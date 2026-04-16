/**
 * Custom blocks — user-authored blocks that live alongside built-in ones.
 * Owns the editing state, persistence, and Blockly registry integration.
 */

import { useCallback, useState } from 'react'
import * as Blockly from 'blockly'
import { registry } from '../blocks/registry'
import { registerSingleBlock, unregisterBlock, getToolboxXml } from '../blocks/blockly-register'
import { saveCustomBlocksToLocal } from '../storage'
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
  initialCustomBlocks?: BlockDefinition[]
}

export function useCustomBlocks(deps: Deps) {
  const [customBlocks, setCustomBlocks] = useState<BlockDefinition[]>(deps.initialCustomBlocks ?? [])
  const [editingBlock, setEditingBlock] = useState<BlockDefinition | null>(null)

  const handleCreate = useCallback((block: BlockDefinition) => {
    registry.register(block)
    registerSingleBlock(block)
    deps.workspaceRef.current?.updateToolbox(getToolboxXml())
    setCustomBlocks((prev) => {
      const updated = [...prev.filter((b) => b.name !== block.name), block]
      saveCustomBlocksToLocal(updated)
      return updated
    })
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
    setCustomBlocks((prev) => {
      const updated = prev.filter((b) => b.name !== blockDef.name)
      saveCustomBlocksToLocal(updated)
      return updated
    })

    // Refresh toolbox before deleting the Blockly block definition —
    // Blockly needs the definition to cleanly remove it from the toolbox.
    deps.workspaceRef.current?.updateToolbox(getToolboxXml())
    unregisterBlock(blockDef.name)
  }, [deps])

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
    })
    deps.openCreateModal()
  }, [deps])

  // Convert JS code → blocks (from the "Code to Blocks" Pro feature).
  // May register new custom blocks as a side effect.
  const handleCodeToBlocks = useCallback((result: ConversionResult) => {
    for (const blockDef of result.newBlocks) {
      registry.register(blockDef)
      registerSingleBlock(blockDef)
    }
    if (result.newBlocks.length > 0) {
      setCustomBlocks((prev) => {
        const updated = [...prev]
        for (const b of result.newBlocks) {
          const idx = updated.findIndex((x) => x.name === b.name)
          if (idx >= 0) updated[idx] = b
          else updated.push(b)
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
    setCustomBlocks,
    editingBlock,
    setEditingBlock,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSaveAsBlock,
    handleCodeToBlocks,
    closeEditor,
  }
}
