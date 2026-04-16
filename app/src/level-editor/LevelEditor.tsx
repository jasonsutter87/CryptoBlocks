/**
 * Level Editor — visual drag-and-drop platformer level designer.
 *
 * Kids draw platforms on a grid, place a spawn point, and click "Export"
 * to generate the equivalent CryptoBlocks workspace blocks (add_platform,
 * create_sprite, set_gravity, etc.). No code needed.
 *
 * Features:
 *   - Click to place platforms (snap to 20px grid)
 *   - Drag to resize
 *   - Click spawn marker to set player start position
 *   - Color picker for platforms
 *   - Export → generates workspace JSON → loads into editor
 *   - Clear all
 */

import { useState, useRef, useCallback } from 'react'

interface Platform {
  id: string
  x: number
  y: number
  w: number
  h: number
  color: string
}

interface LevelEditorProps {
  onClose: () => void
  onExport: (platforms: Platform[], spawnX: number, spawnY: number) => void
}

const GRID = 20
const CANVAS_W = 800
const CANVAS_H = 480
const PLATFORM_COLORS = ['#a6e3a1', '#89b4fa', '#f9e2af', '#f38ba8', '#cba6f7', '#fab387', '#6c7086']

function snap(v: number): number {
  return Math.round(v / GRID) * GRID
}

export default function LevelEditor({ onClose, onExport }: LevelEditorProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [spawnX, setSpawnX] = useState(80)
  const [spawnY, setSpawnY] = useState(200)
  const [color, setColor] = useState('#a6e3a1')
  const [tool, setTool] = useState<'platform' | 'spawn' | 'erase'>('platform')
  const [drawing, setDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const getPos = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: snap(e.clientX - rect.left), y: snap(e.clientY - rect.top) }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e)
    if (tool === 'spawn') {
      setSpawnX(pos.x)
      setSpawnY(pos.y)
      return
    }
    if (tool === 'erase') {
      setPlatforms((prev) => prev.filter((p) => {
        return !(pos.x >= p.x && pos.x <= p.x + p.w && pos.y >= p.y && pos.y <= p.y + p.h)
      }))
      return
    }
    setDrawing(true)
    setDrawStart(pos)
    setDrawEnd(pos)
  }, [tool, getPos])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawing) return
    setDrawEnd(getPos(e))
  }, [drawing, getPos])

  const handleMouseUp = useCallback(() => {
    if (!drawing || !drawStart || !drawEnd) {
      setDrawing(false)
      return
    }
    const x = Math.min(drawStart.x, drawEnd.x)
    const y = Math.min(drawStart.y, drawEnd.y)
    const w = Math.max(GRID, Math.abs(drawEnd.x - drawStart.x))
    const h = Math.max(GRID, Math.abs(drawEnd.y - drawStart.y))
    setPlatforms((prev) => [...prev, { id: crypto.randomUUID(), x, y, w, h, color }])
    setDrawing(false)
    setDrawStart(null)
    setDrawEnd(null)
  }, [drawing, drawStart, drawEnd, color])

  const previewRect = drawing && drawStart && drawEnd ? {
    x: Math.min(drawStart.x, drawEnd.x),
    y: Math.min(drawStart.y, drawEnd.y),
    w: Math.max(GRID, Math.abs(drawEnd.x - drawStart.x)),
    h: Math.max(GRID, Math.abs(drawEnd.y - drawStart.y)),
  } : null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-[880px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🗺️</span>
            <h2 className="text-text font-bold text-base">Level Editor</h2>
            <span className="text-xs text-overlay">{platforms.length} platforms</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlatforms([])}
              className="px-3 py-1.5 text-xs text-danger bg-danger/10 hover:bg-danger/20 rounded-lg"
            >
              Clear All
            </button>
            <button
              onClick={() => onExport(platforms, spawnX, spawnY)}
              disabled={platforms.length === 0}
              className="px-4 py-1.5 text-xs font-bold text-base bg-success hover:bg-success/80 rounded-lg disabled:opacity-40"
            >
              Export to Editor →
            </button>
            <button onClick={onClose} className="text-overlay hover:text-text p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-surface-0 bg-mantle">
          {/* Tools */}
          {[
            { key: 'platform' as const, label: '▬ Platform', icon: '▬' },
            { key: 'spawn' as const, label: '🦊 Spawn', icon: '🦊' },
            { key: 'erase' as const, label: '🗑️ Erase', icon: '🗑️' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTool(t.key)}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                tool === t.key
                  ? 'bg-accent text-base'
                  : 'bg-surface-0 text-subtext hover:bg-surface-1'
              }`}
            >
              {t.label}
            </button>
          ))}

          <span className="text-surface-1">|</span>

          {/* Color picker */}
          <div className="flex items-center gap-1">
            {PLATFORM_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  color === c ? 'border-white scale-125' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative bg-crust cursor-crosshair select-none overflow-hidden"
          style={{ width: CANVAS_W, height: CANVAS_H, margin: '0 auto' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid */}
          <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H}>
            {Array.from({ length: CANVAS_W / GRID + 1 }, (_, i) => (
              <line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={CANVAS_H} stroke="#1e1e2e" strokeWidth={0.5} />
            ))}
            {Array.from({ length: CANVAS_H / GRID + 1 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * GRID} x2={CANVAS_W} y2={i * GRID} stroke="#1e1e2e" strokeWidth={0.5} />
            ))}
          </svg>

          {/* Platforms */}
          {platforms.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-sm"
              style={{ left: p.x, top: p.y, width: p.w, height: p.h, backgroundColor: p.color, opacity: 0.85 }}
            />
          ))}

          {/* Drawing preview */}
          {previewRect && (
            <div
              className="absolute border-2 border-dashed border-white/50 rounded-sm"
              style={{ left: previewRect.x, top: previewRect.y, width: previewRect.w, height: previewRect.h, backgroundColor: color, opacity: 0.4 }}
            />
          )}

          {/* Spawn point */}
          <div
            className="absolute text-2xl pointer-events-none"
            style={{ left: spawnX - 12, top: spawnY - 12 }}
          >
            🦊
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2 text-center text-[10px] text-overlay border-t border-surface-0">
          Click + drag to draw platforms · Click 🦊 tool then click canvas to set spawn · Export loads the level into the editor with blocks
        </div>
      </div>
    </div>
  )
}
