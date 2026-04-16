/**
 * Achievement queue — shows one unlocked achievement at a time. Also listens
 * for the "hacker mode activated" event from the logo easter-egg and checks
 * for the corresponding achievement.
 *
 * Returns the current achievement (for the <AchievementToast>) plus
 * processAchievements() and showNextAchievement() for the caller.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Achievement } from '../achievements'
import { checkAchievements } from '../achievements'
import { recordAchievement } from '../stats'

export function useAchievements() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const queue = useRef<Achievement[]>([])

  const showNext = useCallback(() => {
    setCurrentAchievement(queue.current.length > 0 ? queue.current.shift()! : null)
  }, [])

  const process = useCallback((newAchievements: Achievement[]) => {
    if (newAchievements.length === 0) return
    for (const a of newAchievements) {
      recordAchievement()
      queue.current.push(a)
    }
    if (!currentAchievement) showNext()
  }, [currentAchievement, showNext])

  // Hacker-mode activation (7 rapid logo clicks) is its own achievement trigger.
  useEffect(() => {
    const handler = () => {
      const unlocked = checkAchievements({ event: 'hacker-mode' })
      if (unlocked.length === 0) return
      for (const a of unlocked) {
        recordAchievement()
        queue.current.push(a)
      }
      setCurrentAchievement((prev) => prev ?? queue.current.shift() ?? null)
    }
    document.addEventListener('cb:hacker-mode-changed', handler)
    return () => document.removeEventListener('cb:hacker-mode-changed', handler)
  }, [])

  return { currentAchievement, process, showNext }
}
