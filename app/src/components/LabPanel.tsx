import { useState } from 'react'
import type { LabExercise } from '../code-lab'

interface LabPanelProps {
  exercise: LabExercise
  onCheckSolution: () => void
  onBack: () => void
  isRunning: boolean
}

export default function LabPanel({ exercise, onCheckSolution, onBack, isRunning }: LabPanelProps) {
  const [showHints, setShowHints] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

  return (
    <div className="bg-[#181825] border-b border-[#313244] px-3 md:px-4 py-2 md:py-3">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors shrink-0"
            title="Back to Code Lab"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#cdd6f4] truncate">{exercise.title}</h3>
            <p className="text-xs text-[#6c7086] truncate hidden sm:block">{exercise.description.split('\n')[0]}</p>
          </div>
        </div>

        {/* Hint button */}
        <button
          onClick={() => {
            setShowHints((v) => !v)
            if (!showHints) setHintIndex(0)
          }}
          className={`flex items-center gap-1 px-2 md:px-3 py-1 text-xs rounded-lg transition-colors shrink-0 ${
            showHints ? 'bg-[#f9e2af] text-[#1e1e2e]' : 'bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a]'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="hidden sm:inline">Hints</span>
        </button>

        {/* Check Solution */}
        <button
          onClick={onCheckSolution}
          disabled={isRunning}
          className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="hidden sm:inline">Check Solution</span>
          <span className="sm:hidden">Check</span>
        </button>
      </div>

      {/* Hints panel */}
      {showHints && exercise.hints.length > 0 && (
        <div className="mt-2 p-3 bg-[#313244] rounded-lg">
          <p className="text-sm text-[#f9e2af]">
            <span className="font-semibold">Hint {hintIndex + 1}/{exercise.hints.length}:</span>{' '}
            {exercise.hints[hintIndex]}
          </p>
          {hintIndex < exercise.hints.length - 1 && (
            <button
              onClick={() => setHintIndex((i) => i + 1)}
              className="mt-2 text-xs text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            >
              Show next hint →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
