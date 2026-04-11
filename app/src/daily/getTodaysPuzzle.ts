/**
 * Deterministic daily puzzle selection.
 *
 * Day 0 = 2026-04-01 (CryptoBlocks Daily launch). Every subsequent day
 * picks the next puzzle in the list, wrapping around when it runs out.
 *
 * The day number is computed in the user's LOCAL timezone so "today's
 * challenge" rolls over at local midnight, not UTC midnight.
 */

import { PUZZLES, type DailyPuzzle } from './puzzles'

const EPOCH_YEAR = 2026
const EPOCH_MONTH = 3 // April (zero-indexed)
const EPOCH_DAY = 1

/** Integer day number since the launch epoch, in local time. */
export function getDayNumber(now: Date = new Date()): number {
  const epoch = new Date(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY).getTime()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.floor((today - epoch) / 86_400_000))
}

/** The puzzle for today, selected deterministically by day number. */
export function getTodaysPuzzle(now: Date = new Date()): { puzzle: DailyPuzzle; dayNumber: number } {
  const dayNumber = getDayNumber(now)
  const puzzle = PUZZLES[dayNumber % PUZZLES.length]
  return { puzzle, dayNumber }
}

/** Look up a puzzle by its day number. Used for history grid / sharing. */
export function getPuzzleByDay(dayNumber: number): DailyPuzzle {
  return PUZZLES[dayNumber % PUZZLES.length]
}
