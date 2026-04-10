/**
 * Matrix Rain — fullscreen digital rain effect.
 * "Wake up, Neo..." intro, then green rain cascades over the page.
 * Press ESC or click to exit.
 *
 * Launched from the HackerTerminal `matrix` command.
 */

const CHARS = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const FONT_SIZE = 16
const FADE_ALPHA = 0.04

export function launchMatrixRain(): void {
  // Intro overlay
  const overlay = document.createElement('div')
  overlay.id = 'matrix-intro-overlay'
  overlay.innerHTML = `
    <style>
      #matrix-intro-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: #000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: 'Fira Code', 'Courier New', monospace;
      }
      .matrix-wake-text {
        color: #00ff00;
        font-size: 2.5rem;
        font-weight: bold;
        text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
        opacity: 0;
        animation: matrixFadeIn 2s ease forwards;
      }
      .matrix-subtitle-text {
        color: #008800;
        font-size: 1rem;
        margin-top: 16px;
        opacity: 0;
        animation: matrixFadeIn 1.5s ease 1s forwards;
      }
      .matrix-hint {
        color: #004400;
        font-size: 0.75rem;
        margin-top: 40px;
        opacity: 0;
        animation: matrixFadeIn 1s ease 2s forwards;
      }
      @keyframes matrixFadeIn {
        to { opacity: 1; }
      }
      @keyframes matrixGlitch {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-3px, 2px); }
        40% { transform: translate(2px, -1px); }
        60% { transform: translate(-1px, -2px); }
        80% { transform: translate(3px, 1px); }
      }
    </style>
    <div class="matrix-wake-text" style="animation: matrixFadeIn 2s ease forwards, matrixGlitch 0.15s ease infinite 2s;">WAKE UP, NEO...</div>
    <div class="matrix-subtitle-text">The Matrix has you.</div>
    <div class="matrix-hint">Press ESC to unplug</div>
  `
  document.body.appendChild(overlay)

  setTimeout(() => {
    overlay.style.transition = 'opacity 1s'
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.remove()
      startRain()
    }, 1000)
  }, 3000)
}

function startRain(): void {
  // Dark background overlay
  const bg = document.createElement('div')
  bg.id = 'matrix-bg'
  bg.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:999997;'
  document.body.appendChild(bg)

  // Canvas for rain
  const canvas = document.createElement('canvas')
  canvas.id = 'matrix-canvas'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:999998;pointer-events:none;'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const columns = Math.floor(canvas.width / FONT_SIZE)
  const drops: number[] = []

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -50
  }

  // Exit UI
  const exitHint = document.createElement('div')
  exitHint.id = 'matrix-exit-hint'
  exitHint.textContent = 'ESC to unplug'
  exitHint.style.cssText = `
    position:fixed;bottom:20px;right:20px;z-index:999999;
    color:#004400;font-family:'Fira Code',monospace;font-size:0.75rem;
    pointer-events:none;
  `
  document.body.appendChild(exitHint)

  let animFrame: number

  function draw() {
    ctx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = `${FONT_SIZE}px 'Fira Code', monospace`

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)]
      const y = drops[i] * FONT_SIZE

      // Lead character is bright white-green
      if (drops[i] > 0) {
        ctx.fillStyle = '#aaffaa'
        ctx.fillText(char, i * FONT_SIZE, y)

        // Trail chars
        ctx.fillStyle = '#00ff00'
        const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)]
        ctx.fillText(trailChar, i * FONT_SIZE, y - FONT_SIZE)
      }

      ctx.fillStyle = `rgb(0, ${100 + Math.floor(Math.random() * 155)}, 0)`
      ctx.fillText(char, i * FONT_SIZE, y)

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }

    animFrame = requestAnimationFrame(draw)
  }

  animFrame = requestAnimationFrame(draw)

  // Resize handler
  function onResize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', onResize)

  // Cleanup on ESC or click
  function cleanup(e: KeyboardEvent | MouseEvent) {
    if (e instanceof KeyboardEvent && e.key !== 'Escape') return
    cancelAnimationFrame(animFrame)
    canvas.remove()
    bg.remove()
    exitHint.remove()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('keydown', cleanup)
    bg.removeEventListener('click', cleanup)
  }

  window.addEventListener('keydown', cleanup)
  bg.addEventListener('click', cleanup)
}
