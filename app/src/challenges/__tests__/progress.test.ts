import { describe, it, expect, beforeEach } from 'vitest'
import { saveProgress, loadProgress, getProgressForChallenge, getTotalStars } from '../progress'

describe('Challenge progress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads progress', () => {
    saveProgress({
      challengeId: 'gs-1',
      completed: true,
      stars: 2,
      bestBlockCount: 3,
      attempts: 1,
    })

    const all = loadProgress()
    expect(all).toHaveLength(1)
    expect(all[0].challengeId).toBe('gs-1')
    expect(all[0].stars).toBe(2)
  })

  it('returns empty array when nothing saved', () => {
    expect(loadProgress()).toEqual([])
  })

  it('getProgressForChallenge returns matching progress', () => {
    saveProgress({
      challengeId: 'mc-1',
      completed: true,
      stars: 3,
      bestBlockCount: 2,
      attempts: 1,
    })

    const progress = getProgressForChallenge('mc-1')
    expect(progress).not.toBeNull()
    expect(progress!.stars).toBe(3)
  })

  it('getProgressForChallenge returns null for unknown id', () => {
    expect(getProgressForChallenge('unknown')).toBeNull()
  })

  it('getTotalStars sums correctly', () => {
    saveProgress({
      challengeId: 'gs-1',
      completed: true,
      stars: 2,
      bestBlockCount: 3,
      attempts: 1,
    })
    saveProgress({
      challengeId: 'gs-2',
      completed: true,
      stars: 3,
      bestBlockCount: 4,
      attempts: 1,
    })

    expect(getTotalStars()).toBe(5)
  })

  it('keeps best score when overwriting', () => {
    saveProgress({
      challengeId: 'gs-1',
      completed: true,
      stars: 3,
      bestBlockCount: 2,
      attempts: 1,
    })

    // Second attempt with worse score
    saveProgress({
      challengeId: 'gs-1',
      completed: true,
      stars: 1,
      bestBlockCount: 5,
      attempts: 1,
    })

    const progress = getProgressForChallenge('gs-1')
    expect(progress!.stars).toBe(3) // kept best
    expect(progress!.bestBlockCount).toBe(2) // kept best
    expect(progress!.attempts).toBe(2) // incremented
  })

  it('updates to better score', () => {
    saveProgress({
      challengeId: 'gs-1',
      completed: true,
      stars: 1,
      bestBlockCount: 8,
      attempts: 1,
    })

    // Better attempt
    saveProgress({
      challengeId: 'gs-1',
      completed: true,
      stars: 3,
      bestBlockCount: 2,
      attempts: 1,
    })

    const progress = getProgressForChallenge('gs-1')
    expect(progress!.stars).toBe(3) // updated to better
    expect(progress!.bestBlockCount).toBe(2) // updated to better
  })
})
