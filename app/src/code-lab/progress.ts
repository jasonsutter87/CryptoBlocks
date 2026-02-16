import type { LabProgress } from './types'
import { allLabPacks } from './index'

const STORAGE_KEY = 'cryptoblocks_lab_progress'

let _validIds: Set<string> | null = null
function getValidExerciseIds(): Set<string> {
  if (!_validIds) {
    _validIds = new Set(allLabPacks.flatMap((p) => p.exercises.map((e) => e.id)))
  }
  return _validIds
}

export function saveLabProgress(progress: LabProgress): void {
  if (!getValidExerciseIds().has(progress.exerciseId)) return

  const all = loadLabProgress()
  const existing = all.findIndex((p) => p.exerciseId === progress.exerciseId)

  if (existing >= 0) {
    const prev = all[existing]
    all[existing] = {
      ...progress,
      completed: prev.completed || progress.completed,
      attempts: prev.attempts + 1,
    }
  } else {
    all.push({ ...progress, attempts: 1 })
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function loadLabProgress(): LabProgress[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json) {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) return []
      const validIds = getValidExerciseIds()
      return parsed.filter(
        (p: unknown): p is LabProgress =>
          !!p &&
          typeof p === 'object' &&
          typeof (p as LabProgress).exerciseId === 'string' &&
          validIds.has((p as LabProgress).exerciseId) &&
          typeof (p as LabProgress).completed === 'boolean' &&
          typeof (p as LabProgress).attempts === 'number'
      )
    }
  } catch {
    // corrupted data, ignore
  }
  return []
}

export function getLabProgressById(id: string): LabProgress | null {
  const all = loadLabProgress()
  return all.find((p) => p.exerciseId === id) ?? null
}
