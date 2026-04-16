import { useState } from 'react'
import type { GolfPack, GolfProblem } from '../code-golf'
import { allGolfPacks, getTotalProblemCount } from '../code-golf'
import { getGolfProgressById, loadGolfProgress } from '../code-golf/progress'

interface GolfBrowserProps {
  onSelectProblem: (problem: GolfProblem) => void
  onBackToSandbox: () => void
}

export default function GolfBrowser({ onSelectProblem, onBackToSandbox }: GolfBrowserProps) {
  const [expandedPack, setExpandedPack] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const totalProblems = getTotalProblemCount()
  const allProgress = loadGolfProgress()
  const completedCount = allProgress.filter((p) => p.completed).length
  const totalAttempts = allProgress.reduce((s, p) => s + p.attempts, 0)

  // Count under-par solutions
  const underParCount = (() => {
    let count = 0
    for (const pack of allGolfPacks) {
      for (const problem of pack.problems) {
        const p = getGolfProgressById(problem.id)
        if (p?.completed && p.bestBlockCount <= problem.par) count++
      }
    }
    return count
  })()

  const getPackProgress = (pack: GolfPack) => {
    let completed = 0
    for (const p of pack.problems) {
      const prog = getGolfProgressById(p.id)
      if (prog?.completed) completed++
    }
    return completed
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-success text-base'
      case 'medium': return 'bg-warn text-base'
      case 'hard': return 'bg-danger text-base'
      default: return 'bg-overlay text-text'
    }
  }

  const efficiencyColor = (best: number, par: number) => {
    if (best <= par) return 'text-success'
    if (best <= par + 3) return 'text-warn'
    return 'text-danger'
  }

  const getCourseScorecard = (pack: GolfPack) => {
    if (pack.problems.length < 18) return null
    const front9 = pack.problems.slice(0, 9)
    const back9 = pack.problems.slice(9, 18)
    const calcNine = (holes: GolfProblem[]) => {
      let par = 0, strokes = 0, completed = 0
      for (const h of holes) {
        par += h.par
        const p = getGolfProgressById(h.id)
        if (p?.completed) { strokes += p.bestBlockCount; completed++ }
      }
      return { par, strokes, completed, total: holes.length }
    }
    const f = calcNine(front9)
    const b = calcNine(back9)
    const totalPar = f.par + b.par
    const totalStrokes = f.strokes + b.strokes
    const totalCompleted = f.completed + b.completed
    return { front: f, back: b, totalPar, totalStrokes, totalCompleted }
  }

  const scoreLabel = (strokes: number, par: number, completed: number, total: number) => {
    if (completed === 0) return { text: '—', color: 'text-overlay' }
    if (completed < total) return { text: `${strokes} (${completed}/${total})`, color: 'text-warn' }
    const diff = strokes - par
    if (diff < 0) return { text: `${strokes} (${diff})`, color: 'text-success' }
    if (diff === 0) return { text: `${strokes} (E)`, color: 'text-accent' }
    return { text: `${strokes} (+${diff})`, color: 'text-danger' }
  }

  return (
    <div className="flex-1 overflow-auto bg-base p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text">Code Golf</h2>
            <p className="text-xs md:text-sm text-overlay mt-1">Solve puzzles with the fewest blocks possible</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setShowStats((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                showStats ? 'bg-accent text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              <span className="text-sm font-bold">{completedCount}</span>
              <span className="text-xs opacity-70">/ {totalProblems}</span>
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
                <div className="text-2xl font-bold text-accent">{underParCount}</div>
                <div className="text-xs text-overlay">At/Under Par</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple">{totalAttempts}</div>
                <div className="text-xs text-overlay">Attempts</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-overlay mb-1">
                <span>Overall Progress</span>
                <span>{completedCount}/{totalProblems} problems</span>
              </div>
              <div className="w-full h-2 bg-surface-1 rounded-full">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${totalProblems > 0 ? (completedCount / totalProblems) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {allGolfPacks.map((pack) => {
                const packCompleted = getPackProgress(pack)
                const packTotal = pack.problems.length
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
          {allGolfPacks.map((pack) => {
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
                      <div className="text-sm font-medium text-text">{completed}/{pack.problems.length}</div>
                      <div className="w-20 h-1.5 bg-surface-1 rounded-full mt-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(completed / pack.problems.length) * 100}%`,
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
                    {/* Course Scorecard (18-hole packs only) */}
                    {(() => {
                      const sc = getCourseScorecard(pack)
                      if (!sc) return null
                      const fScore = scoreLabel(sc.front.strokes, sc.front.par, sc.front.completed, sc.front.total)
                      const bScore = scoreLabel(sc.back.strokes, sc.back.par, sc.back.completed, sc.back.total)
                      const tScore = scoreLabel(sc.totalStrokes, sc.totalPar, sc.totalCompleted, 18)
                      return (
                        <div className="px-4 py-3 bg-mantle border-b border-surface-0">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-subtext font-semibold uppercase tracking-wide">Course Record</span>
                            <span className="text-overlay">Par {sc.totalPar}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-[10px] text-overlay mb-0.5">Front 9</div>
                              <div className={`text-sm font-bold ${fScore.color}`}>{fScore.text}</div>
                              <div className="text-[10px] text-overlay">Par {sc.front.par}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-overlay mb-0.5">Back 9</div>
                              <div className={`text-sm font-bold ${bScore.color}`}>{bScore.text}</div>
                              <div className="text-[10px] text-overlay">Par {sc.back.par}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-overlay mb-0.5">Total</div>
                              <div className={`text-base font-bold ${tScore.color}`}>{tScore.text}</div>
                              <div className="text-[10px] text-overlay">Par {sc.totalPar}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Hole-by-hole divider for 18-hole courses */}
                    {pack.problems.length >= 18 && (
                      <div className="px-4 py-1.5 bg-crust text-[10px] text-overlay font-semibold uppercase tracking-wider">
                        Front 9
                      </div>
                    )}

                    {pack.problems.map((problem, i) => {
                      const progress = getGolfProgressById(problem.id)

                      return (
                        <div key={problem.id}>
                          {/* Back 9 divider for 18-hole courses */}
                          {i === 9 && pack.problems.length >= 18 && (
                            <div className="px-4 py-1.5 bg-crust text-[10px] text-overlay font-semibold uppercase tracking-wider border-t border-surface-0">
                              Back 9
                            </div>
                          )}
                        <button
                          onClick={() => onSelectProblem(problem)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-0/50 cursor-pointer ${
                            i < pack.problems.length - 1 ? 'border-b border-surface-0/50' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-surface-0 flex items-center justify-center text-sm font-mono">
                            <span className="text-text">{i + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text truncate">{problem.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Par display */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-overlay">Par {problem.par}</span>
                            {progress?.completed && (
                              <span className={`text-xs font-bold ${efficiencyColor(progress.bestBlockCount, problem.par)}`}>
                                Best: {progress.bestBlockCount}
                              </span>
                            )}
                          </div>
                        </button>
                        </div>
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
