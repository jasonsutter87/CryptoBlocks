/**
 * Minimap — zoomed-out canvas overview of the Blockly workspace.
 * Shows all top-level blocks as small colored rectangles in a 150x100 panel.
 * Click to pan the workspace to that position.
 * Updates on workspace changes (debounced 200 ms).
 */

import { useEffect, useRef, useCallback } from 'react'
import * as Blockly from 'blockly'

const MAP_W = 150
const MAP_H = 100
const PADDING = 40 // workspace padding to include in bounds

interface MinimapProps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
}

export default function Minimap({ workspaceRef }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const draw = useCallback(() => {
    const ws = workspaceRef.current
    const canvas = canvasRef.current
    if (!ws || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const blocks = ws.getTopBlocks(false) as Blockly.BlockSvg[]
    if (blocks.length === 0) {
      ctx.clearRect(0, 0, MAP_W, MAP_H)
      return
    }

    // Compute bounding box of all blocks in workspace coords
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const b of blocks) {
      const pos = b.getRelativeToSurfaceXY()
      const { width, height } = b.getHeightWidth()
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + width)
      maxY = Math.max(maxY, pos.y + height)
    }

    minX -= PADDING; minY -= PADDING
    maxX += PADDING; maxY += PADDING
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1

    // Scale to fit MAP_W x MAP_H
    const scaleX = MAP_W / rangeX
    const scaleY = MAP_H / rangeY
    const scale = Math.min(scaleX, scaleY)

    // Center within the canvas
    const offsetX = (MAP_W - rangeX * scale) / 2
    const offsetY = (MAP_H - rangeY * scale) / 2

    ctx.clearRect(0, 0, MAP_W, MAP_H)

    // Draw blocks
    for (const b of blocks) {
      const pos = b.getRelativeToSurfaceXY()
      const { width, height } = b.getHeightWidth()
      const x = offsetX + (pos.x - minX) * scale
      const y = offsetY + (pos.y - minY) * scale
      const w = Math.max(2, width * scale)
      const h = Math.max(2, height * scale)

      ctx.fillStyle = b.getColour() || '#7c3aed'
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 1)
      ctx.fill()
    }

    // Draw viewport indicator
    const metrics = ws.getMetrics()
    const wsScale = ws.getScale()
    const vpX = offsetX + (metrics.scrollLeft / wsScale - minX) * scale
    const vpY = offsetY + (metrics.scrollTop / wsScale - minY) * scale
    const vpW = (metrics.viewWidth / wsScale) * scale
    const vpH = (metrics.viewHeight / wsScale) * scale

    ctx.globalAlpha = 1
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 1
    ctx.strokeRect(vpX, vpY, vpW, vpH)
  }, [workspaceRef])

  // Debounced redraw
  const scheduleDraw = useCallback(() => {
    if (rafRef.current) clearTimeout(rafRef.current)
    rafRef.current = setTimeout(draw, 200)
  }, [draw])

  useEffect(() => {
    const ws = workspaceRef.current
    if (!ws) return
    ws.addChangeListener(scheduleDraw)
    scheduleDraw()
    return () => {
      ws.removeChangeListener(scheduleDraw)
      if (rafRef.current) clearTimeout(rafRef.current)
    }
  }, [workspaceRef, scheduleDraw])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const ws = workspaceRef.current
    const canvas = canvasRef.current
    if (!ws || !canvas) return

    const blocks = ws.getTopBlocks(false) as Blockly.BlockSvg[]
    if (blocks.length === 0) return

    // Re-compute bounds (same as draw)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const b of blocks) {
      const pos = b.getRelativeToSurfaceXY()
      const { width, height } = b.getHeightWidth()
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + width)
      maxY = Math.max(maxY, pos.y + height)
    }
    minX -= PADDING; minY -= PADDING
    maxX += PADDING; maxY += PADDING
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1
    const scale = Math.min(MAP_W / rangeX, MAP_H / rangeY)
    const offsetX = (MAP_W - rangeX * scale) / 2
    const offsetY = (MAP_H - rangeY * scale) / 2

    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    // Convert click to workspace coords
    const wsX = (cx - offsetX) / scale + minX
    const wsY = (cy - offsetY) / scale + minY

    // Pan workspace so (wsX, wsY) is at viewport center
    const metrics = ws.getMetrics()
    const wsScale = ws.getScale()
    const newScrollX = wsX * wsScale - metrics.viewWidth / 2
    const newScrollY = wsY * wsScale - metrics.viewHeight / 2
    ws.scroll(-newScrollX, -newScrollY)
  }, [workspaceRef])

  return (
    <div
      className="absolute bottom-4 right-4 z-40 rounded-lg overflow-hidden shadow-2xl border border-white/10"
      style={{ width: MAP_W, height: MAP_H, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      title="Minimap — click to pan"
    >
      <canvas
        ref={canvasRef}
        width={MAP_W}
        height={MAP_H}
        onClick={handleClick}
        className="cursor-crosshair"
      />
    </div>
  )
}
