import type { Checkpoint, Branch } from '../version-control/types'

interface HistoryPanelProps {
  checkpoints: Checkpoint[]
  currentBranch: Branch | null
  onRollback: (checkpointId: string) => void
  onClose: () => void
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function HistoryPanel({ checkpoints, currentBranch, onRollback, onClose }: HistoryPanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="h-full w-full max-w-sm bg-base border-l border-surface-0 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-text font-semibold text-sm">Checkpoint History</span>
            {currentBranch && currentBranch.name !== 'Main' && (
              <span className="text-xs bg-surface-0 text-purple px-2 py-0.5 rounded font-mono">
                {currentBranch.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-overlay hover:text-text transition-colors p-1 rounded"
            aria-label="Close history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current state indicator */}
        <div className="px-4 py-3 border-b border-surface-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">Current state</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto">
          {checkpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <svg className="w-10 h-10 text-surface-1 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-overlay text-sm leading-relaxed">
                No checkpoints yet — save one from the File menu!
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-1">
              {checkpoints.map((cp, index) => (
                <div
                  key={cp.id}
                  className="flex items-start gap-3 py-3 border-b border-surface-0/50 last:border-0"
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full border-2 ${index === 0 ? 'bg-accent border-accent' : 'bg-transparent border-surface-1'}`} />
                    {index < checkpoints.length - 1 && (
                      <div className="w-px flex-1 bg-surface-0 mt-1" style={{ minHeight: '20px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-text text-sm font-medium truncate">{cp.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-overlay">{timeAgo(cp.timestamp)}</span>
                      <span className="text-xs text-surface-1">·</span>
                      <span className="text-xs text-overlay">{cp.blockCount} block{cp.blockCount === 1 ? '' : 's'}</span>
                    </div>
                    <button
                      onClick={() => onRollback(cp.id)}
                      className="mt-1.5 text-xs text-accent hover:text-accent/80 transition-colors font-medium"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
