/**
 * Sprite Browser — browse community-shared sprites and add them to
 * your local library with one click. Launched from the Sprite Editor
 * or Build menu.
 */

import { useEffect, useState } from 'react'
import { showToast } from '../components/Toast'

interface SharedSprite {
  id: string
  name: string
  authorName: string
  dataUrl: string
  frames: number
  size: number
  likes: number
}

interface SpriteBrowserProps {
  onClose: () => void
}

export default function SpriteBrowser({ onClose }: SpriteBrowserProps) {
  const [sprites, setSprites] = useState<SharedSprite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sprites?limit=50')
      .then((r) => r.json())
      .then((data) => setSprites(data.sprites ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addToLibrary = (sprite: SharedSprite) => {
    const lib = JSON.parse(localStorage.getItem('cryptoblocks-sprites') || '{}')
    lib[sprite.name] = {
      dataUrl: sprite.dataUrl,
      frames: sprite.frames,
      size: sprite.size,
    }
    localStorage.setItem('cryptoblocks-sprites', JSON.stringify(lib))
    showToast(`"${sprite.name}" added to your sprites!`, 'success')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-mantle border border-surface-0 rounded-xl w-[90vw] max-w-[800px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-0">
          <h2 className="text-lg font-bold text-text">Sprite Library</h2>
          <button onClick={onClose} className="text-overlay hover:text-text text-xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-overlay text-center py-12 animate-pulse">Loading sprites…</div>
          ) : sprites.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">🎨</span>
              <p className="text-text font-semibold">No sprites shared yet</p>
              <p className="text-sm text-overlay mt-1">Be the first — open the Sprite Editor, create something, and hit Share!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {sprites.map((sprite) => (
                <div
                  key={sprite.id}
                  className="bg-base border border-surface-0 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-surface-1 transition-colors group"
                >
                  <img
                    src={sprite.dataUrl}
                    alt={sprite.name}
                    className="w-16 h-16 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="text-xs font-semibold text-text text-center truncate w-full">{sprite.name}</div>
                  <div className="text-[10px] text-overlay">
                    {sprite.size}×{sprite.size} · {sprite.frames}f · {sprite.authorName}
                  </div>
                  <button
                    onClick={() => addToLibrary(sprite)}
                    className="w-full px-2 py-1 text-xs font-bold text-base bg-accent hover:bg-sapphire rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
