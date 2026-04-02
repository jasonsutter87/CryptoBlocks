import { useState, useEffect, useCallback } from 'react'
import * as Blockly from 'blockly'
import type { ProjectHistory, Branch, Checkpoint } from './types'
import { loadHistory, saveHistory } from './storage'

const DEFAULT_PROJECT_ID = 'default'

function initProject(): ProjectHistory {
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
    projectId: DEFAULT_PROJECT_ID,
    activeBranchId: branchId,
    branches: [mainBranch],
    checkpoints: [],
  }
}

export function useVersionControl(
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>,
  blockCount: number
) {
  const [history, setHistory] = useState<ProjectHistory | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showCheckpointModal, setShowCheckpointModal] = useState(false)

  // Load or initialize history on mount
  useEffect(() => {
    loadHistory(DEFAULT_PROJECT_ID).then((loaded) => {
      if (loaded) {
        setHistory(loaded)
      } else {
        const fresh = initProject()
        setHistory(fresh)
        saveHistory(DEFAULT_PROJECT_ID, fresh).catch(console.error)
      }
    }).catch(console.error)
  }, [])

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
    await saveHistory(DEFAULT_PROJECT_ID, updated)
  }, [workspaceRef, history, currentBranch, blockCount])

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
    await saveHistory(DEFAULT_PROJECT_ID, updated)
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
  }
}
