/**
 * Yjs ↔ Blockly Binding
 *
 * Syncs a Blockly workspace with a Yjs document using block-level granularity.
 * Each top-level block tree is stored as a key in a Y.Map. Two users editing
 * different block trees = no conflict. Same block tree = last-write-wins.
 *
 * Loop prevention: `isApplyingRemote` flag suppresses local→Yjs writes
 * while applying remote changes. Local changes are debounced at 150ms.
 */

import * as Y from 'yjs'
import * as Blockly from 'blockly'

export interface YjsBlocklyBinding {
  destroy: () => void
  getYDoc: () => Y.Doc
}

/** Serialize a top-level block (and its entire connected chain) */
function serializeTopBlock(block: Blockly.Block): Record<string, unknown> | null {
  try {
    return Blockly.serialization.blocks.save(block) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Get the top-level block for any block (walk up previous connections) */
function getTopBlock(block: Blockly.Block): Blockly.Block {
  let current = block
  while (current.getParent()) {
    current = current.getParent()!
  }
  return current
}

/** Get all top-level block IDs currently in the workspace */
function getTopBlockIds(workspace: Blockly.WorkspaceSvg): Set<string> {
  const ids = new Set<string>()
  for (const block of workspace.getTopBlocks(false)) {
    ids.add(block.id)
  }
  return ids
}

export function bindWorkspaceToYDoc(
  workspace: Blockly.WorkspaceSvg,
  ydoc: Y.Doc
): YjsBlocklyBinding {
  const yblocks = ydoc.getMap<Record<string, unknown>>('blocks')
  const yvariables = ydoc.getMap<{ name: string; type: string }>('variables')

  let isApplyingRemote = false
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const pendingBlockIds = new Set<string>()

  // --- Local → Yjs ---

  /** Flush pending local changes to Yjs */
  function flushToYjs() {
    if (isApplyingRemote) return

    ydoc.transact(() => {
      // Sync changed blocks
      const currentTopIds = getTopBlockIds(workspace)

      for (const blockId of pendingBlockIds) {
        const block = workspace.getBlockById(blockId)
        if (block) {
          const topBlock = getTopBlock(block)
          const serialized = serializeTopBlock(topBlock)
          if (serialized) {
            yblocks.set(topBlock.id, serialized)
          }
        }
      }

      // Remove blocks that no longer exist
      for (const [key] of yblocks) {
        if (!currentTopIds.has(key)) {
          yblocks.delete(key)
        }
      }

      // Sync variables
      const vars = workspace.getAllVariables()
      const currentVarIds = new Set<string>()
      for (const v of vars) {
        currentVarIds.add(v.getId())
        yvariables.set(v.getId(), { name: v.name, type: v.type })
      }
      for (const [key] of yvariables) {
        if (!currentVarIds.has(key)) {
          yvariables.delete(key)
        }
      }
    })

    pendingBlockIds.clear()
  }

  /** Schedule a debounced flush */
  function scheduleFlush(blockId?: string) {
    if (blockId) pendingBlockIds.add(blockId)
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(flushToYjs, 150)
  }

  /** Blockly change listener */
  function onBlocklyChange(event: Blockly.Events.Abstract) {
    if (isApplyingRemote) return
    if (!event.recordUndo) return // Skip non-user events (like workspace load)

    // Extract the block ID from the event
    const blockId = (event as { blockId?: string }).blockId
    if (blockId) {
      scheduleFlush(blockId)
    } else if (
      event.type === Blockly.Events.VAR_CREATE ||
      event.type === Blockly.Events.VAR_DELETE ||
      event.type === Blockly.Events.VAR_RENAME
    ) {
      scheduleFlush()
    }

    // For delete events, flush immediately to remove the block
    if (event.type === Blockly.Events.BLOCK_DELETE) {
      scheduleFlush()
    }
  }

  workspace.addChangeListener(onBlocklyChange)

  // --- Yjs → Local ---

  /** Apply remote block changes to the workspace */
  function onYjsBlockChange(event: Y.YMapEvent<Record<string, unknown>>) {
    if (event.transaction.local) return

    isApplyingRemote = true
    try {
      Blockly.Events.disable()

      // Handle deleted blocks
      for (const [key, change] of event.changes.keys) {
        if (change.action === 'delete') {
          const block = workspace.getBlockById(key)
          if (block) {
            block.dispose(false)
          }
        }
      }

      // Handle added/updated blocks
      for (const [key, change] of event.changes.keys) {
        if (change.action === 'add' || change.action === 'update') {
          const serialized = yblocks.get(key)
          if (!serialized) continue

          // Remove existing block if updating
          if (change.action === 'update') {
            const existing = workspace.getBlockById(key)
            if (existing) {
              existing.dispose(false)
            }
          }

          // Append the block
          try {
            Blockly.serialization.blocks.append(
              serialized as Blockly.serialization.blocks.State,
              workspace
            )
          } catch {
            // Block type might not be registered, skip
          }
        }
      }

      Blockly.Events.enable()
    } finally {
      isApplyingRemote = false
    }
  }

  /** Apply remote variable changes */
  function onYjsVarChange(event: Y.YMapEvent<{ name: string; type: string }>) {
    if (event.transaction.local) return

    isApplyingRemote = true
    try {
      Blockly.Events.disable()

      for (const [key, change] of event.changes.keys) {
        if (change.action === 'delete') {
          const variable = workspace.getVariableById(key)
          if (variable) {
            workspace.deleteVariableById(key)
          }
        } else if (change.action === 'add' || change.action === 'update') {
          const data = yvariables.get(key)
          if (!data) continue
          const existing = workspace.getVariableById(key)
          if (existing) {
            workspace.renameVariableById(key, data.name)
          } else {
            workspace.createVariable(data.name, data.type, key)
          }
        }
      }

      Blockly.Events.enable()
    } finally {
      isApplyingRemote = false
    }
  }

  yblocks.observe(onYjsBlockChange)
  yvariables.observe(onYjsVarChange)

  // --- Initial sync ---
  // If the Yjs doc already has blocks (late joiner), load them
  if (yblocks.size > 0) {
    isApplyingRemote = true
    try {
      Blockly.Events.disable()
      for (const [, serialized] of yblocks) {
        try {
          Blockly.serialization.blocks.append(
            serialized as Blockly.serialization.blocks.State,
            workspace
          )
        } catch {
          // skip unregistered block types
        }
      }
      Blockly.Events.enable()
    } finally {
      isApplyingRemote = false
    }
  }

  // If the workspace already has blocks (room creator), push them to Yjs
  if (yblocks.size === 0) {
    const topBlocks = workspace.getTopBlocks(false)
    if (topBlocks.length > 0) {
      ydoc.transact(() => {
        for (const block of topBlocks) {
          const serialized = serializeTopBlock(block)
          if (serialized) {
            yblocks.set(block.id, serialized)
          }
        }
      })
    }
  }

  return {
    destroy() {
      if (debounceTimer) clearTimeout(debounceTimer)
      workspace.removeChangeListener(onBlocklyChange)
      yblocks.unobserve(onYjsBlockChange)
      yvariables.unobserve(onYjsVarChange)
    },
    getYDoc() {
      return ydoc
    },
  }
}
