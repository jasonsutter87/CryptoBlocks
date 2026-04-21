/**
 * Whiteboard — freeform drawing canvas in the Peek panel.
 * Pen, eraser, colors, stroke width, clear. Saves to localStorage.
 */

import { useRef, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'cb-whiteboard'
const COLORS = ['#cdd6f4', '#f38ba8', '#a6e3a1', '#89b4fa', '#f9e2af', '#cba6f7', '#fab387', '#f5c2e7']

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#cdd6f4')
  const [lineWidth, setLineWidth] = useState(2)
  const [eraser, setEraser] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Load saved drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const saved = canvas.toDataURL()
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      // Restore after resize
      const img = new Image()
      img.onload = () => { ctx.drawImage(img, 0, 0) }
      img.src = saved
    }

    resize()

    // Load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const img = new Image()
        img.onload = () => { ctx.drawImage(img, 0, 0) }
        img.src = saved
      }
    } catch { /* no saved drawing */ }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [])

  // Save to localStorage (debounced)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const save = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      try {
        const dataUrl = canvas.toDataURL('image/png')
        // Cap at 2 MB to avoid filling localStorage (5 MB shared budget)
        if (dataUrl.length <= 2_097_152) {
          localStorage.setItem(STORAGE_KEY, dataUrl)
        }
      } catch { /* storage full or canvas tainted */ }
    }, 500)
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true)
    lastPos.current = getPos(e)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !lastPos.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = eraser ? '#1e1e2e' : color
    ctx.lineWidth = eraser ? lineWidth * 4 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  const stopDraw = () => {
    setDrawing(false)
    lastPos.current = null
    save()
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    save()
  }

  return (
    <div className="flex flex-col h-full bg-base">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-mantle border-b border-surface-0 shrink-0">
        <span className="text-xs text-overlay uppercase tracking-wide font-semibold mr-1">
          Whiteboard
        </span>

        {/* Colors */}
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setEraser(false) }}
            className={`w-4 h-4 rounded-full border-2 transition-transform ${
              color === c && !eraser ? 'border-white scale-125' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}

        <div className="w-px h-4 bg-surface-1 mx-1" />

        {/* Stroke width */}
        {[1, 2, 4, 8].map((w) => (
          <button
            key={w}
            onClick={() => { setLineWidth(w); setEraser(false) }}
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
              lineWidth === w && !eraser ? 'bg-surface-1' : ''
            }`}
            title={`${w}px`}
          >
            <div
              className="rounded-full bg-text"
              style={{ width: Math.max(3, w + 1), height: Math.max(3, w + 1) }}
            />
          </button>
        ))}

        <div className="w-px h-4 bg-surface-1 mx-1" />

        {/* Eraser */}
        <button
          onClick={() => setEraser(!eraser)}
          className={`px-2 py-0.5 text-xs rounded transition-colors ${
            eraser ? 'bg-danger text-white' : 'text-overlay hover:text-text'
          }`}
        >
          Eraser
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="px-2 py-0.5 text-xs text-overlay hover:text-danger transition-colors ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  )
}
