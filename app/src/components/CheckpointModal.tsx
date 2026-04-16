import { useState, useRef, useEffect } from 'react'

interface CheckpointModalProps {
  onSave: (label: string) => void
  onCancel: () => void
}

export default function CheckpointModal({ onSave, onCancel }: CheckpointModalProps) {
  const [label, setLabel] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && label.trim()) {
      onSave(label.trim())
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-text font-semibold text-base mb-1">Save Checkpoint</h2>
        <p className="text-overlay text-sm mb-4">Give this checkpoint a name so you can find it later.</p>

        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Working loop, before refactor…"
          className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 placeholder-overlay focus:outline-none focus:border-accent transition-colors mb-4"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (label.trim()) onSave(label.trim()) }}
            disabled={!label.trim()}
            className="px-4 py-2 text-sm font-semibold text-base bg-accent hover:bg-accent/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
