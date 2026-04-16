import type { GolfProblem } from '../code-golf'

interface GolfPanelProps {
  problem: GolfProblem
  blockCount: number
  onCheckSolution: () => void
  onBack: () => void
  isRunning: boolean
}

export default function GolfPanel({ problem, blockCount, onCheckSolution, onBack, isRunning }: GolfPanelProps) {
  const parDiff = blockCount - problem.par
  const blockColor =
    parDiff <= 0 ? 'text-success' :
    parDiff <= 3 ? 'text-warn' :
    'text-danger'

  return (
    <div className="bg-mantle border-b border-surface-0 px-3 md:px-4 py-2 md:py-3">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="text-overlay hover:text-text transition-colors shrink-0"
            title="Back to Code Golf"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text truncate">{problem.title}</h3>
            <p className="text-xs text-overlay truncate hidden sm:block">{problem.description}</p>
          </div>
        </div>

        {/* Par + Block counter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-surface-0 px-2 md:px-3 py-1 rounded-lg flex items-center gap-1.5 md:gap-2">
            <span className="text-xs text-overlay hidden sm:inline">Par:</span>
            <span className="text-sm font-bold text-accent">{problem.par}</span>
          </div>
          <div className="bg-surface-0 px-2 md:px-3 py-1 rounded-lg flex items-center gap-1.5 md:gap-2">
            <span className="text-xs text-overlay hidden sm:inline">Blocks:</span>
            <span className={`text-sm font-bold ${blockColor}`}>{blockCount}</span>
          </div>
        </div>

        {/* Check Solution */}
        <button
          onClick={onCheckSolution}
          disabled={isRunning || blockCount === 0}
          className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 text-sm font-semibold rounded-lg bg-success text-base hover:bg-success/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="hidden sm:inline">Check Solution</span>
          <span className="sm:hidden">Check</span>
        </button>
      </div>
    </div>
  )
}
