/**
 * DOOM-style raycaster — Wolfenstein-inspired FPS in the hacker terminal aesthetic.
 * WASD to move, mouse/arrows to look. Green phosphor CRT vibe.
 *
 * Launched from the HackerTerminal `doom` command.
 */

export function launchDoomGame(): void {
  // Intro screen
  const overlay = document.createElement('div')
  overlay.id = 'doom-intro-overlay'
  overlay.innerHTML = `
    <style>
      #doom-intro-overlay {
        position: fixed; top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: #000;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        z-index: 999999;
        font-family: 'Fira Code', 'Courier New', monospace;
      }
      .doom-title {
        color: #a6e3a1;
        font-size: 3rem; font-weight: bold;
        text-shadow: 0 0 20px #a6e3a1, 0 0 40px #a6e3a166;
        letter-spacing: 0.3em;
      }
      .doom-skull { font-size: 4rem; margin: 20px 0; }
      .doom-sub {
        color: #585b70; font-size: 0.85rem;
        text-align: center; line-height: 2;
      }
      .doom-key { color: #a6e3a1; }
    </style>
    <div class="doom-title">C R Y P T D O O M</div>
    <div class="doom-skull">💀</div>
    <div class="doom-sub">
      <span class="doom-key">WASD</span> move &nbsp;|&nbsp;
      <span class="doom-key">← →</span> look &nbsp;|&nbsp;
      <span class="doom-key">SPACE</span> shoot &nbsp;|&nbsp;
      <span class="doom-key">ESC</span> quit<br>
      Find and destroy all enemies.
    </div>
  `
  document.body.appendChild(overlay)

  setTimeout(() => {
    overlay.style.transition = 'opacity 0.8s'
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.remove()
      startGame()
    }, 800)
  }, 2000)
}

// ---------------------------------------------------------------------------
// Map
// ---------------------------------------------------------------------------

// 1 = wall, 0 = empty, 2 = enemy spawn
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,0,0,0,1,0,1,1,0,1],
  [1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,0,2,0,0,0,0,2,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,0,2,0,0,0,0,2,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

const MAP_W = MAP[0].length
const MAP_H = MAP.length

interface Enemy {
  x: number
  y: number
  alive: boolean
}

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

function startGame(): void {
  const canvas = document.createElement('canvas')
  canvas.id = 'doom-canvas'
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:crosshair;background:#000;image-rendering:pixelated'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const W = 320
  const H = 200
  canvas.width = W
  canvas.height = H

  // Player state
  let px = 1.5, py = 1.5 // position
  let pa = 0 // angle (radians)
  const moveSpeed = 0.04
  const rotSpeed = 0.03
  const fov = Math.PI / 3 // 60 degree FOV

  // Enemies
  const enemies: Enemy[] = []
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (MAP[y][x] === 2) {
        enemies.push({ x: x + 0.5, y: y + 0.5, alive: true })
        MAP[y][x] = 0
      }
    }
  }

  // Input
  const keys: Record<string, boolean> = {}
  let shooting = false
  let shootFrame = 0
  let alive = true
  let kills = 0
  const totalEnemies = enemies.length

  const onKey = (e: KeyboardEvent, down: boolean) => {
    keys[e.key.toLowerCase()] = down
    if (e.key === 'Escape' && down) cleanup()
    if (e.key === ' ' && down && !shooting) { shooting = true; shootFrame = 8 }
    e.preventDefault()
  }
  const keyDown = (e: KeyboardEvent) => onKey(e, true)
  const keyUp = (e: KeyboardEvent) => onKey(e, false)
  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)

  let animId = 0

  // -----------------------------------------------------------------------
  // Audio — procedural dark ambient soundtrack + SFX via Web Audio API
  // -----------------------------------------------------------------------
  const audio = new AudioContext()
  const masterGain = audio.createGain()
  masterGain.gain.value = 0.3
  masterGain.connect(audio.destination)

  // Bass drone (E1 = 41.2 Hz)
  const drone = audio.createOscillator()
  drone.type = 'sawtooth'
  drone.frequency.value = 41.2
  const droneGain = audio.createGain()
  droneGain.gain.value = 0.15
  const droneFilter = audio.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 120
  drone.connect(droneFilter)
  droneFilter.connect(droneGain)
  droneGain.connect(masterGain)
  drone.start()

  // Sub-bass pulse
  const sub = audio.createOscillator()
  sub.type = 'sine'
  sub.frequency.value = 30
  const subGain = audio.createGain()
  subGain.gain.value = 0.12
  sub.connect(subGain)
  subGain.connect(masterGain)
  sub.start()

  // LFO to modulate drone filter for movement
  const lfo = audio.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.15
  const lfoGain = audio.createGain()
  lfoGain.gain.value = 60
  lfo.connect(lfoGain)
  lfoGain.connect(droneFilter.frequency)
  lfo.start()

  // Eerie high pad
  const pad = audio.createOscillator()
  pad.type = 'sine'
  pad.frequency.value = 330
  const padGain = audio.createGain()
  padGain.gain.value = 0.04
  const padFilter = audio.createBiquadFilter()
  padFilter.type = 'bandpass'
  padFilter.frequency.value = 400
  padFilter.Q.value = 8
  pad.connect(padFilter)
  padFilter.connect(padGain)
  padGain.connect(masterGain)
  pad.start()

  // Slow pitch drift on pad for unease
  const padLfo = audio.createOscillator()
  padLfo.type = 'triangle'
  padLfo.frequency.value = 0.08
  const padLfoGain = audio.createGain()
  padLfoGain.gain.value = 15
  padLfo.connect(padLfoGain)
  padLfoGain.connect(pad.frequency)
  padLfo.start()

  // Shoot SFX
  function playShootSound() {
    const osc = audio.createOscillator()
    osc.type = 'square'
    osc.frequency.value = 150
    osc.frequency.exponentialRampToValueAtTime(40, audio.currentTime + 0.15)
    const g = audio.createGain()
    g.gain.value = 0.25
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.2)
    // Noise burst via distortion
    const dist = audio.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x)) }
    dist.curve = curve
    osc.connect(dist)
    dist.connect(g)
    g.connect(masterGain)
    osc.start()
    osc.stop(audio.currentTime + 0.2)
  }

  // Kill SFX
  function playKillSound() {
    const osc = audio.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 200
    osc.frequency.exponentialRampToValueAtTime(80, audio.currentTime + 0.4)
    const g = audio.createGain()
    g.gain.value = 0.2
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.5)
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    osc.stop(audio.currentTime + 0.5)
  }

  function stopAudio() {
    masterGain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.5)
    setTimeout(() => {
      drone.stop(); sub.stop(); lfo.stop(); pad.stop(); padLfo.stop()
      audio.close()
    }, 600)
  }

  function cleanup() {
    alive = false
    cancelAnimationFrame(animId)
    window.removeEventListener('keydown', keyDown)
    window.removeEventListener('keyup', keyUp)
    stopAudio()
    canvas.remove()
  }

  // Check if position is walkable
  function canWalk(x: number, y: number): boolean {
    const margin = 0.2
    return (
      MAP[Math.floor(y - margin)]?.[Math.floor(x - margin)] === 0 &&
      MAP[Math.floor(y + margin)]?.[Math.floor(x - margin)] === 0 &&
      MAP[Math.floor(y - margin)]?.[Math.floor(x + margin)] === 0 &&
      MAP[Math.floor(y + margin)]?.[Math.floor(x + margin)] === 0
    )
  }

  // Cast a single ray, return distance to wall and side hit
  function castRay(angle: number): { dist: number; side: number; mapX: number; mapY: number } {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    const dx = cos
    const dy = sin

    let mapX = Math.floor(px)
    let mapY = Math.floor(py)

    const deltaDistX = Math.abs(1 / (dx || 1e-10))
    const deltaDistY = Math.abs(1 / (dy || 1e-10))

    let stepX: number, stepY: number
    let sideDistX: number, sideDistY: number

    if (dx < 0) { stepX = -1; sideDistX = (px - mapX) * deltaDistX }
    else { stepX = 1; sideDistX = (mapX + 1 - px) * deltaDistX }

    if (dy < 0) { stepY = -1; sideDistY = (py - mapY) * deltaDistY }
    else { stepY = 1; sideDistY = (mapY + 1 - py) * deltaDistY }

    let side = 0
    for (let i = 0; i < 64; i++) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX
        mapX += stepX
        side = 0
      } else {
        sideDistY += deltaDistY
        mapY += stepY
        side = 1
      }
      if (mapX < 0 || mapX >= MAP_W || mapY < 0 || mapY >= MAP_H) break
      if (MAP[mapY][mapX] === 1) {
        const dist = side === 0
          ? (mapX - px + (1 - stepX) / 2) / (dx || 1e-10)
          : (mapY - py + (1 - stepY) / 2) / (dy || 1e-10)
        return { dist: Math.abs(dist), side, mapX, mapY }
      }
    }
    return { dist: 64, side: 0, mapX, mapY }
  }

  // Z-buffer for sprite clipping
  const zBuffer = new Float32Array(W)

  function render() {
    // Clear
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)

    // Ceiling
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H / 2)

    // Floor
    ctx.fillStyle = '#111'
    ctx.fillRect(0, H / 2, W, H / 2)

    // Raycast walls
    for (let x = 0; x < W; x++) {
      const rayAngle = pa - fov / 2 + (x / W) * fov
      const hit = castRay(rayAngle)

      // Fix fisheye
      const dist = hit.dist * Math.cos(rayAngle - pa)
      zBuffer[x] = dist

      const lineHeight = Math.min(H * 2, Math.floor(H / (dist || 0.01)))
      const drawStart = Math.floor((H - lineHeight) / 2)

      // Green phosphor color — darker on Y-side walls for depth
      const brightness = Math.max(0.15, 1 - dist * 0.08)
      const base = hit.side === 0 ? brightness : brightness * 0.65
      const r = Math.floor(20 * base)
      const g = Math.floor(200 * base)
      const b = Math.floor(50 * base)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x, drawStart, 1, lineHeight)

      // Scanline effect (every other pixel row slightly darker)
      for (let y = drawStart; y < drawStart + lineHeight; y += 2) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(x, y, 1, 1)
      }
    }

    // Render enemies (billboard sprites)
    // Sort back to front
    const sorted = enemies
      .filter((e) => e.alive)
      .map((e) => ({ ...e, dist: Math.hypot(e.x - px, e.y - py) }))
      .sort((a, b) => b.dist - a.dist)

    for (const e of sorted) {
      const dx = e.x - px
      const dy = e.y - py
      let angle = Math.atan2(dy, dx) - pa
      // Normalize angle
      while (angle < -Math.PI) angle += Math.PI * 2
      while (angle > Math.PI) angle -= Math.PI * 2

      if (Math.abs(angle) > fov / 2 + 0.1) continue

      const dist = e.dist * Math.cos(angle)
      if (dist < 0.3) continue

      const spriteHeight = Math.min(H * 2, Math.floor(H / dist))
      const spriteWidth = spriteHeight
      const screenX = Math.floor((angle / fov + 0.5) * W)
      const drawStartX = screenX - spriteWidth / 2
      const drawStartY = (H - spriteHeight) / 2

      // Draw enemy (pixel skull)
      const brightness = Math.max(0.2, 1 - dist * 0.1)
      const er = Math.floor(255 * brightness)
      const eg = Math.floor(80 * brightness)
      const eb = Math.floor(80 * brightness)

      for (let sx = 0; sx < spriteWidth; sx++) {
        const drawX = Math.floor(drawStartX + sx)
        if (drawX < 0 || drawX >= W) continue
        if (zBuffer[drawX] < dist) continue // behind wall

        // Simple skull pattern
        const tx = sx / spriteWidth
        const bodyLeft = 0.25, bodyRight = 0.75
        if (tx < bodyLeft || tx > bodyRight) continue

        const bodyH = spriteHeight * 0.6
        const bodyTop = drawStartY + spriteHeight * 0.15
        ctx.fillStyle = `rgb(${er},${eg},${eb})`
        ctx.fillRect(drawX, bodyTop, 1, bodyH)

        // Eyes (dark holes)
        const eyeY = bodyTop + bodyH * 0.3
        const eyeH = bodyH * 0.15
        if ((tx > 0.33 && tx < 0.43) || (tx > 0.57 && tx < 0.67)) {
          ctx.fillStyle = '#000'
          ctx.fillRect(drawX, eyeY, 1, eyeH)
        }

        // Mouth
        const mouthY = bodyTop + bodyH * 0.65
        const mouthH = bodyH * 0.08
        if (tx > 0.35 && tx < 0.65 && Math.floor(tx * 20) % 2 === 0) {
          ctx.fillStyle = '#000'
          ctx.fillRect(drawX, mouthY, 1, mouthH)
        }
      }
    }

    // Shoot flash
    if (shooting && shootFrame > 0) {
      shootFrame--

      // Muzzle flash
      if (shootFrame > 4) {
        ctx.fillStyle = `rgba(166, 227, 161, ${shootFrame * 0.1})`
        ctx.fillRect(W / 2 - 3, H / 2 - 20, 6, 20)
        ctx.fillStyle = `rgba(255, 255, 200, ${shootFrame * 0.12})`
        ctx.fillRect(W / 2 - 1, H / 2 - 15, 2, 15)
      }

      // Shoot SFX on first frame
      if (shootFrame === 7) {
        playShootSound()
      }

      // Hit check on first frame
      if (shootFrame === 7) {
        // Check center of screen for enemy hit
        for (const e of enemies) {
          if (!e.alive) continue
          const dx = e.x - px
          const dy = e.y - py
          const dist = Math.hypot(dx, dy)
          let angle = Math.atan2(dy, dx) - pa
          while (angle < -Math.PI) angle += Math.PI * 2
          while (angle > Math.PI) angle -= Math.PI * 2

          // Is enemy in crosshair? (within ~5 degrees and in front)
          if (Math.abs(angle) < 0.08 && dist < 10) {
            // Check if wall is blocking
            const wallDist = castRay(pa).dist
            if (dist < wallDist) {
              e.alive = false
              kills++
              playKillSound()
            }
          }
        }
      }

      if (shootFrame === 0) shooting = false
    }

    // Crosshair
    ctx.fillStyle = '#a6e3a1'
    ctx.fillRect(W / 2 - 4, H / 2, 3, 1)
    ctx.fillRect(W / 2 + 2, H / 2, 3, 1)
    ctx.fillRect(W / 2, H / 2 - 4, 1, 3)
    ctx.fillRect(W / 2, H / 2 + 2, 1, 3)

    // Weapon (simple gun shape at bottom)
    ctx.fillStyle = '#444'
    ctx.fillRect(W / 2 - 8, H - 40, 16, 35)
    ctx.fillStyle = '#555'
    ctx.fillRect(W / 2 - 5, H - 45, 10, 10)
    ctx.fillStyle = '#333'
    ctx.fillRect(W / 2 - 2, H - 55, 4, 15)
    // Barrel
    ctx.fillStyle = shooting && shootFrame > 4 ? '#a6e3a1' : '#666'
    ctx.fillRect(W / 2 - 1, H - 60, 2, 8)

    // HUD
    ctx.fillStyle = '#a6e3a1'
    ctx.font = '8px monospace'
    ctx.fillText(`KILLS: ${kills}/${totalEnemies}`, 4, 10)
    ctx.fillText('ESC to quit', W - 62, 10)

    // Minimap (top right)
    const mmSize = 3
    const mmX = W - MAP_W * mmSize - 4
    const mmY = 14
    ctx.globalAlpha = 0.5
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        ctx.fillStyle = MAP[y][x] === 1 ? '#a6e3a1' : '#111'
        ctx.fillRect(mmX + x * mmSize, mmY + y * mmSize, mmSize - 1, mmSize - 1)
      }
    }
    // Player dot
    ctx.fillStyle = '#ff0'
    ctx.fillRect(mmX + Math.floor(px) * mmSize, mmY + Math.floor(py) * mmSize, mmSize - 1, mmSize - 1)
    // Enemy dots
    for (const e of enemies) {
      if (!e.alive) continue
      ctx.fillStyle = '#f00'
      ctx.fillRect(mmX + Math.floor(e.x) * mmSize, mmY + Math.floor(e.y) * mmSize, mmSize - 1, mmSize - 1)
    }
    ctx.globalAlpha = 1

    // Win screen
    if (kills === totalEnemies) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#a6e3a1'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('AREA CLEARED', W / 2, H / 2 - 10)
      ctx.font = '8px monospace'
      ctx.fillText('All enemies eliminated.', W / 2, H / 2 + 10)
      ctx.fillText('Press ESC to exit.', W / 2, H / 2 + 25)
      ctx.textAlign = 'left'
    }

    // CRT scanline overlay
    ctx.fillStyle = 'rgba(0,0,0,0.04)'
    for (let y = 0; y < H; y += 2) {
      ctx.fillRect(0, y, W, 1)
    }

    // Vignette
    const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.4)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  function update() {
    if (!alive) return

    // Movement
    if (keys['w'] || keys['arrowup']) {
      const nx = px + Math.cos(pa) * moveSpeed
      const ny = py + Math.sin(pa) * moveSpeed
      if (canWalk(nx, py)) px = nx
      if (canWalk(px, ny)) py = ny
    }
    if (keys['s'] || keys['arrowdown']) {
      const nx = px - Math.cos(pa) * moveSpeed
      const ny = py - Math.sin(pa) * moveSpeed
      if (canWalk(nx, py)) px = nx
      if (canWalk(px, ny)) py = ny
    }
    if (keys['a']) {
      const nx = px + Math.sin(pa) * moveSpeed
      const ny = py - Math.cos(pa) * moveSpeed
      if (canWalk(nx, py)) px = nx
      if (canWalk(px, ny)) py = ny
    }
    if (keys['d']) {
      const nx = px - Math.sin(pa) * moveSpeed
      const ny = py + Math.cos(pa) * moveSpeed
      if (canWalk(nx, py)) px = nx
      if (canWalk(px, ny)) py = ny
    }
    if (keys['arrowleft']) pa -= rotSpeed
    if (keys['arrowright']) pa += rotSpeed
  }

  function loop() {
    if (!alive) return
    update()
    render()
    animId = requestAnimationFrame(loop)
  }

  loop()
}
