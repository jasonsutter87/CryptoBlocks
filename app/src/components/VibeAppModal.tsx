import { useState, useCallback, useRef, useEffect } from 'react'
import { getComposer } from '../vibe/composer'
import {
  brickTreeToWorkspace,
  BrickTreeError,
  type BrickTreeConversion,
} from '../converters/brick-tree-to-workspace'

interface VibeAppModalProps {
  onLoad: (result: BrickTreeConversion) => void
  onClose: () => void
}

const EXAMPLES = [
  'say hello',
  'make a string hello, hash it, print it',
  'print 42',
]

type Status =
  | { kind: 'idle' }
  | { kind: 'building' }
  | { kind: 'built'; conversion: BrickTreeConversion; output?: string; bricks: string[] }
  | { kind: 'abstain'; reason: string }

export default function VibeAppModal({ onLoad, onClose }: VibeAppModalProps) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [composer] = useState(getComposer)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const build = useCallback(async (text: string) => {
    const request = text.trim()
    if (!request) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setStatus({ kind: 'building' })

    try {
      const result = await composer.compose(request, ctrl.signal)
      if (!result.ok) {
        setStatus({ kind: 'abstain', reason: result.reason })
        return
      }
      const conversion = brickTreeToWorkspace(result.tree)
      setStatus({ kind: 'built', conversion, output: result.output, bricks: result.bricks })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const reason = err instanceof BrickTreeError
        ? `I built it, but some of it can't be shown as blocks yet: ${err.message}`
        : 'Something went wrong while building.'
      setStatus({ kind: 'abstain', reason })
    }
  }, [composer])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      build(prompt)
    }
  }, [build, prompt])

  const building = status.kind === 'building'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-base border border-surface-0 rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-0">
          <div>
            <h2 className="text-xl font-bold text-text">My First Vibe App</h2>
            <p className="text-sm text-overlay mt-0.5">Say what you want. Get the blocks that do it.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-0 transition-colors text-overlay hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prompt */}
        <div className="px-6 py-4 border-b border-surface-0">
          <textarea
            autoFocus
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Try "say hello"'
            rows={3}
            className="w-full bg-mantle border border-surface-0 rounded-lg text-text text-sm p-3 resize-none outline-none focus:border-purple"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setPrompt(ex); build(ex) }}
                disabled={building}
                className="px-3 py-1 text-xs text-subtext bg-surface-0 hover:bg-surface-1 rounded-full transition-colors disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {status.kind === 'building' && (
          <div className="px-6 py-4 border-b border-surface-0 text-sm text-overlay">Building your blocks…</div>
        )}
        {status.kind === 'abstain' && (
          <div className="px-6 py-3 bg-warn/10 border-b border-warn/30">
            <p className="text-sm text-warn">{status.reason}</p>
          </div>
        )}
        {status.kind === 'built' && (
          <div className="px-6 py-4 border-b border-surface-0 space-y-3 overflow-auto">
            <div>
              <p className="text-xs font-semibold text-overlay uppercase tracking-wide">Blocks used</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {status.bricks.map((b) => (
                  <span key={b} className="px-2 py-0.5 text-xs font-mono text-text bg-surface-0 rounded">{b}</span>
                ))}
              </div>
            </div>
            {status.output !== undefined && (
              <div>
                <p className="text-xs font-semibold text-overlay uppercase tracking-wide">It prints</p>
                <pre className="mt-1.5 text-xs font-mono text-success bg-mantle rounded p-2 whitespace-pre-wrap break-all">{status.output}</pre>
              </div>
            )}
            {status.conversion.warnings.length > 0 && (
              <div className="text-xs text-warn">
                {status.conversion.warnings.map((w, i) => <p key={i}>- {w}</p>)}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <p className="text-xs text-overlay">
            {status.kind === 'built' ? 'This replaces what’s on your workspace.' : `Engine: ${composer.name}`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text hover:bg-surface-0 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {status.kind === 'built' ? (
              <button
                onClick={() => onLoad(status.conversion)}
                className="px-4 py-2 text-sm font-semibold bg-success text-base hover:bg-success/80 rounded-lg transition-colors"
              >
                Show me the blocks
              </button>
            ) : (
              <button
                onClick={() => build(prompt)}
                disabled={building || !prompt.trim()}
                className="px-4 py-2 text-sm font-semibold bg-purple text-base hover:bg-purple/80 rounded-lg transition-colors disabled:opacity-50"
              >
                {building ? 'Building…' : 'Build it'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
