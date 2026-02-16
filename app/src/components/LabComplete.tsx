import { useEffect, useState } from 'react'

interface LabCompleteProps {
  onNextExercise: () => void
  onBackToLab: () => void
  hasNextExercise: boolean
}

export default function LabComplete({
  onNextExercise,
  onBackToLab,
  hasNextExercise,
}: LabCompleteProps) {
  const [showContent, setShowContent] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 200)
    const t2 = setTimeout(() => setShowConfetti(true), 400)
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

      <div className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl p-8 max-w-sm w-full mx-4 text-center relative z-10 transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        <h2 className="text-2xl font-bold mb-2 text-[#a6e3a1]">Exercise Complete!</h2>
        <p className="text-sm text-[#6c7086] mb-6">Your code produced the correct output.</p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {hasNextExercise && (
            <button
              onClick={onNextExercise}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 transition-colors"
            >
              Next Exercise →
            </button>
          )}
          <button
            onClick={onBackToLab}
            className="w-full px-4 py-2 text-sm text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
          >
            Back to Code Lab
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
