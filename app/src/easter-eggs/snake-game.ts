/**
 * Snake Game — the snake eats actual page elements.
 * Apples restore them. Don't hit yourself.
 *
 * Launched from the HackerTerminal `snake` command.
 */

const SNAKE_SPEED = 100
const GRID_SIZE = 20

export function launchSnakeGame(): void {
  // Intro overlay
  const overlay = document.createElement('div')
  overlay.id = 'snake-intro-overlay'
  overlay.innerHTML = `
    <style>
      #snake-intro-overlay {
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
      #snake-intro-overlay .snake-text {
        color: #a6e3a1;
        font-size: 2rem;
        font-weight: bold;
        text-shadow: 0 0 10px #a6e3a1;
        animation: snakePulse 0.5s ease infinite alternate;
      }
      #snake-intro-overlay .snake-icon {
        font-size: 5rem;
        margin: 20px 0;
      }
      #snake-intro-overlay .snake-subtitle {
        color: #585b70;
        font-size: 0.9rem;
        text-align: center;
        line-height: 2;
      }
      @keyframes snakePulse {
        from { transform: scale(1); }
        to { transform: scale(1.05); }
      }
    </style>
    <div class="snake-text">SNAKE MODE</div>
    <div class="snake-icon">🐍</div>
    <div class="snake-subtitle">
      Arrow keys to move<br>
      Eat the page. Collect 🍎 to restore it.<br>
      Don't hit yourself!
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
  const cols = Math.floor(window.innerWidth / GRID_SIZE)
  const rows = Math.floor(window.innerHeight / GRID_SIZE)

  let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]
  let direction = { x: 1, y: 0 }
  let nextDirection = { x: 1, y: 0 }
  let food: { x: number; y: number } | null = null
  let score = 0
  const eatenElements: HTMLElement[] = []
  let gameOver = false
  let timer: ReturnType<typeof setTimeout> | null = null

  function getEdibleElements(): HTMLElement[] {
    const elements: HTMLElement[] = []
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, img, li, td, th, label, div').forEach(el => {
      const htmlEl = el as HTMLElement
      if (htmlEl.id?.includes('snake-')) return
      if (htmlEl.closest('#snake-ui') || htmlEl.closest('#snake-canvas')) return
      const rect = htmlEl.getBoundingClientRect()
      const style = window.getComputedStyle(htmlEl)
      if (rect.width > 10 && rect.height > 10 &&
          rect.width < 500 && rect.height < 200 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !htmlEl.dataset.snakeEaten) {
        elements.push(htmlEl)
      }
    })
    return elements
  }

  // Canvas
  const canvas = document.createElement('canvas')
  canvas.id = 'snake-canvas'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:999998;pointer-events:none;'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!

  // UI
  const ui = document.createElement('div')
  ui.id = 'snake-ui'
  ui.innerHTML = `
    <style>
      #snake-hud {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(17,17,27,0.9);
        color: #a6e3a1;
        padding: 10px 24px;
        font-size: 13px;
        border-radius: 8px;
        z-index: 999999;
        font-family: 'Fira Code', monospace;
        display: flex;
        gap: 24px;
        border: 1px solid #313244;
      }
      #snake-badge {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #11111b;
        color: #a6e3a1;
        padding: 8px 15px;
        font-size: 11px;
        border-radius: 6px;
        z-index: 999999;
        font-family: 'Fira Code', monospace;
        border: 1px solid #313244;
      }
    </style>
    <div id="snake-hud">
      <span>🐍 Score: <span id="snake-score">0</span></span>
      <span>🍎 Eaten: <span id="snake-eaten-count">0</span></span>
      <span>↑↓←→ move</span>
      <span style="color:#585b70">ESC to quit</span>
    </div>
    <div id="snake-badge">🐍 Snake mode active</div>
  `
  document.body.appendChild(ui)

  function spawnFood() {
    food = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    }
  }
  spawnFood()

  function cleanup() {
    if (timer) clearTimeout(timer)
    canvas.remove()
    ui.remove()
    document.removeEventListener('keydown', handleKey)
    // Restore all eaten elements
    for (const el of eatenElements) {
      el.style.opacity = '1'
      el.style.visibility = 'visible'
      delete el.dataset.snakeEaten
    }
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      gameOver = true
      cleanup()
      return
    }
    if (gameOver) return
    switch (e.key) {
      case 'ArrowUp':
        if (direction.y !== 1) nextDirection = { x: 0, y: -1 }
        e.preventDefault()
        break
      case 'ArrowDown':
        if (direction.y !== -1) nextDirection = { x: 0, y: 1 }
        e.preventDefault()
        break
      case 'ArrowLeft':
        if (direction.x !== 1) nextDirection = { x: -1, y: 0 }
        e.preventDefault()
        break
      case 'ArrowRight':
        if (direction.x !== -1) nextDirection = { x: 1, y: 0 }
        e.preventDefault()
        break
    }
  }
  document.addEventListener('keydown', handleKey)

  function gameLoop() {
    if (gameOver) return

    direction = nextDirection

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    }

    // Wrap around
    if (head.x < 0) head.x = cols - 1
    if (head.x >= cols) head.x = 0
    if (head.y < 0) head.y = rows - 1
    if (head.y >= rows) head.y = 0

    // Self collision
    for (const segment of snake) {
      if (segment.x === head.x && segment.y === head.y) {
        gameOver = true
        showGameOver()
        return
      }
    }

    snake.unshift(head)

    // Food collision
    if (food && head.x === food.x && head.y === food.y) {
      score += 10
      const scoreEl = document.getElementById('snake-score')
      if (scoreEl) scoreEl.textContent = String(score)

      // Restore an eaten element
      if (eatenElements.length > 0) {
        const restored = eatenElements.pop()!
        restored.style.opacity = '1'
        restored.style.visibility = 'visible'
        delete restored.dataset.snakeEaten
      }

      spawnFood()
    } else {
      snake.pop()
    }

    // Eat page elements
    const headPx = head.x * GRID_SIZE + GRID_SIZE / 2
    const headPy = head.y * GRID_SIZE + GRID_SIZE / 2

    const edible = getEdibleElements()
    for (const el of edible) {
      const rect = el.getBoundingClientRect()
      if (headPx >= rect.left && headPx <= rect.right &&
          headPy >= rect.top && headPy <= rect.bottom) {
        el.dataset.snakeEaten = 'true'
        el.style.transition = 'opacity 0.3s'
        el.style.opacity = '0'
        setTimeout(() => { el.style.visibility = 'hidden' }, 300)
        eatenElements.push(el)
        const countEl = document.getElementById('snake-eaten-count')
        if (countEl) countEl.textContent = String(eatenElements.length)
        score += 5
        const scoreEl = document.getElementById('snake-score')
        if (scoreEl) scoreEl.textContent = String(score)
        break
      }
    }

    draw()
    timer = setTimeout(gameLoop, SNAKE_SPEED)
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Snake
    snake.forEach((segment, i) => {
      const x = segment.x * GRID_SIZE
      const y = segment.y * GRID_SIZE
      if (i === 0) {
        ctx.font = `${GRID_SIZE}px Arial`
        ctx.fillText('🐍', x, y + GRID_SIZE - 2)
      } else {
        ctx.fillStyle = `hsl(${150 - i * 2}, 80%, ${50 - i}%)`
        ctx.beginPath()
        ctx.roundRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 3)
        ctx.fill()
        ctx.fillStyle = `hsl(${150 - i * 2}, 80%, ${60 - i}%)`
        ctx.beginPath()
        ctx.roundRect(x + 4, y + 4, GRID_SIZE - 8, GRID_SIZE - 8, 2)
        ctx.fill()
      }
    })

    // Food
    if (food) {
      ctx.font = `${GRID_SIZE}px Arial`
      ctx.fillText('🍎', food.x * GRID_SIZE, food.y * GRID_SIZE + GRID_SIZE - 2)
    }
  }

  function showGameOver() {
    const el = document.createElement('div')
    el.id = 'snake-gameover'
    el.innerHTML = `
      <style>
        #snake-gameover-box {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: #11111b;
          color: #f38ba8;
          padding: 40px 50px;
          font-size: 24px;
          border-radius: 16px;
          z-index: 9999999;
          font-family: 'Fira Code', monospace;
          text-align: center;
          border: 2px solid #313244;
        }
        #snake-gameover-box .final-score {
          color: #a6e3a1;
          font-size: 48px;
          margin: 16px 0;
          font-weight: bold;
        }
        #snake-gameover-box .eaten-count {
          color: #f9e2af;
          font-size: 16px;
        }
        #snake-gameover-box .dismiss {
          margin-top: 20px;
          font-size: 13px;
          color: #585b70;
          cursor: pointer;
        }
        #snake-gameover-box .dismiss:hover {
          color: #cdd6f4;
        }
      </style>
      <div id="snake-gameover-box">
        <div>GAME OVER</div>
        <div class="final-score">${score}</div>
        <div class="eaten-count">Elements eaten: ${eatenElements.length}</div>
        <div class="dismiss" onclick="this.closest('#snake-gameover').remove()">click to dismiss</div>
      </div>
    `
    document.body.appendChild(el)

    // Clean up after showing game over
    setTimeout(() => {
      canvas.remove()
      ui.remove()
      document.removeEventListener('keydown', handleKey)
      // Restore elements
      for (const eaten of eatenElements) {
        eaten.style.opacity = '1'
        eaten.style.visibility = 'visible'
        delete eaten.dataset.snakeEaten
      }
    }, 500)
  }

  draw()
  setTimeout(gameLoop, 1000)
}
