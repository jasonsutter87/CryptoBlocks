/**
 * Global Leaderboard — top builders, most loved projects, most remixed.
 */

import { useState, useEffect } from 'react'

interface Builder {
  authorName: string
  projectCount: number
  totalLikes: number
}

interface LovedProject {
  id: string
  name: string
  authorName: string
  likes: number
  category: string
}

interface RemixedProject {
  id: string
  name: string
  authorName: string
  category: string
  remixCount: number
}

interface GlobalStats {
  totalProjects: number
  totalBuilders: number
  totalLikes: number
  totalRemixes: number
}

interface LeaderboardData {
  topBuilders: Builder[]
  mostLoved: LovedProject[]
  mostRemixed: RemixedProject[]
  global: GlobalStats
}

const MEDALS = ['🥇', '🥈', '🥉']

function RankBadge({ rank }: { rank: number }) {
  if (rank < 3) {
    return <span className="text-xl">{MEDALS[rank]}</span>
  }
  return <span className="text-sm font-bold text-[#6c7086] w-6 text-center">{rank + 1}</span>
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'builders' | 'loved' | 'remixed'>('builders')

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-full bg-[#1e1e2e]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl">🏆</span>
            <h1 className="text-3xl font-bold text-[#cdd6f4] tracking-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-[#a6adc8]">
            See who's building, sharing, and inspiring the community.
          </p>
        </div>

        {/* Global stats */}
        {data?.global && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#313244] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#89b4fa]">{data.global.totalProjects}</div>
              <div className="text-xs text-[#6c7086]">Projects</div>
            </div>
            <div className="bg-[#313244] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#a6e3a1]">{data.global.totalBuilders}</div>
              <div className="text-xs text-[#6c7086]">Builders</div>
            </div>
            <div className="bg-[#313244] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#f38ba8]">{data.global.totalLikes}</div>
              <div className="text-xs text-[#6c7086]">Likes</div>
            </div>
            <div className="bg-[#313244] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#fab387]">{data.global.totalRemixes}</div>
              <div className="text-xs text-[#6c7086]">Remixes</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'builders' as const, label: '👷 Top Builders', color: '#89b4fa' },
            { key: 'loved' as const, label: '❤️ Most Loved', color: '#f38ba8' },
            { key: 'remixed' as const, label: '🔀 Most Remixed', color: '#a6e3a1' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'text-[#1e1e2e]'
                  : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
              }`}
              style={tab === t.key ? { backgroundColor: t.color } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-[#6c7086] animate-pulse py-16 text-center">Loading leaderboard...</div>
        ) : !data ? (
          <div className="text-[#6c7086] py-16 text-center">Failed to load leaderboard</div>
        ) : (
          <div className="bg-[#181825] border border-[#313244] rounded-xl overflow-hidden">
            {/* Top Builders */}
            {tab === 'builders' && (
              data.topBuilders.length === 0 ? (
                <div className="p-12 text-center text-[#6c7086]">No builders yet — be the first to upload!</div>
              ) : (
                <div>
                  {data.topBuilders.map((b, i) => (
                    <div
                      key={b.authorName}
                      className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-[#313244]' : ''} ${i < 3 ? 'bg-[#1e1e2e]' : ''}`}
                    >
                      <RankBadge rank={i} />
                      <div className="w-8 h-8 rounded-full bg-[#89b4fa] flex items-center justify-center text-sm font-bold text-[#1e1e2e]">
                        {b.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#cdd6f4] truncate">{b.authorName}</div>
                        <div className="text-xs text-[#6c7086]">
                          {b.projectCount} project{b.projectCount !== 1 ? 's' : ''} · {b.totalLikes} like{b.totalLikes !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-[#89b4fa]">{b.projectCount}</div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Most Loved */}
            {tab === 'loved' && (
              data.mostLoved.length === 0 ? (
                <div className="p-12 text-center text-[#6c7086]">No likes yet — share a project and get your first!</div>
              ) : (
                <div>
                  {data.mostLoved.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-[#313244]' : ''} ${i < 3 ? 'bg-[#1e1e2e]' : ''}`}
                    >
                      <RankBadge rank={i} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#cdd6f4] truncate">{p.name}</div>
                        <div className="text-xs text-[#6c7086]">
                          by <span className="text-[#89b4fa]">{p.authorName}</span> · {p.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[#f38ba8]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span className="text-lg font-bold text-[#f38ba8]">{p.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Most Remixed */}
            {tab === 'remixed' && (
              data.mostRemixed.length === 0 ? (
                <div className="p-12 text-center text-[#6c7086]">No remixes yet — remix a project to start a tree!</div>
              ) : (
                <div>
                  {data.mostRemixed.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-[#313244]' : ''} ${i < 3 ? 'bg-[#1e1e2e]' : ''}`}
                    >
                      <RankBadge rank={i} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#cdd6f4] truncate">{p.name}</div>
                        <div className="text-xs text-[#6c7086]">
                          by <span className="text-[#89b4fa]">{p.authorName}</span> · {p.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                        <span className="text-lg font-bold text-[#a6e3a1]">{p.remixCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
