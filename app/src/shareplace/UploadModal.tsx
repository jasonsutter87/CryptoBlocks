import { useState, useEffect } from 'react'
import { useUser, useAuth } from '../auth'
import { publishProject, updateProject } from './api'

interface UploadModalProps {
  onClose: () => void
  onPublished?: () => void
  /** When set, modal pre-fills from this project and PATCHes on submit
   *  instead of POSTing a new project. Used by dashboard "Publish". */
  existingProject?: {
    id: string
    name: string
    description?: string
    category?: string
    workspaceJson: string
    blockCount: number
  }
}

const CATEGORIES = ['Games', 'Art', 'Web', 'Sound', 'Data', 'AI'] as const

export default function UploadModal({ onClose, onPublished, existingProject }: UploadModalProps) {
  const { user } = useUser()
  const { getToken } = useAuth()

  // Check if this upload is a remix of another project
  const remixParent = (() => {
    if (existingProject) return null
    try {
      const raw = localStorage.getItem('cryptoblocks_remix_parent')
      return raw ? JSON.parse(raw) as { id: string; name: string; author: string } : null
    } catch { return null }
  })()

  const [name, setName] = useState(
    existingProject?.name ?? (remixParent ? `${remixParent.name} (remix)` : ''),
  )
  const [description, setDescription] = useState(existingProject?.description ?? '')
  const [category, setCategory] = useState<string>(existingProject?.category ?? 'Games')
  const [tags, setTags] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use existing project's workspace if provided, otherwise read from localStorage
  const workspaceJson = existingProject?.workspaceJson ?? (() => {
    try {
      return localStorage.getItem('cryptoblocks_workspace') || ''
    } catch {
      return ''
    }
  })()
  const blockCount = existingProject?.blockCount ?? (() => {
    try {
      const ws = JSON.parse(workspaceJson)
      return ws?.blocks?.blocks?.length ?? 0
    } catch {
      return 0
    }
  })()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleUpload = async () => {
    if (!workspaceJson) {
      setError('No workspace to upload — build something in the editor first!')
      return
    }
    setUploading(true)
    setError(null)
    const token = await getToken() || undefined
    const payload = {
      name: name.trim(),
      authorName: user?.fullName || user?.username || 'Anonymous',
      description: description.trim(),
      category,
      workspaceJson,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      blockCount,
      parentId: remixParent?.id,
      visibility: 'public' as const,
    }
    const result = existingProject
      ? await updateProject(existingProject.id, payload, token)
      : await publishProject(payload, token)
    setUploading(false)
    if (!result) {
      setError('Upload failed — check your connection and try again.')
    } else if ('error' in result) {
      setError(result.error)
    } else {
      localStorage.removeItem('cryptoblocks_remix_parent')
      onPublished?.()
      onClose()
    }
  }

  const isValid = name.trim().length > 0 && description.trim().length > 0 && !!workspaceJson

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-0">
          <div>
            <h2 className="text-text font-semibold text-base">Upload to Shareplace</h2>
            <p className="text-overlay text-xs mt-0.5">Share your project with the community</p>
          </div>
          <button
            onClick={onClose}
            className="text-overlay hover:text-text transition-colors p-1 rounded-lg hover:bg-surface-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Project name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Awesome Game"
              className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 placeholder-overlay focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your project do? What makes it interesting?"
              rows={3}
              className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 placeholder-overlay focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext">
              Tags <span className="text-overlay font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. game, puzzle, beginner"
              className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 placeholder-overlay focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Preview */}
          <div className="bg-mantle border border-surface-0 rounded-lg px-4 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <p className="text-xs text-overlay">Current workspace</p>
              <p className="text-sm text-text font-medium">Ready to upload</p>
            </div>
            <span className="ml-auto text-xs text-success bg-surface-0 px-2 py-1 rounded font-mono">
              {blockCount} blocks
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!isValid || uploading}
            className="px-4 py-2 text-sm font-semibold text-base bg-accent hover:bg-accent/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {error && (
            <p className="text-xs text-danger mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
