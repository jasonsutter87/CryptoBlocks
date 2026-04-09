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
    body: 'This is your toolbox on the left. All your blocks live here, organized by category.',
    target: '.blocklyToolboxDiv',
    position: 'right',
  },
  {
    title: 'Drag a Block',
    body: 'Click the Basics category, then drag a Print block onto the workspace.',
    target: '.blocklyMainBackground',
    position: 'top',
  },
  {
    title: 'Blocks Need Values',
    body: 'Blocks have slots that need values. Click the Values category on the left.',
    target: '.blocklyToolboxDiv',
    position: 'right',
  },
  {
    title: 'Connect a Text Block',
    body: "Drag a text block and drop it INSIDE the Print block's slot. They'll snap together.",
    target: '.blocklyMainBackground',
    position: 'top',
  },
  {
    title: 'Type Your Message',
    body: 'Click the text inside the block to edit it. Type anything!',
    target: '.blocklyMainBackground',
    position: 'top',
  },
  {
    title: 'Run Your Code',
    body: 'Click the green Run button at the top to execute your blocks.',
    target: 'button[aria-label="Run"]',
    position: 'bottom',
  },
  {
    title: 'See the Output',
    body: 'Your message appears in the console panel on the right.',
    target: '.output-panel',
    position: 'left',
  },
  {
    title: 'Slow-Mo Debugger',
    body: 'Click Slow-Mo to watch your blocks light up one at a time as they run. Great for debugging!',
    target: 'button[title*="Slow"]',
    position: 'bottom',
  },
  {
    title: 'Peek the Code',
    body: 'Want to see the real JavaScript your blocks generate? Click Show Code any time.',
    target: 'button[aria-label="Show Code"]',
    position: 'bottom',
  },
  {
    title: 'You got this! 🎉',
    body: "That's the basics! Explore challenges, examples, and the Shareplace from the menus. Have fun!",
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

interface TooltipPosition {
  top: number
  left: number
}

function getTargetRect(selector: string | null): TargetRect | null {
  if (!selector) return null
  const el = document.querySelector(selector)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

const TOOLTIP_WIDTH = 280
const TOOLTIP_HEIGHT = 180
const GAP = 12
const PADDING = 8

function computeTooltipPosition(
  rect: TargetRect | null,
  position: TutorialStep['position'],
): TooltipPosition {
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (!rect || position === 'center') {
    return {
      top: vh / 2 - TOOLTIP_HEIGHT / 2,
      left: vw / 2 - TOOLTIP_WIDTH / 2,
    }
  }

  let top = 0
  let left = 0

  switch (position) {
    case 'right':
      top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2
      left = rect.left + rect.width + GAP
      break
    case 'left':
      top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2
      left = rect.left - TOOLTIP_WIDTH - GAP
      break
    case 'bottom':
      top = rect.top + rect.height + GAP
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2
      break
    case 'top':
      top = rect.top - TOOLTIP_HEIGHT - GAP
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2
      break
  }

  // Clamp to viewport
  top = Math.max(PADDING, Math.min(top, vh - TOOLTIP_HEIGHT - PADDING))
  left = Math.max(PADDING, Math.min(left, vw - TOOLTIP_WIDTH - PADDING))

  return { top, left }
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

  const updateRect = useCallback(() => {
    setTargetRect(getTargetRect(step.target))
  }, [step.target])

  useEffect(() => {
    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [updateRect])

  const handleNext = () => {
    if (isLast) {
      handleFinish()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onFinish()
  }

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onSkip()
  }

  const tooltipPos = computeTooltipPosition(targetRect, step.position)
  const showSpotlight = targetRect && step.target

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay — rendered as four quadrant divs around the spotlight */}
      {showSpotlight ? (
        <>
          {/* Top strip */}
          <div
            className="absolute bg-black/60 pointer-events-auto"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, targetRect!.top - 4),
            }}
            onClick={handleSkip}
          />
          {/* Bottom strip */}
          <div
            className="absolute bg-black/60 pointer-events-auto"
            style={{
              top: targetRect!.top + targetRect!.height + 4,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={handleSkip}
          />
          {/* Left strip (between top and bottom strips) */}
          <div
            className="absolute bg-black/60 pointer-events-auto"
            style={{
              top: Math.max(0, targetRect!.top - 4),
              left: 0,
              width: Math.max(0, targetRect!.left - 4),
              height: targetRect!.height + 8,
            }}
            onClick={handleSkip}
          />
          {/* Right strip */}
          <div
            className="absolute bg-black/60 pointer-events-auto"
            style={{
              top: Math.max(0, targetRect!.top - 4),
              left: targetRect!.left + targetRect!.width + 4,
              right: 0,
              height: targetRect!.height + 8,
            }}
            onClick={handleSkip}
          />
          {/* Spotlight border ring */}
          <div
            className="absolute rounded border-2 border-[#89b4fa] pointer-events-none"
            style={{
              top: targetRect!.top - 4,
              left: targetRect!.left - 4,
              width: targetRect!.width + 8,
              height: targetRect!.height + 8,
            }}
          />
        </>
      ) : (
        /* Full overlay when no target */
        <div
          className="absolute inset-0 bg-black/60 pointer-events-auto"
          onClick={handleSkip}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl pointer-events-auto"
        style={{
          width: TOOLTIP_WIDTH,
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
      >
        {/* Step counter */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <span className="text-[#6c7086] text-xs font-mono">
            {stepIndex + 1} / {TUTORIAL_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors text-xs"
          >
            Skip Tour
          </button>
        </div>

        <div className="px-4 pt-2 pb-4">
          <h3 className="text-[#cdd6f4] font-semibold text-sm mb-1">{step.title}</h3>
          <p className="text-[#a6adc8] text-xs leading-relaxed mb-4">{step.body}</p>

          {/* Progress dots */}
          <div className="flex gap-1 mb-4">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === stepIndex
                    ? 'bg-[#89b4fa] w-4'
                    : i < stepIndex
                    ? 'bg-[#45475a] w-2'
                    : 'bg-[#313244] w-2'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-xs text-[#a6adc8] hover:text-[#cdd6f4] bg-[#313244] hover:bg-[#45475a] rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-3 py-1.5 text-xs font-semibold bg-[#89b4fa] hover:bg-[#89b4fa]/80 text-[#1e1e2e] rounded-lg transition-colors"
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
