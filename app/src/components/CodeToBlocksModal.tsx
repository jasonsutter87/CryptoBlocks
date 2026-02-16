import { useState, useCallback, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { jsToWorkspace, type ConversionResult } from '../converters/js-to-workspace'

interface CodeToBlocksModalProps {
  onConvert: (result: ConversionResult) => void
  onClose: () => void
}

const PLACEHOLDER = `// Paste JavaScript code here!
// It becomes snapped-together blocks.

let score = 0;

for (let i = 0; i < 5; i++) {
  score = score + 10;
  if (score > 30) {
    console.log("High score: " + score);
  } else {
    console.log("Keep going: " + score);
  }
}

console.log("Final score: " + score);
`

export default function CodeToBlocksModal({ onConvert, onClose }: CodeToBlocksModalProps) {
  const [code, setCode] = useState(PLACEHOLDER)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [monacoFailed, setMonacoFailed] = useState(false)
  const mountedRef = useRef(false)

  // Fallback to textarea if Monaco fails to load within 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mountedRef.current) setMonacoFailed(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleConvert = useCallback(() => {
    setError(null)
    setWarnings([])

    try {
      const result = jsToWorkspace(code)
      setWarnings(result.warnings)

      // If there are only warnings (no fatal error), still proceed
      onConvert(result)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [code, onConvert])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244]">
          <div>
            <h2 className="text-xl font-bold text-[#cdd6f4]">Code to Blocks</h2>
            <p className="text-sm text-[#6c7086] mt-0.5">Paste JavaScript — get snapped-together blocks</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#313244] transition-colors text-[#6c7086] hover:text-[#cdd6f4]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 border-b border-[#313244]">
          {monacoFailed ? (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[400px] bg-[#1e1e2e] text-[#cdd6f4] text-[13px] font-mono p-3 resize-none outline-none"
              spellCheck={false}
            />
          ) : (
            <Editor
              height="400px"
              defaultLanguage="javascript"
              value={code}
              onChange={(val) => setCode(val ?? '')}
              theme="vs-dark"
              loading={
                <div className="h-[400px] flex items-center justify-center bg-[#1e1e2e] text-[#6c7086] text-sm">
                  Loading editor...
                </div>
              }
              onMount={() => { mountedRef.current = true }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12 },
              }}
            />
          )}
        </div>

        {/* Error / Warnings */}
        {error && (
          <div className="px-6 py-3 bg-[#f38ba8]/10 border-b border-[#f38ba8]/30">
            <p className="text-sm text-[#f38ba8] font-medium">Parse Error</p>
            <p className="text-sm text-[#f38ba8]/80 mt-0.5">{error}</p>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="px-6 py-3 bg-[#f9e2af]/10 border-b border-[#f9e2af]/30 max-h-24 overflow-auto">
            <p className="text-sm text-[#f9e2af] font-medium">Warnings</p>
            {warnings.map((w, i) => (
              <p key={i} className="text-sm text-[#f9e2af]/80 mt-0.5">- {w}</p>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#cdd6f4] hover:bg-[#313244] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            className="px-4 py-2 text-sm font-semibold bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 rounded-lg transition-colors"
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  )
}
