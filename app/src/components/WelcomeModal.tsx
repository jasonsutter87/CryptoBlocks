interface WelcomeModalProps {
  onStartTour: () => void
  onSkip: () => void
}

const STORAGE_KEY = 'cryptoblocks-tutorial-seen'

export default function WelcomeModal({ onStartTour, onSkip }: WelcomeModalProps) {
  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onSkip()
  }

  const handleStartTour = () => {
    onStartTour()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) handleSkip() }}
    >
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="text-5xl mb-4">🐢</div>
        <h2 className="text-[#cdd6f4] font-bold text-xl mb-2">Welcome to CryptoBlocks!</h2>
        <p className="text-[#a6adc8] text-sm mb-6 leading-relaxed">
          Build apps, games, and websites with drag-and-drop blocks. No typing code required.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleStartTour}
            className="w-full px-4 py-2.5 bg-[#89b4fa] hover:bg-[#89b4fa]/80 text-[#1e1e2e] font-semibold text-sm rounded-lg transition-colors"
          >
            Start Tour
          </button>
          <button
            onClick={handleSkip}
            className="w-full px-4 py-2.5 bg-transparent hover:bg-[#313244] text-[#a6adc8] text-sm rounded-lg transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
