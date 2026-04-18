import { useState, useEffect, useRef, useCallback } from 'react'
import * as Blockly from 'blockly'
import type { ProjectHistory, Branch, Checkpoint } from './types'
import { loadHistory, saveHistory } from './storage'
import { loadSettings } from '../settings'

function initProject(projectId: string): ProjectHistory {
  const branchId = crypto.randomUUID()
  const now = Date.now()

  const mainBranch: Branch = {
    id: branchId,
    name: 'Main',
    parentBranchId: null,
    forkPointId: null,
    headId: null,
    createdAt: now,
  }

  return {
    version: 1,
    projectId,
    activeBranchId: branchId,
    branches: [mainBranch],
    checkpoints: [],
  }
}

export function useVersionControl(
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>,
  blockCount: number,
  projectId?: string | null,
) {
  const activeProjectId = projectId || 'default'
  const [history, setHistory] = useState<ProjectHistory | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showCheckpointModal, setShowCheckpointModal] = useState(false)

  // Auto-save: track last saved block count to detect changes
  const lastAutoSaveBlockCount = useRef<number>(-1)
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load or initialize history — reloads when project changes
  useEffect(() => {
    loadHistory(activeProjectId).then((loaded) => {
      if (loaded) {
        setHistory(loaded)
      } else {
        const fresh = initProject(activeProjectId)
        setHistory(fresh)
        saveHistory(activeProjectId, fresh).catch(console.error)
      }
    }).catch(console.error)
  }, [activeProjectId])

  // Keep a stable ref to blockCount so the interval callback always sees current value
  const blockCountRef = useRef(blockCount)
  blockCountRef.current = blockCount

  // Stable ref to saveCheckpoint — populated after saveCheckpoint is defined below
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveCheckpointRef = useRef<(label: string) => Promise<void>>(async () => {})

  // Set up auto-save interval — re-runs when settings change (via resetAutoSave)
  const [autoSaveKey, setAutoSaveKey] = useState(0)
  const resetAutoSave = useCallback(() => setAutoSaveKey((k) => k + 1), [])

  useEffect(() => {
    const settings = loadSettings()
    if (!settings.autoSaveEnabled) return

    const intervalMs = settings.autoSaveIntervalMinutes * 60 * 1000

    autoSaveIntervalRef.current = setInterval(() => {
      const current = blockCountRef.current
      if (current !== lastAutoSaveBlockCount.current) {
        lastAutoSaveBlockCount.current = current
        saveCheckpointRef.current('Auto-save').catch(console.error)
      }
    }, intervalMs)

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
        autoSaveIntervalRef.current = null
      }
    }
  }, [autoSaveKey])

  const currentBranch = history
    ? history.branches.find((b) => b.id === history.activeBranchId) ?? null
    : null

  const checkpoints = history
    ? history.checkpoints
        .filter((c) => c.branchId === history.activeBranchId)
        .sort((a, b) => b.timestamp - a.timestamp)
    : []

  const saveCheckpoint = useCallback(async (label: string) => {
    if (!workspaceRef.current || !history) return

    const workspace = workspaceRef.current
    const snapshot = Blockly.serialization.workspaces.save(workspace)

    const parentId = currentBranch?.headId ?? null

    const checkpoint: Checkpoint = {
      id: crypto.randomUUID(),
      branchId: history.activeBranchId,
      parentId,
      timestamp: Date.now(),
      label,
      snapshot,
      blockCount,
    }

    const updatedBranches = history.branches.map((b) =>
      b.id === history.activeBranchId
        ? { ...b, headId: checkpoint.id }
        : b
    )

    const updated: ProjectHistory = {
      ...history,
      branches: updatedBranches,
      checkpoints: [...history.checkpoints, checkpoint],
    }

    setHistory(updated)
    await saveHistory(activeProjectId, updated)

    // Fire checkpoint achievement
    const { checkAchievements } = await import('../achievements/tracker')
    checkAchievements({ event: 'checkpoint', checkpointCount: updated.checkpoints.length })

    // Reset auto-save interval so it doesn't fire too soon after a manual save
    resetAutoSave()
  }, [workspaceRef, history, currentBranch, blockCount, resetAutoSave])

  // Keep ref in sync so the interval callback always calls the latest version
  saveCheckpointRef.current = saveCheckpoint

  const rollbackTo = useCallback(async (checkpointId: string) => {
    if (!workspaceRef.current || !history) return

    const target = history.checkpoints.find((c) => c.id === checkpointId)
    if (!target) return

    const workspace = workspaceRef.current
    workspace.clear()
    Blockly.serialization.workspaces.load(target.snapshot, workspace)

    // Create a new checkpoint recording the rollback
    const rollbackCheckpoint: Checkpoint = {
      id: crypto.randomUUID(),
      branchId: history.activeBranchId,
      parentId: currentBranch?.headId ?? null,
      timestamp: Date.now(),
      label: `Rolled back to: ${target.label}`,
      snapshot: target.snapshot,
      blockCount: target.blockCount,
    }

    const updatedBranches = history.branches.map((b) =>
      b.id === history.activeBranchId
        ? { ...b, headId: rollbackCheckpoint.id }
        : b
    )

    const updated: ProjectHistory = {
      ...history,
      branches: updatedBranches,
      checkpoints: [...history.checkpoints, rollbackCheckpoint],
    }

    setHistory(updated)
    await saveHistory(activeProjectId, updated)
  }, [workspaceRef, history, currentBranch])

  return {
    history,
    showHistory,
    setShowHistory,
    showCheckpointModal,
    setShowCheckpointModal,
    saveCheckpoint,
    rollbackTo,
    currentBranch,
    checkpoints,
    resetAutoSave,
  }
}
