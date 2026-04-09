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
    <div className="my-5 rounded-lg border border-[#313244] overflow-hidden bg-[#11111b]">
      {/* Code display */}
      <div className="relative">
        <pre className="px-5 py-4 overflow-x-auto">
          <code className="text-[#cdd6f4] font-mono text-sm leading-relaxed whitespace-pre">
            {code}
          </code>
        </pre>
        {/* Language badge */}
        <span className="absolute top-2 right-3 text-[10px] font-mono text-[#6c7086] uppercase tracking-wider select-none">
          {language}
        </span>
      </div>

      {/* Run button bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-t border-[#313244]">
        <button
          onClick={handleRun}
          disabled={runState === 'running'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-colors ${
            runState === 'running'
              ? 'bg-[#89b4fa]/5 text-[#89b4fa]/50 border border-[#89b4fa]/20 cursor-not-allowed'
              : 'bg-[#89b4fa]/10 text-[#89b4fa] border border-[#89b4fa]/30 hover:bg-[#89b4fa]/20'
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

        {runState === 'done' && outputLines.length === 0 && (
          <span className="text-xs text-[#6c7086]">No output</span>
        )}
        {runState === 'error' && (
          <span className="text-xs text-[#f38ba8]">Error</span>
        )}
      </div>

      {/* Output area */}
      {showOutput && (runState !== 'idle') && (
        <div className="border-t border-[#313244] bg-[#0d0d1a]">
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[#313244]/50">
            <span className="text-[10px] font-mono text-[#6c7086] uppercase tracking-wider">Output</span>
            {runState === 'done' && <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] inline-block" />}
            {runState === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-[#f38ba8] inline-block" />}
            {runState === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-[#89b4fa] inline-block animate-pulse" />}
          </div>
          <div className="px-4 py-3 min-h-[2rem] max-h-40 overflow-y-auto font-mono text-sm">
            {outputLines.map((line, i) => (
              <div key={i} className="text-[#a6e3a1] leading-relaxed">{line}</div>
            ))}
            {errorMsg && (
              <div className="text-[#f38ba8] leading-relaxed">{errorMsg}</div>
            )}
            {runState === 'running' && outputLines.length === 0 && (
              <div className="text-[#6c7086] italic">Running...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
