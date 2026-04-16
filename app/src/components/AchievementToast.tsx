import { useEffect, useState } from 'react'
import type { Achievement } from '../achievements/types'

interface AchievementToastProps {
  achievement: Achievement | null
  onDismiss: () => void
}

const rarityColors = {
  common: 'bg-gray-600 text-gray-100',
  rare: 'bg-blue-600 text-blue-100',
  epic: 'bg-purple-600 text-purple-100',
  legendary: 'bg-yellow-600 text-yellow-100',
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      // Trigger slide-in animation
      setIsVisible(true)

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for slide-out animation
      }, 4000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [achievement, onDismiss])

  if (!achievement) {
    return null
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-surface-0 text-text rounded-lg shadow-2xl p-4 min-w-[320px] max-w-[400px] border border-surface-1 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-warn mb-1">Achievement Unlocked!</div>
          <div className="font-bold text-base mb-1">{achievement.name}</div>
          <div className="text-sm text-[#bac2de] mb-2">{achievement.description}</div>
          <div className="inline-block">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${rarityColors[achievement.rarity]}`}
            >
              {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
