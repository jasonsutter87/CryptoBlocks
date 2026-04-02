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
      <div className="h-full w-full max-w-sm bg-[#1e1e2e] border-l border-[#313244] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#313244]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[#cdd6f4] font-semibold text-sm">Checkpoint History</span>
            {currentBranch && currentBranch.name !== 'Main' && (
              <span className="text-xs bg-[#313244] text-[#cba6f7] px-2 py-0.5 rounded font-mono">
                {currentBranch.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors p-1 rounded"
            aria-label="Close history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current state indicator */}
        <div className="px-4 py-3 border-b border-[#313244]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse" />
            <span className="text-xs text-[#a6e3a1] font-medium">Current state</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto">
          {checkpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <svg className="w-10 h-10 text-[#45475a] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#6c7086] text-sm leading-relaxed">
                No checkpoints yet — save one from the File menu!
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-1">
              {checkpoints.map((cp, index) => (
                <div
                  key={cp.id}
                  className="flex items-start gap-3 py-3 border-b border-[#313244]/50 last:border-0"
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full border-2 ${index === 0 ? 'bg-[#89b4fa] border-[#89b4fa]' : 'bg-transparent border-[#45475a]'}`} />
                    {index < checkpoints.length - 1 && (
                      <div className="w-px flex-1 bg-[#313244] mt-1" style={{ minHeight: '20px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#cdd6f4] text-sm font-medium truncate">{cp.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#6c7086]">{timeAgo(cp.timestamp)}</span>
                      <span className="text-xs text-[#45475a]">·</span>
                      <span className="text-xs text-[#6c7086]">{cp.blockCount} block{cp.blockCount === 1 ? '' : 's'}</span>
                    </div>
                    <button
                      onClick={() => onRollback(cp.id)}
                      className="mt-1.5 text-xs text-[#89b4fa] hover:text-[#89b4fa]/80 transition-colors font-medium"
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
