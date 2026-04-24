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
import { getClerkToken } from '../auth'

interface SpriteEditorProps {
  onClose: () => void
  onSave: (dataUrl: string, name: string, frames: number) => void
  initialProject?: SpriteProject
}

function createEmptyFrame(width: number, height: number, name: string): SpriteFrame {
  const pixels: RGBA[][] = []
  for (let y = 0; y < height; y++) {
    const row: RGBA[] = []
    for (let x = 0; x < width; x++) {
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
  const migratedInitial = initialProject
    ? {
        ...initialProject,
        width: initialProject.width ?? initialProject.size ?? 16,
        height: initialProject.height ?? initialProject.size ?? 16,
      }
    : null
  const [project, setProject] = useState<SpriteProject>(
    migratedInitial || {
      name: 'my-sprite',
      width: 16,
      height: 16,
      frames: [createEmptyFrame(16, 16, 'frame-1')],
      palette: [...DEFAULT_PALETTE],
    }
  )
  const [activeFrame, setActiveFrame] = useState(0)
  const [color, setColor] = useState('#000000')
  const [tool, setTool] = useState<Tool>('draw')
  const [isDrawing, setIsDrawing] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [playFrame, setPlayFrame] = useState(0)
  const [traceImg, setTraceImg] = useState<HTMLImageElement | null>(null)
  const [traceOpacity, setTraceOpacity] = useState(0.5)
  const [traceVisible, setTraceVisible] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const traceFileRef = useRef<HTMLInputElement>(null)

  const frame = project.frames[activeFrame]
  const width = project.width
  const height = project.height
  const maxCanvasPx = Math.min(640, window.innerWidth - 300)
  const pixelSize = Math.max(2, Math.floor(maxCanvasPx / Math.max(width, height)))

  // Draw the grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !frame) return
    const ctx = canvas.getContext('2d')!
    const totalW = width * pixelSize
    const totalH = height * pixelSize

    canvas.width = totalW
    canvas.height = totalH

    // Checkerboard background (transparency indicator)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = x * pixelSize
        const py = y * pixelSize
        ctx.fillStyle = (x + y) % 2 === 0 ? '#2a2a3d' : '#232336'
        ctx.fillRect(px, py, pixelSize, pixelSize)
      }
    }

    // Trace image (between checkerboard and pixels, letterboxed to fit)
    if (traceImg && traceVisible && traceImg.width > 0) {
      const imgRatio = traceImg.width / traceImg.height
      const canvasRatio = totalW / totalH
      let dw = totalW
      let dh = totalH
      if (imgRatio > canvasRatio) dh = totalW / imgRatio
      else dw = totalH * imgRatio
      const dx = (totalW - dw) / 2
      const dy = (totalH - dh) / 2
      ctx.globalAlpha = traceOpacity
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(traceImg, dx, dy, dw, dh)
      ctx.globalAlpha = 1
    }

    // Pixel art on top of trace
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rgba = frame.pixels[y]?.[x]
        if (rgba && rgba[3] > 0) {
          ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i <= width; i++) {
      ctx.beginPath()
      ctx.moveTo(i * pixelSize, 0)
      ctx.lineTo(i * pixelSize, totalH)
      ctx.stroke()
    }
    for (let i = 0; i <= height; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * pixelSize)
      ctx.lineTo(totalW, i * pixelSize)
      ctx.stroke()
    }
  }, [frame, width, height, pixelSize, traceImg, traceOpacity, traceVisible])

  useEffect(() => { drawGrid() }, [drawGrid, project])

  // Draw preview
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const f = playing ? project.frames[playFrame] : frame
    if (!f) return

    const previewPx = 4
    canvas.width = width * previewPx
    canvas.height = height * previewPx

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rgba = f.pixels[y]?.[x]
        if (rgba && rgba[3] > 0) {
          ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
          ctx.fillRect(x * previewPx, y * previewPx, previewPx, previewPx)
        }
      }
    }
  }, [frame, width, height, playing, playFrame, project.frames])

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
    if (x < 0 || x >= width || y < 0 || y >= height) return
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
      if (x < 0 || x >= width || y < 0 || y >= height) continue
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
    const newFrame = createEmptyFrame(width, height, `frame-${project.frames.length + 1}`)
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
    canvas.width = width * frameCount
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    for (let f = 0; f < frameCount; f++) {
      const fr = project.frames[f]
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const rgba = fr.pixels[y]?.[x]
          if (rgba && rgba[3] > 0) {
            ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
            ctx.fillRect(f * width + x, y, 1, 1)
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

  async function handleShare() {
    const dataUrl = exportSpriteSheet()
    try {
      const { showToast } = await import('../components/Toast')
      const token = await getClerkToken()
      const res = await fetch('/api/sprites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: project.name,
          dataUrl,
          frames: project.frames.length,
          size: Math.max(width, height),
          width,
          height,
          tags: [],
        }),
      })
      if (res.ok) showToast('Shared to Sprite Library!', 'success')
      else {
        const data = await res.json().catch(() => ({}))
        showToast(data.error || 'Share failed', 'error')
      }
    } catch {
      const { showToast } = await import('../components/Toast')
      showToast('Share failed — try again', 'error')
    }
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
        className="bg-base border border-surface-0 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎨</span>
            <input
              type="text"
              value={project.name}
              onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="bg-transparent text-text font-bold text-lg outline-none border-b border-transparent focus:border-accent w-40"
              spellCheck={false}
            />
            <span className="text-xs text-[#585b70]">{width}x{height}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-1.5 bg-accent text-base text-sm font-semibold rounded-lg hover:bg-accent/80"
            >
              Share
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-success text-base text-sm font-semibold rounded-lg hover:bg-success/80"
            >
              Save Sprite
            </button>
            <button onClick={onClose} className="text-overlay hover:text-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left — Tools + Palette */}
          <div className="w-48 border-r border-surface-0 p-3 flex flex-col gap-4 overflow-y-auto">
            {/* Tools */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Tools</p>
              <div className="grid grid-cols-2 gap-1">
                {tools.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                      tool === t.id ? 'bg-accent text-base font-semibold' : 'text-text hover:bg-surface-0'
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
                  className="w-8 h-8 rounded-lg border border-surface-1"
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase text-[#585b70] tracking-wider">Palette</p>
                <button
                  onClick={() => {
                    if (project.palette.includes(color)) return
                    setProject({ ...project, palette: [...project.palette, color] })
                  }}
                  className="text-[10px] text-accent hover:text-text px-1.5 py-0.5 rounded"
                  title="Add current color as a swatch"
                >
                  + Add
                </button>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {project.palette.map((c, i) => {
                  const isCustom = !(DEFAULT_PALETTE as readonly string[]).includes(c)
                  return (
                    <button
                      key={`${c}-${i}`}
                      onClick={() => { setColor(c); setTool('draw') }}
                      onContextMenu={e => {
                        e.preventDefault()
                        if (!isCustom) return
                        setProject({ ...project, palette: project.palette.filter((_, j) => j !== i) })
                      }}
                      className={`w-6 h-6 rounded border transition-transform ${
                        color === c ? 'border-white scale-110' : 'border-surface-1 hover:scale-105'
                      }`}
                      style={{ background: c }}
                      title={isCustom ? `${c} (right-click to remove)` : c}
                    />
                  )
                })}
              </div>
            </div>

            {/* Trace underlay */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Trace</p>
              <input
                ref={traceFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = URL.createObjectURL(file)
                  const img = new Image()
                  img.onload = () => {
                    setTraceImg(img)
                    setTraceVisible(true)
                  }
                  img.src = url
                }}
              />
              {!traceImg ? (
                <button
                  onClick={() => traceFileRef.current?.click()}
                  className="w-full text-xs py-1.5 rounded bg-surface-0 hover:bg-surface-1 text-overlay"
                >
                  Upload image
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTraceVisible(v => !v)}
                      className={`flex-1 text-xs py-1 rounded ${traceVisible ? 'bg-accent text-base' : 'bg-surface-0 text-overlay'}`}
                    >
                      {traceVisible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => { setTraceImg(null); setTraceVisible(true) }}
                      className="px-2 text-xs py-1 rounded bg-surface-0 text-overlay hover:text-text"
                      title="Remove trace image"
                    >
                      ✕
                    </button>
                  </div>
                  <label className="text-[10px] text-[#585b70]">
                    Opacity {Math.round(traceOpacity * 100)}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(traceOpacity * 100)}
                      onChange={e => setTraceOpacity(Number(e.target.value) / 100)}
                      className="w-full"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Grid size */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Grid Size</p>
              {(['width', 'height'] as const).map(dim => {
                const current = dim === 'width' ? width : height
                return (
                  <div key={dim} className="mb-2">
                    <p className="text-[9px] text-[#585b70] mb-1 capitalize">{dim}</p>
                    <div className="flex gap-1 flex-wrap">
                      {[16, 24, 32, 48, 64, 96, 128].map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            if (s === current) return
                            if (project.frames.some(f => f.pixels.some(row => row.some(p => p[3] > 0)))) {
                              if (!confirm(`Resize ${dim} to ${s}? This clears all frames.`)) return
                            }
                            const nextW = dim === 'width' ? s : width
                            const nextH = dim === 'height' ? s : height
                            setProject({
                              ...project,
                              width: nextW,
                              height: nextH,
                              frames: [createEmptyFrame(nextW, nextH, 'frame-1')],
                            })
                            setActiveFrame(0)
                          }}
                          className={`min-w-[36px] px-2 py-1 text-xs rounded ${
                            s === current ? 'bg-accent text-base font-bold' : 'text-overlay hover:bg-surface-0'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Preview */}
            <div>
              <p className="text-[10px] uppercase text-[#585b70] mb-2 tracking-wider">Preview</p>
              <div className="bg-surface-0 rounded-lg p-3 flex flex-col items-center gap-2">
                <canvas
                  ref={previewRef}
                  style={{
                    imageRendering: 'pixelated',
                    width: width >= height ? 64 : Math.round((64 * width) / height),
                    height: height >= width ? 64 : Math.round((64 * height) / width),
                  }}
                  className="rounded"
                />
                {project.frames.length > 1 && (
                  <button
                    onClick={() => { setPlaying(!playing); setPlayFrame(0) }}
                    className={`text-xs px-3 py-1 rounded ${playing ? 'bg-danger text-base' : 'bg-surface-1 text-text'}`}
                  >
                    {playing ? '⏹ Stop' : '▶ Play'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Center — Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-crust overflow-auto">
            <canvas
              ref={canvasRef}
              style={{ imageRendering: 'pixelated', cursor: tool === 'pick' ? 'crosshair' : 'pointer' }}
              className="rounded-lg flex-shrink-0"
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
          <div className="w-36 border-l border-surface-0 p-3 flex flex-col gap-2 overflow-y-auto">
            <p className="text-[10px] uppercase text-[#585b70] tracking-wider">Frames</p>

            {project.frames.map((f, i) => (
              <button
                key={i}
                onClick={() => { setActiveFrame(i); setPlaying(false) }}
                className={`p-2 rounded-lg text-left transition-colors ${
                  i === activeFrame ? 'bg-surface-0 border border-accent' : 'hover:bg-surface-0 border border-transparent'
                }`}
              >
                <div className="text-[10px] text-overlay mb-1">{f.name}</div>
                <FrameThumbnail frame={f} width={width} height={height} />
              </button>
            ))}

            <div className="flex gap-1 mt-1">
              <button
                onClick={addFrame}
                className="flex-1 py-1.5 text-xs bg-surface-0 text-text rounded hover:bg-surface-1"
                title="New frame"
              >
                +
              </button>
              <button
                onClick={duplicateFrame}
                className="flex-1 py-1.5 text-xs bg-surface-0 text-text rounded hover:bg-surface-1"
                title="Duplicate frame"
              >
                📋
              </button>
              {project.frames.length > 1 && (
                <button
                  onClick={deleteFrame}
                  className="flex-1 py-1.5 text-xs bg-surface-0 text-danger rounded hover:bg-surface-1"
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
function FrameThumbnail({ frame, width, height }: { frame: SpriteFrame; width: number; height: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const px = 2
    canvas.width = width * px
    canvas.height = height * px
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rgba = frame.pixels[y]?.[x]
        if (rgba && rgba[3] > 0) {
          ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
          ctx.fillRect(x * px, y * px, px, px)
        }
      }
    }
  }, [frame, width, height])

  return (
    <canvas
      ref={ref}
      style={{ imageRendering: 'pixelated', width: '100%', height: 'auto' }}
      className="rounded bg-crust"
    />
  )
}
