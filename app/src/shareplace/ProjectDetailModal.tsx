import { useState, useEffect } from 'react'
import { useAuth } from '../auth'
import { useIsPro } from '../billing/useIsPro'
import type { SharedProject } from '../types/shareplace'
import { fetchRemixTree, type RemixTree } from './api'
import RemixModal from './RemixModal'
import RemixTreeView from './RemixTreeView'
import ShareCardButton from './ShareCard'
import { showToast } from '../components/Toast'
import EditListingModal from './EditListingModal'
import RemoveListingModal from './RemoveListingModal'

interface ProjectDetailModalProps {
  project: SharedProject
  isOwner?: boolean
  onClose: () => void
  onRemix?: () => void
  onEdit?: () => void
  onRemove?: () => void
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Games: 'from-accent/30 to-sapphire/20',
  Art: 'from-purple/30 to-[#f5c2e7]/20',
  Web: 'from-danger/30 to-[#eba0ac]/20',
  Sound: 'from-peach/30 to-warn/20',
  Data: 'from-success/30 to-[#94e2d5]/20',
  AI: 'from-warn/30 to-peach/20',
}

const CATEGORY_ICON_COLORS: Record<string, string> = {
  Games: '#89b4fa',
  Art: '#cba6f7',
  Web: '#f38ba8',
  Sound: '#fab387',
  Data: '#a6e3a1',
  AI: '#f9e2af',
}

const CATEGORY_PILL_COLORS: Record<string, string> = {
  Games: 'bg-accent/15 text-accent',
  Art: 'bg-purple/15 text-purple',
  Web: 'bg-danger/15 text-danger',
  Sound: 'bg-peach/15 text-peach',
  Data: 'bg-success/15 text-success',
  AI: 'bg-warn/15 text-warn',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Games: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14 opacity-60">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h-3m0 0H9m3 0V9m0 3v3M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  ),
  Art: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14 opacity-60">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  Web: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14 opacity-60">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  Sound: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14 opacity-60">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  ),
  Data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14 opacity-60">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  AI: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14 opacity-60">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
}

type SubModal = 'remix' | 'edit' | 'remove' | null

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ProjectDetailModal({
  project,
  isOwner = false,
  onClose,
  onRemix,
  onEdit: _onEdit,
  onRemove,
}: ProjectDetailModalProps) {
  const [subModal, setSubModal] = useState<SubModal>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !subModal) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, subModal])

  const gradient = CATEGORY_GRADIENTS[project.category] ?? 'from-surface-0/60 to-surface-1/40'
  const iconColor = CATEGORY_ICON_COLORS[project.category] ?? '#6c7086'
  const pillClass = CATEGORY_PILL_COLORS[project.category] ?? 'bg-surface-1/40 text-subtext'

  const [downloading, setDownloading] = useState(false)
  const [opening, setOpening] = useState(false)
  const { getToken } = useAuth()
  const { isAdmin } = useIsPro()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(project.likes)
  const [remixTree, setRemixTree] = useState<RemixTree | null>(null)

  useEffect(() => {
    fetchRemixTree(project.id).then(setRemixTree)
  }, [project.id])

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setLikeCount((c) => c + 1)
    try {
      const token = await getToken()
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/projects/${project.id}/like`, { method: 'POST', headers })
      if (!res.ok) throw new Error('like failed')
    } catch {
      setLiked(false)
      setLikeCount((c) => c - 1)
    }
  }

  const handleOpenInEditor = async () => {
    setOpening(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const workspaceJson = data.workspaceJson || '{}'
      localStorage.setItem('cryptoblocks_workspace', workspaceJson)
      // Force a full page reload so the editor picks up the new workspace
      // from localStorage (React Router navigate doesn't re-run the
      // loadFromLocalStorage effect on the App component)
      window.location.href = '/'
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Open in editor failed:', err)
      setOpening(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      const data = await res.json()
      const workspaceJson = data.workspaceJson || '{}'

      // Increment download count in the background
      fetch(`/api/projects/${project.id}/download`, { method: 'POST' }).catch(() => {})

      const blob = new Blob([workspaceJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.blocks`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Download failed:', err)
    }
    setDownloading(false)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden max-h-[90vh] flex flex-col">
          {/* Category gradient header */}
          <div className={`bg-gradient-to-br ${gradient} px-6 py-8 flex items-center gap-5 relative shrink-0`}>
            <div style={{ color: iconColor }}>
              {CATEGORY_ICONS[project.category] ?? CATEGORY_ICONS['Web']}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pillClass}`}>
                  {project.category}
                </span>
              </div>
              <h2 className="text-text font-bold text-xl leading-tight">{project.name}</h2>
              <p className="text-subtext text-sm mt-0.5">by <span className="text-accent">{project.author}</span></p>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-overlay hover:text-text transition-colors p-1 rounded-lg hover:bg-black/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-mantle rounded-lg px-3 py-2.5 flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-text font-semibold text-sm">{project.blockCount}</span>
                <span className="text-[10px] text-overlay">blocks</span>
              </div>
              <div className="bg-mantle rounded-lg px-3 py-2.5 flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span className="text-text font-semibold text-sm">{project.downloads.toLocaleString()}</span>
                <span className="text-[10px] text-overlay">downloads</span>
              </div>
              <button
                onClick={handleLike}
                disabled={liked}
                className={`bg-mantle rounded-lg px-3 py-2.5 flex flex-col items-center gap-1 transition-colors ${liked ? 'ring-1 ring-danger' : 'hover:bg-base cursor-pointer'}`}
                title={liked ? 'Liked!' : 'Like this project'}
              >
                <svg className="w-4 h-4 text-danger" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span className="text-text font-semibold text-sm">{likeCount}</span>
                <span className="text-[10px] text-overlay">{liked ? 'liked!' : 'likes'}</span>
              </button>
              <div className="bg-mantle rounded-lg px-3 py-2.5 flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-peach" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span className="text-text font-semibold text-sm leading-tight text-center">
                  {formatDate(project.createdAt)}
                </span>
                <span className="text-[10px] text-overlay">created</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-medium text-overlay uppercase tracking-wider mb-2">About</h3>
              <p className="text-subtext text-sm leading-relaxed">{project.description}</p>
            </div>

            {/* "Remixed from" badge */}
            {remixTree && remixTree.ancestors.length > 0 && (
              <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                <span className="text-xs text-subtext">
                  Remixed from{' '}
                  <span className="text-success font-semibold">{remixTree.ancestors[remixTree.ancestors.length - 1].name}</span>
                  {' '}by{' '}
                  <span className="text-accent">{remixTree.ancestors[remixTree.ancestors.length - 1].authorName}</span>
                </span>
              </div>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-overlay uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-overlay bg-mantle border border-surface-0 px-2 py-0.5 rounded font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Remix tree */}
            {remixTree && (remixTree.ancestors.length > 0 || remixTree.children.length > 0) && (
              <div>
                <h3 className="text-xs font-medium text-overlay uppercase tracking-wider mb-3">Remix Tree</h3>
                <RemixTreeView
                  ancestors={remixTree.ancestors}
                  currentProject={{ id: project.id, name: project.name, authorName: project.author }}
                  children={remixTree.children}
                  remixCount={remixTree.remixCount}
                  onNodeClick={(id) => {
                    // Could navigate to that project — for now just log
                    // eslint-disable-next-line no-console
                    console.log('Navigate to project:', id)
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 pb-6 pt-4 border-t border-surface-0 flex flex-wrap gap-2 shrink-0">
            {/* Primary actions */}
            <button
              onClick={handleOpenInEditor}
              disabled={opening}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-base bg-warn hover:bg-warn/80 rounded-lg transition-colors disabled:opacity-60"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {opening ? 'Loading...' : 'Open in Editor'}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-base bg-success hover:bg-success/80 rounded-lg transition-colors disabled:opacity-60"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              {downloading ? 'Downloading...' : 'Download .blocks'}
            </button>
            <button
              onClick={() => setSubModal('remix')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-base bg-accent hover:bg-accent/80 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Remix
            </button>

            {/* Owner actions */}
            {isOwner && (
              <>
                <button
                  onClick={() => setSubModal('edit')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setSubModal('remove')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Remove
                </button>
              </>
            )}

            {/* Share Card */}
            <ShareCardButton project={project} />

            {/* Admin delete */}
            {isAdmin && (
              <button
                onClick={async () => {
                  if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return
                  try {
                    const token = await getToken()
                    await fetch(`/api/projects/${project.id}`, {
                      method: 'DELETE',
                      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    })
                    onClose()
                    window.location.reload()
                  } catch {}
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors"
                title="Admin: delete this project"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}

            {/* Report */}
            {!isOwner && (
              <button
                onClick={async () => {
                  const reason = prompt('Why are you reporting this project?')
                  if (!reason) return
                  try {
                    const t = await getToken()
                    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
                    if (t) headers['Authorization'] = `Bearer ${t}`
                    await fetch(`/api/projects/${project.id}/report`, {
                      method: 'POST', headers,
                      body: JSON.stringify({ reason }),
                    })
                    showToast('Thank you for reporting. We will review this project.', 'success')
                  } catch {}
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs text-overlay hover:text-danger transition-colors"
                title="Report this project"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
                Report
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 text-sm text-subtext hover:text-text transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {subModal === 'remix' && (
        <RemixModal
          project={project}
          onClose={() => setSubModal(null)}
          onConfirm={() => { setSubModal(null); onRemix?.(); onClose() }}
        />
      )}
      {subModal === 'edit' && (
        <EditListingModal
          project={project}
          onClose={() => setSubModal(null)}
          onSaved={() => { _onEdit?.() }}
        />
      )}
      {subModal === 'remove' && (
        <RemoveListingModal
          project={project}
          onClose={() => setSubModal(null)}
          onConfirm={() => { setSubModal(null); onRemove?.(); onClose() }}
        />
      )}
    </>
  )
}
