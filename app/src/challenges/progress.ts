import type { ChallengeProgress } from './types'

const STORAGE_KEY = 'cryptoblocks_challenge_progress'

export function saveProgress(progress: ChallengeProgress): void {
  const all = loadProgress()
  const existing = all.findIndex((p) => p.challengeId === progress.challengeId)

  if (existing >= 0) {
    const prev = all[existing]
    // Keep best score
    all[existing] = {
      ...progress,
      stars: Math.max(prev.stars, progress.stars),
      bestBlockCount: Math.min(prev.bestBlockCount, progress.bestBlockCount),
      attempts: prev.attempts + 1,
    }
  } else {
    all.push({ ...progress, attempts: 1 })
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function loadProgress(): ChallengeProgress[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json) return JSON.parse(json)
  } catch {
    // corrupted data, ignore
  }
  return []
}

export function getProgressForChallenge(id: string): ChallengeProgress | null {
  const all = loadProgress()
  return all.find((p) => p.challengeId === id) ?? null
}

export function getTotalStars(): number {
  return loadProgress().reduce((sum, p) => sum + p.stars, 0)
}
