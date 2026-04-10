import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'cryptoblocks-tutorial-seen'

interface TutorialStep {
  title: string
  body: string
  target: string | null
  position: 'right' | 'left' | 'top' | 'bottom' | 'center'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'The Brick Bin',
    body: 'This is your toolbox on the left. All your blocks live here, organized by category. Click any category to see its blocks.',
    target: '.blocklyToolboxDiv',
    position: 'right',
  },
  {
    title: 'Drag a Block',
    body: 'Click the Basics category, then drag a Print block onto the workspace. This is where you build your programs!',
    target: '.blocklySvg',
    position: 'top',
  },
  {
    title: 'Blocks Need Values',
    body: 'Blocks have slots that need values. Open the Values category on the left to find text, number, and boolean blocks.',
    target: '.blocklyToolboxDiv',
    position: 'right',
  },
  {
    title: 'Connect a Text Block',
    body: "Drag a text block and drop it INSIDE the Print block's slot. When the slot glows, let go — they'll snap together!",
    target: '.blocklySvg',
    position: 'top',
  },
  {
    title: 'Type Your Message',
    body: 'Click the text inside the block to edit it. Type anything you want — your name, a joke, or an emoji!',
    target: '.blocklySvg',
    position: 'top',
  },
  {
    title: 'Run Your Code',
    body: 'Click the green Run button to execute your blocks and see what happens.',
    target: '.run-button',
    position: 'bottom',
  },
  {
    title: 'See the Output',
    body: 'Your message appears in the console panel on the right. This is where print output shows up.',
    target: '.output-panel',
    position: 'left',
  },
  {
    title: 'Slow-Mo Debugger',
    body: 'Click Slow-Mo to watch your blocks light up one at a time as they run. Great for understanding what each block does!',
    target: '.slowmo-button',
    position: 'bottom',
  },
  {
    title: 'Show / Hide Code',
    body: 'Toggle the code panel to see the real JavaScript your blocks generate. This is how you bridge blocks → code!',
    target: '.toggle-code-button',
    position: 'bottom',
  },
  {
    title: 'You got this! 🎉',
    body: "That's the basics! Try the challenges from Build → Challenges, explore examples, or just play around. Have fun building!",
    target: null,
    position: 'center',
  },
]

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

const TOOLTIP_W = 380
const TOOLTIP_H = 220
const GAP = 16
const PAD = 12
const ARROW_SIZE = 12

function getTargetRect(selector: string | null): TargetRect | null {
  if (!selector) return null
  const el = document.querySelector(selector)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function computePosition(rect: TargetRect | null, pos: TutorialStep['position']) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (!rect || pos === 'center') {
    return { top: vh / 2 - TOOLTIP_H / 2, left: vw / 2 - TOOLTIP_W / 2 }
  }

  let top = 0, left = 0
  switch (pos) {
    case 'right':
      top = rect.top + rect.height / 2 - TOOLTIP_H / 2
      left = rect.left + rect.width + GAP + ARROW_SIZE
      break
    case 'left':
      top = rect.top + rect.height / 2 - TOOLTIP_H / 2
      left = rect.left - TOOLTIP_W - GAP - ARROW_SIZE
      break
    case 'bottom':
      top = rect.top + rect.height + GAP + ARROW_SIZE
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2
      break
    case 'top':
      top = rect.top - TOOLTIP_H - GAP - ARROW_SIZE
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2
      break
  }

  top = Math.max(PAD, Math.min(top, vh - TOOLTIP_H - PAD))
  left = Math.max(PAD, Math.min(left, vw - TOOLTIP_W - PAD))
  return { top, left }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _Arrow({ position, targetRect, tooltipPos }: { position: string; targetRect: TargetRect | null; tooltipPos: { top: number; left: number } }) {
  if (!targetRect || position === 'center') return null

  const style: React.CSSProperties = {
    position: 'fixed',
    width: 0,
    height: 0,
    zIndex: 102,
  }

  const s = ARROW_SIZE
  switch (position) {
    case 'right':
      style.top = targetRect.top + targetRect.height / 2 - s
      style.left = tooltipPos.left - s * 2
      style.borderTop = `${s}px solid transparent`
      style.borderBottom = `${s}px solid transparent`
      style.borderRight = `${s * 2}px solid #313244`
      break
    case 'left':
      style.top = targetRect.top + targetRect.height / 2 - s
      style.left = tooltipPos.left + TOOLTIP_W
      style.borderTop = `${s}px solid transparent`
      style.borderBottom = `${s}px solid transparent`
      style.borderLeft = `${s * 2}px solid #313244`
      break
    case 'bottom':
      style.top = tooltipPos.top - s * 2
      style.left = targetRect.left + targetRect.width / 2 - s
      style.borderLeft = `${s}px solid transparent`
      style.borderRight = `${s}px solid transparent`
      style.borderBottom = `${s * 2}px solid #313244`
      break
    case 'top':
      style.top = tooltipPos.top + TOOLTIP_H
      style.left = targetRect.left + targetRect.width / 2 - s
      style.borderLeft = `${s}px solid transparent`
      style.borderRight = `${s}px solid transparent`
      style.borderTop = `${s * 2}px solid #313244`
      break
  }

  return <div style={style} />
}

interface TutorialOverlayProps {
  onFinish: () => void
  onSkip: () => void
}

export default function TutorialOverlay({ onFinish, onSkip }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)

  const step = TUTORIAL_STEPS[stepIndex]
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1
  const isFirst = stepIndex === 0

  const updateRect = useCallback(() => {
    setTargetRect(getTargetRect(step.target))
  }, [step.target])

  useEffect(() => {
    updateRect()
    window.addEventListener('resize', updateRect)
    const interval = setInterval(updateRect, 500) // update if layout shifts
    return () => {
      window.removeEventListener('resize', updateRect)
      clearInterval(interval)
    }
  }, [updateRect])

  const done = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleNext = () => {
    if (isLast) { done(); onFinish() }
    else setStepIndex(i => i + 1)
  }
  const handlePrev = () => setStepIndex(i => Math.max(0, i - 1))
  const handleSkip = () => { done(); onSkip() }

  const tooltipPos = computePosition(targetRect, step.position)
  const hasSpotlight = !!targetRect && !!step.target

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight cutout */}
      {hasSpotlight ? (
        <>
          <div className="absolute bg-black/60" style={{ top: 0, left: 0, right: 0, height: Math.max(0, targetRect!.top - 6) }} onClick={handleSkip} />
          <div className="absolute bg-black/60" style={{ top: targetRect!.top + targetRect!.height + 6, left: 0, right: 0, bottom: 0 }} onClick={handleSkip} />
          <div className="absolute bg-black/60" style={{ top: Math.max(0, targetRect!.top - 6), left: 0, width: Math.max(0, targetRect!.left - 6), height: targetRect!.height + 12 }} onClick={handleSkip} />
          <div className="absolute bg-black/60" style={{ top: Math.max(0, targetRect!.top - 6), left: targetRect!.left + targetRect!.width + 6, right: 0, height: targetRect!.height + 12 }} onClick={handleSkip} />
          {/* Spotlight border */}
          <div
            className="absolute rounded-lg pointer-events-none"
            style={{
              top: targetRect!.top - 6,
              left: targetRect!.left - 6,
              width: targetRect!.width + 12,
              height: targetRect!.height + 12,
              border: '3px solid #89b4fa',
              boxShadow: '0 0 20px rgba(137, 180, 250, 0.3)',
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/60" onClick={handleSkip} />
      )}

      {/* Tooltip card */}
      <div
        className="fixed z-[101] bg-[#1e1e2e] border-2 border-[#313244] rounded-2xl shadow-2xl"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TOOLTIP_W,
          minHeight: TOOLTIP_H,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span className="text-xs text-[#6c7086] font-mono">{stepIndex + 1} / {TUTORIAL_STEPS.length}</span>
          <button onClick={handleSkip} className="text-xs text-[#6c7086] hover:text-[#cdd6f4] transition-colors">
            Skip Tour
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <h3 className="text-xl font-bold text-[#cdd6f4] mb-3">{step.title}</h3>
          <p className="text-[#a6adc8] text-sm leading-relaxed">{step.body}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 px-6 pb-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? 'w-4 bg-[#89b4fa]' : i < stepIndex ? 'w-1.5 bg-[#89b4fa]/50' : 'w-1.5 bg-[#313244]'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 px-6 pb-5">
          {!isFirst && (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 text-sm font-medium text-[#a6adc8] hover:text-[#cdd6f4] transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-2.5 text-sm font-semibold bg-[#89b4fa] text-[#1e1e2e] rounded-lg hover:bg-[#89b4fa]/90 transition-colors"
          >
            {isLast ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
