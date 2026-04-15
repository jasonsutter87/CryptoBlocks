/**
 * Owns the execution lifecycle: isRunning, result, liveOutput, in-flight handle.
 *
 * Bakes in the abort-prior-handle invariant so a fast double-click cannot
 * leave two postMessage listeners racing (Purple Team A3).
 *
 * Used by the sandbox Run button and every "Check Solution" handler.
 */

import { useCallback, useRef, useState } from 'react'
import type { Language } from '../types/block'
import { executeCode } from '../execution/runner'
import type { ExecutionHandle, ExecutionResult } from '../execution/runner'

export interface RunOptions {
  code: string
  language: Language
  onTrace?: (blockId: string) => void
  onCanvasUpdate?: (dataUrl: string) => void
}

export function useExecution() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [liveOutput, setLiveOutput] = useState<string[]>([])
  const handleRef = useRef<ExecutionHandle | null>(null)

  const run = useCallback(async (opts: RunOptions): Promise<ExecutionResult> => {
    handleRef.current?.abort()
    handleRef.current = null

    setIsRunning(true)
    setResult(null)
    setLiveOutput([])

    const handle = executeCode(
      opts.code,
      opts.language,
      (line) => setLiveOutput((prev) => [...prev, line]),
      opts.onTrace,
      opts.onCanvasUpdate,
    )
    handleRef.current = handle

    const execResult = await handle.promise
    handleRef.current = null
    return execResult
  }, [])

  const finish = useCallback((execResult: ExecutionResult) => {
    setResult(execResult)
    setLiveOutput([])
    setIsRunning(false)
  }, [])

  const abort = useCallback(() => {
    handleRef.current?.abort()
    handleRef.current = null
    setIsRunning(false)
  }, [])

  const patchResult = useCallback((updater: (prev: ExecutionResult | null) => ExecutionResult) => {
    setResult(updater)
  }, [])

  return { isRunning, result, liveOutput, run, finish, abort, patchResult, setResult }
}
