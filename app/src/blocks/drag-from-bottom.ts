/**
 * Drag-From-Bottom — shift+click a block to drag *it plus the chain above*
 * as one unit, instead of Blockly's default "block + descendants".
 *
 * We do a fully manual drag (not Blockly's) because Blockly's drag system
 * only knows how to move a block + its descendants. To move a block +
 * ancestors we hijack the mousedown and translate every block ourselves.
 *
 * Flow:
 *  1. Shift-mousedown on X: stop propagation, record state, install listeners.
 *     Defer the actual detach until the mouse has moved past a threshold so
 *     a plain shift-click doesn't mangle structure.
 *  2. On first qualifying mousemove: sever X from below, sever top-ancestor
 *     from its parent, heal the gap between those two if possible.
 *  3. Every mousemove: moveBy(delta) on X and all ancestors so they travel
 *     together.
 *  4. On mouseup: reconnect ancestors → X at the drop location.
 */

import * as Blockly from 'blockly'

interface DragSession {
  leader: Blockly.BlockSvg
  ancestors: Blockly.BlockSvg[] // nearest-first: [closest-parent, ..., top]
  initialMouse: { x: number; y: number }
  initialLeaderXY: { x: number; y: number }
  initialAncestorsXY: Array<{ x: number; y: number }>
  detached: boolean
  previousParentConnection: Blockly.Connection | null
  detachedBelow: Blockly.BlockSvg | null
}

const MOVE_THRESHOLD_PX = 4

export function registerDragFromBottom(workspace: Blockly.WorkspaceSvg): () => void {
  let session: DragSession | null = null

  const svg = workspace.getParentSvg()
  if (!svg) return () => {}

  function findClickedBlock(target: EventTarget | null): Blockly.BlockSvg | null {
    let el = target as Element | null
    while (el && el !== svg) {
      const id = el.getAttribute?.('data-id')
      if (id) {
        const block = workspace.getBlockById(id)
        if (block) return block as Blockly.BlockSvg
      }
      el = el.parentElement
    }
    return null
  }

  function collectAncestors(start: Blockly.BlockSvg): Blockly.BlockSvg[] {
    const chain: Blockly.BlockSvg[] = []
    const surroundLimit = start.getSurroundParent()
    let cursor = start.getPreviousBlock() as Blockly.BlockSvg | null
    while (cursor) {
      if (cursor === surroundLimit) break
      chain.push(cursor)
      cursor = cursor.getPreviousBlock() as Blockly.BlockSvg | null
    }
    return chain
  }

  function performDetach(s: DragSession) {
    // Remember where the top ancestor was connected (if anywhere) so we can heal
    const top = s.ancestors[s.ancestors.length - 1]
    const parentTarget = top.previousConnection?.targetConnection ?? null
    s.previousParentConnection = parentTarget

    // Sever below the leader — the blocks below stay where they are
    const below = s.leader.getNextBlock() as Blockly.BlockSvg | null
    s.detachedBelow = below
    if (below && s.leader.nextConnection?.isConnected()) {
      s.leader.nextConnection.disconnect()
    }

    // Sever top ancestor from its parent (frees the whole chain)
    if (top.previousConnection?.isConnected()) {
      top.previousConnection.disconnect()
    }

    // Heal the gap: if there was a parent above and a block below, stitch them
    if (parentTarget && below?.previousConnection) {
      try { parentTarget.connect(below.previousConnection) } catch { /* ignore */ }
    }

    // Sever leader from ancestors so they move independently
    if (s.leader.previousConnection?.isConnected()) {
      s.leader.previousConnection.disconnect()
    }

    s.detached = true
  }

  function applyMove(s: DragSession, mouseX: number, mouseY: number) {
    const scale = workspace.scale || 1
    const dx = (mouseX - s.initialMouse.x) / scale
    const dy = (mouseY - s.initialMouse.y) / scale

    const desiredLeader = { x: s.initialLeaderXY.x + dx, y: s.initialLeaderXY.y + dy }
    const currentLeader = s.leader.getRelativeToSurfaceXY()
    s.leader.moveBy(desiredLeader.x - currentLeader.x, desiredLeader.y - currentLeader.y)

    for (let i = 0; i < s.ancestors.length; i++) {
      const block = s.ancestors[i]
      const init = s.initialAncestorsXY[i]
      const desired = { x: init.x + dx, y: init.y + dy }
      const current = block.getRelativeToSurfaceXY()
      block.moveBy(desired.x - current.x, desired.y - current.y)
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (!e.shiftKey || e.button !== 0) return
    const clicked = findClickedBlock(e.target)
    if (!clicked) return
    const ancestors = collectAncestors(clicked)
    if (ancestors.length === 0) return

    e.stopPropagation()
    e.preventDefault()

    const leaderXY = clicked.getRelativeToSurfaceXY()
    session = {
      leader: clicked,
      ancestors,
      initialMouse: { x: e.clientX, y: e.clientY },
      initialLeaderXY: { x: leaderXY.x, y: leaderXY.y },
      initialAncestorsXY: ancestors.map(b => {
        const xy = b.getRelativeToSurfaceXY()
        return { x: xy.x, y: xy.y }
      }),
      detached: false,
      previousParentConnection: null,
      detachedBelow: null,
    }

    window.addEventListener('mousemove', onWindowMouseMove, true)
    window.addEventListener('mouseup', onWindowMouseUp, true)
  }

  function onWindowMouseMove(e: MouseEvent) {
    if (!session) return
    const s = session
    const dx = e.clientX - s.initialMouse.x
    const dy = e.clientY - s.initialMouse.y
    if (!s.detached) {
      if (Math.hypot(dx, dy) < MOVE_THRESHOLD_PX) return
      performDetach(s)
    }
    applyMove(s, e.clientX, e.clientY)
  }

  function onWindowMouseUp() {
    const s = session
    session = null
    window.removeEventListener('mousemove', onWindowMouseMove, true)
    window.removeEventListener('mouseup', onWindowMouseUp, true)
    if (!s || !s.detached) return

    // Reconnect the chain: top-ancestor → ... → closest-parent → leader
    for (let i = s.ancestors.length - 1; i >= 0; i--) {
      const ancestor = s.ancestors[i]
      const below = i === 0 ? s.leader : s.ancestors[i - 1]
      if (ancestor.nextConnection && below.previousConnection) {
        try { ancestor.nextConnection.connect(below.previousConnection) } catch { /* ignore */ }
      }
    }
    // Chain lands free-floating — user drags it the last few pixels to snap
    // into a target connection using Blockly's normal drag-to-connect.
  }

  svg.addEventListener('mousedown', onMouseDown as EventListener, true)

  return () => {
    svg.removeEventListener('mousedown', onMouseDown as EventListener, true)
    window.removeEventListener('mousemove', onWindowMouseMove, true)
    window.removeEventListener('mouseup', onWindowMouseUp, true)
  }
}
