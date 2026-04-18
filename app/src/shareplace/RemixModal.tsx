import { useState, useEffect } from 'react'
import type { SharedProject } from '../types/shareplace'
import { checkAchievements } from '../achievements/tracker'

interface RemixModalProps {
  project: SharedProject
  onClose: () => void
  onConfirm?: () => void
}

export default function RemixModal({ project, onClose, onConfirm }: RemixModalProps) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()

      // Save workspace to localStorage so editor loads it
      localStorage.setItem('cryptoblocks_workspace', data.workspaceJson || '{}')
      // Track the parent so UploadModal sets parentId on the remix upload
      localStorage.setItem('cryptoblocks_remix_parent', JSON.stringify({
        id: project.id,
        name: project.name,
        author: project.author,
      }))

      // Fire seed badge achievement immediately on remix
      checkAchievements({ event: 'remix', parentProjectId: project.id })

      onConfirm?.()
      onClose()
      window.location.href = '/'
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Remix failed:', err)
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>

        <h2 className="text-text font-semibold text-base mb-1">Remix this project?</h2>
        <p className="text-subtext text-sm mb-1">
          <span className="text-text font-medium">{project.name}</span>
          {' '}by{' '}
          <span className="text-accent">{project.author}</span>
        </p>
        <p className="text-overlay text-sm mt-3 leading-relaxed">
          This will create a copy in your editor. Your current workspace will be saved as a checkpoint first so you won't lose your work.
        </p>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-base bg-success hover:bg-success/80 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Remix'}
          </button>
        </div>
      </div>
    </div>
  )
}
