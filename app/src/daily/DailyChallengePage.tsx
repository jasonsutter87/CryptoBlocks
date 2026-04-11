/**
 * Daily Challenge landing page — /daily
 *
 * Shows today's puzzle, the user's streak, a 10-day history grid, and a
 * CTA to start solving. Clicking "Start Today's Challenge" navigates to
 * `/?daily=1` which triggers the in-editor banner + auto-check on Run.
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getTodaysPuzzle, getDayNumber, getPuzzleByDay } from './getTodaysPuzzle'
import { loadDailyState, getEffectiveStreak } from './state'

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const colors = {
    easy: { bg: '#1a3e2a', fg: '#a6e3a1', label: 'Easy' },
    medium: { bg: '#3e331a', fg: '#f9e2af', label: 'Medium' },
    hard: { bg: '#3e1a1a', fg: '#f38ba8', label: 'Hard' },
  }[difficulty]
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: colors.bg, color: colors.fg }}
    >
      {colors.label}
    </span>
  )
}

function HistorySquare({ dayNumber, solved, isToday }: { dayNumber: number; solved: boolean; isToday: boolean }) {
  const puzzle = getPuzzleByDay(dayNumber)
  const bg = solved ? '#a6e3a1' : isToday ? '#45475a' : '#2a2b3d'
  const border = isToday ? '2px solid #89b4fa' : '1px solid #313244'
  return (
    <div
      title={`Day ${dayNumber}: ${puzzle.title}${solved ? ' — solved!' : ''}`}
      className="aspect-square rounded-md flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: bg, border, color: solved ? '#1e1e2e' : '#6c7086' }}
    >
      {solved ? '✓' : dayNumber}
    </div>
  )
}

export default function DailyChallengePage() {
  const { puzzle, dayNumber } = useMemo(() => getTodaysPuzzle(), [])
  const state = useMemo(() => loadDailyState(), [])
  const currentDay = useMemo(() => getDayNumber(), [])
  const effectiveStreak = getEffectiveStreak(state, currentDay)
  const solvedToday = !!state.solved[dayNumber]

  // History grid: last 10 days including today
  const historyDays = useMemo(() => {
    const days: number[] = []
    for (let i = Math.max(0, dayNumber - 9); i <= dayNumber; i++) {
      days.push(i)
    }
    return days
  }, [dayNumber])

  return (
    <div className="min-h-full bg-[#1e1e2e]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl">🎯</span>
            <h1 className="text-3xl font-bold text-[#cdd6f4] tracking-tight">
              Daily Challenge
            </h1>
          </div>
          <p className="text-[#a6adc8]">
            A new puzzle every day. Same puzzle for everyone. Keep your streak alive.
          </p>
        </div>

        {/* Streak + stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#313244] rounded-xl p-5 flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#fab387]">
              {effectiveStreak}
              <span className="text-lg ml-1">🔥</span>
            </span>
            <span className="text-sm text-[#6c7086]">Current Streak</span>
          </div>
          <div className="bg-[#313244] rounded-xl p-5 flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#f9e2af]">{state.longestStreak}</span>
            <span className="text-sm text-[#6c7086]">Longest Streak</span>
          </div>
          <div className="bg-[#313244] rounded-xl p-5 flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#a6e3a1]">{state.totalSolved}</span>
            <span className="text-sm text-[#6c7086]">Total Solved</span>
          </div>
          <div className="bg-[#313244] rounded-xl p-5 flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#89b4fa]">#{dayNumber}</span>
            <span className="text-sm text-[#6c7086]">Today's Day</span>
          </div>
        </div>

        {/* Today's puzzle card */}
        <div className="bg-[#181825] rounded-xl p-6 border border-[#313244] mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs text-[#6c7086] uppercase tracking-wide mb-1">
                Today — Day {dayNumber}
              </div>
              <h2 className="text-2xl font-bold text-[#cdd6f4] mb-2">{puzzle.title}</h2>
              <p className="text-[#a6adc8]">{puzzle.description}</p>
            </div>
            <DifficultyBadge difficulty={puzzle.difficulty} />
          </div>

          {/* Target output preview */}
          <div className="bg-[#11111b] rounded-lg p-4 mb-4 border border-[#313244]">
            <div className="text-xs text-[#6c7086] uppercase tracking-wide mb-2">
              Target Output
            </div>
            <pre className="text-[#a6e3a1] font-mono text-sm whitespace-pre-wrap">
              {puzzle.targetOutput.join('\n')}
            </pre>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-[#6c7086]">
              Par: <span className="text-[#cdd6f4] font-semibold">{puzzle.parBlocks} blocks</span>
            </div>
            {solvedToday ? (
              <div className="flex items-center gap-3">
                <span className="text-[#a6e3a1] font-semibold flex items-center gap-1">
                  ✓ Solved in {state.solved[dayNumber].blocks} blocks
                </span>
                <Link
                  to="/?daily=1"
                  className="px-4 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg font-semibold transition-colors"
                >
                  Play Again
                </Link>
              </div>
            ) : (
              <Link
                to="/?daily=1"
                className="px-5 py-2.5 bg-[#89b4fa] hover:bg-[#74c7ec] text-[#1e1e2e] rounded-lg font-bold transition-colors"
              >
                Start Today's Challenge →
              </Link>
            )}
          </div>
        </div>

        {/* History grid */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[#cdd6f4] mb-3 uppercase tracking-wide">
            Last 10 Days
          </h3>
          <div className="grid grid-cols-10 gap-2">
            {historyDays.map((day) => (
              <HistorySquare
                key={day}
                dayNumber={day}
                solved={!!state.solved[day]}
                isToday={day === dayNumber}
              />
            ))}
          </div>
        </div>

        {/* Footer tip */}
        <div className="text-center text-[#6c7086] text-sm">
          💡 New puzzle every day at midnight (your time).
        </div>
      </div>
    </div>
  )
}
