import { useEffect, useState } from 'react'

interface GolfCompleteProps {
  blockCount: number
  par: number
  isNewBest: boolean
  onRetry: () => void
  onNextProblem: () => void
  onBackToGolf: () => void
  hasNextProblem: boolean
}

export default function GolfComplete({
  blockCount,
  par,
  isNewBest,
  onRetry,
  onNextProblem,
  onBackToGolf,
  hasNextProblem,
}: GolfCompleteProps) {
  const [showContent, setShowContent] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const underPar = blockCount < par
  const onPar = blockCount === par
  const overPar = blockCount > par

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 200)
    const t2 = setTimeout(() => setShowConfetti(true), 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const ratingText = underPar ? 'Under Par!' : onPar ? 'On Par!' : 'Over Par'
  const ratingColor = underPar ? 'text-success' : onPar ? 'text-accent' : 'text-warn'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Confetti for at/under par */}
      {showConfetti && !overPar && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`,
                backgroundColor: ['#89b4fa', '#a6e3a1', '#f9e2af', '#cba6f7', '#f38ba8'][i % 5],
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      <div className={`bg-base border border-surface-0 rounded-2xl p-8 max-w-sm w-full mx-4 text-center relative z-10 transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        {/* Rating */}
        <h2 className={`text-2xl font-bold mb-2 ${ratingColor}`}>{ratingText}</h2>

        {isNewBest && (
          <p className="text-xs text-purple font-medium mb-3">New Personal Best!</p>
        )}

        {/* Score card */}
        <div className="bg-surface-0 rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-xs text-overlay">Your Blocks</div>
              <div className={`text-2xl font-bold ${ratingColor}`}>{blockCount}</div>
            </div>
            <div className="text-overlay text-lg">vs</div>
            <div className="text-center">
              <div className="text-xs text-overlay">Par</div>
              <div className="text-2xl font-bold text-accent">{par}</div>
            </div>
          </div>
          {overPar && (
            <p className="text-xs text-warn mt-2">Try again with fewer blocks to reach par!</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {hasNextProblem && !overPar && (
            <button
              onClick={onNextProblem}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-success text-base hover:bg-success/80 transition-colors"
            >
              Next Problem →
            </button>
          )}
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-surface-0 text-text hover:bg-surface-1 transition-colors"
          >
            {overPar ? 'Try Again — Beat Par!' : 'Try Again — Beat Your Score!'}
          </button>
          <button
            onClick={onBackToGolf}
            className="w-full px-4 py-2 text-sm text-overlay hover:text-text transition-colors"
          >
            Back to Code Golf
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}
