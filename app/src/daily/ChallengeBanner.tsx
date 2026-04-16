/**
 * In-editor banner shown when the user is solving the Daily Challenge
 * (i.e., the URL has `?daily=1`).
 *
 * Displays the puzzle title, description, target output, and a live
 * "solved" state. When the user solves it, this component also renders
 * a shareable summary for copy-to-clipboard.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import type { DailyPuzzle } from './puzzles'

interface ChallengeBannerProps {
  puzzle: DailyPuzzle
  dayNumber: number
  solvedBlocks: number | null
}

export default function ChallengeBanner({ puzzle, dayNumber, solvedBlocks }: ChallengeBannerProps) {
  const { getToken } = useAuth()
  const [expanded, setExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  // Sync solve to global leaderboard when solvedBlocks first appears
  useEffect(() => {
    if (solvedBlocks == null) return
    ;(async () => {
      try {
        const token = await getToken()
        if (!token) return
        await fetch('/api/daily/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ dayNumber, blocksUsed: solvedBlocks }),
        })
      } catch {}
    })()
  }, [solvedBlocks, dayNumber, getToken])

  const stars = solvedBlocks == null
    ? ''
    : solvedBlocks <= puzzle.parBlocks
      ? '⭐⭐⭐'
      : solvedBlocks <= puzzle.parBlocks + 2
        ? '⭐⭐'
        : '⭐'

  const shareText =
    solvedBlocks == null
      ? ''
      : `CryptoBlocks Daily #${dayNumber} — "${puzzle.title}"\nSolved in ${solvedBlocks} blocks ${stars}\nPar: ${puzzle.parBlocks}\n\nhttps://app.getcryptoblocks.com/daily`

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard denied — do nothing
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 bg-accent text-base rounded-full text-xs font-bold shadow-lg hover:bg-sapphire"
      >
        🎯 Daily #{dayNumber}
      </button>
    )
  }

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,560px)] bg-mantle border border-surface-1 rounded-xl shadow-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">🎯</span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-overlay">
              Daily #{dayNumber}
            </div>
            <div className="text-sm font-bold text-text truncate">
              {puzzle.title}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-overlay hover:text-text text-lg leading-none px-1"
          aria-label="Minimize"
        >
          −
        </button>
      </div>

      <p className="text-xs text-subtext mb-2">{puzzle.description}</p>

      <div className="bg-crust rounded-md p-2 mb-2 border border-surface-0">
        <div className="text-[10px] text-overlay uppercase tracking-wide mb-1">
          Target Output
        </div>
        <pre className="text-success font-mono text-xs whitespace-pre-wrap max-h-24 overflow-auto">
          {puzzle.targetOutput.join('\n')}
        </pre>
      </div>

      {solvedBlocks == null ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-overlay">
            Par: <span className="text-text font-semibold">{puzzle.parBlocks} blocks</span>
          </span>
          <Link
            to="/daily"
            className="text-xs text-accent hover:text-sapphire"
          >
            ← Back to Daily
          </Link>
        </div>
      ) : (
        <div className="bg-[#1a3e2a] border border-success rounded-md p-3">
          <div className="text-success font-bold text-sm mb-1">
            ✓ Solved in {solvedBlocks} blocks! {stars}
          </div>
          <div className="text-xs text-subtext mb-2">
            {solvedBlocks <= puzzle.parBlocks
              ? 'Under par — incredible!'
              : solvedBlocks === puzzle.parBlocks
                ? 'Right at par — nice work!'
                : 'Nice! Try to beat par next time.'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 px-3 py-1.5 bg-accent hover:bg-sapphire text-base rounded-md text-xs font-bold transition-colors"
            >
              {copied ? '✓ Copied!' : 'Share Result'}
            </button>
            <Link
              to="/daily"
              className="flex-1 px-3 py-1.5 bg-surface-0 hover:bg-surface-1 text-text rounded-md text-xs font-bold text-center transition-colors"
            >
              Back to Daily
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
