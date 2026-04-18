/**
 * File I/O operations — .blocks save/load, HTML export, embed snippet
 * copy, dashboard save, and import-as-block. Extracted from App.tsx
 * so the root component doesn't carry ~130 lines of I/O logic.
 */

import { useCallback } from 'react'
import * as Blockly from 'blockly'
import type { Language, BlockDefinition } from '../types/block'
import { registry } from '../blocks/registry'
import { registerSingleBlock, generateCode, getToolboxXml } from '../blocks/blockly-register'
import { exportBlocksFile, importBlocksFile, saveCustomBlocksToLocal, saveWorkspaceToLocal } from '../storage'
import { generateStandaloneHtml, generateEmbedSnippet, downloadHtml, copyToClipboard } from '../export-html'
import { saveToDashboard, updateProject } from '../shareplace/api'
import { countBlocks } from '../challenges/validator'
import { showToast } from '../components/Toast'
import { checkAchievements } from '../achievements/tracker'
import { getClerkToken, getClerkUserName } from '../auth'

interface Deps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
  language: Language
  code: string
  customBlocks: BlockDefinition[]
  setCustomBlocks: (blocks: BlockDefinition[]) => void
  setEditingBlock: (b: BlockDefinition) => void
  openCreateModal: () => void
  /** When set, Save to Dashboard PATCHes this project instead of POSTing
   *  a new copy. Populated by the dashboard "Open in Editor" flow. */
  currentProject: { id: string; name: string } | null
  setCurrentProject: (p: { id: string; name: string } | null) => void
}

export function useFileOps(deps: Deps) {
  // Generate JS code from the active workspace — or return `code` if we
  // already have it (HTML mode compiles to JS on demand).
  const getJsCode = useCallback((): string => {
    return deps.language === 'html' && deps.workspaceRef.current
      ? generateCode(deps.workspaceRef.current, 'javascript')
      : deps.code
  }, [deps.code, deps.language, deps.workspaceRef])

  const handleExportHtml = useCallback(() => {
    const html = generateStandaloneHtml(getJsCode(), { title: 'CryptoBlocks Project' })
    downloadHtml(html)
  }, [getJsCode])

  const handleCopyEmbed = useCallback(async () => {
    await copyToClipboard(generateEmbedSnippet(getJsCode()))
  }, [getJsCode])

  const handleExport = useCallback(() => {
    if (deps.workspaceRef.current) {
      exportBlocksFile(deps.customBlocks, deps.workspaceRef.current)
    }
  }, [deps.customBlocks, deps.workspaceRef])

  const handleSaveToDashboard = useCallback(async () => {
    if (!deps.workspaceRef.current) return
    try {
      const state = Blockly.serialization.workspaces.save(deps.workspaceRef.current)
      const workspaceJson = JSON.stringify(state)
      const token = await getClerkToken()
      const blockCount = countBlocks(deps.workspaceRef.current)

      // If we opened this project from the dashboard, update in place.
      if (deps.currentProject) {
        const result = await updateProject(deps.currentProject.id, {
          name: deps.currentProject.name,
          authorName: getClerkUserName(),
          workspaceJson,
          blockCount,
          category: 'General',
        }, token)
        if (result && 'id' in result) showToast('Saved!', 'success')
        else if (result && 'error' in result) showToast(result.error, 'error')
        else showToast('Save failed — try again', 'error')
        return
      }

      // First-time save — ask for a name and POST a new project.
      // Check if this is a remix (remix parent stashed by RemixModal)
      let parentId: string | undefined
      try {
        const raw = localStorage.getItem('cryptoblocks_remix_parent')
        if (raw) parentId = JSON.parse(raw)?.id
      } catch { /* no parent */ }

      const name = prompt('Project name:') || 'Untitled Project'
      const result = await saveToDashboard({
        name, parentId, authorName: 'User', workspaceJson, blockCount, category: 'General',
      }, token)

      if (result && 'id' in result) {
        showToast('Saved to your dashboard!', 'success')
        // Fire remix achievement check (awards "Hello Indeed" if parent is the seed)
        if (parentId) {
          checkAchievements({ event: 'remix', parentProjectId: parentId })
        }
        localStorage.removeItem('cryptoblocks_remix_parent')
        // Future saves on this session update in place rather than create copies.
        deps.setCurrentProject({ id: result.id, name })
      } else if (result && 'error' in result) {
        showToast(result.error, 'error')
      } else {
        showToast('Save failed — try again', 'error')
      }
    } catch {
      showToast('Save failed', 'error')
    }
  }, [deps])

  const handleImport = useCallback(async (file: File) => {
    try {
      const data = await importBlocksFile(file)
      for (const block of data.customBlocks) {
        registry.register(block)
        registerSingleBlock(block)
      }
      deps.setCustomBlocks(data.customBlocks)
      saveCustomBlocksToLocal(data.customBlocks)
      if (deps.workspaceRef.current) {
        deps.workspaceRef.current.updateToolbox(getToolboxXml())
        Blockly.serialization.workspaces.load(data.workspaceState, deps.workspaceRef.current)
        saveWorkspaceToLocal(deps.workspaceRef.current)
      }
    } catch (err) {
      showToast(`Failed to import: ${err instanceof Error ? err.message : 'unknown error'}`, 'error')
    }
  }, [deps])

  // Import a .blocks file AS a reusable custom block — wraps the workspace
  // in a function definition named after the file, then opens the block
  // editor pre-filled so the user can tweak and save.
  const handleImportAsBlock = useCallback(async (file: File) => {
    try {
      const data = await importBlocksFile(file)
      for (const block of data.customBlocks) {
        registry.register(block)
        registerSingleBlock(block)
      }

      const headless = new Blockly.Workspace()
      Blockly.serialization.workspaces.load(data.workspaceState, headless)
      const jsCode = generateCode(headless, 'javascript')
      const pyCode = generateCode(headless, 'python')
      headless.dispose()

      const funcName = (file.name.replace(/\.blocks$/i, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase() || 'imported_block')

      const wrappedJs = `function ${funcName}() {\n${jsCode.split('\n').map(l => '  ' + l).join('\n')}\n}`
      const wrappedPy = `def ${funcName}():\n${pyCode.split('\n').map(l => '    ' + l).join('\n')}`

      deps.setEditingBlock({
        name: funcName,
        author: 'User',
        version: '1.0.0',
        description: `Imported from ${file.name}`,
        category: 'My Blocks',
        inputs: [],
        outputs: [],
        implementations: { javascript: wrappedJs, python: wrappedPy },
        tests: [],
        color: '#F59E0B',
        shape: 'statement',
      })
      deps.openCreateModal()
    } catch (err) {
      showToast(`Failed to import as block: ${err instanceof Error ? err.message : 'unknown error'}`, 'error')
    }
  }, [deps])

  return {
    handleExportHtml,
    handleCopyEmbed,
    handleExport,
    handleSaveToDashboard,
    handleImport,
    handleImportAsBlock,
  }
}
