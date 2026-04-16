/**
 * Owns code-lab-mode state + handlers. Extracted from App.tsx.
 *
 * Lab is different from challenge/blockset/golf: it uses CodeMirror
 * instead of Blockly and runs labCode directly (not the workspace).
 */

import { useState, useCallback } from 'react'
import type { LabExercise } from '../code-lab'
import { getNextExercise } from '../code-lab'
import { validateOutput } from '../challenges/validator'
import { saveLabProgress } from '../code-lab/progress'
import { recordLabComplete } from '../stats'
import { checkAchievements } from '../achievements'
import type { AppMode } from '../types/appMode'

interface Deps {
  mode: AppMode
  setMode: (m: AppMode) => void
  beginModeEntry: () => void
  handleBackToSandbox: () => void
  processAchievements: (a: ReturnType<typeof checkAchievements>) => void
  exec: {
    run: (opts: { code: string; language: 'javascript' }) => Promise<import('../execution/runner').ExecutionResult>
    finish: (r: import('../execution/runner').ExecutionResult) => void
    patchResult: (fn: (prev: import('../execution/runner').ExecutionResult | null) => import('../execution/runner').ExecutionResult) => void
  }
  setShowOutput: (v: boolean) => void
}

export function useLabMode(deps: Deps) {
  const [activeLabExercise, setActiveLabExercise] = useState<LabExercise | null>(null)
  const [showComplete, setShowComplete] = useState(false)
  const [labCode, setLabCode] = useState('')

  const handleSelect = useCallback((exercise: LabExercise) => {
    deps.beginModeEntry()
    setActiveLabExercise(exercise)
    deps.setMode('active-lab')
    setShowComplete(false)
    setLabCode(exercise.starterCode || '')
  }, [deps])

  const handleBackToBrowser = useCallback(() => {
    deps.setMode('code-lab')
    setActiveLabExercise(null)
    setShowComplete(false)
    setLabCode('')
  }, [deps])

  const handleNext = useCallback(() => {
    if (!activeLabExercise) return
    const next = getNextExercise(activeLabExercise.id)
    if (next) handleSelect(next)
    else handleBackToBrowser()
  }, [activeLabExercise, handleSelect, handleBackToBrowser])

  const handleCheckSolution = useCallback(async () => {
    if (!activeLabExercise) return
    deps.setShowOutput(true)
    const execResult = await deps.exec.run({ code: labCode, language: 'javascript' })
    deps.exec.finish(execResult)
    if (execResult.error) return

    if (validateOutput(execResult.output, activeLabExercise.expectedOutput)) {
      saveLabProgress({ exerciseId: activeLabExercise.id, completed: true, attempts: 1 })
      recordLabComplete()
      deps.processAchievements(checkAchievements({ event: 'lab-complete' }))
      setShowComplete(true)
    } else {
      const expected = activeLabExercise.expectedOutput.join('\n')
      const actual = execResult.output.length > 0 ? execResult.output.join('\n') : '(no output)'
      deps.exec.patchResult(() => ({
        ...execResult,
        output: [
          ...execResult.output, '',
          '❌ Not quite! Make sure your code prints the result.',
          `Expected output: ${expected}`,
          `Your output: ${actual}`,
        ],
      }))
    }
  }, [labCode, activeLabExercise, deps])

  const handleLabCodeChange = useCallback((newCode: string) => {
    setLabCode(newCode)
  }, [])

  const handleOpen = useCallback(() => {
    if (deps.mode === 'code-lab') deps.handleBackToSandbox()
    else deps.setMode('code-lab')
  }, [deps])

  return {
    activeLabExercise,
    showComplete,
    labCode,
    handleSelect,
    handleBackToBrowser,
    handleNext,
    handleCheckSolution,
    handleLabCodeChange,
    handleOpen,
  }
}
