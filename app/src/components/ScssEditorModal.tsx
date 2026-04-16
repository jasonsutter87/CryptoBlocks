import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

interface ScssEditorModalProps {
  initialCode: string
  onSave: (code: string) => void
  onClose: () => void
}

function PlainScssEditor({ code, onChange }: { code: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full bg-base text-[13px] leading-relaxed text-text font-mono resize-none outline-none border-none p-3"
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
    />
  )
}

export default function ScssEditorModal({ initialCode, onSave, onClose }: ScssEditorModalProps) {
  const [code, setCode] = useState(initialCode)
  const [monacoFailed, setMonacoFailed] = useState(false)
  const mountedRef = useRef(false)

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Monaco timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mountedRef.current) setMonacoFailed(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = useCallback(() => {
    onSave(code)
    onClose()
  }, [code, onSave, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col w-[720px] max-w-[95vw] h-[520px] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl bg-mantle border border-surface-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-crust border-b border-surface-0">
          <span className="text-sm font-semibold text-text">Edit SCSS</span>
          <button
            onClick={onClose}
            className="text-overlay hover:text-text transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Monaco editor area */}
        <div className="flex-1 min-h-0">
          {monacoFailed ? (
            <PlainScssEditor code={code} onChange={setCode} />
          ) : (
            <Suspense fallback={<PlainScssEditor code={code} onChange={setCode} />}>
              <MonacoEditor
                language="scss"
                value={code}
                theme="vs-dark"
                loading={<PlainScssEditor code={code} onChange={setCode} />}
                onMount={() => { mountedRef.current = true }}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 12 },
                  renderLineHighlight: 'line',
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  tabCompletion: 'off',
                  acceptSuggestionOnEnter: 'on',
                  parameterHints: { enabled: true },
                  suggest: {
                    showProperties: true,
                    showKeywords: true,
                    showSnippets: true,
                  },
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'hidden',
                  },
                }}
              />
            </Suspense>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 bg-crust border-t border-surface-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-text rounded-md hover:bg-surface-0 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm font-semibold bg-accent text-base rounded-md hover:bg-[#b4d0f7] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
