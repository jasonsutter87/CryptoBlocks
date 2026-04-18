import { useEffect, useState } from 'react'
import type { SharedProject } from '../types/shareplace'
import { deleteProject } from './api'
import { useAuth } from '../auth'
import { showToast } from '../components/Toast'

interface RemoveListingModalProps {
  project: SharedProject
  onClose: () => void
  onConfirm?: () => void
}

export default function RemoveListingModal({ project, onClose, onConfirm }: RemoveListingModalProps) {
  const { getToken } = useAuth()
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleConfirm = async () => {
    setRemoving(true)
    const token = await getToken().catch(() => null)
    const result = await deleteProject(project.id, token ?? undefined)
    if (result && 'ok' in result) {
      showToast('Removed from Shareplace', 'success')
      onConfirm?.()
    } else {
      showToast('Failed to remove', 'error')
    }
    setRemoving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {/* Warning icon */}
        <div className="w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h2 className="text-text font-semibold text-base mb-2">Remove from Shareplace?</h2>
        <p className="text-subtext text-sm leading-relaxed">
          Are you sure you want to remove{' '}
          <span className="text-text font-medium">{project.name}</span>{' '}
          from Shareplace?
        </p>
        <p className="text-overlay text-sm mt-2">
          This won't delete your local project.
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
            disabled={removing}
            className="px-4 py-2 text-sm font-semibold text-white bg-danger/80 hover:bg-danger rounded-lg transition-colors disabled:opacity-50"
          >
            {removing ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}
