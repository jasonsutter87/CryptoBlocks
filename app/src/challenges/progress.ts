import type { ChallengeProgress } from './types'
import { allThemes } from './index'

const STORAGE_KEY = 'cryptoblocks_challenge_progress'

/** Set of all valid challenge IDs from registered themes. */
let _validIds: Set<string> | null = null
function getValidChallengeIds(): Set<string> {
  if (!_validIds) {
    _validIds = new Set(allThemes.flatMap((t) => t.challenges.map((c) => c.id)))
  }
  return _validIds
}

export function saveProgress(progress: ChallengeProgress): void {
  // Only accept progress for known challenge IDs
  if (!getValidChallengeIds().has(progress.challengeId)) return

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
    if (json) {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) return []
      const validIds = getValidChallengeIds()
      // Filter out entries with invalid challenge IDs or malformed data
      return parsed.filter(
        (p: unknown): p is ChallengeProgress =>
          !!p &&
          typeof p === 'object' &&
          typeof (p as ChallengeProgress).challengeId === 'string' &&
          validIds.has((p as ChallengeProgress).challengeId) &&
          typeof (p as ChallengeProgress).completed === 'boolean' &&
          typeof (p as ChallengeProgress).stars === 'number' &&
          typeof (p as ChallengeProgress).bestBlockCount === 'number'
      )
    }
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
