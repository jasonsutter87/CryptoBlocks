import type { ExecutionResult } from '../execution/runner'

interface OutputPanelProps {
  result: ExecutionResult | null
  isRunning: boolean
  liveOutput: string[]
}

export default function OutputPanel({ result, isRunning, liveOutput }: OutputPanelProps) {
  const lines = isRunning ? liveOutput : result?.output ?? []

  return (
    <div className="flex flex-col h-full bg-[#11111b]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6c7086] uppercase tracking-wide font-semibold">
            Output
          </span>
          {isRunning && (
            <span className="text-xs text-[#f9e2af] animate-pulse">Running...</span>
          )}
        </div>
        {result && !isRunning && (
          <span className="text-xs text-[#6c7086]">
            {result.duration.toFixed(0)}ms
          </span>
        )}
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {!isRunning && !result && lines.length === 0 && (
          <div className="text-[#6c7086] italic">
            Hit Play to run your blocks
          </div>
        )}

        {lines.map((line, i) => (
          <div key={i} className="text-[#cdd6f4] leading-relaxed">
            {line}
          </div>
        ))}

        {result && !isRunning && result.error && (
          <div className="mt-2 text-[#f38ba8] bg-[#f38ba8]/10 rounded-lg p-3">
            <span className="font-semibold">Error: </span>
            {result.error}
          </div>
        )}

        {result && !isRunning && result.returnValue !== undefined && result.returnValue !== null && !result.error && (
          <div className="mt-2 text-[#a6e3a1]">
            <span className="text-[#6c7086]">{'=> '}</span>
            {typeof result.returnValue === 'object'
              ? JSON.stringify(result.returnValue, null, 2)
              : String(result.returnValue)}
          </div>
        )}
      </div>
    </div>
  )
}
