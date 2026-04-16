/**
 * Owns blockset-mode state + handlers. Extracted from App.tsx.
 */

import { useState, useCallback } from 'react'
import * as Blockly from 'blockly'
import type { Blockset } from '../blocksets'
import { getNextBlockset } from '../blocksets'
import { validateOutput } from '../challenges/validator'
import { saveBlocksetProgress } from '../blocksets/progress'
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
}

export function useBlocksetMode(deps: Deps) {
  const [activeBlockset, setActiveBlockset] = useState<Blockset | null>(null)
  const [showComplete, setShowComplete] = useState(false)

  const handleSelect = useCallback((blockset: Blockset) => {
    deps.beginModeEntry()
    setActiveBlockset(blockset)
    deps.setMode('active-blockset')
    setShowComplete(false)
    deps.setBlockCount(0)
    setTimeout(() => {
      enterMode(deps.workspaceRef.current, { allowedCategories: blockset.allowedCategories })
    }, 0)
  }, [deps])

  const handleBackToBrowser = useCallback(() => {
    deps.setMode('blocksets')
    setActiveBlockset(null)
    setShowComplete(false)
  }, [deps])

  const handleNext = useCallback(() => {
    if (!activeBlockset) return
    const next = getNextBlockset(activeBlockset.id)
    if (next) handleSelect(next)
    else handleBackToBrowser()
  }, [activeBlockset, handleSelect, handleBackToBrowser])

  const handleCheckSolution = useCallback(async () => {
    if (!activeBlockset) return
    const execResult = await deps.runCurrentCode()
    if (!execResult) return
    if (validateOutput(execResult.output, activeBlockset.expectedOutput)) {
      saveBlocksetProgress({ blocksetId: activeBlockset.id, completed: true, attempts: 1 })
      setShowComplete(true)
    }
  }, [activeBlockset, deps])

  const handleOpen = useCallback(() => {
    if (deps.mode === 'blocksets') deps.handleBackToSandbox()
    else deps.setMode('blocksets')
  }, [deps])

  return {
    activeBlockset,
    showComplete,
    handleSelect,
    handleBackToBrowser,
    handleNext,
    handleCheckSolution,
    handleOpen,
  }
}
