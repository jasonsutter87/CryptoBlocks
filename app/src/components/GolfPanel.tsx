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
    parDiff <= 0 ? 'text-[#a6e3a1]' :
    parDiff <= 3 ? 'text-[#f9e2af]' :
    'text-[#f38ba8]'

  return (
    <div className="bg-[#181825] border-b border-[#313244] px-3 md:px-4 py-2 md:py-3">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors shrink-0"
            title="Back to Code Golf"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#cdd6f4] truncate">{problem.title}</h3>
            <p className="text-xs text-[#6c7086] truncate hidden sm:block">{problem.description}</p>
          </div>
        </div>

        {/* Par + Block counter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#313244] px-2 md:px-3 py-1 rounded-lg flex items-center gap-1.5 md:gap-2">
            <span className="text-xs text-[#6c7086] hidden sm:inline">Par:</span>
            <span className="text-sm font-bold text-[#89b4fa]">{problem.par}</span>
          </div>
          <div className="bg-[#313244] px-2 md:px-3 py-1 rounded-lg flex items-center gap-1.5 md:gap-2">
            <span className="text-xs text-[#6c7086] hidden sm:inline">Blocks:</span>
            <span className={`text-sm font-bold ${blockColor}`}>{blockCount}</span>
          </div>
        </div>

        {/* Check Solution */}
        <button
          onClick={onCheckSolution}
          disabled={isRunning || blockCount === 0}
          className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
