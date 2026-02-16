import type { BlocksetProgress } from './types'
import { allBlocksetPacks } from './index'

const STORAGE_KEY = 'cryptoblocks_blockset_progress'

let _validIds: Set<string> | null = null
function getValidBlocksetIds(): Set<string> {
  if (!_validIds) {
    _validIds = new Set(allBlocksetPacks.flatMap((p) => p.blocksets.map((b) => b.id)))
  }
  return _validIds
}

export function saveBlocksetProgress(progress: BlocksetProgress): void {
  if (!getValidBlocksetIds().has(progress.blocksetId)) return

  const all = loadBlocksetProgress()
  const existing = all.findIndex((p) => p.blocksetId === progress.blocksetId)

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

export function loadBlocksetProgress(): BlocksetProgress[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json) {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) return []
      const validIds = getValidBlocksetIds()
      return parsed.filter(
        (p: unknown): p is BlocksetProgress =>
          !!p &&
          typeof p === 'object' &&
          typeof (p as BlocksetProgress).blocksetId === 'string' &&
          validIds.has((p as BlocksetProgress).blocksetId) &&
          typeof (p as BlocksetProgress).completed === 'boolean'
      )
    }
  } catch {
    // corrupted data, ignore
  }
  return []
}

export function getBlocksetProgressById(id: string): BlocksetProgress | null {
  const all = loadBlocksetProgress()
  return all.find((p) => p.blocksetId === id) ?? null
}
