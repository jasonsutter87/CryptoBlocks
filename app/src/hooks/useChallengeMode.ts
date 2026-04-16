/**
 * Owns challenge-mode state + handlers. Extracted from App.tsx so the root
 * component doesn't carry ~90 lines of challenge-specific logic.
 */

import { useState, useCallback } from 'react'
import * as Blockly from 'blockly'
import type { Challenge } from '../challenges'
import { getNextChallenge } from '../challenges'
import { validateOutput, calculateStars, countBlocks } from '../challenges/validator'
import { saveProgress } from '../challenges/progress'
import { recordChallengeComplete } from '../stats'
import { checkAchievements } from '../achievements'
import { enterMode } from './modeWorkspace'
import type { ExecutionResult } from '../execution/runner'
import type { AppMode } from '../types/appMode'

interface Deps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
  modeRef: React.RefObject<AppMode>
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

export function useChallengeMode(deps: Deps) {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [showComplete, setShowComplete] = useState(false)
  const [challengeStars, setChallengeStars] = useState(0)

  const handleCheckSolution = useCallback(async () => {
    if (!activeChallenge) return
    const execResult = await deps.runCurrentCode()
    if (!execResult || !deps.workspaceRef.current) return

    if (validateOutput(execResult.output, activeChallenge.expectedOutput)) {
      const blocks = countBlocks(deps.workspaceRef.current)
      const stars = calculateStars(blocks, activeChallenge.par)
      setChallengeStars(stars)
      saveProgress({ challengeId: activeChallenge.id, completed: true, stars, bestBlockCount: blocks, attempts: 1 })
      recordChallengeComplete()
      deps.processAchievements(checkAchievements({ event: 'challenge-complete', challengeStars: stars }))
      setShowComplete(true)
    }
  }, [activeChallenge, deps])

  const handleSelect = useCallback((challenge: Challenge) => {
    deps.beginModeEntry()
    setActiveChallenge(challenge)
    deps.setMode('active-challenge')
    setShowComplete(false)
    deps.setBlockCount(0)
    setTimeout(() => {
      enterMode(deps.workspaceRef.current, {
        allowedCategories: challenge.allowedCategories,
        starterBlocks: challenge.starterBlocks,
      })
    }, 0)
  }, [deps])

  const handleBackToBrowser = useCallback(() => {
    deps.setMode('challenges')
    setActiveChallenge(null)
    setShowComplete(false)
  }, [deps])

  const handleNext = useCallback(() => {
    if (!activeChallenge) return
    const next = getNextChallenge(activeChallenge.id)
    if (next) handleSelect(next)
    else handleBackToBrowser()
  }, [activeChallenge, handleSelect, handleBackToBrowser])

  const handleRetry = useCallback(() => {
    setShowComplete(false)
    deps.exec.setResult(null)
    deps.setShowOutput(false)
    enterMode(deps.workspaceRef.current, {
      allowedCategories: activeChallenge?.allowedCategories,
      starterBlocks: activeChallenge?.starterBlocks,
    })
  }, [activeChallenge, deps])

  const handleOpen = useCallback(() => {
    if (deps.mode === 'challenges') deps.handleBackToSandbox()
    else deps.setMode('challenges')
  }, [deps])

  return {
    activeChallenge,
    showComplete,
    challengeStars,
    handleCheckSolution,
    handleSelect,
    handleBackToBrowser,
    handleNext,
    handleRetry,
    handleOpen,
  }
}
