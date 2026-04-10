/**
 * SpriteEditor — visual pixel art editor for creating game sprites.
 *
 * Features:
 * - Click-to-draw pixel grid (16x16, 24x24, 32x32)
 * - Color palette + custom color picker
 * - Tools: draw, erase, fill, color pick
 * - Multiple animation frames
 * - Live preview with animation playback
 * - Export as PNG data URL for use with Games blocks
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { DEFAULT_PALETTE, hexToRgba, TRANSPARENT } from './palette'
import type { SpriteFrame, SpriteProject, Tool } from './types'
import type { RGBA } from './palette'

interface SpriteEditorProps {
  onClose: () => void
  onSave: (dataUrl: string, name: string, frames: number) => void
  initialProject?: SpriteProject
}

function createEmptyFrame(size: number, name: string): SpriteFrame {
  const pixels: RGBA[][] = []
  for (let y = 0; y < size; y++) {
    const row: RGBA[] = []
    for (let x = 0; x < size; x++) {
      row.push([...TRANSPARENT] as RGBA)
    }
    pixels.push(row)
  }
  return { pixels, name }
}

function rgbaMatch(a: RGBA, b: RGBA): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
}

export default function SpriteEditor({ onClose, onSave, initialProject }: SpriteEditorProps) {
  const defaultSize = initialProject?.size || 16
  const [project, setProject] = useState<SpriteProject>(
    initialProject || {
      name: 'my-sprite',
      size: defaultSize,
      frames: [createEmptyFrame(defaultSize, 'frame-1')],
      palette: [...DEFAULT_PALETTE],
    }
  )
  const [activeFrame, setActiveFrame] = useState(0)
  const [color, setColor] = useState('#000000')
  const [tool, setTool] = useState<Tool>('draw')
  const [isDrawing, setIsDrawing] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [playFrame, setPlayFrame] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  const frame = project.frames[activeFrame]
  const size = project.size
  const pixelSize = Math.floor(Math.min(384, window.innerWidth - 300) / size)

  // Draw the grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !frame) return
    const ctx = canvas.getContext('2d')!
    const totalPx = size * pixelSize

    canvas.width = totalPx
    canvas.height = totalPx

    // Checkerboard background (transparency indicator)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const px = x * pixelSize
        const py = y * pixelSize
        ctx.fillStyle = (x + y) % 2 === 0 ? '#2a2a3d' : '#232336'
        ctx.fillRect(px, py, pixelSize, pixelSize)

        // Draw pixel
        const rgba = frame.pixels[y]?.[x]
        if (rgba && rgba[3] > 0) {
          ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
          ctx.fillRect(px, py, pixelSize, pixelSize)
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i <= size; i++) {
      ctx.beginPath()
      ctx.moveTo(i * pixelSize, 0)
      ctx.lineTo(i * pixelSize, totalPx)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * pixelSize)
      ctx.lineTo(totalPx, i * pixelSize)
      ctx.stroke()
    }
  }, [frame, size, pixelSize])

  useEffect(() => { drawGrid() }, [drawGrid, project])

  // Draw preview
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const f = playing ? project.frames[playFrame] : frame
    if (!f) return

    const previewPx = 4
    canvas.width = size * previewPx
    canvas.height = size * previewPx

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const rgba = f.pixels[y]?.[x]
        if (rgba && rgba[3] > 0) {
          ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
          ctx.fillRect(x * previewPx, y * previewPx, previewPx, previewPx)
        }
      }
    }
  }, [frame, size, playing, playFrame, project.frames])

  useEffect(() => { drawPreview() }, [drawPreview])

  // Animation playback
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setPlayFrame(prev => (prev + 1) % project.frames.length)
    }, 150)
    return () => clearInterval(interval)
  }, [playing, project.frames.length])

  // --- Pixel operations ---

  function setPixel(x: number, y: number) {
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const newProject = { ...project }
    const newFrames = [...newProject.frames]
    const newFrame = { ...newFrames[activeFrame], pixels: newFrames[activeFrame].pixels.map(row => [...row]) }

    if (tool === 'draw') {
      newFrame.pixels[y][x] = hexToRgba(color)
    } else if (tool === 'erase') {
      newFrame.pixels[y][x] = [...TRANSPARENT] as RGBA
    } else if (tool === 'pick') {
      const picked = newFrame.pixels[y][x]
      if (picked[3] > 0) {
        const hex = '#' + picked.slice(0, 3).map(c => c.toString(16).padStart(2, '0')).join('')
        setColor(hex)
        setTool('draw')
      }
      return
    } else if (tool === 'fill') {
      floodFill(newFrame.pixels, x, y, hexToRgba(color))
    }

    newFrames[activeFrame] = newFrame
    newProject.frames = newFrames
    setProject(newProject)
  }

  function floodFill(pixels: RGBA[][], startX: number, startY: number, fillColor: RGBA) {
    const target = [...pixels[startY][startX]] as RGBA
    if (rgbaMatch(target, fillColor)) return

    const stack = [{ x: startX, y: startY }]
    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      if (x < 0 || x >= size || y < 0 || y >= size) continue
      if (!rgbaMatch(pixels[y][x], target)) continue
      pixels[y][x] = [...fillColor] as RGBA
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
    }
  }

  function getPixelCoords(e: React.MouseEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)
    return { x, y }
  }

  // --- Frame management ---

  function addFrame() {
    const newFrame = createEmptyFrame(size, `frame-${project.frames.length + 1}`)
    setProject(prev => ({ ...prev, frames: [...prev.frames, newFrame] }))
    setActiveFrame(project.frames.length)
  }

  function duplicateFrame() {
    const src = project.frames[activeFrame]
    const dup: SpriteFrame = {
      name: `${src.name}-copy`,
      pixels: src.pixels.map(row => row.map(px => [...px] as RGBA)),
    }
    const newFrames = [...project.frames]
    newFrames.splice(activeFrame + 1, 0, dup)
    setProject(prev => ({ ...prev, frames: newFrames }))
    setActiveFrame(activeFrame + 1)
  }

  function deleteFrame() {
    if (project.frames.length <= 1) return
    const newFrames = project.frames.filter((_, i) => i !== activeFrame)
    setProject(prev => ({ ...prev, frames: newFrames }))
    setActiveFrame(Math.min(activeFrame, newFrames.length - 1))
  }

  // --- Export ---

  function exportSpriteSheet(): string {
    // Create a horizontal strip sprite sheet
    const canvas = document.createElement('canvas')
    const frameCount = project.frames.length
    canvas.width = size * frameCount
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    for (let f = 0; f < frameCount; f++) {
      const fr = project.frames[f]
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const rgba = fr.pixels[y]?.[x]
          if (rgba && rgba[3] > 0) {
            ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
            ctx.fillRect(f * size + x, y, 1, 1)
          }
        }
      }
    }

    return canvas.toDataURL('image/png')
  }

  function handleSave() {
    const dataUrl = exportSpriteSheet()
    onSave(dataUrl, project.name, project.frames.length)
  }

  // --- Tool buttons ---
  const tools: Array<{ id: Tool; icon: string; label: string }> = [
    { id: 'draw', icon: '✏️', label: 'Draw' },
    { id: 'erase', icon: '🧹', label: 'Erase' },
    { id: 'fill', icon: '🪣', label: 'Fill' },
    { id: 'pick', icon: '💉', label: 'Pick Color' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#313244]">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎨</span>
            <input
              type="text"
              value={project.name}
              onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="bg-transparent text-[#cdd6f4] font-bold text-lg outline-none border-b border-transparent focus:border-[#89b4fa] w-40"
              spellCheck={false}
            />
            <span className="text-xs text-[#585b70]">{size}x{size}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#a6e3a1] text-[#1e1e2e] text-sm font-semibold rounded-lg hover:bg-[#a6e3a1]/80"
            >
              Save Sprite
            </button>
            <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left — Tools + Palette */}
          <div className="w-48 border-r border-[#313244] p-3 flex flex-col gap-4 overflow-y-auto">
            {/* Tools */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Tools</p>
              <div className="grid grid-cols-2 gap-1">
                {tools.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                      tool === t.id ? 'bg-[#89b4fa] text-[#1e1e2e] font-semibold' : 'text-[#cdd6f4] hover:bg-[#313244]'
                    }`}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current color */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-[#45475a]"
                  style={{ background: color }}
                />
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-8 h-8 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Palette */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Palette</p>
              <div className="grid grid-cols-4 gap-1">
                {DEFAULT_PALETTE.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setColor(c); setTool('draw') }}
                    className={`w-7 h-7 rounded border transition-transform ${
                      color === c ? 'border-white scale-110' : 'border-[#45475a] hover:scale-105'
                    }`}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Grid size */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Grid Size</p>
              <div className="flex gap-1">
                {[16, 24, 32].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      if (s === size) return
                      setProject({
                        ...project,
                        size: s,
                        frames: [createEmptyFrame(s, 'frame-1')],
                      })
                      setActiveFrame(0)
                    }}
                    className={`flex-1 py-1 text-xs rounded ${
                      s === size ? 'bg-[#89b4fa] text-[#1e1e2e] font-bold' : 'text-[#6c7086] hover:bg-[#313244]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Preview</p>
              <div className="bg-[#313244] rounded-lg p-3 flex flex-col items-center gap-2">
                <canvas
                  ref={previewRef}
                  style={{ imageRendering: 'pixelated', width: 64, height: 64 }}
                  className="rounded"
                />
                {project.frames.length > 1 && (
                  <button
                    onClick={() => { setPlaying(!playing); setPlayFrame(0) }}
                    className={`text-xs px-3 py-1 rounded ${playing ? 'bg-[#f38ba8] text-[#1e1e2e]' : 'bg-[#45475a] text-[#cdd6f4]'}`}
                  >
                    {playing ? '⏹ Stop' : '▶ Play'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Center — Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#11111b]">
            <canvas
              ref={canvasRef}
              style={{ imageRendering: 'pixelated', cursor: tool === 'pick' ? 'crosshair' : 'pointer' }}
              className="rounded-lg"
              onMouseDown={e => {
                setIsDrawing(true)
                const { x, y } = getPixelCoords(e)
                setPixel(x, y)
              }}
              onMouseMove={e => {
                if (!isDrawing) return
                if (tool === 'fill' || tool === 'pick') return
                const { x, y } = getPixelCoords(e)
                setPixel(x, y)
              }}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
            />
          </div>

          {/* Right — Frames */}
          <div className="w-36 border-l border-[#313244] p-3 flex flex-col gap-2 overflow-y-auto">
            <p className="text-[10px] uppercase text-[#585b70] tracking-wider">Frames</p>

            {project.frames.map((f, i) => (
              <button
                key={i}
                onClick={() => { setActiveFrame(i); setPlaying(false) }}
                className={`p-2 rounded-lg text-left transition-colors ${
                  i === activeFrame ? 'bg-[#313244] border border-[#89b4fa]' : 'hover:bg-[#313244] border border-transparent'
                }`}
              >
                <div className="text-[10px] text-[#6c7086] mb-1">{f.name}</div>
                <FrameThumbnail frame={f} size={size} />
              </button>
            ))}

            <div className="flex gap-1 mt-1">
              <button
                onClick={addFrame}
                className="flex-1 py-1.5 text-xs bg-[#313244] text-[#cdd6f4] rounded hover:bg-[#45475a]"
                title="New frame"
              >
                +
              </button>
              <button
                onClick={duplicateFrame}
                className="flex-1 py-1.5 text-xs bg-[#313244] text-[#cdd6f4] rounded hover:bg-[#45475a]"
                title="Duplicate frame"
              >
                📋
              </button>
              {project.frames.length > 1 && (
                <button
                  onClick={deleteFrame}
                  className="flex-1 py-1.5 text-xs bg-[#313244] text-[#f38ba8] rounded hover:bg-[#45475a]"
                  title="Delete frame"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Tiny thumbnail of a frame */
function FrameThumbnail({ frame, size }: { frame: SpriteFrame; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const px = 2
    canvas.width = size * px
    canvas.height = size * px
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const rgba = frame.pixels[y]?.[x]
        if (rgba && rgba[3] > 0) {
          ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
          ctx.fillRect(x * px, y * px, px, px)
        }
      }
    }
  }, [frame, size])

  return (
    <canvas
      ref={ref}
      style={{ imageRendering: 'pixelated', width: '100%', height: 'auto' }}
      className="rounded bg-[#11111b]"
    />
  )
}
