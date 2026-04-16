import { useEffect, useState } from 'react'

interface ChallengeCompleteProps {
  stars: number
  blockCount: number
  par: number
  onNextChallenge: () => void
  onBackToChallenges: () => void
  onRetry: () => void
  hasNextChallenge: boolean
}

export default function ChallengeComplete({
  stars,
  blockCount,
  par,
  onNextChallenge,
  onBackToChallenges,
  onRetry,
  hasNextChallenge,
}: ChallengeCompleteProps) {
  const [animatedStars, setAnimatedStars] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Animate stars one by one
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= stars; i++) {
      timers.push(setTimeout(() => setAnimatedStars(i), i * 300))
    }
    // Show confetti after stars
    timers.push(setTimeout(() => setShowConfetti(true), stars * 300 + 200))
    return () => timers.forEach(clearTimeout)
  }, [stars])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
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

      {/* Card */}
      <div className="bg-base border border-surface-0 rounded-2xl p-8 max-w-sm w-full mx-4 text-center relative z-10">
        <h2 className="text-2xl font-bold text-text mb-4">
          {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great Job!' : 'Completed!'}
        </h2>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`text-4xl transition-all duration-300 ${
                i < animatedStars
                  ? 'text-warn scale-100 opacity-100'
                  : 'text-surface-1 scale-75 opacity-50'
              }`}
              style={{
                transitionDelay: `${i * 100}ms`,
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-surface-0 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-text">
            You used <span className="font-bold text-accent">{blockCount}</span> blocks
            <span className="text-overlay"> (par: {par})</span>
          </p>
          {stars === 1 && (
            <p className="text-xs text-warn mt-1">Try again with fewer blocks for more stars!</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {hasNextChallenge && (
            <button
              onClick={onNextChallenge}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-success text-base hover:bg-success/80 transition-colors"
            >
              Next Challenge →
            </button>
          )}
          {stars < 3 && (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-surface-0 text-text hover:bg-surface-1 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onBackToChallenges}
            className="w-full px-4 py-2 text-sm text-overlay hover:text-text transition-colors"
          >
            Back to Challenges
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
