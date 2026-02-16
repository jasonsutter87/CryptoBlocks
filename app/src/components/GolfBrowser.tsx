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
      case 'easy': return 'bg-[#a6e3a1] text-[#1e1e2e]'
      case 'medium': return 'bg-[#f9e2af] text-[#1e1e2e]'
      case 'hard': return 'bg-[#f38ba8] text-[#1e1e2e]'
      default: return 'bg-[#6c7086] text-[#cdd6f4]'
    }
  }

  const efficiencyColor = (best: number, par: number) => {
    if (best <= par) return 'text-[#a6e3a1]'
    if (best <= par + 3) return 'text-[#f9e2af]'
    return 'text-[#f38ba8]'
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
    if (completed === 0) return { text: '—', color: 'text-[#6c7086]' }
    if (completed < total) return { text: `${strokes} (${completed}/${total})`, color: 'text-[#f9e2af]' }
    const diff = strokes - par
    if (diff < 0) return { text: `${strokes} (${diff})`, color: 'text-[#a6e3a1]' }
    if (diff === 0) return { text: `${strokes} (E)`, color: 'text-[#89b4fa]' }
    return { text: `${strokes} (+${diff})`, color: 'text-[#f38ba8]' }
  }

  return (
    <div className="flex-1 overflow-auto bg-[#1e1e2e] p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#cdd6f4]">Code Golf</h2>
            <p className="text-xs md:text-sm text-[#6c7086] mt-1">Solve puzzles with the fewest blocks possible</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setShowStats((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                showStats ? 'bg-[#89b4fa] text-[#1e1e2e]' : 'bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a]'
              }`}
            >
              <span className="text-sm font-bold">{completedCount}</span>
              <span className="text-xs opacity-70">/ {totalProblems}</span>
            </button>
            <button
              onClick={onBackToSandbox}
              className="text-sm text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            >
              ← Back to Sandbox
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {showStats && (
          <div className="mb-6 rounded-xl border border-[#313244] bg-[#181825] p-4 md:p-5">
            <h3 className="text-sm font-semibold text-[#cdd6f4] mb-4">Your Stats</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#a6e3a1]">{completedCount}</div>
                <div className="text-xs text-[#6c7086]">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#89b4fa]">{underParCount}</div>
                <div className="text-xs text-[#6c7086]">At/Under Par</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#cba6f7]">{totalAttempts}</div>
                <div className="text-xs text-[#6c7086]">Attempts</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-[#6c7086] mb-1">
                <span>Overall Progress</span>
                <span>{completedCount}/{totalProblems} problems</span>
              </div>
              <div className="w-full h-2 bg-[#45475a] rounded-full">
                <div
                  className="h-full bg-[#89b4fa] rounded-full transition-all"
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
                    <span className="text-[#cdd6f4] w-20 md:w-28 truncate">{pack.name}</span>
                    <div className="flex-1 h-1.5 bg-[#45475a] rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(packCompleted / packTotal) * 100}%`,
                          backgroundColor: pack.color,
                        }}
                      />
                    </div>
                    <span className="text-[#6c7086] w-8 text-right">{packCompleted}/{packTotal}</span>
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
              <div key={pack.id} className="rounded-xl border border-[#313244] overflow-hidden">
                <button
                  onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#313244]/50 transition-colors text-left"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: pack.color + '20' }}
                  >
                    {pack.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#cdd6f4]">{pack.name}</h3>
                    <p className="text-sm text-[#6c7086]">{pack.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#cdd6f4]">{completed}/{pack.problems.length}</div>
                      <div className="w-20 h-1.5 bg-[#45475a] rounded-full mt-1">
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
                      className={`w-5 h-5 text-[#6c7086] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                  <div className="border-t border-[#313244]">
                    {/* Course Scorecard (18-hole packs only) */}
                    {(() => {
                      const sc = getCourseScorecard(pack)
                      if (!sc) return null
                      const fScore = scoreLabel(sc.front.strokes, sc.front.par, sc.front.completed, sc.front.total)
                      const bScore = scoreLabel(sc.back.strokes, sc.back.par, sc.back.completed, sc.back.total)
                      const tScore = scoreLabel(sc.totalStrokes, sc.totalPar, sc.totalCompleted, 18)
                      return (
                        <div className="px-4 py-3 bg-[#181825] border-b border-[#313244]">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-[#a6adc8] font-semibold uppercase tracking-wide">Course Record</span>
                            <span className="text-[#6c7086]">Par {sc.totalPar}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-[10px] text-[#6c7086] mb-0.5">Front 9</div>
                              <div className={`text-sm font-bold ${fScore.color}`}>{fScore.text}</div>
                              <div className="text-[10px] text-[#6c7086]">Par {sc.front.par}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-[#6c7086] mb-0.5">Back 9</div>
                              <div className={`text-sm font-bold ${bScore.color}`}>{bScore.text}</div>
                              <div className="text-[10px] text-[#6c7086]">Par {sc.back.par}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-[#6c7086] mb-0.5">Total</div>
                              <div className={`text-base font-bold ${tScore.color}`}>{tScore.text}</div>
                              <div className="text-[10px] text-[#6c7086]">Par {sc.totalPar}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Hole-by-hole divider for 18-hole courses */}
                    {pack.problems.length >= 18 && (
                      <div className="px-4 py-1.5 bg-[#11111b] text-[10px] text-[#6c7086] font-semibold uppercase tracking-wider">
                        Front 9
                      </div>
                    )}

                    {pack.problems.map((problem, i) => {
                      const progress = getGolfProgressById(problem.id)

                      return (
                        <div key={problem.id}>
                          {/* Back 9 divider for 18-hole courses */}
                          {i === 9 && pack.problems.length >= 18 && (
                            <div className="px-4 py-1.5 bg-[#11111b] text-[10px] text-[#6c7086] font-semibold uppercase tracking-wider border-t border-[#313244]">
                              Back 9
                            </div>
                          )}
                        <button
                          onClick={() => onSelectProblem(problem)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#313244]/50 cursor-pointer ${
                            i < pack.problems.length - 1 ? 'border-b border-[#313244]/50' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#313244] flex items-center justify-center text-sm font-mono">
                            <span className="text-[#cdd6f4]">{i + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#cdd6f4] truncate">{problem.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Par display */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-[#6c7086]">Par {problem.par}</span>
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
