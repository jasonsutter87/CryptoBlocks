import { useState } from 'react'
import type { Challenge } from '../challenges'

interface ChallengePanelProps {
  challenge: Challenge
  blockCount: number
  onCheckSolution: () => void
  onBack: () => void
  isRunning: boolean
}

export default function ChallengePanel({ challenge, blockCount, onCheckSolution, onBack, isRunning }: ChallengePanelProps) {
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [showSolution, setShowSolution] = useState(false)

  const parDiff = blockCount - challenge.par
  const blockColor =
    parDiff <= 0 ? 'text-[#a6e3a1]' :
    parDiff <= 2 ? 'text-[#f9e2af]' :
    'text-[#f38ba8]'

  return (
    <div className="bg-[#181825] border-b border-[#313244] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Challenge info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors shrink-0"
            title="Back to Challenges"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#cdd6f4] truncate">{challenge.title}</h3>
            <p className="text-xs text-[#6c7086] truncate">{challenge.description}</p>
          </div>
        </div>

        {/* Center: Block counter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#313244] px-3 py-1 rounded-lg flex items-center gap-2">
            <span className="text-xs text-[#6c7086]">Blocks:</span>
            <span className={`text-sm font-bold ${blockColor}`}>{blockCount}</span>
            <span className="text-xs text-[#6c7086]">/</span>
            <span className="text-xs text-[#6c7086]">Par: {challenge.par}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hints */}
          {challenge.hints.length > 0 && hintsRevealed < challenge.hints.length && (
            <button
              onClick={() => setHintsRevealed((prev) => prev + 1)}
              className="text-xs text-[#cba6f7] hover:text-[#cba6f7]/80 transition-colors px-2 py-1"
            >
              Need a hint?
            </button>
          )}

          {/* Show Solution — appears after all hints used */}
          {challenge.solution && hintsRevealed >= challenge.hints.length && !showSolution && (
            <button
              onClick={() => setShowSolution(true)}
              className="text-xs text-[#f38ba8] hover:text-[#f38ba8]/80 transition-colors px-2 py-1"
            >
              Show Solution
            </button>
          )}

          {/* Check Solution */}
          <button
            onClick={onCheckSolution}
            disabled={isRunning || blockCount === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Check Solution
          </button>
        </div>
      </div>

      {/* Hint display */}
      {hintsRevealed > 0 && (
        <div className="mt-2 space-y-1">
          {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
            <div key={i} className="text-xs text-[#cba6f7] bg-[#cba6f7]/10 px-3 py-1.5 rounded">
              💡 {hint}
            </div>
          ))}
        </div>
      )}

      {/* Solution display */}
      {showSolution && challenge.solution && (
        <div className="mt-2">
          <div className="text-xs text-[#f38ba8] bg-[#f38ba8]/10 px-3 py-2 rounded border border-[#f38ba8]/20">
            <span className="font-semibold">Solution:</span> {challenge.solution}
          </div>
        </div>
      )}
    </div>
  )
}
