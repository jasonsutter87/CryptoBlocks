/**
 * Public user badge showcase — /user/:id
 * Shows a user's unlocked achievements with rarity glow effects.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { achievements } from '../achievements/definitions'
import { RARITY_ORDER, RARITY_STYLES, RARITY_LABEL } from '../achievements/rarity'
import type { Achievement } from '../achievements/types'

interface UnlockedRecord {
  achievementId: string
  unlockedAt: number
}

const RARITY_WEIGHT: Record<string, number> = {
  common: 1, rare: 3, epic: 10, legendary: 25,
}

export default function UserShowcasePage() {
  const { id } = useParams<{ id: string }>()
  const [unlocked, setUnlocked] = useState<UnlockedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/achievements/showcase/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((data) => {
        setUnlocked(data.unlocked ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [id])

  const unlockedMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const u of unlocked) m.set(u.achievementId, u.unlockedAt)
    return m
  }, [unlocked])

  const sorted = useMemo(() =>
    [...achievements]
      .filter((a) => !a.secret || unlockedMap.has(a.id))
      .sort((a, b) => {
        const aUnlocked = unlockedMap.has(a.id) ? 0 : 1
        const bUnlocked = unlockedMap.has(b.id) ? 0 : 1
        if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked
        return (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9)
      }),
  [unlockedMap])

  const score = useMemo(() => {
    let total = 0
    for (const u of unlocked) {
      const a = achievements.find((a) => a.id === u.achievementId)
      if (a) total += RARITY_WEIGHT[a.rarity] ?? 1
    }
    return total
  }, [unlocked])

  const byRarity = useMemo(() => {
    const counts = { legendary: 0, epic: 0, rare: 0, common: 0 }
    for (const u of unlocked) {
      const a = achievements.find((a) => a.id === u.achievementId)
      if (a) counts[a.rarity]++
    }
    return counts
  }, [unlocked])

  if (loading) {
    return (
      <div className="min-h-full bg-base flex items-center justify-center">
        <span className="text-overlay animate-pulse">Loading badges...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full bg-base flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">😕</span>
        <p className="text-text font-semibold text-lg">User not found</p>
        <Link to="/leaderboard" className="text-accent text-sm hover:underline">← Back to Leaderboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-base">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/leaderboard" className="text-accent text-sm hover:underline mb-4 inline-block">← Leaderboard</Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-0 flex items-center justify-center text-2xl font-bold text-accent">
              {(id ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Badge Showcase</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-overlay">{unlocked.length} badges</span>
                <span className="text-sm text-yellow-400 font-bold">{score} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rarity breakdown */}
        <div className="flex gap-3 flex-wrap mb-6">
          {(['legendary', 'epic', 'rare', 'common'] as const).map((r) => {
            const style = RARITY_STYLES[r]
            return (
              <div key={r} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${style.bg}`}>
                <span className={`text-xs font-bold ${style.text}`}>{byRarity[r]}</span>
                <span className={`text-[10px] uppercase tracking-wider ${style.text}`}>{RARITY_LABEL[r]}</span>
              </div>
            )
          })}
        </div>

        {/* Badge grid */}
        {unlocked.length === 0 ? (
          <div className="bg-mantle border border-surface-0 rounded-xl p-12 text-center">
            <span className="text-4xl block mb-3">🏅</span>
            <p className="text-text font-semibold">No badges yet</p>
            <p className="text-sm text-overlay mt-1">This user hasn't earned any badges.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sorted.map((a) => {
              const isUnlocked = unlockedMap.has(a.id)
              const style = RARITY_STYLES[a.rarity]
              const unlockedAt = unlockedMap.get(a.id)
              return (
                <div
                  key={a.id}
                  className={`relative rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                    isUnlocked
                      ? `${style.bg} ${style.ring} ${style.glow}`
                      : 'bg-surface-0/50 ring-1 ring-surface-1 opacity-40'
                  }`}
                >
                  <div className={`text-4xl ${isUnlocked ? '' : 'grayscale brightness-[0.3]'}`}>
                    {a.icon}
                  </div>
                  <div className={`text-sm font-bold text-center ${isUnlocked ? 'text-text' : 'text-overlay'}`}>
                    {a.name}
                  </div>
                  <div className={`text-xs text-center leading-tight ${isUnlocked ? 'text-subtext' : 'text-overlay/50'}`}>
                    {a.description}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isUnlocked ? style.text : 'text-overlay/40'}`}>
                    {RARITY_LABEL[a.rarity as keyof typeof RARITY_LABEL]}
                  </span>
                  {isUnlocked && unlockedAt && (
                    <span className="text-[10px] text-overlay">
                      {new Date(unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                  {isUnlocked && a.rarity === 'legendary' && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-shimmer" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
