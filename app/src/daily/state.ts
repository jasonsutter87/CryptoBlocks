/**
 * localStorage-backed state for the Daily Challenge.
 *
 * Tracks:
 * - current streak (days solved in a row, up to and including today)
 * - longest streak ever
 * - solved history (dayNumber → { blocks, solvedAt })
 * - last day the user checked in (used to detect "missed yesterday")
 */

const STORAGE_KEY = 'cb-daily-state-v1'

export interface SolvedEntry {
  /** How many blocks were in the workspace when they solved it */
  blocks: number
  /** Epoch ms when they solved it */
  solvedAt: number
}

export interface DailyState {
  streak: number
  longestStreak: number
  lastSolvedDay: number | null
  solved: Record<number, SolvedEntry>
  totalSolved: number
}

const EMPTY_STATE: DailyState = {
  streak: 0,
  longestStreak: 0,
  lastSolvedDay: null,
  solved: {},
  totalSolved: 0,
}

export function loadDailyState(): DailyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY_STATE }
    const parsed = JSON.parse(raw)
    return {
      streak: parsed.streak ?? 0,
      longestStreak: parsed.longestStreak ?? 0,
      lastSolvedDay: parsed.lastSolvedDay ?? null,
      solved: parsed.solved ?? {},
      totalSolved: parsed.totalSolved ?? 0,
    }
  } catch {
    return { ...EMPTY_STATE }
  }
}

export function saveDailyState(state: DailyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or disabled — fail silently
  }
}

/**
 * Mark today's puzzle as solved, updating streak + history.
 *
 * Streak logic:
 * - If `lastSolvedDay === dayNumber - 1`, streak increments
 * - If `lastSolvedDay === dayNumber`, no-op (already solved today)
 * - Otherwise streak resets to 1 (missed at least one day)
 */
export function markSolved(dayNumber: number, blocks: number): DailyState {
  const state = loadDailyState()

  // Already solved today — don't double-count
  if (state.solved[dayNumber]) {
    return state
  }

  let newStreak: number
  if (state.lastSolvedDay === dayNumber - 1) {
    newStreak = state.streak + 1
  } else if (state.lastSolvedDay === null) {
    newStreak = 1
  } else {
    newStreak = 1
  }

  const next: DailyState = {
    streak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastSolvedDay: dayNumber,
    solved: {
      ...state.solved,
      [dayNumber]: { blocks, solvedAt: Date.now() },
    },
    totalSolved: state.totalSolved + 1,
  }

  saveDailyState(next)
  return next
}

/**
 * If the user's last solve was more than 1 day ago, their streak is broken
 * as of today — reflect that in the loaded state without persisting yet.
 */
export function getEffectiveStreak(state: DailyState, currentDay: number): number {
  if (state.lastSolvedDay === null) return 0
  if (state.lastSolvedDay === currentDay) return state.streak
  if (state.lastSolvedDay === currentDay - 1) return state.streak
  return 0 // broken
}
