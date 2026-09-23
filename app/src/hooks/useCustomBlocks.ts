/**
 * Custom blocks — user-authored blocks that live alongside built-in ones.
 * Owns the editing state, persistence, and Blockly registry integration.
 *
 * Two pools:
 *  - GLOBAL: persisted to localStorage, shared across all projects.
 *  - WORKSPACE: persisted to a sibling localStorage key + bundled into the
 *    .blocks file, scoped to the current project only.
 *
 * Consumers see a combined `customBlocks` array (back-compat); writes go to
 * the pool indicated by `block.scope` (defaulting to 'global').
 */

import { useCallback, useMemo, useState } from 'react'
import * as Blockly from 'blockly'
import { registry } from '../blocks/registry'
import { registerSingleBlock, unregisterBlock, getToolboxXml } from '../blocks/blockly-register'
import { saveCustomBlocksToLocal, saveWorkspaceBlocksToLocal } from '../storage'
import type { BlockDefinition } from '../types/block'
import type { ConversionResult } from '../converters/js-to-workspace'
import type { Achievement } from '../achievements'
import { checkAchievements } from '../achievements'

interface Deps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
  closeCreateModal: () => void
  openCreateModal: () => void
  closeCodeToBlocksModal: () => void
  processAchievements: (a: Achievement[]) => void
  initialGlobalBlocks?: BlockDefinition[]
  initialWorkspaceBlocks?: BlockDefinition[]
}

function withScope(b: BlockDefinition, scope: 'global' | 'workspace'): BlockDefinition {
  return { ...b, scope }
}

export function useCustomBlocks(deps: Deps) {
  const [globalBlocks, setGlobalBlocks] = useState<BlockDefinition[]>(
    (deps.initialGlobalBlocks ?? []).map((b) => withScope(b, 'global'))
  )
  const [workspaceBlocks, setWorkspaceBlocks] = useState<BlockDefinition[]>(
    (deps.initialWorkspaceBlocks ?? []).map((b) => withScope(b, 'workspace'))
  )
  const [editingBlock, setEditingBlock] = useState<BlockDefinition | null>(null)

  // Combined view for consumers that just want "all my custom blocks".
  const customBlocks = useMemo(
    () => [...globalBlocks, ...workspaceBlocks],
    [globalBlocks, workspaceBlocks]
  )

  // Replace-the-whole-list setter, used by file imports. It splits incoming
  // blocks back into the two pools by scope.
  const setCustomBlocks = useCallback((next: BlockDefinition[]) => {
    const g = next
      .filter((b) => (b.scope ?? 'global') === 'global')
      .map((b) => withScope(b, 'global'))
    const w = next.filter((b) => b.scope === 'workspace').map((b) => withScope(b, 'workspace'))
    setGlobalBlocks(g)
    setWorkspaceBlocks(w)
    saveCustomBlocksToLocal(g)
    saveWorkspaceBlocksToLocal(w)
  }, [])

  const handleCreate = useCallback((block: BlockDefinition) => {
    const scope = block.scope ?? 'global'
    const scoped = withScope(block, scope)
    registry.register(scoped)
    registerSingleBlock(scoped)
    deps.workspaceRef.current?.updateToolbox(getToolboxXml())
    if (scope === 'workspace') {
      setWorkspaceBlocks((prev) => {
        const updated = [...prev.filter((b) => b.name !== scoped.name), scoped]
        saveWorkspaceBlocksToLocal(updated)
        return updated
      })
      // Moving from global → workspace? Drop the stale global copy.
      setGlobalBlocks((prev) => {
        if (!prev.some((b) => b.name === scoped.name)) return prev
        const updated = prev.filter((b) => b.name !== scoped.name)
        saveCustomBlocksToLocal(updated)
        return updated
      })
    } else {
      setGlobalBlocks((prev) => {
        const updated = [...prev.filter((b) => b.name !== scoped.name), scoped]
        saveCustomBlocksToLocal(updated)
        return updated
      })
      setWorkspaceBlocks((prev) => {
        if (!prev.some((b) => b.name === scoped.name)) return prev
        const updated = prev.filter((b) => b.name !== scoped.name)
        saveWorkspaceBlocksToLocal(updated)
        return updated
      })
    }
    deps.closeCreateModal()
    setEditingBlock(null)
    deps.processAchievements(checkAchievements({ event: 'custom-block' }))
  }, [deps])

  const handleEdit = useCallback((blockDef: BlockDefinition) => {
    setEditingBlock(blockDef)
    deps.openCreateModal()
  }, [deps])

  const handleDelete = useCallback((blockDef: BlockDefinition) => {
    const displayName = blockDef.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    if (!confirm(`Delete "${displayName}"? This will remove it from your saved blocks and the workspace.`)) return

    if (deps.workspaceRef.current) {
      const blockType = `cb_${blockDef.name}`
      for (const block of deps.workspaceRef.current.getBlocksByType(blockType, false)) {
        block.dispose(false)
      }
    }

    registry.unregister(blockDef.name)
    setGlobalBlocks((prev) => {
      if (!prev.some((b) => b.name === blockDef.name)) return prev
      const updated = prev.filter((b) => b.name !== blockDef.name)
      saveCustomBlocksToLocal(updated)
      return updated
    })
    setWorkspaceBlocks((prev) => {
      if (!prev.some((b) => b.name === blockDef.name)) return prev
      const updated = prev.filter((b) => b.name !== blockDef.name)
      saveWorkspaceBlocksToLocal(updated)
      return updated
    })

    // Refresh toolbox before deleting the Blockly block definition —
    // Blockly needs the definition to cleanly remove it from the toolbox.
    deps.workspaceRef.current?.updateToolbox(getToolboxXml())
    unregisterBlock(blockDef.name)
  }, [deps])

  // Move a block between scopes without re-opening the editor.
  const handleMoveScope = useCallback((blockDef: BlockDefinition, target: 'global' | 'workspace') => {
    if ((blockDef.scope ?? 'global') === target) return
    handleCreate(withScope(blockDef, target))
  }, [handleCreate])

  const handleSaveAsBlock = useCallback((jsCode: string, pyCode: string) => {
    setEditingBlock({
      name: '',
      author: 'User',
      version: '1.0.0',
      description: '',
      category: 'My Blocks',
      inputs: [],
      outputs: [],
      implementations: { javascript: jsCode, python: pyCode },
      tests: [],
      color: '#F59E0B',
      shape: 'statement',
      scope: 'global',
    })
    deps.openCreateModal()
  }, [deps])

  // Convert JS code → blocks (from the "Code to Blocks" Pro feature).
  // May register new custom blocks as a side effect. New blocks default to global.
  const handleCodeToBlocks = useCallback((result: ConversionResult) => {
    for (const blockDef of result.newBlocks) {
      const scoped = withScope(blockDef, blockDef.scope ?? 'global')
      registry.register(scoped)
      registerSingleBlock(scoped)
    }
    if (result.newBlocks.length > 0) {
      setGlobalBlocks((prev) => {
        const updated = [...prev]
        for (const b of result.newBlocks) {
          const scoped = withScope(b, 'global')
          const idx = updated.findIndex((x) => x.name === scoped.name)
          if (idx >= 0) updated[idx] = scoped
          else updated.push(scoped)
        }
        saveCustomBlocksToLocal(updated)
        return updated
      })
    }
    setTimeout(() => {
      if (deps.workspaceRef.current) {
        deps.workspaceRef.current.updateToolbox(getToolboxXml())
        deps.workspaceRef.current.clear()
        Blockly.serialization.workspaces.load(result.workspace, deps.workspaceRef.current)
      }
    }, 0)
    deps.closeCodeToBlocksModal()
  }, [deps])

  const closeEditor = useCallback(() => {
    deps.closeCreateModal()
    setEditingBlock(null)
  }, [deps])

  return {
    customBlocks,
    globalBlocks,
    workspaceBlocks,
    setCustomBlocks,
    editingBlock,
    setEditingBlock,
    handleCreate,
    handleEdit,
    handleDelete,
    handleMoveScope,
    handleSaveAsBlock,
    handleCodeToBlocks,
    closeEditor,
  }
}
