import { useState } from 'react'
import type { SharedProject } from '../types/shareplace'
import { updateProject, fetchProject } from './api'
import { useAuth, useUser } from '../auth'
import { showToast } from '../components/Toast'
import TagSelector from '../components/TagSelector'
import { CATEGORIES } from './constants'
import { ShareplaceModal, fieldClass, labelClass } from './ShareplaceModal'

interface EditListingModalProps {
  project: SharedProject
  onClose: () => void
  onSaved?: () => void
}

export default function EditListingModal({ project, onClose, onSaved }: EditListingModalProps) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [category, setCategory] = useState(project.category)
  const [tags, setTags] = useState<string[]>(project.tags ?? [])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = await getToken() || undefined
      const full = await fetchProject(project.id, token)
      if (!full) { showToast('Could not load project', 'error'); setSaving(false); return }
      const result = await updateProject(project.id, {
        name: name.trim(),
        authorName: user?.fullName || user?.username || project.author,
        description: description.trim(),
        category,
        workspaceJson: full.workspaceJson,
        blockCount: Number(project.blockCount) || 0,
        tags,
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
    <ShareplaceModal
      title="Edit Listing"
      subtitle="Update your Shareplace listing"
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
            onClick={handleSave}
            disabled={!isValid || saving}
            className="px-4 py-2 text-sm font-semibold text-base bg-accent hover:bg-accent/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={fieldClass + ' resize-none'}
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
    </ShareplaceModal>
  )
}
