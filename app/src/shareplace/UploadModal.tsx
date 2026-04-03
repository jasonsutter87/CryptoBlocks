import { useState, useEffect } from 'react'

interface UploadModalProps {
  onClose: () => void
}

const CATEGORIES = ['Games', 'Art', 'Web', 'Sound', 'Data', 'AI'] as const

export default function UploadModal({ onClose }: UploadModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Games')
  const [tags, setTags] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleUpload = () => {
    console.log('Upload to Shareplace (coming soon):', { name, description, category, tags })
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
            <h2 className="text-[#cdd6f4] font-semibold text-base">Upload to Shareplace</h2>
            <p className="text-[#6c7086] text-xs mt-0.5">Share your project with the community</p>
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
              placeholder="e.g. My Awesome Game"
              className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2.5 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#a6adc8]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your project do? What makes it interesting?"
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
              placeholder="e.g. game, puzzle, beginner"
              className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2.5 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] transition-colors"
            />
          </div>

          {/* Preview */}
          <div className="bg-[#181825] border border-[#313244] rounded-lg px-4 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-[#89b4fa] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <p className="text-xs text-[#6c7086]">Current workspace</p>
              <p className="text-sm text-[#cdd6f4] font-medium">Ready to upload</p>
            </div>
            <span className="ml-auto text-xs text-[#a6adc8] bg-[#313244] px-2 py-1 rounded font-mono">
              Coming Soon
            </span>
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
            onClick={handleUpload}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-semibold text-[#1e1e2e] bg-[#89b4fa] hover:bg-[#89b4fa]/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}
