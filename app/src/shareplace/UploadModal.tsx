import { useState } from 'react'
import TagSelector from '../components/TagSelector'
import { useUser, useAuth } from '../auth'
import { publishProject, updateProject } from './api'
import { checkAchievements } from '../achievements/tracker'
import { CATEGORIES } from './constants'
import { ShareplaceModal, fieldClass, labelClass } from './ShareplaceModal'

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

export default function UploadModal({ onClose, onPublished, existingProject }: UploadModalProps) {
  const { user } = useUser()
  const { getToken } = useAuth()

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
  const [tags, setTags] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const workspaceJson = existingProject?.workspaceJson ?? (() => {
    try { return localStorage.getItem('cryptoblocks_workspace') || '' } catch { return '' }
  })()
  const blockCount = existingProject?.blockCount ?? (() => {
    try { return JSON.parse(workspaceJson)?.blocks?.blocks?.length ?? 0 } catch { return 0 }
  })()

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
      tags,
      blockCount: Number(blockCount) || 0,
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
      setError(result.error + ((result as { detail?: string }).detail ? ': ' + (result as { detail?: string }).detail : ''))
    } else {
      if (remixParent?.id) {
        checkAchievements({ event: 'remix', parentProjectId: remixParent.id })
      }
      localStorage.removeItem('cryptoblocks_remix_parent')
      onPublished?.()
      onClose()
    }
  }

  const isValid = name.trim().length > 0 && description.trim().length > 0 && !!workspaceJson

  return (
    <ShareplaceModal
      title="Upload to Shareplace"
      subtitle="Share your project with the community"
      onClose={onClose}
      footer={
        <>
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
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Awesome Game"
          className={fieldClass + ' placeholder-overlay'}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does your project do? What makes it interesting?"
          rows={3}
          className={fieldClass + ' placeholder-overlay resize-none'}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldClass + ' cursor-pointer'}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Tags</label>
        <TagSelector selected={tags} onChange={setTags} />
      </div>

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
    </ShareplaceModal>
  )
}
