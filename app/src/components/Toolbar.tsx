import type { Language } from '../types/block'

interface ToolbarProps {
  language: Language
  isRunning: boolean
  onRun: () => void
  onStop: () => void
  showCode: boolean
  onToggleCode: () => void
}

export default function Toolbar({
  language,
  isRunning,
  onRun,
  onStop,
  showCode,
  onToggleCode,
}: ToolbarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244] select-none">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-[#89b4fa]" />
          <div className="w-5 h-5 rounded bg-[#f9e2af] -ml-1.5" />
          <div className="w-5 h-5 rounded bg-[#a6e3a1] -ml-1.5" />
        </div>
        <h1 className="text-lg font-bold text-[#cdd6f4] tracking-tight">
          CryptoBlocks
        </h1>
        <span className="text-[10px] text-[#6c7086] bg-[#313244] px-1.5 py-0.5 rounded font-mono">
          v0.1
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Peek toggle */}
        <button
          onClick={onToggleCode}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            showCode
              ? 'bg-[#cba6f7] text-[#1e1e2e]'
              : 'text-[#cdd6f4] hover:bg-[#313244]'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          {showCode ? 'Hide Code' : 'Peek Code'}
        </button>

        {/* Language indicator */}
        <div className="text-xs text-[#6c7086] bg-[#313244] px-2 py-1 rounded font-mono">
          {language === 'javascript' ? 'JS' : 'PY'}
        </div>

        {/* Run / Stop */}
        {isRunning ? (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Run
          </button>
        )}
      </div>
    </header>
  )
}
