import { useState } from 'react'
import type { Blockset } from '../blocksets'

interface BlocksetPanelProps {
  blockset: Blockset
  blockCount: number
  onCheckSolution: () => void
  onBack: () => void
  isRunning: boolean
}

export default function BlocksetPanel({ blockset, blockCount, onCheckSolution, onBack, isRunning }: BlocksetPanelProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const step = blockset.steps[currentStep]
  const totalSteps = blockset.steps.length
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="bg-mantle border-b border-surface-0 px-3 md:px-4 py-2 md:py-3">
      {/* Top row: Back + title + block counter */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="text-overlay hover:text-text transition-colors shrink-0"
            title="Back to Blocksets"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text truncate">{blockset.title}</h3>
            <p className="text-xs text-overlay truncate hidden sm:block">{blockset.description}</p>
          </div>
        </div>

        {/* Block counter */}
        <div className="bg-surface-0 px-2 md:px-3 py-1 rounded-lg flex items-center gap-1.5 md:gap-2 shrink-0">
          <span className="text-xs text-overlay hidden sm:inline">Blocks:</span>
          <span className="text-sm font-bold text-accent">{blockCount}</span>
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

      {/* Step instruction */}
      <div className="mt-2 bg-surface-0/50 rounded-lg px-3 py-2">
        {/* Step progress dots */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs text-overlay mr-1">Step {currentStep + 1}/{totalSteps}</span>
          {blockset.steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentStep ? 'bg-success' :
                i === currentStep ? 'bg-accent' :
                'bg-surface-1'
              }`}
            />
          ))}
        </div>

        {/* Instruction */}
        <p className="text-sm text-text">{step.instruction}</p>

        {/* Hint */}
        {step.hint && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="text-xs text-purple hover:text-purple/80 transition-colors mt-1"
          >
            Need a hint?
          </button>
        )}
        {showHint && step.hint && (
          <div className="text-xs text-purple bg-purple/10 px-2 py-1 rounded mt-1">
            {step.hint}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => { setCurrentStep((s) => s - 1); setShowHint(false) }}
            disabled={currentStep === 0}
            className="text-xs text-overlay hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          {!isLastStep && (
            <button
              onClick={() => { setCurrentStep((s) => s + 1); setShowHint(false) }}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
