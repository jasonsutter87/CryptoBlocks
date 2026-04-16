/**
 * Owns code-golf-mode state + handlers. Extracted from App.tsx.
 */

import { useState, useCallback } from 'react'
import * as Blockly from 'blockly'
import type { GolfProblem } from '../code-golf'
import { getNextProblem } from '../code-golf'
import { validateOutput, countBlocks } from '../challenges/validator'
import { saveGolfProgress } from '../code-golf/progress'
import { recordGolfComplete } from '../stats'
import { checkAchievements } from '../achievements'
import { enterMode } from './modeWorkspace'
import type { ExecutionResult } from '../execution/runner'
import type { AppMode } from '../types/appMode'

interface Deps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
  mode: AppMode
  setMode: (m: AppMode) => void
  setBlockCount: (n: number) => void
  beginModeEntry: () => void
  handleBackToSandbox: () => void
  runCurrentCode: () => Promise<ExecutionResult | null>
  processAchievements: (a: ReturnType<typeof checkAchievements>) => void
  exec: { setResult: (r: null) => void }
  setShowOutput: (v: boolean) => void
}

export function useGolfMode(deps: Deps) {
  const [activeGolfProblem, setActiveGolfProblem] = useState<GolfProblem | null>(null)
  const [showComplete, setShowComplete] = useState(false)
  const [golfIsNewBest, setGolfIsNewBest] = useState(false)

  const handleSelect = useCallback((problem: GolfProblem) => {
    deps.beginModeEntry()
    setActiveGolfProblem(problem)
    deps.setMode('active-golf')
    setShowComplete(false)
    deps.setBlockCount(0)
    setGolfIsNewBest(false)
    setTimeout(() => {
      enterMode(deps.workspaceRef.current, { allowedCategories: problem.allowedCategories })
    }, 0)
  }, [deps])

  const handleBackToBrowser = useCallback(() => {
    deps.setMode('code-golf')
    setActiveGolfProblem(null)
    setShowComplete(false)
  }, [deps])

  const handleNext = useCallback(() => {
    if (!activeGolfProblem) return
    const next = getNextProblem(activeGolfProblem.id)
    if (next) handleSelect(next)
    else handleBackToBrowser()
  }, [activeGolfProblem, handleSelect, handleBackToBrowser])

  const handleRetry = useCallback(() => {
    setShowComplete(false)
    deps.exec.setResult(null)
    deps.setShowOutput(false)
    deps.workspaceRef.current?.clear()
  }, [deps])

  const handleCheckSolution = useCallback(async () => {
    if (!activeGolfProblem) return
    const execResult = await deps.runCurrentCode()
    if (!execResult || !deps.workspaceRef.current) return
    if (!validateOutput(execResult.output, activeGolfProblem.expectedOutput)) return

    const blocks = countBlocks(deps.workspaceRef.current)
    const { getGolfProgressById } = await import('../code-golf/progress')
    const prev = getGolfProgressById(activeGolfProblem.id)
    setGolfIsNewBest(!prev || blocks < prev.bestBlockCount)

    saveGolfProgress({ problemId: activeGolfProblem.id, completed: true, bestBlockCount: blocks, attempts: 1 })
    recordGolfComplete()
    deps.processAchievements(checkAchievements({ event: 'golf-complete' }))
    setShowComplete(true)
  }, [activeGolfProblem, deps])

  const handleOpen = useCallback(() => {
    if (deps.mode === 'code-golf') deps.handleBackToSandbox()
    else deps.setMode('code-golf')
  }, [deps])

  return {
    activeGolfProblem,
    showComplete,
    golfIsNewBest,
    handleSelect,
    handleBackToBrowser,
    handleNext,
    handleRetry,
    handleCheckSolution,
    handleOpen,
  }
}
