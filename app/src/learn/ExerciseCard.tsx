import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { executeCode } from '../execution/runner'
import type { ExecutionHandle } from '../execution/runner'
import { markExerciseComplete } from './progress'
import type { LessonExercise } from './types'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

function PlainEditor({ code, onChange }: { code: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="w-full bg-[#1e1e2e] text-[#cdd6f4] font-mono text-sm px-4 py-3 resize-none outline-none border-0"
      style={{ height: '150px' }}
      value={code}
      onChange={e => onChange(e.target.value)}
      spellCheck={false}
    />
  )
}

function EditorWithFallback({ code, onChange }: { code: string; onChange: (v: string) => void }) {
  const [useFallback, setUseFallback] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mountedRef.current) setUseFallback(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (useFallback) {
    return <PlainEditor code={code} onChange={onChange} />
  }

  return (
    <Suspense fallback={<PlainEditor code={code} onChange={onChange} />}>
      <MonacoEditor
        language="javascript"
        value={code}
        theme="vs-dark"
        height="150px"
        onChange={(value) => onChange(value ?? '')}
        onMount={() => { mountedRef.current = true }}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: 'line',
          overviewRulerLanes: 0,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          tabCompletion: 'on',
          parameterHints: { enabled: true },
          scrollbar: { vertical: 'auto', horizontal: 'hidden' },
        }}
      />
    </Suspense>
  )
}

export interface ExerciseCardProps {
  exercise: LessonExercise
  lessonId: string
  isCompleted: boolean
  onComplete: () => void
}

type RunState = 'idle' | 'running' | 'done' | 'error'
type CheckState = 'idle' | 'running' | 'pass' | 'fail'

export default function ExerciseCard({ exercise, lessonId, isCompleted, onComplete }: ExerciseCardProps) {
  const [code, setCode] = useState(exercise.starterCode)
  const [runState, setRunState] = useState<RunState>('idle')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [outputLines, setOutputLines] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [checkMessage, setCheckMessage] = useState<string | null>(null)
  const [hintIndex, setHintIndex] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const handleRef = useRef<ExecutionHandle | null>(null)

  const completed = isCompleted

  function runCode(onResult?: (lines: string[]) => void) {
    handleRef.current?.abort()
    setOutputLines([])
    setErrorMsg(null)
    setCheckMessage(null)

    const collected: string[] = []
    const handle = executeCode(
      code,
      'javascript',
      (line) => {
        collected.push(line)
        setOutputLines(prev => [...prev, line])
      },
    )
    handleRef.current = handle

    handle.promise.then((result) => {
      if (result.error) {
        setErrorMsg(result.error)
        setRunState('error')
        setCheckState('idle')
      } else {
        onResult?.(collected)
      }
    }).catch((err) => {
      setErrorMsg(String(err))
      setRunState('error')
      setCheckState('idle')
    })
  }

  function handleRun() {
    setRunState('running')
    setCheckState('idle')
    runCode(() => {
      setRunState('done')
    })
  }

  function handleCheck() {
    setCheckState('running')
    setRunState('idle')
    runCode((lines) => {
      const actual = lines.map(l => l.trim())
      const expected = exercise.expectedOutput.map(l => l.trim())

      const pass =
        actual.length === expected.length &&
        actual.every((line, i) => line === expected[i])

      if (pass) {
        setCheckState('pass')
        setCheckMessage('Correct!')
        if (!completed) {
          markExerciseComplete(lessonId, exercise.id)
          onComplete()
        }
      } else {
        setCheckState('fail')
        const expectedStr = expected.join(', ')
        const gotStr = actual.length > 0 ? actual.join(', ') : '(no output)'
        setCheckMessage(`Expected: ${expectedStr} — Got: ${gotStr}`)
      }
    })
  }

  function handleHint() {
    if (!showHints) {
      setShowHints(true)
    } else if (hintIndex < exercise.hints.length - 1) {
      setHintIndex(i => i + 1)
    }
  }

  const isRunning = runState === 'running' || checkState === 'running'
  const hasOutput = outputLines.length > 0 || errorMsg !== null || checkMessage !== null
  const visibleHints = showHints ? exercise.hints.slice(0, hintIndex + 1) : []
  const hasMoreHints = !showHints || hintIndex < exercise.hints.length - 1

  const borderColor = checkState === 'pass'
    ? 'border-[#a6e3a1] shadow-[0_0_12px_rgba(166,227,161,0.15)]'
    : checkState === 'fail'
    ? 'border-[#f38ba8] shadow-[0_0_12px_rgba(243,139,168,0.15)]'
    : 'border-[#313244]'

  return (
    <div className={`my-6 border rounded-xl bg-[#181825] overflow-hidden transition-all ${borderColor}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#313244]/50 border-b border-[#313244]">
        <span className="text-base">✏️</span>
        <span className="text-sm font-semibold text-[#cdd6f4]">Exercise</span>
        {completed && (
          <span className="ml-auto flex items-center gap-1 text-xs text-[#a6e3a1]">
            <span>✓</span>
            <span>Completed</span>
          </span>
        )}
      </div>

      {/* Prompt */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[#a6adc8] text-sm leading-relaxed">{exercise.prompt}</p>
      </div>

      {/* Code Editor */}
      <div className="mx-4 mb-3 rounded-lg overflow-hidden border border-[#313244]">
        <EditorWithFallback code={code} onChange={setCode} />
      </div>

      {/* Button row */}
      <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
            isRunning
              ? 'bg-[#89b4fa]/5 text-[#89b4fa]/50 border-[#89b4fa]/20 cursor-not-allowed'
              : 'bg-[#89b4fa]/10 text-[#89b4fa] border-[#89b4fa]/30 hover:bg-[#89b4fa]/20'
          }`}
        >
          {runState === 'running' ? (
            <>
              <span className="inline-block w-3 h-3 border border-[#89b4fa]/50 border-t-[#89b4fa] rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <span className="text-xs">&#9654;</span>
              Run
            </>
          )}
        </button>

        {/* Check button */}
        <button
          onClick={handleCheck}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
            isRunning
              ? 'bg-[#a6e3a1]/5 text-[#a6e3a1]/50 border-[#a6e3a1]/20 cursor-not-allowed'
              : 'bg-[#a6e3a1]/10 text-[#a6e3a1] border-[#a6e3a1]/30 hover:bg-[#a6e3a1]/20'
          }`}
        >
          {checkState === 'running' ? (
            <>
              <span className="inline-block w-3 h-3 border border-[#a6e3a1]/50 border-t-[#a6e3a1] rounded-full animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <span className="text-xs">✓</span>
              Check
            </>
          )}
        </button>

        {/* Hint button */}
        {exercise.hints.length > 0 && (
          <button
            onClick={handleHint}
            disabled={!hasMoreHints}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
              !hasMoreHints
                ? 'bg-[#f9e2af]/5 text-[#f9e2af]/40 border-[#f9e2af]/20 cursor-not-allowed'
                : 'bg-[#f9e2af]/10 text-[#f9e2af] border-[#f9e2af]/30 hover:bg-[#f9e2af]/20'
            }`}
          >
            <span className="text-xs">💡</span>
            {!showHints ? 'Hint' : hasMoreHints ? 'Next hint' : 'No more hints'}
          </button>
        )}
      </div>

      {/* Hints */}
      {visibleHints.length > 0 && (
        <div className="mx-4 mb-3 flex flex-col gap-1.5">
          {visibleHints.map((hint, i) => (
            <div
              key={i}
              className="flex gap-2 bg-[#f9e2af]/5 border border-[#f9e2af]/20 rounded-lg px-3 py-2 text-xs text-[#f9e2af]"
            >
              <span className="shrink-0">💡</span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Output area */}
      {hasOutput && (
        <div className="border-t border-[#313244] bg-[#0d0d1a]">
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[#313244]/50">
            <span className="text-[10px] font-mono text-[#6c7086] uppercase tracking-wider">Output</span>
            {checkState === 'pass' && <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] inline-block" />}
            {checkState === 'fail' && <span className="w-1.5 h-1.5 rounded-full bg-[#f38ba8] inline-block" />}
            {runState === 'done' && checkState === 'idle' && <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] inline-block" />}
            {runState === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-[#f38ba8] inline-block" />}
          </div>
          <div className="px-4 py-3 min-h-[2rem] max-h-40 overflow-y-auto font-mono text-sm">
            {outputLines.map((line, i) => (
              <div key={i} className="text-[#a6e3a1] leading-relaxed">{line}</div>
            ))}
            {errorMsg && (
              <div className="text-[#f38ba8] leading-relaxed">{errorMsg}</div>
            )}
            {checkState === 'pass' && checkMessage && (
              <div className="text-[#a6e3a1] font-semibold mt-1">✅ {checkMessage}</div>
            )}
            {checkState === 'fail' && checkMessage && (
              <div className="text-[#f38ba8] mt-1">❌ {checkMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
