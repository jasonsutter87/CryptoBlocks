import type { DevStats } from './types'
import { getClerkToken } from '../auth'

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

export function recordBlockCreated(): DevStats {
  const stats = loadStats()
  stats.totalBlocks++
  saveStats(stats)
  scheduleSyncToServer()
  return stats
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
  scheduleSyncToServer()
  return stats
}

export function recordChallengeComplete(): DevStats {
  const stats = loadStats()
  stats.challengesCompleted++
  saveStats(stats)
  scheduleSyncToServer()
  return stats
}

export function recordGolfComplete(): DevStats {
  const stats = loadStats()
  stats.golfSolved++
  saveStats(stats)
  scheduleSyncToServer()
  return stats
}

export function recordLabComplete(): DevStats {
  const stats = loadStats()
  stats.labExercises++
  saveStats(stats)
  scheduleSyncToServer()
  return stats
}

export function recordAchievement(): DevStats {
  const stats = loadStats()
  stats.achievementsUnlocked++
  saveStats(stats)
  scheduleSyncToServer()
  return stats
}

// Debounce timer for server sync
let syncTimer: ReturnType<typeof setTimeout> | null = null

/** Sync stats to server (debounced — waits 5s after last change). */
export function scheduleSyncToServer(): void {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => syncStatsToServer(), 5000)
}

/** Push local stats to server, receive merged result back. */
async function syncStatsToServer(): Promise<void> {
  try {
    const token = await getClerkToken()
    if (!token) return
    const stats = loadStats()
    const res = await fetch('/api/stats/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(stats),
    })
    if (!res.ok) return
    const data = await res.json()
    if (data.stats) {
      // Server merged result — save locally
      saveStats({ ...getDefaultStats(), ...data.stats })
    }
  } catch { /* offline — local stats are the fallback */ }
}

/** Pull stats from server and merge into localStorage (call on sign-in). */
export async function syncStatsFromServer(): Promise<void> {
  try {
    const token = await getClerkToken()
    if (!token) return
    const res = await fetch('/api/stats/my', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) return
    const data = await res.json()
    if (!data.stats) {
      // No server stats yet — push local to server
      await syncStatsToServer()
      return
    }
    // Merge server into local (take max of everything)
    const local = loadStats()
    const server = data.stats as DevStats
    const merged: DevStats = { ...getDefaultStats() }

    const numericFields: (keyof DevStats)[] = [
      'totalRuns', 'totalBlocks', 'totalLinesGenerated',
      'challengesCompleted', 'golfSolved', 'labExercises',
      'longestProgram', 'currentStreak', 'bestStreak', 'achievementsUnlocked',
    ]
    for (const f of numericFields) {
      (merged as unknown as Record<string, number>)[f] = Math.max(Number(local[f] ?? 0), Number(server[f] ?? 0))
    }

    merged.firstRunDate = Math.min(local.firstRunDate || Infinity, server.firstRunDate || Infinity)
    if (merged.firstRunDate === Infinity) merged.firstRunDate = 0
    merged.lastRunDate = Math.max(local.lastRunDate, server.lastRunDate)

    merged.runsPerLanguage = {
      javascript: Math.max(local.runsPerLanguage.javascript, server.runsPerLanguage?.javascript ?? 0),
      python: Math.max(local.runsPerLanguage.python, server.runsPerLanguage?.python ?? 0),
      html: Math.max(local.runsPerLanguage.html, server.runsPerLanguage?.html ?? 0),
    }

    const mergedDates: Record<string, number> = { ...server.runsByDate }
    for (const [date, count] of Object.entries(local.runsByDate)) {
      mergedDates[date] = Math.max(mergedDates[date] ?? 0, count)
    }
    merged.runsByDate = mergedDates

    saveStats(merged)

    // Push merged result back to server
    const localOnly = Object.keys(local.runsByDate).some(d => !(d in (server.runsByDate || {})))
    if (localOnly) await syncStatsToServer()
  } catch { /* offline */ }
}
