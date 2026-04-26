/**
 * Sprite Browser — two tabs:
 *   • My Sprites: this user's personal library (Turso-backed, localStorage cache)
 *   • Community: public sprites people have shared via /api/sprites
 *
 * Launched from the Sprite Editor or Build menu.
 */

import { useEffect, useState } from 'react'
import { showToast } from '../components/Toast'
import { pushSprite, fetchUserSprites, deleteSprite } from './sync'
import type { UserSprite } from './sync'

interface SharedSprite {
  id: string
  name: string
  authorName: string
  dataUrl: string
  frames: number
  size: number
  likes: number
}

interface MySprite extends UserSprite {
  name: string
}

interface SpriteBrowserProps {
  onClose: () => void
}

type Tab = 'mine' | 'community'

function readLocalLibrary(): MySprite[] {
  try {
    const raw = JSON.parse(localStorage.getItem('cryptoblocks-sprites') || '{}') as Record<string, UserSprite>
    return Object.entries(raw).map(([name, s]) => ({ name, ...s }))
  } catch {
    return []
  }
}

export default function SpriteBrowser({ onClose }: SpriteBrowserProps) {
  const [tab, setTab] = useState<Tab>('mine')
  const [sprites, setSprites] = useState<SharedSprite[]>([])
  const [mine, setMine] = useState<MySprite[]>(() => readLocalLibrary())
  const [loading, setLoading] = useState(false)

  // Load community sprites lazily on first switch
  useEffect(() => {
    if (tab !== 'community' || sprites.length > 0) return
    setLoading(true)
    fetch('/api/sprites?limit=50')
      .then((r) => r.json())
      .then((data) => setSprites(data.sprites ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tab, sprites.length])

  // Refresh personal library from server on mount (multi-device sync)
  useEffect(() => {
    void fetchUserSprites().then(() => setMine(readLocalLibrary()))
  }, [])

  const addToLibrary = (sprite: SharedSprite) => {
    pushSprite(sprite.name, {
      dataUrl: sprite.dataUrl,
      frames: sprite.frames,
      width: sprite.size,
      height: sprite.size,
    })
    setMine(readLocalLibrary())
    showToast(`"${sprite.name}" added to your sprites!`, 'success')
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return
    await deleteSprite(name)
    setMine(readLocalLibrary())
    showToast(`Deleted "${name}"`, 'info')
  }

  const handleCopyName = (name: string) => {
    navigator.clipboard?.writeText(name).catch(() => {})
    showToast(`Copied "${name}" — paste into a sprite_editor_image block`, 'success')
  }

  const tabClass = (active: boolean) =>
    `flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-accent text-base' : 'text-overlay hover:text-text hover:bg-surface-0'
    }`

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

        <div className="px-6 pt-3 pb-2">
          <div className="flex gap-1 bg-base p-1 rounded-lg">
            <button onClick={() => setTab('mine')} className={tabClass(tab === 'mine')}>
              My Sprites <span className="opacity-60 ml-1">({mine.length})</span>
            </button>
            <button onClick={() => setTab('community')} className={tabClass(tab === 'community')}>
              Community
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {tab === 'mine' ? (
            mine.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🎨</span>
                <p className="text-text font-semibold">Your library is empty</p>
                <p className="text-sm text-overlay mt-1">Open the Sprite Editor to draw your first one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {mine.map((s) => {
                  const w = s.width ?? s.size ?? 16
                  const h = s.height ?? s.size ?? 16
                  return (
                    <div
                      key={s.name}
                      className="bg-base border border-surface-0 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-surface-1 transition-colors group"
                    >
                      <img
                        src={s.dataUrl}
                        alt={s.name}
                        className="w-16 h-16 object-contain cursor-pointer"
                        style={{ imageRendering: 'pixelated' }}
                        onClick={() => handleCopyName(s.name)}
                        title="Click to copy name"
                      />
                      <div className="text-xs font-semibold text-text text-center truncate w-full">{s.name}</div>
                      <div className="text-[10px] text-overlay">
                        {w}×{h}{s.frames > 1 ? ` · ${s.frames}f` : ''}
                      </div>
                      <button
                        onClick={() => handleDelete(s.name)}
                        className="w-full px-2 py-1 text-xs font-bold text-base bg-danger hover:opacity-80 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          ) : loading ? (
            <div className="text-overlay text-center py-12 animate-pulse">Loading sprites…</div>
          ) : sprites.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">🌍</span>
              <p className="text-text font-semibold">No community sprites yet</p>
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
