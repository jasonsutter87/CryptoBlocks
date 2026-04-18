import { useState, useEffect } from 'react'
import type { SharedProject } from '../types/shareplace'
import { updateProject, fetchProject } from './api'
import { useAuth, useUser } from '../auth'
import { showToast } from '../components/Toast'

interface EditListingModalProps {
  project: SharedProject
  onClose: () => void
  onSaved?: () => void
}

const CATEGORIES = ['Games', 'Art', 'Web', 'Sound', 'Data', 'AI'] as const

export default function EditListingModal({ project, onClose, onSaved }: EditListingModalProps) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [category, setCategory] = useState(project.category)
  const [tags, setTags] = useState(project.tags.join(', '))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = await getToken() || undefined
      // Need the workspaceJson for the PATCH — fetch the full project
      const full = await fetchProject(project.id, token)
      if (!full) { showToast('Could not load project', 'error'); setSaving(false); return }
      const result = await updateProject(project.id, {
        name: name.trim(),
        authorName: user?.fullName || user?.username || project.author,
        description: description.trim(),
        category,
        workspaceJson: full.workspaceJson,
        blockCount: Number(project.blockCount) || 0,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        visibility: project.visibility ?? 'public',
      }, token)
      if (result && 'id' in result) {
        showToast('Listing updated!', 'success')
        onSaved?.()
        onClose()
      } else if (result && 'error' in result) {
        showToast(result.error, 'error')
      } else {
        showToast('Save failed', 'error')
      }
    } catch {
      showToast('Save failed', 'error')
    }
    setSaving(false)
  }

  const isValid = name.trim().length > 0 && description.trim().length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-0">
          <div>
            <h2 className="text-text font-semibold text-base">Edit Listing</h2>
            <p className="text-overlay text-xs mt-0.5">Update your Shareplace listing</p>
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
              className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 placeholder-overlay focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 placeholder-overlay focus:outline-none focus:border-accent transition-colors"
            />
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
            onClick={handleSave}
            disabled={!isValid || saving}
            className="px-4 py-2 text-sm font-semibold text-base bg-accent hover:bg-accent/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
