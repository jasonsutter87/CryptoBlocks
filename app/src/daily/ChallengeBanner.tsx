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
import { useAuth } from '@clerk/clerk-react'
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
        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 bg-[#89b4fa] text-[#1e1e2e] rounded-full text-xs font-bold shadow-lg hover:bg-[#74c7ec]"
      >
        🎯 Daily #{dayNumber}
      </button>
    )
  }

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,560px)] bg-[#181825] border border-[#45475a] rounded-xl shadow-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">🎯</span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-[#6c7086]">
              Daily #{dayNumber}
            </div>
            <div className="text-sm font-bold text-[#cdd6f4] truncate">
              {puzzle.title}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[#6c7086] hover:text-[#cdd6f4] text-lg leading-none px-1"
          aria-label="Minimize"
        >
          −
        </button>
      </div>

      <p className="text-xs text-[#a6adc8] mb-2">{puzzle.description}</p>

      <div className="bg-[#11111b] rounded-md p-2 mb-2 border border-[#313244]">
        <div className="text-[10px] text-[#6c7086] uppercase tracking-wide mb-1">
          Target Output
        </div>
        <pre className="text-[#a6e3a1] font-mono text-xs whitespace-pre-wrap max-h-24 overflow-auto">
          {puzzle.targetOutput.join('\n')}
        </pre>
      </div>

      {solvedBlocks == null ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6c7086]">
            Par: <span className="text-[#cdd6f4] font-semibold">{puzzle.parBlocks} blocks</span>
          </span>
          <Link
            to="/daily"
            className="text-xs text-[#89b4fa] hover:text-[#74c7ec]"
          >
            ← Back to Daily
          </Link>
        </div>
      ) : (
        <div className="bg-[#1a3e2a] border border-[#a6e3a1] rounded-md p-3">
          <div className="text-[#a6e3a1] font-bold text-sm mb-1">
            ✓ Solved in {solvedBlocks} blocks! {stars}
          </div>
          <div className="text-xs text-[#a6adc8] mb-2">
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
              className="flex-1 px-3 py-1.5 bg-[#89b4fa] hover:bg-[#74c7ec] text-[#1e1e2e] rounded-md text-xs font-bold transition-colors"
            >
              {copied ? '✓ Copied!' : 'Share Result'}
            </button>
            <Link
              to="/daily"
              className="flex-1 px-3 py-1.5 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-md text-xs font-bold text-center transition-colors"
            >
              Back to Daily
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
