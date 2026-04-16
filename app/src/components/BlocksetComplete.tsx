import { useEffect, useState } from 'react'

interface BlocksetCompleteProps {
  onNextBlockset: () => void
  onBackToBlocksets: () => void
  hasNextBlockset: boolean
}

export default function BlocksetComplete({
  onNextBlockset,
  onBackToBlocksets,
  hasNextBlockset,
}: BlocksetCompleteProps) {
  const [showCheck, setShowCheck] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowCheck(true), 200)
    const t2 = setTimeout(() => setShowConfetti(true), 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Confetti */}
      {showConfetti && (
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

      <div className="bg-base border border-surface-0 rounded-2xl p-8 max-w-sm w-full mx-4 text-center relative z-10">
        {/* Checkmark */}
        <div className={`mb-4 transition-all duration-500 ${showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text mb-2">Blockset Complete!</h2>
        <p className="text-sm text-overlay mb-6">Great work following the instructions!</p>

        <div className="flex flex-col gap-2">
          {hasNextBlockset && (
            <button
              onClick={onNextBlockset}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-success text-base hover:bg-success/80 transition-colors"
            >
              Next Blockset →
            </button>
          )}
          <button
            onClick={onBackToBlocksets}
            className="w-full px-4 py-2 text-sm text-overlay hover:text-text transition-colors"
          >
            Back to Blocksets
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
