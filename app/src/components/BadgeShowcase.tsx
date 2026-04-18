/**
 * Badge showcase — COD-style grid of all achievements.
 * Unlocked badges glow with rarity color, locked ones are silhouetted.
 */

import { useMemo } from 'react'
import { achievements } from '../achievements/definitions'
import { loadUnlocked } from '../achievements/tracker'
import type { Achievement } from '../achievements/types'

const RARITY_ORDER: Record<string, number> = { legendary: 0, epic: 1, rare: 2, common: 3 }

const RARITY_STYLES: Record<string, { ring: string; glow: string; bg: string; text: string; label: string }> = {
  legendary: {
    ring: 'ring-2 ring-yellow-500/60',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    label: 'Legendary',
  },
  epic: {
    ring: 'ring-2 ring-purple-500/60',
    glow: 'shadow-[0_0_16px_rgba(168,85,247,0.35)]',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    label: 'Epic',
  },
  rare: {
    ring: 'ring-2 ring-blue-500/50',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    label: 'Rare',
  },
  common: {
    ring: 'ring-1 ring-surface-1',
    glow: '',
    bg: 'bg-surface-0',
    text: 'text-overlay',
    label: 'Common',
  },
}

function BadgeCard({ achievement, unlocked, unlockedAt }: {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: number
}) {
  const style = RARITY_STYLES[achievement.rarity]
  const isSecret = achievement.secret && !unlocked

  return (
    <div
      className={`relative rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
        unlocked
          ? `${style.bg} ${style.ring} ${style.glow}`
          : 'bg-surface-0/50 ring-1 ring-surface-1 opacity-50'
      }`}
    >
      {/* Icon */}
      <div className={`text-4xl ${unlocked ? '' : 'grayscale brightness-[0.3]'}`}>
        {isSecret ? '🔒' : achievement.icon}
      </div>

      {/* Name */}
      <div className={`text-sm font-bold text-center ${unlocked ? 'text-text' : 'text-overlay'}`}>
        {isSecret ? '???' : achievement.name}
      </div>

      {/* Description */}
      <div className={`text-xs text-center leading-tight ${unlocked ? 'text-subtext' : 'text-overlay/50'}`}>
        {isSecret ? 'Hidden achievement' : achievement.description}
      </div>

      {/* Rarity tag */}
      <span className={`text-[10px] font-bold uppercase tracking-wider ${unlocked ? style.text : 'text-overlay/40'}`}>
        {style.label}
      </span>

      {/* Unlock date */}
      {unlocked && unlockedAt && (
        <span className="text-[10px] text-overlay">
          {new Date(unlockedAt).toLocaleDateString()}
        </span>
      )}

      {/* Legendary shimmer */}
      {unlocked && achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-shimmer" />
        </div>
      )}
    </div>
  )
}

export default function BadgeShowcase() {
  const unlocked = useMemo(() => loadUnlocked(), [])
  const unlockedMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const u of unlocked) m.set(u.achievementId, u.unlockedAt)
    return m
  }, [unlocked])

  const sorted = useMemo(() =>
    [...achievements].sort((a, b) => {
      // Unlocked first, then by rarity
      const aUnlocked = unlockedMap.has(a.id) ? 0 : 1
      const bUnlocked = unlockedMap.has(b.id) ? 0 : 1
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked
      return (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9)
    }),
  [unlockedMap])

  const total = achievements.length
  const unlockedCount = unlocked.length
  const byRarity = useMemo(() => {
    const counts = { legendary: 0, epic: 0, rare: 0, common: 0 }
    for (const u of unlocked) {
      const a = achievements.find((a) => a.id === u.achievementId)
      if (a) counts[a.rarity]++
    }
    return counts
  }, [unlocked])

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-text">{unlockedCount} / {total} Badges</span>
          <span className="text-xs text-overlay">{Math.round((unlockedCount / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-surface-0 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Rarity breakdown */}
      <div className="flex gap-3 flex-wrap">
        {(['legendary', 'epic', 'rare', 'common'] as const).map((r) => {
          const style = RARITY_STYLES[r]
          const total = achievements.filter((a) => a.rarity === r).length
          return (
            <div key={r} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${style.bg}`}>
              <span className={`text-xs font-bold ${style.text}`}>{byRarity[r]}/{total}</span>
              <span className={`text-[10px] uppercase tracking-wider ${style.text}`}>{style.label}</span>
            </div>
          )
        })}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sorted.map((a) => (
          <BadgeCard
            key={a.id}
            achievement={a}
            unlocked={unlockedMap.has(a.id)}
            unlockedAt={unlockedMap.get(a.id)}
          />
        ))}
      </div>
    </div>
  )
}
