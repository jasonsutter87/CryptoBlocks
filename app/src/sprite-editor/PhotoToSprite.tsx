/**
 * Photo → Sprite converter. Drop or upload a photo, pick a grid size,
 * preview the pixel art result, save to library or share.
 */

import { useCallback, useRef, useState } from 'react'
import { showToast } from '../components/Toast'

interface PhotoToSpriteProps {
  onClose: () => void
}

const SIZES = [8, 16, 32, 64] as const

export default function PhotoToSprite({ onClose }: PhotoToSpriteProps) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [size, setSize] = useState<number>(16)
  const [pixelUrl, setPixelUrl] = useState<string | null>(null)
  const [name, setName] = useState('my-sprite')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback((img: HTMLImageElement, gridSize: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = gridSize
    canvas.height = gridSize
    const ctx = canvas.getContext('2d')!
    // Nearest-neighbor off for the downscale (browser bilinear gives
    // better color averaging), then we read back pixel-perfect data.
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'medium'

    // Crop to square (center)
    const min = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - min) / 2
    const sy = (img.naturalHeight - min) / 2
    ctx.drawImage(img, sx, sy, min, min, 0, 0, gridSize, gridSize)

    // Re-export with nearest-neighbor scaling for the preview
    setPixelUrl(canvas.toDataURL('image/png'))
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setSourceUrl(url)
      const img = new Image()
      img.onload = () => processImage(img, size)
      img.src = url
    }
    reader.readAsDataURL(file)
  }, [size, processImage])

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize)
    if (!sourceUrl) return
    const img = new Image()
    img.onload = () => processImage(img, newSize)
    img.src = sourceUrl
  }, [sourceUrl, processImage])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const saveToLibrary = () => {
    if (!pixelUrl) return
    const lib = JSON.parse(localStorage.getItem('cryptoblocks-sprites') || '{}')
    lib[name] = { dataUrl: pixelUrl, frames: 1, size }
    localStorage.setItem('cryptoblocks-sprites', JSON.stringify(lib))
    showToast(`"${name}" saved to sprites!`, 'success')
  }

  const shareToLibrary = async () => {
    if (!pixelUrl) return
    try {
      const token = await (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string> } } }).Clerk?.session?.getToken()
      const res = await fetch('/api/sprites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name, dataUrl: pixelUrl, frames: 1, size, tags: ['photo'] }),
      })
      if (res.ok) showToast('Shared to Sprite Library!', 'success')
      else showToast('Share failed', 'error')
    } catch {
      showToast('Share failed', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-mantle border border-surface-0 rounded-xl w-[90vw] max-w-[600px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-0">
          <h2 className="text-lg font-bold text-text">Photo → Sprite</h2>
          <button onClick={onClose} className="text-overlay hover:text-text text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Drop zone / file picker */}
          {!sourceUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-surface-1 rounded-xl py-16 text-center cursor-pointer hover:border-accent transition-colors"
            >
              <span className="text-3xl block mb-2">📸</span>
              <p className="text-text font-semibold">Drop a photo here</p>
              <p className="text-xs text-overlay mt-1">or click to browse</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }} />
            </div>
          ) : (
            <>
              {/* Size selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-overlay uppercase tracking-wider font-semibold">Grid</span>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(s)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      size === s ? 'bg-accent text-base' : 'bg-surface-0 text-subtext hover:bg-surface-1'
                    }`}
                  >
                    {s}×{s}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="flex gap-6 items-center justify-center">
                <div className="text-center">
                  <p className="text-[10px] text-overlay mb-1 uppercase">Original</p>
                  <img src={sourceUrl} alt="source" className="w-32 h-32 object-cover rounded-lg border border-surface-0" />
                </div>
                <div className="text-text text-2xl">→</div>
                <div className="text-center">
                  <p className="text-[10px] text-overlay mb-1 uppercase">Sprite ({size}×{size})</p>
                  {pixelUrl && (
                    <img
                      src={pixelUrl}
                      alt="sprite"
                      className="w-32 h-32 object-contain rounded-lg border border-surface-0 bg-crust"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
              </div>

              {/* Hidden work canvas */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Name + actions */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="sprite name"
                  className="flex-1 bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                />
                <button
                  onClick={saveToLibrary}
                  className="px-4 py-2 text-sm font-bold text-base bg-success hover:bg-success/80 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={shareToLibrary}
                  className="px-4 py-2 text-sm font-bold text-base bg-accent hover:bg-accent/80 rounded-lg"
                >
                  Share
                </button>
              </div>

              <button
                onClick={() => { setSourceUrl(null); setPixelUrl(null) }}
                className="text-xs text-overlay hover:text-text self-center"
              >
                ← pick a different photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
