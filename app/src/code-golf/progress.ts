import type { GolfProgress } from './types'
import { allGolfPacks } from './index'

const STORAGE_KEY = 'cryptoblocks_golf_progress'

let _validIds: Set<string> | null = null
function getValidProblemIds(): Set<string> {
  if (!_validIds) {
    _validIds = new Set(allGolfPacks.flatMap((p) => p.problems.map((pr) => pr.id)))
  }
  return _validIds
}

export function saveGolfProgress(progress: GolfProgress): void {
  if (!getValidProblemIds().has(progress.problemId)) return

  const all = loadGolfProgress()
  const existing = all.findIndex((p) => p.problemId === progress.problemId)

  if (existing >= 0) {
    const prev = all[existing]
    all[existing] = {
      ...progress,
      completed: prev.completed || progress.completed,
      bestBlockCount: Math.min(prev.bestBlockCount, progress.bestBlockCount),
      attempts: prev.attempts + 1,
    }
  } else {
    all.push({ ...progress, attempts: 1 })
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function loadGolfProgress(): GolfProgress[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json) {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) return []
      const validIds = getValidProblemIds()
      return parsed.filter(
        (p: unknown): p is GolfProgress =>
          !!p &&
          typeof p === 'object' &&
          typeof (p as GolfProgress).problemId === 'string' &&
          validIds.has((p as GolfProgress).problemId) &&
          typeof (p as GolfProgress).completed === 'boolean' &&
          typeof (p as GolfProgress).bestBlockCount === 'number'
      )
    }
  } catch {
    // corrupted data, ignore
  }
  return []
}

export function getGolfProgressById(id: string): GolfProgress | null {
  const all = loadGolfProgress()
  return all.find((p) => p.problemId === id) ?? null
}
