import { useEffect } from 'react'
import type { SharedProject } from '../types/shareplace'

interface RemoveListingModalProps {
  project: SharedProject
  onClose: () => void
  onConfirm?: () => void
}

export default function RemoveListingModal({ project, onClose, onConfirm }: RemoveListingModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleConfirm = () => {
    console.log('Remove listing (coming soon):', project.id)
    onConfirm?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {/* Warning icon */}
        <div className="w-10 h-10 rounded-full bg-[#f38ba8]/15 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-[#f38ba8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h2 className="text-[#cdd6f4] font-semibold text-base mb-2">Remove from Shareplace?</h2>
        <p className="text-[#a6adc8] text-sm leading-relaxed">
          Are you sure you want to remove{' '}
          <span className="text-[#cdd6f4] font-medium">{project.name}</span>{' '}
          from Shareplace?
        </p>
        <p className="text-[#6c7086] text-sm mt-2">
          This won't delete your local project.
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
            className="px-4 py-2 text-sm font-semibold text-white bg-[#f38ba8]/80 hover:bg-[#f38ba8] rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
