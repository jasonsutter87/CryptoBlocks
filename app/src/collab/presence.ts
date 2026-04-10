/**
 * Presence — track which block each collaborator is working on.
 *
 * Publishes the local user's selected block ID to Yjs Awareness,
 * and highlights remote users' selected blocks with colored outlines.
 */

import * as Blockly from 'blockly'
import type { Awareness } from 'y-protocols/awareness'
import type { PresenceState } from './types'

interface PresenceBinding {
  destroy: () => void
}

export function bindPresence(
  workspace: Blockly.WorkspaceSvg,
  awareness: Awareness
): PresenceBinding {
  // Track local selection → publish to awareness
  function onBlocklyEvent(event: Blockly.Events.Abstract) {
    if (event.type !== Blockly.Events.SELECTED) return
    const selected = (event as Blockly.Events.Selected).newElementId ?? null
    const current = awareness.getLocalState() as PresenceState | null
    if (current) {
      awareness.setLocalStateField('selectedBlockId', selected)
    }
  }

  workspace.addChangeListener(onBlocklyEvent)

  // Track remote selections → highlight blocks
  const highlightedBlocks = new Map<string, { blockId: string; color: string }>()

  function clearHighlight(clientId: string) {
    const prev = highlightedBlocks.get(clientId)
    if (prev) {
      const block = workspace.getBlockById(prev.blockId)
      if (block) {
        const svgRoot = block.getSvgRoot()
        if (svgRoot) {
          svgRoot.style.outline = ''
          svgRoot.style.outlineOffset = ''
        }
      }
      highlightedBlocks.delete(clientId)
    }
  }

  function applyHighlight(clientId: string, blockId: string, color: string) {
    clearHighlight(clientId)
    const block = workspace.getBlockById(blockId)
    if (block) {
      const svgRoot = block.getSvgRoot()
      if (svgRoot) {
        svgRoot.style.outline = `3px solid ${color}`
        svgRoot.style.outlineOffset = '2px'
      }
      highlightedBlocks.set(clientId, { blockId, color })
    }
  }

  function onAwarenessChange() {
    const states = awareness.getStates()
    const remoteClientIds = new Set<string>()

    states.forEach((state, clientId) => {
      if (clientId === awareness.clientID) return
      const ps = state as PresenceState
      const cid = String(clientId)
      remoteClientIds.add(cid)

      if (ps.selectedBlockId && ps.user?.color) {
        applyHighlight(cid, ps.selectedBlockId, ps.user.color)
      } else {
        clearHighlight(cid)
      }
    })

    // Clean up highlights for disconnected peers
    for (const [cid] of highlightedBlocks) {
      if (!remoteClientIds.has(cid)) {
        clearHighlight(cid)
      }
    }
  }

  awareness.on('change', onAwarenessChange)

  return {
    destroy() {
      workspace.removeChangeListener(onBlocklyEvent)
      awareness.off('change', onAwarenessChange)
      for (const [cid] of highlightedBlocks) {
        clearHighlight(cid)
      }
    },
  }
}
