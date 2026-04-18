/**
 * The full sandbox Run pipeline — what happens when a user hits the Play
 * button.
 *
 * Three responsibilities braided into one callback because they all fire
 * off one event:
 *   1. Execute code in the sandbox (with optional Slow-Mo block-highlight replay)
 *   2. Record the run's stats + check achievements
 *   3. If this is a Daily Challenge session, check whether the output matches
 *      today's target and mark solved if so.
 *
 * The hook also binds "Run for Everyone" collab broadcast — if the current
 * user is in a collab session, a broadcast fires handleRun on all peers.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import { generateCode } from '../blocks/blockly-register'
import { countBlocks } from '../challenges/validator'
import { checkAchievements } from '../achievements'
import type { Achievement } from '../achievements'
import { recordRun } from '../stats'
import { matchesTarget } from '../daily/puzzles'
import { markSolved, loadDailyState } from '../daily/state'
import { getTodaysPuzzle } from '../daily/getTodaysPuzzle'
import { bindRunBroadcast } from '../collab/run-broadcast'
import type { Language } from '../types/block'
import type { ExecutionResult } from '../execution/runner'

type ExecHandle = {
  run: (opts: {
    code: string
    language: Language
    onTrace?: (blockId: string) => void
    onCanvasUpdate?: (url: string) => void
  }) => Promise<ExecutionResult>
  finish: (r: ExecutionResult) => void
  patchResult: (fn: (prev: ExecutionResult | null) => ExecutionResult) => void
}

interface Deps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
  exec: ExecHandle
  code: string
  language: Language
  slowMo: boolean
  processAchievements: (a: Achievement[]) => void
  getUsedCategories: () => string[]
  getCryptoBlockTypes?: () => number
  setLastExecCode: (code: string) => void
  setShowOutput: (v: boolean) => void
  collabDoc: unknown | null
  isDailyChallenge: boolean
  dailyInfo: ReturnType<typeof getTodaysPuzzle> | null
}

export function useRunPipeline(deps: Deps) {
  const [dailySolvedBlocks, setDailySolvedBlocks] = useState<number | null>(() => {
    if (!deps.isDailyChallenge || !deps.dailyInfo) return null
    return loadDailyState().solved[deps.dailyInfo.dayNumber]?.blocks ?? null
  })

  const handleRun = useCallback(async () => {
    // Cancel any leftover game loop from a prior run so two Runs don't pile
    // up requestAnimationFrame callbacks on the same canvas.
    const w = window as unknown as { __cbGameLoopId?: number }
    if (w.__cbGameLoopId) {
      cancelAnimationFrame(w.__cbGameLoopId)
      w.__cbGameLoopId = 0
    }

    deps.setShowOutput(true)

    // HTML mode compiles to JS for execution — the HTML "peek" is display-only.
    const execLang = deps.language === 'html' ? 'javascript' : deps.language
    const traceEnabled = deps.slowMo && execLang === 'javascript'
    const execCode = traceEnabled && deps.workspaceRef.current
      ? generateCode(deps.workspaceRef.current, execLang, true)
      : deps.language === 'html' && deps.workspaceRef.current
        ? generateCode(deps.workspaceRef.current, 'javascript')
        : deps.code
    deps.setLastExecCode(execCode)

    const traceLog: string[] = []
    const execResult = await deps.exec.run({
      code: execCode,
      language: execLang,
      onTrace: traceEnabled ? (blockId) => { traceLog.push(blockId) } : undefined,
      onCanvasUpdate: (dataUrl) => {
        deps.exec.patchResult((prev) => prev
          ? { ...prev, canvasDataUrl: dataUrl }
          : { output: [], error: null, returnValue: undefined, duration: 0, canvasDataUrl: dataUrl })
      },
    })

    // Slow-Mo replays trace highlights with a small delay so the user can
    // follow block-by-block which block fired when.
    if (traceEnabled && traceLog.length > 0) {
      deps.exec.finish(execResult)
      for (const blockId of traceLog) {
        deps.workspaceRef.current?.highlightBlock(blockId)
        await new Promise((r) => setTimeout(r, 200))
      }
      deps.workspaceRef.current?.highlightBlock(null as unknown as string)
    } else {
      deps.exec.finish(execResult)
    }

    // Stats + achievements
    const blocks = deps.workspaceRef.current ? countBlocks(deps.workspaceRef.current) : 0
    recordRun({
      language: deps.language as 'javascript' | 'python' | 'html',
      blockCount: blocks,
      lineCount: execCode.split('\n').length,
    })
    deps.processAchievements(checkAchievements({
      event: 'run',
      output: execResult.output,
      hasError: !!execResult.error,
      blockCount: blocks,
      categoriesUsed: deps.getUsedCategories(),
      cryptoBlockTypes: deps.getCryptoBlockTypes?.() ?? 0,
      language: deps.language,
    }))

    // Daily Challenge: did today's target match?
    if (deps.isDailyChallenge && deps.dailyInfo && !execResult.error) {
      if (matchesTarget(execResult.output, deps.dailyInfo.puzzle)) {
        markSolved(deps.dailyInfo.dayNumber, blocks)
        setDailySolvedBlocks(blocks)
      }
    }
  }, [deps])

  // Bind "Run for Everyone" — a collab peer triggering this fires handleRun
  // on all connected peers. Handler is looked up through a ref so the
  // effect doesn't re-subscribe on every handleRun identity change.
  const handleRunRef = useRef<() => void>(() => {})
  handleRunRef.current = handleRun

  const runBroadcastRef = useRef<ReturnType<typeof bindRunBroadcast> | null>(null)
  useEffect(() => {
    if (!deps.collabDoc) return
    const binding = bindRunBroadcast(deps.collabDoc as Parameters<typeof bindRunBroadcast>[0], () => {
      handleRunRef.current()
    })
    runBroadcastRef.current = binding
    return () => {
      binding.destroy()
      runBroadcastRef.current = null
    }
  }, [deps.collabDoc])

  const requestRunForEveryone = useCallback(() => {
    runBroadcastRef.current?.requestRunForEveryone()
    handleRun()
  }, [handleRun])

  return {
    handleRun,
    requestRunForEveryone,
    dailySolvedBlocks,
    setDailySolvedBlocks,
  }
}
