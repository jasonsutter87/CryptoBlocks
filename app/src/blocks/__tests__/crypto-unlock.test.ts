import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ChallengeProgress } from '../../challenges/types'

vi.mock('../../challenges/progress', () => ({
  loadProgress: vi.fn(() => [] as ChallengeProgress[]),
}))

vi.mock('../../challenges/index', () => ({
  getTotalChallengeCount: vi.fn(() => 10),
}))

import { getCryptoUnlockState } from '../crypto-unlock'
import { loadProgress } from '../../challenges/progress'
import { getTotalChallengeCount } from '../../challenges/index'

function mockProgress(completed: number, total: number) {
  vi.mocked(getTotalChallengeCount).mockReturnValue(total)
  vi.mocked(loadProgress).mockReturnValue(
    Array.from({ length: completed }, (_, i) => ({
      challengeId: `ch-${i}`,
      completed: true,
      stars: 3,
      bestBlockCount: 5,
      attempts: 1,
    }))
  )
}

describe('getCryptoUnlockState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns hidden when 0 challenges completed', () => {
    mockProgress(0, 10)
    expect(getCryptoUnlockState()).toBe('hidden')
  })

  it('returns hidden at 49% (boundary)', () => {
    mockProgress(49, 100)
    expect(getCryptoUnlockState()).toBe('hidden')
  })

  it('returns disabled at exactly 50%', () => {
    mockProgress(5, 10)
    expect(getCryptoUnlockState()).toBe('disabled')
  })

  it('returns disabled at 51%', () => {
    mockProgress(51, 100)
    expect(getCryptoUnlockState()).toBe('disabled')
  })

  it('returns disabled at 99%', () => {
    mockProgress(99, 100)
    expect(getCryptoUnlockState()).toBe('disabled')
  })

  it('returns unlocked at 100%', () => {
    mockProgress(10, 10)
    expect(getCryptoUnlockState()).toBe('unlocked')
  })

  it('returns hidden when total is 0', () => {
    mockProgress(0, 0)
    expect(getCryptoUnlockState()).toBe('hidden')
  })
})
