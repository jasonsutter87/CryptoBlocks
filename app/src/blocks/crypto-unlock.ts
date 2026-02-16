import { loadProgress } from '../challenges/progress'
import { getTotalChallengeCount } from '../challenges/index'

export type CryptoUnlockState = 'hidden' | 'disabled' | 'unlocked'

export function getCryptoUnlockState(): CryptoUnlockState {
  const progress = loadProgress()
  const total = getTotalChallengeCount()

  if (total === 0) return 'hidden'

  const completed = progress.filter((p) => p.completed).length
  const ratio = completed / total

  if (ratio >= 1) return 'unlocked'
  if (ratio >= 0.5) return 'disabled'
  return 'hidden'
}
