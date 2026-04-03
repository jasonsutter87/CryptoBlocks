import { useEffect } from 'react'
import type { SharedProject } from '../types/shareplace'

interface RemixModalProps {
  project: SharedProject
  onClose: () => void
  onConfirm?: () => void
}

export default function RemixModal({ project, onClose, onConfirm }: RemixModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleConfirm = () => {
    console.log('Remix project (coming soon):', project.id)
    onConfirm?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-[#a6e3a1]/15 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>

        <h2 className="text-[#cdd6f4] font-semibold text-base mb-1">Remix this project?</h2>
        <p className="text-[#a6adc8] text-sm mb-1">
          <span className="text-[#cdd6f4] font-medium">{project.name}</span>
          {' '}by{' '}
          <span className="text-[#89b4fa]">{project.author}</span>
        </p>
        <p className="text-[#6c7086] text-sm mt-3 leading-relaxed">
          This will create a copy in your editor. Your current workspace will be saved as a checkpoint first so you won't lose your work.
        </p>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#cdd6f4] bg-[#313244] hover:bg-[#45475a] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-semibold text-[#1e1e2e] bg-[#a6e3a1] hover:bg-[#a6e3a1]/80 rounded-lg transition-colors"
          >
            Remix
          </button>
        </div>
      </div>
    </div>
  )
}
