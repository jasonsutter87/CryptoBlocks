import { useState } from 'react'
import type { ThemePack, Challenge } from '../challenges'
import { allThemes, getTotalChallengeCount } from '../challenges'
import { getProgressForChallenge, getTotalStars } from '../challenges/progress'

interface ChallengeBrowserProps {
  onSelectChallenge: (challenge: Challenge) => void
  onBackToSandbox: () => void
}

export default function ChallengeBrowser({ onSelectChallenge, onBackToSandbox }: ChallengeBrowserProps) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null)
  const totalStars = getTotalStars()
  const maxStars = getTotalChallengeCount() * 3

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
      case 'beginner': return 'bg-[#a6e3a1] text-[#1e1e2e]'
      case 'intermediate': return 'bg-[#f9e2af] text-[#1e1e2e]'
      case 'advanced': return 'bg-[#f38ba8] text-[#1e1e2e]'
      default: return 'bg-[#6c7086] text-[#cdd6f4]'
    }
  }

  const renderStars = (count: number) => {
    return (
      <span className="text-sm tracking-wide">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={i < count ? 'text-[#f9e2af]' : 'text-[#45475a]'}>
            ★
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-[#1e1e2e] p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#cdd6f4]">Challenge Hub</h2>
            <p className="text-sm text-[#6c7086] mt-1">Solve puzzles, earn stars, level up your skills</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#313244] px-3 py-1.5 rounded-lg">
              <span className="text-[#f9e2af]">★</span>
              <span className="text-sm font-bold text-[#cdd6f4]">{totalStars}</span>
              <span className="text-xs text-[#6c7086]">/ {maxStars}</span>
            </div>
            <button
              onClick={onBackToSandbox}
              className="text-sm text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            >
              ← Back to Sandbox
            </button>
          </div>
        </div>

        {/* Theme Cards */}
        <div className="space-y-4">
          {allThemes.map((theme) => {
            const completed = getThemeProgress(theme)
            const isExpanded = expandedTheme === theme.id

            return (
              <div key={theme.id} className="rounded-xl border border-[#313244] overflow-hidden">
                {/* Theme Header */}
                <button
                  onClick={() => setExpandedTheme(isExpanded ? null : theme.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#313244]/50 transition-colors text-left"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: theme.color + '20' }}
                  >
                    {theme.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#cdd6f4]">{theme.name}</h3>
                    <p className="text-sm text-[#6c7086]">{theme.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#cdd6f4]">{completed}/{theme.challenges.length}</div>
                      <div className="w-20 h-1.5 bg-[#45475a] rounded-full mt-1">
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

                {/* Challenge List */}
                {isExpanded && (
                  <div className="border-t border-[#313244]">
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
                              ? 'hover:bg-[#313244]/50 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed'
                          } ${i < theme.challenges.length - 1 ? 'border-b border-[#313244]/50' : ''}`}
                        >
                          {/* Number / Lock */}
                          <div className="w-8 h-8 rounded-lg bg-[#313244] flex items-center justify-center text-sm font-mono">
                            {unlocked ? (
                              <span className="text-[#cdd6f4]">{i + 1}</span>
                            ) : (
                              <svg className="w-4 h-4 text-[#6c7086]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#cdd6f4] truncate">{challenge.title}</span>
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
