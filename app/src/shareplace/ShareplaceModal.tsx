import { useEffect, type ReactNode } from 'react'

interface ShareplaceModalProps {
  title: string
  subtitle: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}

/** Backdrop + panel shell shared by UploadModal and EditListingModal. */
export function ShareplaceModal({ title, subtitle, onClose, children, footer }: ShareplaceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-0">
          <div>
            <h2 className="text-text font-semibold text-base">{title}</h2>
            <p className="text-overlay text-xs mt-0.5">{subtitle}</p>
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
          {children}
        </div>

        <div className="flex gap-2 justify-end px-6 pb-6">
          {footer}
        </div>
      </div>
    </div>
  )
}

/** Shared Tailwind classes for form fields inside a ShareplaceModal. */
export const fieldClass = 'w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent transition-colors'
export const labelClass = 'text-xs font-medium text-subtext'
