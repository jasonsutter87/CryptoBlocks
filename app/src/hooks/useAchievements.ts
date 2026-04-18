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
import { checkAchievements, syncFromServer } from '../achievements'
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

  // Sync server-side achievements on mount (fire-and-forget)
  useEffect(() => { syncFromServer() }, [])

  // Universal listener — any callsite that triggers checkAchievements()
  // will dispatch cb:achievement-unlocked, and this picks it up for the
  // COD animation queue. No more per-event wiring needed.
  useEffect(() => {
    const handler = (e: Event) => {
      const unlocked = (e as CustomEvent).detail?.achievements as Achievement[] | undefined
      if (!unlocked || unlocked.length === 0) return
      for (const a of unlocked) {
        recordAchievement()
        queue.current.push(a)
      }
      setCurrentAchievement((prev) => prev ?? queue.current.shift() ?? null)
    }
    document.addEventListener('cb:achievement-unlocked', handler)
    return () => document.removeEventListener('cb:achievement-unlocked', handler)
  }, [])

  // Hacker-mode and DOOM still call checkAchievements() directly,
  // which now dispatches cb:achievement-unlocked automatically.
  // Legacy event listeners for triggers that don't go through checkAchievements:
  useEffect(() => {
    const handler = () => { checkAchievements({ event: 'hacker-mode' }) }
    document.addEventListener('cb:hacker-mode-changed', handler)
    return () => document.removeEventListener('cb:hacker-mode-changed', handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const level = (e as CustomEvent).detail?.level ?? 0
      checkAchievements({ event: 'doom-clear', doomLevel: level })
    }
    document.addEventListener('cb:doom-clear', handler)
    return () => document.removeEventListener('cb:doom-clear', handler)
  }, [])

  return { currentAchievement, process, showNext }
}
