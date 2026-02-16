import { useState, useEffect, useRef } from 'react'
import type { ExecutionResult } from '../execution/runner'

type OutputTab = 'console' | 'canvas' | 'preview'

interface OutputPanelProps {
  result: ExecutionResult | null
  isRunning: boolean
  liveOutput: string[]
}

export default function OutputPanel({ result, isRunning, liveOutput }: OutputPanelProps) {
  const lines = isRunning ? liveOutput : result?.output ?? []
  const hasCanvas = !!result?.canvasDataUrl
  const hasHtml = !!result?.htmlOutput
  const [tab, setTab] = useState<OutputTab>('console')
  const prevHtmlRef = useRef<string | undefined>(undefined)

  // Auto-switch to preview tab when htmlOutput first arrives
  useEffect(() => {
    if (result?.htmlOutput && result.htmlOutput !== prevHtmlRef.current) {
      setTab('preview')
    }
    prevHtmlRef.current = result?.htmlOutput
  }, [result?.htmlOutput])

  // Resolve active tab (fall back to console if selected tab has no data)
  let activeTab = tab
  if (tab === 'canvas' && !hasCanvas) activeTab = 'console'
  if (tab === 'preview' && !hasHtml) activeTab = 'console'

  return (
    <div className="flex flex-col h-full bg-[#11111b]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <button
            onClick={() => setTab('console')}
            className={`text-xs uppercase tracking-wide font-semibold px-2 py-0.5 rounded ${
              activeTab === 'console'
                ? 'text-[#cdd6f4] bg-[#313244]'
                : 'text-[#6c7086] hover:text-[#a6adc8]'
            }`}
          >
            Console
          </button>
          <button
            onClick={() => setTab('canvas')}
            className={`text-xs uppercase tracking-wide font-semibold px-2 py-0.5 rounded ${
              activeTab === 'canvas'
                ? 'text-[#cdd6f4] bg-[#313244]'
                : hasCanvas
                  ? 'text-[#cba6f7] hover:text-[#cba6f7]/80'
                  : 'text-[#6c7086]/40 cursor-not-allowed'
            }`}
            disabled={!hasCanvas}
          >
            Canvas
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`text-xs uppercase tracking-wide font-semibold px-2 py-0.5 rounded ${
              activeTab === 'preview'
                ? 'text-[#cdd6f4] bg-[#313244]'
                : hasHtml
                  ? 'text-[#f38ba8] hover:text-[#f38ba8]/80'
                  : 'text-[#6c7086]/40 cursor-not-allowed'
            }`}
            disabled={!hasHtml}
          >
            Preview
          </button>
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

      {/* Console tab */}
      {activeTab === 'console' && (
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
      )}

      {/* Canvas tab */}
      {activeTab === 'canvas' && (
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#1e1e2e]">
          {hasCanvas ? (
            <img
              src={result!.canvasDataUrl}
              alt="Canvas output"
              className="max-w-full max-h-full rounded-lg shadow-lg border border-[#313244]"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="text-[#6c7086] italic text-sm">
              Use Art blocks to draw on the canvas
            </div>
          )}
        </div>
      )}

      {/* Preview tab */}
      {activeTab === 'preview' && (
        <div className="flex-1 overflow-hidden">
          {hasHtml ? (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;margin:16px;}</style></head><body>${result!.htmlOutput}</body></html>`}
              sandbox=""
              className="w-full h-full border-none bg-white"
              title="HTML Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#6c7086] italic text-sm">
              Use HTML blocks to build a page
            </div>
          )}
        </div>
      )}
    </div>
  )
}
