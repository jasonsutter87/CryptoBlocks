import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadStats,
  saveStats,
  recordRun,
  recordChallengeComplete,
  recordGolfComplete,
  recordLabComplete,
  recordAchievement,
} from '../tracker'
import type { DevStats } from '../types'

describe('Stats Tracker', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadStats returns defaults when empty', () => {
    const stats = loadStats()

    expect(stats.totalRuns).toBe(0)
    expect(stats.totalBlocks).toBe(0)
    expect(stats.totalLinesGenerated).toBe(0)
    expect(stats.challengesCompleted).toBe(0)
    expect(stats.golfSolved).toBe(0)
    expect(stats.labExercises).toBe(0)
    expect(stats.runsPerLanguage.javascript).toBe(0)
    expect(stats.runsPerLanguage.python).toBe(0)
    expect(stats.runsPerLanguage.html).toBe(0)
    expect(stats.firstRunDate).toBe(0)
    expect(stats.lastRunDate).toBe(0)
    expect(stats.longestProgram).toBe(0)
    expect(stats.runsByDate).toEqual({})
    expect(stats.currentStreak).toBe(0)
    expect(stats.bestStreak).toBe(0)
    expect(stats.achievementsUnlocked).toBe(0)
  })

  it('recordRun increments totalRuns', () => {
    const stats = recordRun({
      language: 'javascript',
      blockCount: 5,
      lineCount: 10,
    })

    expect(stats.totalRuns).toBe(1)
  })

  it('recordRun tracks language counts', () => {
    recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    recordRun({ language: 'javascript', blockCount: 3, lineCount: 8 })
    recordRun({ language: 'python', blockCount: 7, lineCount: 15 })
    const stats = recordRun({ language: 'html', blockCount: 2, lineCount: 5 })

    expect(stats.runsPerLanguage.javascript).toBe(2)
    expect(stats.runsPerLanguage.python).toBe(1)
    expect(stats.runsPerLanguage.html).toBe(1)
    expect(stats.totalRuns).toBe(4)
  })

  it('recordRun updates longestProgram only when larger', () => {
    let stats = recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    expect(stats.longestProgram).toBe(5)

    stats = recordRun({ language: 'javascript', blockCount: 3, lineCount: 8 })
    expect(stats.longestProgram).toBe(5) // didn't increase

    stats = recordRun({ language: 'javascript', blockCount: 10, lineCount: 20 })
    expect(stats.longestProgram).toBe(10) // increased
  })

  it('recordRun increments runsByDate for today', () => {
    const now = new Date()
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    let stats = recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    expect(stats.runsByDate[dateKey]).toBe(1)

    stats = recordRun({ language: 'python', blockCount: 3, lineCount: 8 })
    expect(stats.runsByDate[dateKey]).toBe(2)

    stats = recordRun({ language: 'html', blockCount: 2, lineCount: 5 })
    expect(stats.runsByDate[dateKey]).toBe(3)
  })

  it('recordRun calculates streak correctly', () => {
    // Mock Date.now() to control dates
    const today = new Date('2026-02-16T12:00:00Z')
    const yesterday = new Date('2026-02-15T12:00:00Z')
    const twoDaysAgo = new Date('2026-02-14T12:00:00Z')
    const fourDaysAgo = new Date('2026-02-12T12:00:00Z')

    // Manually build stats with streak pattern
    const stats: DevStats = {
      totalRuns: 0,
      totalBlocks: 0,
      totalLinesGenerated: 0,
      challengesCompleted: 0,
      golfSolved: 0,
      labExercises: 0,
      runsPerLanguage: { javascript: 0, python: 0, html: 0 },
      firstRunDate: 0,
      lastRunDate: 0,
      longestProgram: 0,
      runsByDate: {
        '2026-02-14': 2, // two days ago
        '2026-02-15': 1, // yesterday
        // today will be added by recordRun
        // note: 2026-02-13 is missing (gap)
        '2026-02-12': 1, // four days ago
      },
      currentStreak: 0,
      bestStreak: 0,
      achievementsUnlocked: 0,
    }
    saveStats(stats)

    // Mock Date.now to return today's timestamp
    vi.spyOn(Date, 'now').mockReturnValue(today.getTime())

    const result = recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })

    // Should have streak of 3: today, yesterday, two days ago
    expect(result.currentStreak).toBe(3)
    expect(result.bestStreak).toBe(3)
  })

  it('recordRun updates totalBlocks and totalLinesGenerated', () => {
    recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    recordRun({ language: 'python', blockCount: 3, lineCount: 8 })
    const stats = recordRun({ language: 'html', blockCount: 2, lineCount: 5 })

    expect(stats.totalBlocks).toBe(10)
    expect(stats.totalLinesGenerated).toBe(23)
  })

  it('recordRun sets firstRunDate on first run', () => {
    const before = Date.now()
    const stats = recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    const after = Date.now()

    expect(stats.firstRunDate).toBeGreaterThanOrEqual(before)
    expect(stats.firstRunDate).toBeLessThanOrEqual(after)
  })

  it('recordRun does not change firstRunDate on subsequent runs', () => {
    const stats1 = recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    const firstDate = stats1.firstRunDate

    // Wait a bit
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000)

    const stats2 = recordRun({ language: 'python', blockCount: 3, lineCount: 8 })
    expect(stats2.firstRunDate).toBe(firstDate)
  })

  it('recordRun updates lastRunDate on each run', () => {
    const stats1 = recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    const firstLastDate = stats1.lastRunDate

    // Advance time
    const laterTime = Date.now() + 5000
    vi.spyOn(Date, 'now').mockReturnValue(laterTime)

    const stats2 = recordRun({ language: 'python', blockCount: 3, lineCount: 8 })
    expect(stats2.lastRunDate).toBe(laterTime)
    expect(stats2.lastRunDate).toBeGreaterThan(firstLastDate)
  })

  it('recordChallengeComplete increments counter', () => {
    let stats = recordChallengeComplete()
    expect(stats.challengesCompleted).toBe(1)

    stats = recordChallengeComplete()
    expect(stats.challengesCompleted).toBe(2)
  })

  it('recordGolfComplete increments counter', () => {
    let stats = recordGolfComplete()
    expect(stats.golfSolved).toBe(1)

    stats = recordGolfComplete()
    expect(stats.golfSolved).toBe(2)
  })

  it('recordLabComplete increments counter', () => {
    let stats = recordLabComplete()
    expect(stats.labExercises).toBe(1)

    stats = recordLabComplete()
    expect(stats.labExercises).toBe(2)
  })

  it('recordAchievement increments counter', () => {
    let stats = recordAchievement()
    expect(stats.achievementsUnlocked).toBe(1)

    stats = recordAchievement()
    expect(stats.achievementsUnlocked).toBe(2)
  })

  it('all record functions save to localStorage', () => {
    recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })
    expect(localStorage.getItem('cb-dev-stats')).toBeDefined()

    localStorage.clear()
    recordChallengeComplete()
    expect(localStorage.getItem('cb-dev-stats')).toBeDefined()

    localStorage.clear()
    recordGolfComplete()
    expect(localStorage.getItem('cb-dev-stats')).toBeDefined()

    localStorage.clear()
    recordLabComplete()
    expect(localStorage.getItem('cb-dev-stats')).toBeDefined()

    localStorage.clear()
    recordAchievement()
    expect(localStorage.getItem('cb-dev-stats')).toBeDefined()
  })

  it('saveStats and loadStats work correctly', () => {
    const testStats: DevStats = {
      totalRuns: 42,
      totalBlocks: 100,
      totalLinesGenerated: 250,
      challengesCompleted: 5,
      golfSolved: 3,
      labExercises: 2,
      runsPerLanguage: {
        javascript: 20,
        python: 15,
        html: 7,
      },
      firstRunDate: 1234567890,
      lastRunDate: 1234567999,
      longestProgram: 50,
      runsByDate: {
        '2026-02-15': 3,
        '2026-02-16': 5,
      },
      currentStreak: 2,
      bestStreak: 5,
      achievementsUnlocked: 8,
    }

    saveStats(testStats)
    const loaded = loadStats()

    expect(loaded).toEqual(testStats)
  })

  it('loadStats handles malformed JSON gracefully', () => {
    localStorage.setItem('cb-dev-stats', 'not valid json {')

    const stats = loadStats()
    expect(stats.totalRuns).toBe(0)
  })

  it('recordRun updates bestStreak when currentStreak exceeds it', () => {
    // Setup initial state with a previous best streak
    const initial: DevStats = {
      totalRuns: 0,
      totalBlocks: 0,
      totalLinesGenerated: 0,
      challengesCompleted: 0,
      golfSolved: 0,
      labExercises: 0,
      runsPerLanguage: { javascript: 0, python: 0, html: 0 },
      firstRunDate: 0,
      lastRunDate: 0,
      longestProgram: 0,
      runsByDate: {},
      currentStreak: 0,
      bestStreak: 2, // Previous best was 2
      achievementsUnlocked: 0,
    }
    saveStats(initial)

    // Create a 3-day streak
    const today = new Date('2026-02-16T12:00:00Z')
    const yesterday = new Date('2026-02-15T12:00:00Z')
    const twoDaysAgo = new Date('2026-02-14T12:00:00Z')

    const statsWithStreak: DevStats = {
      ...initial,
      runsByDate: {
        '2026-02-14': 1,
        '2026-02-15': 1,
      },
    }
    saveStats(statsWithStreak)

    vi.spyOn(Date, 'now').mockReturnValue(today.getTime())
    const result = recordRun({ language: 'javascript', blockCount: 5, lineCount: 10 })

    expect(result.currentStreak).toBe(3)
    expect(result.bestStreak).toBe(3) // Should update from 2 to 3
  })
})
