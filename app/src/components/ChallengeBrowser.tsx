import { useState } from 'react'
import type { ThemePack, Challenge } from '../challenges'
import { allThemes, getTotalChallengeCount } from '../challenges'
import { getProgressForChallenge, getTotalStars, loadProgress } from '../challenges/progress'

interface ChallengeBrowserProps {
  onSelectChallenge: (challenge: Challenge) => void
  onBackToSandbox: () => void
}

export default function ChallengeBrowser({ onSelectChallenge, onBackToSandbox }: ChallengeBrowserProps) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const totalStars = getTotalStars()
  const totalChallenges = getTotalChallengeCount()
  const maxStars = totalChallenges * 3
  const allProgress = loadProgress()
  const completedCount = allProgress.filter((p) => p.completed).length
  const totalAttempts = allProgress.reduce((s, p) => s + p.attempts, 0)
  const perfectCount = allProgress.filter((p) => p.stars === 3).length

  const getThemeProgress = (theme: ThemePack) => {
    let completed = 0
    for (const c of theme.challenges) {
      const p = getProgressForChallenge(c.id)
      if (p?.completed) completed++
    }
    return completed
  }

  const isChallengeUnlocked = (theme: ThemePack, index: number) => {
    if (index === 0) return true
    const prevChallenge = theme.challenges[index - 1]
    const prevProgress = getProgressForChallenge(prevChallenge.id)
    return prevProgress?.completed ?? false
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-success text-base'
      case 'intermediate': return 'bg-warn text-base'
      case 'advanced': return 'bg-danger text-base'
      default: return 'bg-overlay text-text'
    }
  }

  const renderStars = (count: number) => {
    return (
      <span className="text-sm tracking-wide">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={i < count ? 'text-warn' : 'text-surface-1'}>
            ★
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-base p-4 md:p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text">Challenge Hub</h2>
            <p className="text-xs md:text-sm text-overlay mt-1">Solve puzzles, earn stars, level up your skills</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setShowStats((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                showStats ? 'bg-warn text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              <span className="text-warn">★</span>
              <span className="text-sm font-bold">{totalStars}</span>
              <span className="text-xs opacity-70">/ {maxStars}</span>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warn">{totalStars}</div>
                <div className="text-xs text-overlay">Stars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{completedCount}</div>
                <div className="text-xs text-overlay">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple">{perfectCount}</div>
                <div className="text-xs text-overlay">Perfect (3★)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{totalAttempts}</div>
                <div className="text-xs text-overlay">Attempts</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-overlay mb-1">
                <span>Overall Progress</span>
                <span>{completedCount}/{totalChallenges} challenges</span>
              </div>
              <div className="w-full h-2 bg-surface-1 rounded-full">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Per-theme breakdown */}
            <div className="space-y-2">
              {allThemes.map((theme) => {
                const themeCompleted = getThemeProgress(theme)
                const themeTotal = theme.challenges.length
                let themeStars = 0
                for (const c of theme.challenges) {
                  const p = getProgressForChallenge(c.id)
                  if (p) themeStars += p.stars
                }
                return (
                  <div key={theme.id} className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-center">{theme.icon}</span>
                    <span className="text-text w-20 md:w-28 truncate">{theme.name}</span>
                    <div className="flex-1 h-1.5 bg-surface-1 rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(themeCompleted / themeTotal) * 100}%`,
                          backgroundColor: theme.color,
                        }}
                      />
                    </div>
                    <span className="text-overlay w-8 text-right">{themeCompleted}/{themeTotal}</span>
                    <span className="text-warn w-10 text-right">★{themeStars}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Theme Cards */}
        <div className="space-y-4">
          {allThemes.map((theme) => {
            const completed = getThemeProgress(theme)
            const isExpanded = expandedTheme === theme.id

            return (
              <div key={theme.id} className="rounded-xl border border-surface-0 overflow-hidden">
                {/* Theme Header */}
                <button
                  onClick={() => setExpandedTheme(isExpanded ? null : theme.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-surface-0/50 transition-colors text-left"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: theme.color + '20' }}
                  >
                    {theme.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text">{theme.name}</h3>
                    <p className="text-sm text-overlay">{theme.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-text">{completed}/{theme.challenges.length}</div>
                      <div className="w-20 h-1.5 bg-surface-1 rounded-full mt-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(completed / theme.challenges.length) * 100}%`,
                            backgroundColor: theme.color,
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

                {/* Challenge List */}
                {isExpanded && (
                  <div className="border-t border-surface-0">
                    {theme.challenges.map((challenge, i) => {
                      const progress = getProgressForChallenge(challenge.id)
                      const unlocked = isChallengeUnlocked(theme, i)

                      return (
                        <button
                          key={challenge.id}
                          onClick={() => unlocked && onSelectChallenge(challenge)}
                          disabled={!unlocked}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            unlocked
                              ? 'hover:bg-surface-0/50 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed'
                          } ${i < theme.challenges.length - 1 ? 'border-b border-surface-0/50' : ''}`}
                        >
                          {/* Number / Lock */}
                          <div className="w-8 h-8 rounded-lg bg-surface-0 flex items-center justify-center text-sm font-mono">
                            {unlocked ? (
                              <span className="text-text">{i + 1}</span>
                            ) : (
                              <svg className="w-4 h-4 text-overlay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text truncate">{challenge.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(challenge.difficulty)}`}>
                                {challenge.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Stars */}
                          {progress?.completed && renderStars(progress.stars)}
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
