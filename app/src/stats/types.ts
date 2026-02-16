export interface DevStats {
  totalRuns: number
  totalBlocks: number           // cumulative blocks across all runs
  totalLinesGenerated: number   // cumulative lines of code
  challengesCompleted: number
  golfSolved: number
  labExercises: number
  runsPerLanguage: {
    javascript: number
    python: number
    html: number
  }
  firstRunDate: number          // timestamp
  lastRunDate: number           // timestamp
  longestProgram: number        // max blocks in a single program
  runsByDate: Record<string, number>  // "2026-02-16": 5
  currentStreak: number         // consecutive days
  bestStreak: number
  achievementsUnlocked: number
}
