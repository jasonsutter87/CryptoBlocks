/**
 * Time Travel hook — captures a scrubbable history of every content-changing
 * Blockly event, so the user can drag a slider backwards through their work
 * and watch blocks assemble or dissolve in real time.
 *
 * This is distinct from:
 *   - Undo/redo:    one-at-a-time, linear, no UI scrubber
 *   - Checkpoints:  discrete user-named save points
 *
 * Snapshots are kept in memory only (~500 rolling) — no persistence yet.
 * Editing while scrubbing forks the timeline at the current index.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import type { Snapshot } from './types'

/** Maximum snapshots retained in memory. Oldest are dropped when full. */
const MAX_SNAPSHOTS = 500

/**
 * Debounce window for rapid events — a drag fires many block_move events,
 * we only want the final resting state.
 */
const SNAPSHOT_DEBOUNCE_MS = 150

export interface UseTimeTravelResult {
  /** True when the user is actively scrubbing through history */
  isActive: boolean
  /** The current scrub position (index into `snapshots`) */
  currentIndex: number
  /** Total snapshots available */
  snapshotCount: number
  /** Formatted label for the current scrub position (e.g. "2 min ago · block_create") */
  currentLabel: string
  /** Enter time-travel mode — start showing the scrubber bar */
  enterTimeTravel: () => void
  /** Leave time-travel mode — jump back to latest and resume editing */
  exitTimeTravel: () => void
  /** Drag to a specific index */
  scrubTo: (index: number) => void
  /** "Jump here" — truncate future snapshots so editing resumes from this point */
  forkHere: () => void
  /** Step one snapshot backward */
  stepBack: () => void
  /** Step one snapshot forward */
  stepForward: () => void
}

interface UseTimeTravelOptions {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>
  /** If true, the hook ignores all events and doesn't record anything. */
  disabled?: boolean
}

export function useTimeTravel({ workspaceRef, disabled }: UseTimeTravelOptions): UseTimeTravelResult {
  // We keep the snapshot log in a ref so capturing doesn't cause re-renders.
  // Only the UI state (index, active, length) lives in React state.
  const snapshotsRef = useRef<Snapshot[]>([])
  const [snapshotCount, setSnapshotCount] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)

  // While we're loading a past snapshot into the workspace, the load()
  // call itself fires Blockly events — we must NOT record those.
  const isReplayingRef = useRef(false)

  // Debounce timer for rapid event bursts
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Take a snapshot of the current workspace state. Called on content-changing
   * Blockly events. Skipped while replaying.
   */
  const captureSnapshot = useCallback((eventType: string) => {
    const workspace = workspaceRef.current
    if (!workspace) return

    try {
      const state = Blockly.serialization.workspaces.save(workspace) as Record<string, unknown>
      const blockCount = workspace.getAllBlocks(false).length

      const snapshot: Snapshot = {
        state,
        timestamp: Date.now(),
        eventType,
        blockCount,
      }

      const buffer = snapshotsRef.current
      buffer.push(snapshot)
      if (buffer.length > MAX_SNAPSHOTS) {
        buffer.shift()
      }
      setSnapshotCount(buffer.length)
      // Keep currentIndex pinned at latest while NOT actively scrubbing
      setCurrentIndex((prev) => (isActive ? prev : buffer.length - 1))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[time-travel] snapshot failed', err)
    }
  }, [workspaceRef, isActive])

  /**
   * Blockly change listener. Fires on every workspace event. We ignore UI
   * events (clicks, viewport) and debounce the rest.
   */
  useEffect(() => {
    if (disabled) return
    const workspace = workspaceRef.current
    if (!workspace) return

    const listener = (event: Blockly.Events.Abstract) => {
      if (isReplayingRef.current) return
      // isUiEvent: true for selection/click/viewport/scroll/etc.
      if (event.isUiEvent) return
      // Ignore our own programmatic loads marked with group "time-travel-replay"
      if ((event as unknown as { group?: string }).group === 'time-travel-replay') return

      // When the user edits while scrubbing back in time, fork the timeline:
      // drop everything after currentIndex, then capture fresh.
      if (isActive && currentIndex < snapshotsRef.current.length - 1) {
        snapshotsRef.current = snapshotsRef.current.slice(0, currentIndex + 1)
        setSnapshotCount(snapshotsRef.current.length)
        setIsActive(false)
      }

      // Debounce the snapshot so rapid bursts (drags, multi-block pastes)
      // collapse into one entry.
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        captureSnapshot(event.type || 'unknown')
        debounceTimerRef.current = null
      }, SNAPSHOT_DEBOUNCE_MS)
    }

    workspace.addChangeListener(listener)

    // Take an initial snapshot so index 0 always exists
    if (snapshotsRef.current.length === 0) {
      captureSnapshot('initial')
    }

    return () => {
      workspace.removeChangeListener(listener)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [workspaceRef, captureSnapshot, disabled, isActive, currentIndex])

  /**
   * Load a specific snapshot into the workspace. Events fired during the
   * load are suppressed via the replay guard.
   */
  const loadSnapshot = useCallback((index: number) => {
    const workspace = workspaceRef.current
    if (!workspace) return
    const snapshot = snapshotsRef.current[index]
    if (!snapshot) return

    isReplayingRef.current = true
    try {
      workspace.clear()
      Blockly.serialization.workspaces.load(snapshot.state, workspace)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[time-travel] load failed', err)
    } finally {
      // Defer the unlock so any tail events from the load don't sneak in
      setTimeout(() => {
        isReplayingRef.current = false
      }, 0)
    }
  }, [workspaceRef])

  const enterTimeTravel = useCallback(() => {
    if (snapshotsRef.current.length === 0) return
    setIsActive(true)
    setCurrentIndex(snapshotsRef.current.length - 1)
  }, [])

  const exitTimeTravel = useCallback(() => {
    // Jump back to latest before exiting
    const latest = snapshotsRef.current.length - 1
    if (latest >= 0) {
      loadSnapshot(latest)
      setCurrentIndex(latest)
    }
    setIsActive(false)
  }, [loadSnapshot])

  const scrubTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(snapshotsRef.current.length - 1, index))
    loadSnapshot(clamped)
    setCurrentIndex(clamped)
  }, [loadSnapshot])

  const forkHere = useCallback(() => {
    // Truncate future snapshots so the current state becomes the new "latest"
    snapshotsRef.current = snapshotsRef.current.slice(0, currentIndex + 1)
    setSnapshotCount(snapshotsRef.current.length)
    setIsActive(false)
  }, [currentIndex])

  const stepBack = useCallback(() => {
    scrubTo(currentIndex - 1)
  }, [scrubTo, currentIndex])

  const stepForward = useCallback(() => {
    scrubTo(currentIndex + 1)
  }, [scrubTo, currentIndex])

  const currentLabel = useFormattedLabel(snapshotsRef.current, currentIndex, snapshotCount)

  return {
    isActive,
    currentIndex,
    snapshotCount,
    currentLabel,
    enterTimeTravel,
    exitTimeTravel,
    scrubTo,
    forkHere,
    stepBack,
    stepForward,
  }
}

/**
 * Derives a human-friendly label for the current scrub position.
 * Recomputed whenever the index or count changes — not memoized via useMemo
 * because the source array is a ref (not reactive).
 */
function useFormattedLabel(snapshots: Snapshot[], index: number, count: number): string {
  if (count === 0) return 'No history yet'
  const snap = snapshots[index]
  if (!snap) return '—'
  const age = formatAge(Date.now() - snap.timestamp)
  const typeLabel = prettyEventType(snap.eventType)
  return `${typeLabel} · ${age}`
}

function formatAge(ms: number): string {
  if (ms < 1000) return 'just now'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function prettyEventType(type: string): string {
  const map: Record<string, string> = {
    block_create: 'Added block',
    block_delete: 'Deleted block',
    block_move: 'Moved block',
    block_change: 'Changed block',
    var_create: 'Created variable',
    var_delete: 'Deleted variable',
    var_rename: 'Renamed variable',
    initial: 'Session start',
  }
  return map[type] || type
}
