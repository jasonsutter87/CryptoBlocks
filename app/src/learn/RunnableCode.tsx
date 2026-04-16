import { useState, useRef } from 'react'
import { executeCode } from '../execution/runner'
import type { ExecutionHandle } from '../execution/runner'

interface RunnableCodeProps {
  code: string
  language?: 'javascript'
}

type RunState = 'idle' | 'running' | 'done' | 'error'

export default function RunnableCode({ code, language = 'javascript' }: RunnableCodeProps) {
  const [runState, setRunState] = useState<RunState>('idle')
  const [outputLines, setOutputLines] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const handleRef = useRef<ExecutionHandle | null>(null)

  function handleRun() {
    // Cancel any in-progress execution
    handleRef.current?.abort()
    setOutputLines([])
    setErrorMsg(null)
    setRunState('running')

    const handle = executeCode(
      code,
      language,
      (line) => {
        setOutputLines(prev => [...prev, line])
      },
    )
    handleRef.current = handle

    handle.promise.then((result) => {
      if (result.error) {
        setErrorMsg(result.error)
        setRunState('error')
      } else {
        setRunState('done')
      }
    }).catch((err) => {
      setErrorMsg(String(err))
      setRunState('error')
    })
  }

  const showOutput = runState !== 'idle' || outputLines.length > 0

  return (
    <div className="my-5 rounded-lg border border-surface-0 overflow-hidden bg-crust">
      {/* Code display */}
      <div className="relative">
        <pre className="px-5 py-4 overflow-x-auto">
          <code className="text-text font-mono text-sm leading-relaxed whitespace-pre">
            {code}
          </code>
        </pre>
        {/* Language badge */}
        <span className="absolute top-2 right-3 text-[10px] font-mono text-overlay uppercase tracking-wider select-none">
          {language}
        </span>
      </div>

      {/* Run button bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-mantle border-t border-surface-0">
        <button
          onClick={handleRun}
          disabled={runState === 'running'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-colors ${
            runState === 'running'
              ? 'bg-accent/5 text-accent/50 border border-accent/20 cursor-not-allowed'
              : 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
          }`}
        >
          {runState === 'running' ? (
            <>
              <span className="inline-block w-3 h-3 border border-accent/50 border-t-[#89b4fa] rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <span className="text-xs">&#9654;</span>
              Run
            </>
          )}
        </button>

        {runState === 'done' && outputLines.length === 0 && (
          <span className="text-xs text-overlay">No output</span>
        )}
        {runState === 'error' && (
          <span className="text-xs text-danger">Error</span>
        )}
      </div>

      {/* Output area */}
      {showOutput && (runState !== 'idle') && (
        <div className="border-t border-surface-0 bg-[#0d0d1a]">
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-surface-0/50">
            <span className="text-[10px] font-mono text-overlay uppercase tracking-wider">Output</span>
            {runState === 'done' && <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />}
            {runState === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" />}
            {runState === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />}
          </div>
          <div className="px-4 py-3 min-h-[2rem] max-h-40 overflow-y-auto font-mono text-sm">
            {outputLines.map((line, i) => (
              <div key={i} className="text-success leading-relaxed">{line}</div>
            ))}
            {errorMsg && (
              <div className="text-danger leading-relaxed">{errorMsg}</div>
            )}
            {runState === 'running' && outputLines.length === 0 && (
              <div className="text-overlay italic">Running...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
