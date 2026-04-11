/**
 * Floating scrubber bar for Time Travel mode.
 *
 * Appears at the bottom-center of the editor when time travel is active.
 * Shows a slider over the snapshot range, back/forward step buttons, the
 * current label, and "Jump here" + "Exit" actions.
 */

import { useEffect, useState } from 'react'

interface TimeTravelBarProps {
  currentIndex: number
  snapshotCount: number
  currentLabel: string
  onScrub: (index: number) => void
  onStepBack: () => void
  onStepForward: () => void
  onForkHere: () => void
  onExit: () => void
}

export default function TimeTravelBar({
  currentIndex,
  snapshotCount,
  currentLabel,
  onScrub,
  onStepBack,
  onStepForward,
  onForkHere,
  onExit,
}: TimeTravelBarProps) {
  // Keyboard shortcuts while the bar is open: arrows to scrub, Esc to exit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore keys targeting inputs/textareas
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Escape') {
        e.preventDefault()
        onExit()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onStepBack()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onStepForward()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onExit, onStepBack, onStepForward])

  // Playback mode — animate through snapshots at a comfortable speed
  const [isPlaying, setIsPlaying] = useState(false)
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      if (currentIndex >= snapshotCount - 1) {
        setIsPlaying(false)
      } else {
        onStepForward()
      }
    }, 200)
    return () => clearInterval(timer)
  }, [isPlaying, currentIndex, snapshotCount, onStepForward])

  const max = Math.max(0, snapshotCount - 1)
  const atStart = currentIndex <= 0
  const atEnd = currentIndex >= max

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,720px)] bg-[#181825] border border-[#45475a] rounded-xl shadow-2xl p-3">
      {/* Top row: label + exit */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">🕰️</span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-[#6c7086]">
              Time Travel
            </div>
            <div className="text-sm font-semibold text-[#cdd6f4] truncate">
              {currentLabel}
            </div>
          </div>
        </div>
        <div className="text-xs text-[#6c7086] tabular-nums whitespace-nowrap">
          {currentIndex + 1} / {snapshotCount}
        </div>
      </div>

      {/* Scrubber slider */}
      <input
        type="range"
        min={0}
        max={max}
        value={currentIndex}
        onChange={(e) => {
          setIsPlaying(false)
          onScrub(Number(e.target.value))
        }}
        className="w-full accent-[#89b4fa] cursor-pointer"
        aria-label="Time travel scrubber"
      />

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setIsPlaying(false); onStepBack() }}
            disabled={atStart}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Step back (←)"
            aria-label="Step back"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={atEnd && !isPlaying}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] disabled:opacity-40 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            onClick={() => { setIsPlaying(false); onStepForward() }}
            disabled={atEnd}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Step forward (→)"
            aria-label="Step forward"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onForkHere}
            disabled={atEnd}
            className="px-3 py-1.5 rounded-md bg-[#f9e2af] hover:bg-[#f5d97a] text-[#1e1e2e] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Keep everything up to this point and discard the rest"
          >
            🌱 Fork Here
          </button>
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-md bg-[#89b4fa] hover:bg-[#74c7ec] text-[#1e1e2e] text-xs font-bold transition-colors"
            title="Return to latest state (Esc)"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}
