/**
 * Space Invaders — aliens abduct your page elements.
 * Shoot them down to save your content!
 *
 * Launched from the HackerTerminal `invaders` command.
 */

export function launchInvadersGame(): void {
  const overlay = document.createElement('div')
  overlay.id = 'invaders-intro-overlay'
  overlay.innerHTML = `
    <style>
      #invaders-intro-overlay {
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
      .invaders-text {
        color: #89b4fa;
        font-size: 2.5rem;
        font-weight: bold;
        text-shadow: 0 0 10px #89b4fa;
      }
      .invaders-icon {
        font-size: 4rem;
        margin: 20px 0;
        animation: invaderWiggle 0.3s ease infinite alternate;
      }
      .invaders-subtitle {
        color: #585b70;
        font-size: 0.9rem;
        text-align: center;
        line-height: 2;
      }
      @keyframes invaderWiggle {
        from { transform: translateX(-5px); }
        to { transform: translateX(5px); }
      }
    </style>
    <div class="invaders-text">SPACE INVADERS</div>
    <div class="invaders-icon">👾 👾 👾</div>
    <div class="invaders-subtitle">
      ← → to move &nbsp;|&nbsp; SPACE to shoot<br>
      Defend your webpage!<br>
      Aliens will abduct your content!
    </div>
  `
  document.body.appendChild(overlay)

  setTimeout(() => {
    overlay.style.transition = 'opacity 1s'
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.remove()
      startGame()
    }, 1000)
  }, 2500)
}

function startGame(): void {
  const ALIEN_ROWS = 3
  const ALIEN_COLS = 8
  let alienSpeedBase = 1

  const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight - 60,
    width: 50,
    speed: 8,
  }

  let aliens: Array<{ x: number; y: number; width: number; height: number; emoji: string; alive: boolean }> = []
  let bullets: Array<{ x: number; y: number; width: number; height: number; speed: number }> = []
  let alienBullets: Array<{ x: number; y: number; width: number; height: number; speed: number }> = []
  let alienDirection = 1
  let score = 0
  const abductedElements: HTMLElement[] = []
  let gameOver = false
  let animFrame: number | null = null

  const alienEmojis = ['👾', '👽', '🛸']

  function initAliens() {
    aliens = []
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        aliens.push({
          x: 50 + col * 60,
          y: 50 + row * 50,
          width: 40,
          height: 40,
          emoji: alienEmojis[row % alienEmojis.length],
          alive: true,
        })
      }
    }
  }
  initAliens()

  function getAbductableElements(): HTMLElement[] {
    const elements: HTMLElement[] = []
    document.querySelectorAll('p, h1, h2, h3, img, button, a, span, div').forEach(el => {
      const htmlEl = el as HTMLElement
      if (htmlEl.id?.includes('invaders-')) return
      if (htmlEl.closest('#invaders-ui') || htmlEl.closest('#invaders-canvas')) return
      const rect = htmlEl.getBoundingClientRect()
      const style = window.getComputedStyle(htmlEl)
      if (rect.width > 20 && rect.height > 10 &&
          rect.width < 400 && rect.height < 150 &&
          rect.bottom > window.innerHeight - 200 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !htmlEl.dataset.abducted) {
        elements.push(htmlEl)
      }
    })
    return elements
  }

  // Canvas
  const canvas = document.createElement('canvas')
  canvas.id = 'invaders-canvas'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:999998;'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!

  // UI
  const ui = document.createElement('div')
  ui.id = 'invaders-ui'
  ui.innerHTML = `
    <style>
      #invaders-hud {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(17,17,27,0.9);
        color: #89b4fa;
        padding: 10px 24px;
        font-size: 13px;
        border-radius: 8px;
        z-index: 999999;
        font-family: 'Fira Code', monospace;
        display: flex;
        gap: 24px;
        border: 1px solid #313244;
      }
      #invaders-badge {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #11111b;
        color: #89b4fa;
        padding: 8px 15px;
        font-size: 11px;
        border-radius: 6px;
        z-index: 999999;
        font-family: 'Fira Code', monospace;
        border: 1px solid #313244;
      }
    </style>
    <div id="invaders-hud">
      <span>👾 Score: <span id="invaders-score">0</span></span>
      <span>🛸 Abducted: <span id="invaders-abducted">0</span></span>
      <span>←→ SPACE</span>
      <span style="color:#585b70">ESC to quit</span>
    </div>
    <div id="invaders-badge">👾 Invasion in progress</div>
  `
  document.body.appendChild(ui)

  const keys: Record<string, boolean> = {}

  function cleanup() {
    if (animFrame) cancelAnimationFrame(animFrame)
    canvas.remove()
    ui.remove()
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    for (const el of abductedElements) {
      el.style.opacity = '1'
      el.style.visibility = 'visible'
      el.style.transform = ''
      delete el.dataset.abducted
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      gameOver = true
      cleanup()
      return
    }
    keys[e.key] = true
    if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
    }
    if (e.key === ' ' && !gameOver) {
      bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 15,
        speed: 10,
      })
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    keys[e.key] = false
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  function update() {
    if (gameOver) return

    // Move player
    if (keys['ArrowLeft']) player.x -= player.speed
    if (keys['ArrowRight']) player.x += player.speed
    player.x = Math.max(0, Math.min(window.innerWidth - player.width, player.x))

    // Move bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= bullets[i].speed
      if (bullets[i].y < 0) bullets.splice(i, 1)
    }

    // Move aliens
    let hitEdge = false
    let lowestAlien = 0
    for (const alien of aliens) {
      if (!alien.alive) continue
      alien.x += alienSpeedBase * alienDirection
      if (alien.x <= 0 || alien.x >= window.innerWidth - alien.width) hitEdge = true
      if (alien.y > lowestAlien) lowestAlien = alien.y
    }
    if (hitEdge) {
      alienDirection *= -1
      for (const alien of aliens) alien.y += 20
    }

    // Abduct elements when aliens reach bottom
    if (lowestAlien > window.innerHeight - 150) {
      const elements = getAbductableElements()
      if (elements.length > 0) {
        const el = elements[Math.floor(Math.random() * elements.length)]
        el.dataset.abducted = 'true'
        el.style.transition = 'all 0.5s'
        el.style.transform = 'translateY(-100vh) scale(0)'
        el.style.opacity = '0'
        setTimeout(() => { el.style.visibility = 'hidden' }, 500)
        abductedElements.push(el)
        const countEl = document.getElementById('invaders-abducted')
        if (countEl) countEl.textContent = String(abductedElements.length)
      }
      for (const alien of aliens) alien.y -= 100
    }

    // Bullet-alien collision
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi]
      for (const alien of aliens) {
        if (!alien.alive) continue
        if (b.x < alien.x + alien.width && b.x + b.width > alien.x &&
            b.y < alien.y + alien.height && b.y + b.height > alien.y) {
          alien.alive = false
          bullets.splice(bi, 1)
          score += 100
          const scoreEl = document.getElementById('invaders-score')
          if (scoreEl) scoreEl.textContent = String(score)
          break
        }
      }
    }

    // New wave
    if (aliens.every(a => !a.alive)) {
      alienSpeedBase += 0.5
      initAliens()
    }

    // Alien shooting
    if (Math.random() < 0.01) {
      const alive = aliens.filter(a => a.alive)
      if (alive.length > 0) {
        const shooter = alive[Math.floor(Math.random() * alive.length)]
        alienBullets.push({
          x: shooter.x + shooter.width / 2 - 3,
          y: shooter.y + shooter.height,
          width: 6,
          height: 10,
          speed: 5,
        })
      }
    }

    // Move alien bullets
    for (let i = alienBullets.length - 1; i >= 0; i--) {
      alienBullets[i].y += alienBullets[i].speed
      if (alienBullets[i].y > window.innerHeight) {
        alienBullets.splice(i, 1)
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Player
    ctx.font = '40px Arial'
    ctx.fillText('🚀', player.x, player.y + 35)

    // Aliens
    for (const alien of aliens) {
      if (!alien.alive) continue
      ctx.font = '35px Arial'
      ctx.fillText(alien.emoji, alien.x, alien.y + 35)
    }

    // Bullets
    ctx.fillStyle = '#a6e3a1'
    for (const b of bullets) ctx.fillRect(b.x, b.y, b.width, b.height)

    // Alien bullets
    ctx.fillStyle = '#f38ba8'
    for (const b of alienBullets) ctx.fillRect(b.x, b.y, b.width, b.height)
  }

  function gameLoop() {
    if (gameOver) return
    update()
    draw()
    animFrame = requestAnimationFrame(gameLoop)
  }

  gameLoop()
}
