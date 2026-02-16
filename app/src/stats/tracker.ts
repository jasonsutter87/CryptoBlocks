import type { DevStats } from './types'

const STORAGE_KEY = 'cb-dev-stats'

function getDefaultStats(): DevStats {
  return {
    totalRuns: 0,
    totalBlocks: 0,
    totalLinesGenerated: 0,
    challengesCompleted: 0,
    golfSolved: 0,
    labExercises: 0,
    runsPerLanguage: {
      javascript: 0,
      python: 0,
      html: 0,
    },
    firstRunDate: 0,
    lastRunDate: 0,
    longestProgram: 0,
    runsByDate: {},
    currentStreak: 0,
    bestStreak: 0,
    achievementsUnlocked: 0,
  }
}

export function loadStats(): DevStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultStats()

    const parsed = JSON.parse(raw)
    // Ensure all fields exist (for backwards compatibility)
    return { ...getDefaultStats(), ...parsed }
  } catch {
    return getDefaultStats()
  }
}

export function saveStats(stats: DevStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch (e) {
    console.warn('Failed to save stats:', e)
  }
}

function formatDateKey(timestamp: number): string {
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculateStreak(runsByDate: Record<string, number>, endDate: number): number {
  let streak = 0
  let currentDate = new Date(endDate)

  // Normalize to start of day
  currentDate.setHours(0, 0, 0, 0)

  while (true) {
    const key = formatDateKey(currentDate.getTime())
    if (!runsByDate[key] || runsByDate[key] === 0) {
      break
    }
    streak++
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

export function recordRun(opts: {
  language: 'javascript' | 'python' | 'html'
  blockCount: number
  lineCount: number
}): DevStats {
  const stats = loadStats()
  const now = Date.now()

  // Increment counters
  stats.totalRuns++
  stats.totalBlocks += opts.blockCount
  stats.totalLinesGenerated += opts.lineCount
  stats.runsPerLanguage[opts.language]++

  // Update dates
  if (stats.firstRunDate === 0) {
    stats.firstRunDate = now
  }
  stats.lastRunDate = now

  // Update longest program
  if (opts.blockCount > stats.longestProgram) {
    stats.longestProgram = opts.blockCount
  }

  // Update runs by date
  const dateKey = formatDateKey(now)
  stats.runsByDate[dateKey] = (stats.runsByDate[dateKey] || 0) + 1

  // Recalculate streak
  stats.currentStreak = calculateStreak(stats.runsByDate, now)
  if (stats.currentStreak > stats.bestStreak) {
    stats.bestStreak = stats.currentStreak
  }

  saveStats(stats)
  return stats
}

export function recordChallengeComplete(): DevStats {
  const stats = loadStats()
  stats.challengesCompleted++
  saveStats(stats)
  return stats
}

export function recordGolfComplete(): DevStats {
  const stats = loadStats()
  stats.golfSolved++
  saveStats(stats)
  return stats
}

export function recordLabComplete(): DevStats {
  const stats = loadStats()
  stats.labExercises++
  saveStats(stats)
  return stats
}

export function recordAchievement(): DevStats {
  const stats = loadStats()
  stats.achievementsUnlocked++
  saveStats(stats)
  return stats
}
