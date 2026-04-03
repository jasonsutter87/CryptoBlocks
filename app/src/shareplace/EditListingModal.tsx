import { useState, useEffect } from 'react'
import type { SharedProject } from '../types/shareplace'

interface EditListingModalProps {
  project: SharedProject
  onClose: () => void
}

const CATEGORIES = ['Games', 'Art', 'Web', 'Sound', 'Data', 'AI'] as const

export default function EditListingModal({ project, onClose }: EditListingModalProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [category, setCategory] = useState(project.category)
  const [tags, setTags] = useState(project.tags.join(', '))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSave = () => {
    console.log('Save listing changes (coming soon):', { name, description, category, tags })
    onClose()
  }

  const isValid = name.trim().length > 0 && description.trim().length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#313244]">
          <div>
            <h2 className="text-[#cdd6f4] font-semibold text-base">Edit Listing</h2>
            <p className="text-[#6c7086] text-xs mt-0.5">Update your Shareplace listing</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors p-1 rounded-lg hover:bg-[#313244]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Project name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#a6adc8]">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2.5 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#a6adc8]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2.5 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#a6adc8]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#89b4fa] transition-colors cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#a6adc8]">
              Tags <span className="text-[#6c7086] font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2.5 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#cdd6f4] bg-[#313244] hover:bg-[#45475a] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-semibold text-[#1e1e2e] bg-[#89b4fa] hover:bg-[#89b4fa]/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
