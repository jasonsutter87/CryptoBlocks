/**
 * Global Leaderboard — top builders, most loved projects, most remixed.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

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
  return <span className="text-sm font-bold text-overlay w-6 text-center">{rank + 1}</span>
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'builders' | 'loved' | 'remixed' | 'badges'>('builders')
  const [badgeLeaderboard, setBadgeLeaderboard] = useState<{ userId: string; score: number; count: number }[]>([])
  const [badgesLoading, setBadgesLoading] = useState(false)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab !== 'badges' || badgeLeaderboard.length > 0) return
    setBadgesLoading(true)
    fetch('/api/achievements/leaderboard')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setBadgeLeaderboard(d?.leaderboard ?? []); setBadgesLoading(false) })
      .catch(() => setBadgesLoading(false))
  }, [tab, badgeLeaderboard.length])

  return (
    <div className="min-h-full bg-base">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl">🏆</span>
            <h1 className="text-3xl font-bold text-text tracking-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-subtext">
            See who's building, sharing, and inspiring the community.
          </p>
        </div>

        {/* Global stats */}
        {data?.global && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-0 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent">{data.global.totalProjects}</div>
              <div className="text-xs text-overlay">Projects</div>
            </div>
            <div className="bg-surface-0 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-success">{data.global.totalBuilders}</div>
              <div className="text-xs text-overlay">Builders</div>
            </div>
            <div className="bg-surface-0 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-danger">{data.global.totalLikes}</div>
              <div className="text-xs text-overlay">Likes</div>
            </div>
            <div className="bg-surface-0 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-peach">{data.global.totalRemixes}</div>
              <div className="text-xs text-overlay">Remixes</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'builders' as const, label: '👷 Top Builders', color: '#89b4fa' },
            { key: 'loved' as const, label: '❤️ Most Loved', color: '#f38ba8' },
            { key: 'remixed' as const, label: '🔀 Most Remixed', color: '#a6e3a1' },
            { key: 'badges' as const, label: '🏅 Badge Hunters', color: '#f9e2af' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'text-base'
                  : 'bg-surface-0 text-subtext hover:bg-surface-1'
              }`}
              style={tab === t.key ? { backgroundColor: t.color } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-overlay animate-pulse py-16 text-center">Loading leaderboard...</div>
        ) : !data ? (
          <div className="text-overlay py-16 text-center">Failed to load leaderboard</div>
        ) : (
          <div className="bg-mantle border border-surface-0 rounded-xl overflow-hidden">
            {/* Top Builders */}
            {tab === 'builders' && (
              data.topBuilders.length === 0 ? (
                <div className="p-12 text-center text-overlay">No builders yet — be the first to upload!</div>
              ) : (
                <div>
                  {data.topBuilders.map((b, i) => (
                    <div
                      key={b.authorName}
                      className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-surface-0' : ''} ${i < 3 ? 'bg-base' : ''}`}
                    >
                      <RankBadge rank={i} />
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-base">
                        {b.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text truncate">{b.authorName}</div>
                        <div className="text-xs text-overlay">
                          {b.projectCount} project{b.projectCount !== 1 ? 's' : ''} · {b.totalLikes} like{b.totalLikes !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-accent">{b.projectCount}</div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Most Loved */}
            {tab === 'loved' && (
              data.mostLoved.length === 0 ? (
                <div className="p-12 text-center text-overlay">No likes yet — share a project and get your first!</div>
              ) : (
                <div>
                  {data.mostLoved.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-surface-0' : ''} ${i < 3 ? 'bg-base' : ''}`}
                    >
                      <RankBadge rank={i} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text truncate">{p.name}</div>
                        <div className="text-xs text-overlay">
                          by <span className="text-accent">{p.authorName}</span> · {p.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-danger" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span className="text-lg font-bold text-danger">{p.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Badge Hunters */}
            {tab === 'badges' && (
              badgesLoading ? (
                <div className="p-12 text-center text-overlay animate-pulse">Loading badge leaderboard...</div>
              ) : badgeLeaderboard.length === 0 ? (
                <div className="p-12 text-center text-overlay">No badge hunters yet — start earning!</div>
              ) : (
                <div>
                  {badgeLeaderboard.map((b, i) => (
                    <Link
                      key={b.userId}
                      to={`/user/${b.userId}`}
                      className={`flex items-center gap-4 px-5 py-4 hover:bg-surface-0 transition-colors ${i > 0 ? 'border-t border-surface-0' : ''} ${i < 3 ? 'bg-base' : ''}`}
                    >
                      <RankBadge rank={i} />
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm">
                        🏅
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text truncate">{b.userId.slice(0, 12)}...</div>
                        <div className="text-xs text-overlay">
                          {b.count} badge{b.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-yellow-400">{b.score} pts</div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Most Remixed */}
            {tab === 'remixed' && (
              data.mostRemixed.length === 0 ? (
                <div className="p-12 text-center text-overlay">No remixes yet — remix a project to start a tree!</div>
              ) : (
                <div>
                  {data.mostRemixed.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-surface-0' : ''} ${i < 3 ? 'bg-base' : ''}`}
                    >
                      <RankBadge rank={i} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text truncate">{p.name}</div>
                        <div className="text-xs text-overlay">
                          by <span className="text-accent">{p.authorName}</span> · {p.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                        <span className="text-lg font-bold text-success">{p.remixCount}</span>
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
