import { useState } from 'react'
import type { LabPack, LabExercise } from '../code-lab'
import { allLabPacks, getTotalExerciseCount } from '../code-lab'
import { getLabProgressById, loadLabProgress } from '../code-lab/progress'

interface LabBrowserProps {
  onSelectExercise: (exercise: LabExercise) => void
  onBackToSandbox: () => void
}

export default function LabBrowser({ onSelectExercise, onBackToSandbox }: LabBrowserProps) {
  const [expandedPack, setExpandedPack] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const totalExercises = getTotalExerciseCount()
  const allProgress = loadLabProgress()
  const completedCount = allProgress.filter((p) => p.completed).length
  const totalAttempts = allProgress.reduce((s, p) => s + p.attempts, 0)

  const getPackProgress = (pack: LabPack) => {
    let completed = 0
    for (const e of pack.exercises) {
      const prog = getLabProgressById(e.id)
      if (prog?.completed) completed++
    }
    return completed
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-success text-base'
      case 'intermediate': return 'bg-warn text-base'
      case 'advanced': return 'bg-purple text-base'
      default: return 'bg-overlay text-text'
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-base p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text">Code Lab</h2>
            <p className="text-xs md:text-sm text-overlay mt-1">Write code from scratch to solve challenges</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setShowStats((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                showStats ? 'bg-purple text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              <span className="text-sm font-bold">{completedCount}</span>
              <span className="text-xs opacity-70">/ {totalExercises}</span>
            </button>
            <button
              onClick={onBackToSandbox}
              className="text-sm text-overlay hover:text-text transition-colors"
            >
              ← Back to Sandbox
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {showStats && (
          <div className="mb-6 rounded-xl border border-surface-0 bg-mantle p-4 md:p-5">
            <h3 className="text-sm font-semibold text-text mb-4">Your Stats</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{completedCount}</div>
                <div className="text-xs text-overlay">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{totalExercises - completedCount}</div>
                <div className="text-xs text-overlay">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple">{totalAttempts}</div>
                <div className="text-xs text-overlay">Attempts</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-overlay mb-1">
                <span>Overall Progress</span>
                <span>{completedCount}/{totalExercises} exercises</span>
              </div>
              <div className="w-full h-2 bg-surface-1 rounded-full">
                <div
                  className="h-full bg-purple rounded-full transition-all"
                  style={{ width: `${totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {allLabPacks.map((pack) => {
                const packCompleted = getPackProgress(pack)
                const packTotal = pack.exercises.length
                return (
                  <div key={pack.id} className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-center">{pack.icon}</span>
                    <span className="text-text w-20 md:w-28 truncate">{pack.name}</span>
                    <div className="flex-1 h-1.5 bg-surface-1 rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(packCompleted / packTotal) * 100}%`,
                          backgroundColor: pack.color,
                        }}
                      />
                    </div>
                    <span className="text-overlay w-8 text-right">{packCompleted}/{packTotal}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pack Cards */}
        <div className="space-y-4">
          {allLabPacks.map((pack) => {
            const completed = getPackProgress(pack)
            const isExpanded = expandedPack === pack.id

            return (
              <div key={pack.id} className="rounded-xl border border-surface-0 overflow-hidden">
                <button
                  onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-surface-0/50 transition-colors text-left"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: pack.color + '20' }}
                  >
                    {pack.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text">{pack.name}</h3>
                    <p className="text-sm text-overlay">{pack.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-text">{completed}/{pack.exercises.length}</div>
                      <div className="w-20 h-1.5 bg-surface-1 rounded-full mt-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(completed / pack.exercises.length) * 100}%`,
                            backgroundColor: pack.color,
                          }}
                        />
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-overlay transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-surface-0">
                    {pack.exercises.map((exercise, i) => {
                      const progress = getLabProgressById(exercise.id)

                      return (
                        <button
                          key={exercise.id}
                          onClick={() => onSelectExercise(exercise)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-0/50 cursor-pointer ${
                            i < pack.exercises.length - 1 ? 'border-b border-surface-0/50' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-surface-0 flex items-center justify-center text-sm font-mono">
                            {progress?.completed ? (
                              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-text">{i + 1}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text truncate">{exercise.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(exercise.difficulty)}`}>
                                {exercise.difficulty}
                              </span>
                            </div>
                          </div>

                          {progress?.completed && (
                            <span className="text-xs text-success font-medium shrink-0">Solved</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
