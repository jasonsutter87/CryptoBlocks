import { EXAMPLES, type Example } from '../examples'

interface ExamplesBrowserProps {
  onSelectExample: (example: Example) => void
  onClose: () => void
}

const difficultyColor = (d: string) => {
  switch (d) {
    case 'beginner': return 'bg-[#a6e3a1] text-[#1e1e2e]'
    case 'intermediate': return 'bg-[#f9e2af] text-[#1e1e2e]'
    case 'advanced': return 'bg-[#f38ba8] text-[#1e1e2e]'
    default: return 'bg-[#6c7086] text-[#cdd6f4]'
  }
}

export default function ExamplesBrowser({ onSelectExample, onClose }: ExamplesBrowserProps) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244]">
          <div>
            <h2 className="text-xl font-bold text-[#cdd6f4]">Example Projects</h2>
            <p className="text-sm text-[#6c7086] mt-0.5">Pick one to load into your workspace</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#313244] transition-colors text-[#6c7086] hover:text-[#cdd6f4]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLES.map((example) => (
              <button
                key={example.id}
                onClick={() => onSelectExample(example)}
                className="text-left p-4 rounded-xl border border-[#313244] hover:border-[#45475a] hover:bg-[#313244]/50 transition-all group"
              >
                {/* Name + Difficulty */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-[#cdd6f4] group-hover:text-white transition-colors">
                    {example.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(example.difficulty)}`}>
                    {example.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-[#6c7086] leading-snug mb-3">
                  {example.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {example.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#313244] text-[#a6adc8] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
