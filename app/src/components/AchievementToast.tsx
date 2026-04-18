/**
 * COD-style achievement unlock overlay.
 * Dark backdrop, centered badge burst, rarity glow, text slide-up.
 */

import { useEffect, useState } from 'react'
import type { Achievement } from '../achievements/types'

interface AchievementToastProps {
  achievement: Achievement | null
  onDismiss: () => void
}

const RARITY_COLOR: Record<string, string> = {
  common: '#6c7086',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
}

const RARITY_LABEL: Record<string, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [phase, setPhase] = useState<'hidden' | 'enter' | 'visible' | 'exit'>('hidden')

  useEffect(() => {
    if (achievement) {
      setPhase('enter')
      const t1 = setTimeout(() => setPhase('visible'), 50)
      const t2 = setTimeout(() => setPhase('exit'), 4500)
      const t3 = setTimeout(() => { setPhase('hidden'); onDismiss() }, 5000)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    } else {
      setPhase('hidden')
    }
  }, [achievement, onDismiss])

  if (!achievement || phase === 'hidden') return null

  const color = RARITY_COLOR[achievement.rarity]
  const isVisible = phase === 'visible' || phase === 'enter'

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center cursor-pointer"
      onClick={() => { setPhase('hidden'); onDismiss() }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          isVisible ? 'opacity-70' : 'opacity-0'
        }`}
      />

      {/* Glow burst */}
      <div
        className={`absolute w-64 h-64 rounded-full animate-badge-glow ${
          isVisible ? '' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          animationDelay: '0.1s',
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4">
        {/* Badge icon */}
        <div
          className={`text-7xl sm:text-8xl ${isVisible ? 'animate-badge-burst' : 'opacity-0'}`}
          style={{ filter: `drop-shadow(0 0 30px ${color})` }}
        >
          {achievement.icon}
        </div>

        {/* "ACHIEVEMENT UNLOCKED" */}
        <div
          className={`text-xs font-bold tracking-[0.3em] uppercase ${
            isVisible ? 'animate-badge-text' : 'opacity-0'
          }`}
          style={{ color, animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          Achievement Unlocked
        </div>

        {/* Name */}
        <div
          className={`text-2xl sm:text-3xl font-black text-white text-center ${
            isVisible ? 'animate-badge-text' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
        >
          {achievement.name}
        </div>

        {/* Description */}
        <div
          className={`text-sm text-[#a6adc8] text-center max-w-xs ${
            isVisible ? 'animate-badge-text' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.55s', animationFillMode: 'both' }}
        >
          {achievement.description}
        </div>

        {/* Rarity badge */}
        <div
          className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest ${
            isVisible ? 'animate-badge-text' : 'opacity-0'
          }`}
          style={{
            animationDelay: '0.65s',
            animationFillMode: 'both',
            color,
            border: `2px solid ${color}`,
            boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}10`,
          }}
        >
          {RARITY_LABEL[achievement.rarity]}
        </div>

        {/* Click to dismiss hint */}
        <div
          className={`text-[10px] text-[#585b70] mt-4 ${
            isVisible ? 'animate-badge-text' : 'opacity-0'
          }`}
          style={{ animationDelay: '1s', animationFillMode: 'both' }}
        >
          click anywhere to dismiss
        </div>
      </div>
    </div>
  )
}
