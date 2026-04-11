/**
 * Floating controls layered over the Blockly workspace, alongside Blockly's
 * own built-in trash + zoom buttons. Used for workspace-adjacent toggles
 * that are distracting in the main toolbar (Time Travel, Slow-Mo).
 */

interface WorkspaceFloatingControlsProps {
  slowMo: boolean
  onToggleSlowMo: () => void
  slowMoDisabled?: boolean
  onEnterTimeTravel?: () => void
  timeTravelAvailable?: boolean
}

export default function WorkspaceFloatingControls({
  slowMo,
  onToggleSlowMo,
  slowMoDisabled,
  onEnterTimeTravel,
  timeTravelAvailable,
}: WorkspaceFloatingControlsProps) {
  return (
    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 pointer-events-none">
      {onEnterTimeTravel && (
        <button
          type="button"
          onClick={onEnterTimeTravel}
          disabled={!timeTravelAvailable}
          title="Time Travel — scrub through your recent history"
          aria-label="Time Travel"
          className={`pointer-events-auto w-9 h-9 flex items-center justify-center rounded-lg bg-[#181825]/90 backdrop-blur border border-[#313244] text-[#cdd6f4] hover:bg-[#313244] hover:border-[#45475a] shadow-lg transition-colors ${!timeTravelAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={onToggleSlowMo}
        disabled={slowMoDisabled}
        title="Slow-Mo — highlight blocks as they run"
        aria-label="Slow-Mo"
        className={`pointer-events-auto w-9 h-9 flex items-center justify-center rounded-lg backdrop-blur border shadow-lg transition-colors ${
          slowMo
            ? 'bg-[#f9e2af] border-[#f9e2af] text-[#1e1e2e]'
            : 'bg-[#181825]/90 border-[#313244] text-[#cdd6f4] hover:bg-[#313244] hover:border-[#45475a]'
        } ${slowMoDisabled ? 'opacity-40 cursor-not-allowed' : ''} ${slowMo && slowMoDisabled ? 'animate-pulse' : ''}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  )
}
