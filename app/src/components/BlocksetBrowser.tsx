import { useState } from 'react'
import type { BlocksetPack, Blockset } from '../blocksets'
import { allBlocksetPacks, getTotalBlocksetCount } from '../blocksets'
import { getBlocksetProgressById, loadBlocksetProgress } from '../blocksets/progress'

interface BlocksetBrowserProps {
  onSelectBlockset: (blockset: Blockset) => void
  onBackToSandbox: () => void
}

export default function BlocksetBrowser({ onSelectBlockset, onBackToSandbox }: BlocksetBrowserProps) {
  const [expandedPack, setExpandedPack] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const totalBlocksets = getTotalBlocksetCount()
  const allProgress = loadBlocksetProgress()
  const completedCount = allProgress.filter((p) => p.completed).length
  const totalAttempts = allProgress.reduce((s, p) => s + p.attempts, 0)

  const getPackProgress = (pack: BlocksetPack) => {
    let completed = 0
    for (const b of pack.blocksets) {
      const p = getBlocksetProgressById(b.id)
      if (p?.completed) completed++
    }
    return completed
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-[#a6e3a1] text-[#1e1e2e]'
      case 'intermediate': return 'bg-[#f9e2af] text-[#1e1e2e]'
      case 'advanced': return 'bg-[#f38ba8] text-[#1e1e2e]'
      default: return 'bg-[#6c7086] text-[#cdd6f4]'
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-[#1e1e2e] p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#cdd6f4]">Blocksets</h2>
            <p className="text-xs md:text-sm text-[#6c7086] mt-1">Step-by-step guided tutorials — like LEGO instruction sets</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setShowStats((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                showStats ? 'bg-[#a6e3a1] text-[#1e1e2e]' : 'bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a]'
              }`}
            >
              <span className="text-sm font-bold">{completedCount}</span>
              <span className="text-xs opacity-70">/ {totalBlocksets}</span>
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
                <div className="text-xs text-[#6c7086]">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#89b4fa]">{totalBlocksets - completedCount}</div>
                <div className="text-xs text-[#6c7086]">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#cba6f7]">{totalAttempts}</div>
                <div className="text-xs text-[#6c7086]">Attempts</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-[#6c7086] mb-1">
                <span>Overall Progress</span>
                <span>{completedCount}/{totalBlocksets} blocksets</span>
              </div>
              <div className="w-full h-2 bg-[#45475a] rounded-full">
                <div
                  className="h-full bg-[#a6e3a1] rounded-full transition-all"
                  style={{ width: `${totalBlocksets > 0 ? (completedCount / totalBlocksets) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {allBlocksetPacks.map((pack) => {
                const packCompleted = getPackProgress(pack)
                const packTotal = pack.blocksets.length
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
          {allBlocksetPacks.map((pack) => {
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
                      <div className="text-sm font-medium text-[#cdd6f4]">{completed}/{pack.blocksets.length}</div>
                      <div className="w-20 h-1.5 bg-[#45475a] rounded-full mt-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(completed / pack.blocksets.length) * 100}%`,
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
                    {pack.blocksets.map((blockset, i) => {
                      const progress = getBlocksetProgressById(blockset.id)

                      return (
                        <button
                          key={blockset.id}
                          onClick={() => onSelectBlockset(blockset)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#313244]/50 cursor-pointer ${
                            i < pack.blocksets.length - 1 ? 'border-b border-[#313244]/50' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#313244] flex items-center justify-center text-sm font-mono">
                            <span className="text-[#cdd6f4]">{i + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#cdd6f4] truncate">{blockset.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(blockset.difficulty)}`}>
                                {blockset.difficulty}
                              </span>
                              <span className="text-[10px] text-[#6c7086]">~{blockset.estimatedMinutes}min</span>
                            </div>
                          </div>

                          {progress?.completed && (
                            <svg className="w-5 h-5 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
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
