import { useState, useEffect, useRef } from 'react'
import type { ExecutionResult } from '../execution/runner'

type OutputTab = 'console' | 'canvas' | 'preview'

interface OutputPanelProps {
  result: ExecutionResult | null
  isRunning: boolean
  liveOutput: string[]
  previewCode?: string
}

export default function OutputPanel({ result, isRunning, liveOutput, previewCode }: OutputPanelProps) {
  const lines = isRunning ? liveOutput : result?.output ?? []
  const hasHtml = !!result?.htmlOutput
  const [tab, setTab] = useState<OutputTab>('console')
  const prevHtmlRef = useRef<string | undefined>(undefined)
  const liveCanvasRef = useRef<HTMLCanvasElement>(null)

  // Auto-switch to preview tab when htmlOutput first arrives
  useEffect(() => {
    if (result?.htmlOutput && result.htmlOutput !== prevHtmlRef.current) {
      setTab('preview')
    }
    prevHtmlRef.current = result?.htmlOutput
  }, [result?.htmlOutput])

  // Auto-switch to canvas tab when canvas first arrives
  const prevCanvasRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (result?.canvasDataUrl && !prevCanvasRef.current) {
      setTab('canvas')
    }
    prevCanvasRef.current = result?.canvasDataUrl
  }, [result?.canvasDataUrl])

  // Auto-switch to canvas tab when a new run starts IF a game is active
  // (detected by window.__game existing in the parent — games write to it).
  useEffect(() => {
    if (!isRunning) return
    const hasActiveGame = typeof window !== 'undefined' && (window as unknown as { __game?: unknown }).__game != null
    if (hasActiveGame) setTab('canvas')
  }, [isRunning])

  // Clear the live canvas at the start of each run so leftover frames
  // from the previous run don't bleed into the new one.
  useEffect(() => {
    if (!isRunning) return
    const canvas = liveCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
  }, [isRunning])

  // When the iframe path finishes and returns a canvasDataUrl, paint it
  // onto the live canvas so the static result is visible in the same tab.
  useEffect(() => {
    const canvas = liveCanvasRef.current
    if (!canvas || !result?.canvasDataUrl) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = result.canvasDataUrl
  }, [result?.canvasDataUrl])

  // Resolve active tab (fall back to console if selected tab has no data)
  let activeTab = tab
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
                : 'text-[#cba6f7] hover:text-[#cba6f7]/80'
            }`}
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

      {/* Canvas tab — the canvas is always mounted (even when another tab is
          active) so direct-execution code can find #cb-canvas and draw live.
          We just hide the container with CSS when a different tab is selected. */}
      <div
        className={`flex-1 overflow-auto p-4 items-center justify-center bg-[#1e1e2e] ${
          activeTab === 'canvas' ? 'flex' : 'hidden'
        }`}
      >
        <canvas
          ref={liveCanvasRef}
          id="cb-canvas"
          width={640}
          height={400}
          className="max-w-full max-h-full rounded-lg shadow-lg border border-[#313244] bg-[#11111b]"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Preview tab — executes full generated code so event handlers work */}
      {activeTab === 'preview' && (
        <div className="flex-1 overflow-hidden">
          {hasHtml && previewCode ? (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: https:; connect-src https: wss:;"><style>body{font-family:sans-serif;margin:16px;}#cb-canvas{display:none;}</style></head><body><div id="cb-page" style="display:none"></div><canvas id="cb-canvas" width="400" height="400"></canvas><script>(async function(){try{${previewCode}}catch(e){console.error(e)}})()</script></body></html>`}
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-none bg-white"
              title="HTML Preview"
            />
          ) : hasHtml ? (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https:;"><style>body{font-family:sans-serif;margin:16px;}</style></head><body>${result!.htmlOutput}</body></html>`}
              sandbox="allow-scripts"
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
