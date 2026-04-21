/**
 * WOPR — War Operation Plan Response
 *
 * WarGames-inspired easter egg. Type `wopr` in the hacker terminal.
 * Shows QR code → phone becomes a phreaker → logs into WOPR →
 * thermonuclear war simulation → "the only winning move is not to play" →
 * launches CryptDOOM.
 *
 * Homage to the 1983 film. The Ready Player One of CryptoBlocks.
 */

import { launchDoomGame } from './doom-game'
import QRCode from 'qrcode'

// ─── Types ───────────────────────────────────────────────────────────

interface TerminalAPI {
  addLine: (text: string, color?: string) => void
  addLines: (...lines: { text: string; color?: string }[]) => void
  clear: () => void
  close: () => void
}

// ─── WOPR ASCII Art ──────────────────────────────────────────────────

const WOPR_BOOT = [
  '',
  '  ██╗    ██╗ ██████╗ ██████╗ ██████╗',
  '  ██║    ██║██╔═══██╗██╔══██╗██╔══██╗',
  '  ██║ █╗ ██║██║   ██║██████╔╝██████╔╝',
  '  ██║███╗██║██║   ██║██╔═══╝ ██╔══██╗',
  '  ╚███╔███╔╝╚██████╔╝██║     ██║  ██║',
  '   ╚══╝╚══╝  ╚═════╝ ╚═╝     ╚═╝  ╚═╝',
  '',
  '  WAR OPERATION PLAN RESPONSE',
  '  NORAD STRATEGIC DEFENSE SYSTEM',
  '  ══════════════════════════════════════',
  '',
]

const WAR_TARGETS = [
  'LAS VEGAS',
  'SEATTLE',
  'NEW YORK',
  'CHICAGO',
  'LOS ANGELES',
  'MOSCOW',
  'LONDON',
  'TOKYO',
  'BERLIN',
  'PARIS',
  'SYDNEY',
  'BEIJING',
]

const TICTACTOE_GAMES = [
  // Each game is a sequence of [position, player] — WOPR plays both sides
  // Format: board positions 0-8, X goes first
  ['X:0', 'O:4', 'X:8', 'O:2', 'X:6', 'O:3', 'X:1', 'O:7', 'X:5'], // draw
  ['X:4', 'O:0', 'X:8', 'O:1', 'X:2', 'O:6', 'X:3', 'O:5', 'X:7'], // draw
  ['X:0', 'O:4', 'X:2', 'O:1', 'X:7', 'O:3', 'X:5', 'O:8', 'X:6'], // draw
]

function renderBoard(board: string[]): string[] {
  const c = (i: number) => board[i] || ' '
  return [
    `       ${c(0)} │ ${c(1)} │ ${c(2)}`,
    `      ───┼───┼───`,
    `       ${c(3)} │ ${c(4)} │ ${c(5)}`,
    `      ───┼───┼───`,
    `       ${c(6)} │ ${c(7)} │ ${c(8)}`,
  ]
}

// ─── Audio ────────────────────────────────────────────────────────────

function playModemSound(duration = 3): void {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    // Carrier tone sweep
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(2400, now + duration * 0.4)
    osc.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.6)
    osc.frequency.setValueAtTime(1200, now + duration * 0.6)
    osc.frequency.exponentialRampToValueAtTime(2400, now + duration * 0.8)
    osc.frequency.exponentialRampToValueAtTime(300, now + duration)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.linearRampToValueAtTime(0, now + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)

    // Digital noise bursts
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      // Intermittent noise — sounds like data negotiation
      data[i] = Math.sin(i * 0.1) > 0.3 ? (Math.random() * 2 - 1) * 0.03 : 0
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.connect(ctx.destination)
    noise.start(now)

    setTimeout(() => ctx.close(), (duration + 0.5) * 1000)
  } catch { /* no audio */ }
}

function playNukeAlarm(): void {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    // Two-tone siren
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    gain.gain.setValueAtTime(0.06, now)

    // Alternate between two frequencies
    for (let i = 0; i < 8; i++) {
      const t = now + i * 0.3
      osc.frequency.setValueAtTime(i % 2 === 0 ? 800 : 600, t)
    }

    gain.gain.linearRampToValueAtTime(0, now + 2.4)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 2.4)

    setTimeout(() => ctx.close(), 3000)
  } catch { /* no audio */ }
}

function playResolveChime(): void {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    // Gentle descending chime — resolution, wisdom
    const notes = [880, 660, 440, 330]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = now + i * 0.4
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.08, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.8)
    })

    setTimeout(() => ctx.close(), 3000)
  } catch { /* no audio */ }
}

// ─── Main Game Flow ──────────────────────────────────────────────────

/** Pacing multiplier — 1.25 = 25% slower than original. */
const PACE = 1.25

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms * PACE))
}

/** Speak a line with a robotic voice — low pitch, slow rate. */
function speak(text: string): void {
  try {
    if (!window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.7
    utter.pitch = 0.3
    utter.volume = 0.8
    // Prefer a robotic-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const robot = voices.find(v =>
      /alex|daniel|fred|zarvox|samantha|google.*us/i.test(v.name)
    )
    if (robot) utter.voice = robot
    window.speechSynthesis.speak(utter)
  } catch { /* speech not available */ }
}

/** Create the QR overlay with a scannable image. */
function createQrOverlay(sessionId: string, onClose: () => void): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.id = 'wopr-qr-overlay'

  const url = `${window.location.origin}/wopr?s=${sessionId}`

  // Use a canvas to generate a QR code
  // For reliability, we'll use a simple API-free approach:
  // Render the URL as a prominent link AND generate a QR via canvas
  overlay.innerHTML = `
    <style>
      #wopr-qr-overlay {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100000;
        background: #000;
        border: 2px solid #a6e3a1;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        font-family: 'Fira Code', monospace;
        box-shadow: 0 0 40px rgba(166, 227, 161, 0.3);
      }
      .wopr-qr-title {
        color: #a6e3a1;
        font-size: 14px;
        letter-spacing: 0.2em;
        margin-bottom: 16px;
      }
      .wopr-qr-canvas {
        background: white;
        padding: 12px;
        border-radius: 8px;
        display: inline-block;
      }
      .wopr-qr-url {
        color: #585b70;
        font-size: 10px;
        margin-top: 12px;
        word-break: break-all;
        max-width: 280px;
      }
      .wopr-qr-hint {
        color: #f9e2af;
        font-size: 11px;
        margin-top: 8px;
        animation: wopr-pulse 1.5s ease-in-out infinite;
      }
      @keyframes wopr-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .wopr-qr-status {
        color: #a6e3a1;
        font-size: 11px;
        margin-top: 12px;
      }
    </style>
    <div class="wopr-qr-title">▓ BACKDOOR DETECTED ▓</div>
    <div class="wopr-qr-canvas">
      <canvas id="wopr-qr-canvas" width="200" height="200"></canvas>
    </div>
    <div class="wopr-qr-url">${url}</div>
    <div class="wopr-qr-hint">SCAN WITH PHONE TO CONNECT</div>
    <div class="wopr-qr-status" id="wopr-qr-status">Waiting for connection...</div>
  `

  document.body.appendChild(overlay)

  // Generate real scannable QR code on canvas
  const canvas = document.getElementById('wopr-qr-canvas') as HTMLCanvasElement
  if (canvas) {
    QRCode.toCanvas(canvas, url, { width: 200, margin: 1, color: { dark: '#000', light: '#fff' } })
      .catch(() => { /* QR generation failed — URL is still shown as fallback */ })
  }

  // Store close handler for later
  ;(overlay as HTMLDivElement & { _close?: () => void })._close = onClose

  return overlay
}

/** Poll the signaling server for phone connection status. */
async function pollForConnection(sessionId: string, onPhreaking: () => void, onConnected: () => void): Promise<void> {
  let lastStatus = 'waiting'
  const maxPolls = 120  // 2 minutes max

  for (let i = 0; i < maxPolls; i++) {
    await delay(1000)
    try {
      const res = await fetch(`/api/wopr/status/${sessionId}`)
      if (!res.ok) continue
      const data = await res.json()

      if (data.status === 'phreaking' && lastStatus === 'waiting') {
        lastStatus = 'phreaking'
        onPhreaking()
      }

      if (data.status === 'connected') {
        onConnected()
        return
      }
    } catch { /* offline, keep polling */ }
  }
}

/** Run the full WOPR experience inside the terminal. */
export async function launchWoprGame(api: TerminalAPI): Promise<void> {
  const { addLine } = api
  const green = '#a6e3a1'
  const amber = '#f9e2af'
  const red = '#f38ba8'
  const dim = '#585b70'

  // Phase 1: WOPR Boot Sequence
  for (const line of WOPR_BOOT) {
    addLine(line, green)
    await delay(80)
  }

  await delay(500)
  addLine('  SYSTEM INITIALIZATION...', dim)
  await delay(400)
  addLine('  LOADING DEFENSE NETWORK... ████████████ OK', dim)
  await delay(300)
  addLine('  CONNECTING TO NORAD... ████████████ OK', dim)
  await delay(300)
  addLine('  MISSILE DEFENSE ONLINE... ████████████ OK', dim)
  await delay(300)
  addLine('  THREAT ASSESSMENT: DEFCON 5 (PEACETIME)', dim)
  await delay(600)
  addLine('', undefined)
  addLine('  ══════════════════════════════════════', amber)
  addLine('  LOGON:', amber)
  await delay(800)
  addLine('', undefined)
  addLine('  > IDENTIFICATION NOT RECOGNIZED', red)
  addLine('', undefined)
  await delay(1000)

  // Phase 2: Backdoor Detection + QR Code
  addLine('  ░░░ ANOMALY DETECTED ░░░', red)
  await delay(400)
  addLine('  SCANNING FOR BACKDOOR ACCESS...', dim)
  await delay(600)
  addLine('  BACKDOOR FOUND: FALKEN PROTOCOL v2.6', amber)
  await delay(400)
  addLine('', undefined)
  addLine('  To authenticate, you need a PHREAKER device.', dim)
  addLine('  Scan the QR code with your phone.', dim)
  addLine('', undefined)
  await delay(300)

  // Create session on server
  let sessionId: string | null = null
  try {
    const res = await fetch('/api/wopr/create', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      sessionId = data.sessionId
    }
  } catch { /* offline */ }

  if (!sessionId) {
    // Fallback: skip phone and go straight to war sim
    addLine('  [SIGNAL LOST — BYPASSING AUTHENTICATION]', red)
    await delay(1000)
    addLine('', undefined)
    addLine('  ACCESS GRANTED', green)
    await delay(500)
    await runWarSimulation(api)
    return
  }

  // Show QR overlay
  let qrOverlay: HTMLDivElement | null = null
  let connectionResolved = false

  const connectionPromise = new Promise<void>((resolve) => {
    qrOverlay = createQrOverlay(sessionId!, () => {
      resolve()
    })

    // Poll for connection
    pollForConnection(
      sessionId!,
      // onPhreaking
      () => {
        const statusEl = document.getElementById('wopr-qr-status')
        if (statusEl) {
          statusEl.textContent = 'PHONE DETECTED — PHREAKING IN PROGRESS...'
          statusEl.style.color = amber
        }
        addLine('  ░ PHONE DETECTED — PHREAKING IN PROGRESS...', amber)
        playModemSound(2)
      },
      // onConnected
      () => {
        connectionResolved = true
        const statusEl = document.getElementById('wopr-qr-status')
        if (statusEl) {
          statusEl.textContent = '✓ ACCESS CODE ACCEPTED'
          statusEl.style.color = green
        }
        // Remove QR overlay
        setTimeout(() => {
          qrOverlay?.remove()
          resolve()
        }, 1500)
      },
    )

    // Timeout: auto-bypass after 2 minutes
    setTimeout(() => {
      if (!connectionResolved) {
        qrOverlay?.remove()
        addLine('  [TIMEOUT — BYPASSING AUTHENTICATION]', red)
        resolve()
      }
    }, 120_000)
  })

  await connectionPromise

  // Phase 3: Login success
  await delay(300)
  playModemSound(1.5)
  addLine('', undefined)
  addLine('  ████████████████████████████████████████', green)
  addLine('  █                                      █', green)
  addLine('  █       CONNECTION ESTABLISHED          █', green)
  addLine('  █       WELCOME, PROFESSOR FALKEN       █', green)
  addLine('  █                                      █', green)
  addLine('  ████████████████████████████████████████', green)
  addLine('', undefined)
  await delay(1500)

  await runWarSimulation(api)
}

/** Phase 4-7: The war simulation, tic-tac-toe, and DOOM transition. */
async function runWarSimulation(api: TerminalAPI): Promise<void> {
  const { addLine, close } = api
  const green = '#a6e3a1'
  const amber = '#f9e2af'
  const red = '#f38ba8'
  const dim = '#585b70'

  // Phase 4: SHALL WE PLAY A GAME?
  addLine('  GREETINGS, PROFESSOR FALKEN.', green)
  speak('Greetings, Professor Falken.')
  await delay(2000)
  addLine('', undefined)
  addLine('  SHALL WE PLAY A GAME?', amber)
  speak('Shall we play a game?')
  await delay(1500)
  addLine('', undefined)
  addLine('  LIST OF GAMES:', dim)
  await delay(300)
  addLine('    1. CHESS', dim)
  await delay(150)
  addLine('    2. CHECKERS', dim)
  await delay(150)
  addLine('    3. BACKGAMMON', dim)
  await delay(150)
  addLine('    4. POKER', dim)
  await delay(150)
  addLine('    5. FIGHTER COMBAT', dim)
  await delay(150)
  addLine('    6. GUERRILLA ENGAGEMENT', dim)
  await delay(150)
  addLine('    7. GLOBAL THERMONUCLEAR WAR', red)
  await delay(800)
  addLine('', undefined)
  addLine('  > SELECTING: GLOBAL THERMONUCLEAR WAR', red)
  await delay(1500)
  addLine('', undefined)
  addLine('  EXCELLENT CHOICE.', amber)
  speak('Excellent choice.')
  await delay(800)
  addLine('', undefined)

  // Phase 5: Thermonuclear war simulation
  addLine('  ══════════════════════════════════════', red)
  addLine('  ▓▓▓ DEFCON 1 — LAUNCH DETECTED ▓▓▓', red)
  addLine('  ══════════════════════════════════════', red)
  await delay(500)
  playNukeAlarm()
  addLine('', undefined)

  // Missile launches
  const shuffled = [...WAR_TARGETS].sort(() => Math.random() - 0.5)
  for (let i = 0; i < 8; i++) {
    const target = shuffled[i % shuffled.length]
    const trajectory = '█'.repeat(Math.floor(Math.random() * 15) + 5) + '░'.repeat(Math.floor(Math.random() * 8))
    addLine(`  ICBM → ${target.padEnd(15)} ${trajectory} IMPACT`, red)
    await delay(300 + Math.random() * 200)
  }

  await delay(800)
  addLine('', undefined)
  addLine('  ESTIMATED CASUALTIES: 2.7 BILLION', red)
  addLine('  GLOBAL INFRASTRUCTURE: DESTROYED', red)
  addLine('  WINNER: NONE', amber)
  await delay(2000)
  addLine('', undefined)

  // Phase 6: WOPR learns — tic-tac-toe montage
  addLine('  ══════════════════════════════════════', amber)
  addLine('  RUNNING SIMULATION ANALYSIS...', amber)
  addLine('  ══════════════════════════════════════', amber)
  await delay(1000)
  addLine('', undefined)
  addLine('  LEARNING FROM SIMPLER GAMES...', dim)
  await delay(600)

  // Play through tic-tac-toe games rapidly
  for (let gameNum = 0; gameNum < TICTACTOE_GAMES.length; gameNum++) {
    const game = TICTACTOE_GAMES[gameNum]
    const board = Array(9).fill('')

    addLine(`  GAME ${gameNum + 1}:`, dim)

    for (const move of game) {
      const [player, posStr] = move.split(':')
      const pos = parseInt(posStr)
      board[pos] = player
    }

    // Show final board state
    const boardLines = renderBoard(board)
    for (const line of boardLines) {
      addLine(line, dim)
    }
    addLine(`  RESULT: DRAW`, amber)
    addLine('', undefined)
    await delay(400)
  }

  addLine('  ... 14,794 MORE SIMULATIONS ...', dim)
  await delay(800)
  addLine('  ALL RESULTS: DRAW OR MUTUAL DESTRUCTION', amber)
  await delay(1200)
  addLine('', undefined)

  // Phase 7: The famous conclusion
  playResolveChime()
  await delay(500)
  addLine('  ══════════════════════════════════════', green)
  addLine('', undefined)
  addLine('  A STRANGE GAME.', green)
  speak('A strange game.')
  await delay(2500)
  addLine('', undefined)
  addLine('  THE ONLY WINNING MOVE IS', green)
  await delay(1500)
  addLine('  NOT TO PLAY.', green)
  speak('The only winning move is not to play.')
  await delay(2500)
  addLine('', undefined)
  addLine('  ══════════════════════════════════════', green)
  await delay(2000)

  // Phase 8: Transition to DOOM
  addLine('', undefined)
  addLine('  ...', dim)
  await delay(1500)
  addLine('', undefined)
  addLine('  HOW ABOUT A NICE GAME OF...', amber)
  speak('How about a nice game of Crypt Doom?')
  await delay(2000)
  addLine('', undefined)
  addLine('  ░█████╗░██████╗░██╗░░░██╗██████╗░████████╗', red)
  addLine('  ██╔══██╗██╔══██╗╚██╗░██╔╝██╔══██╗╚══██╔══╝', red)
  addLine('  ██║░░╚═╝██████╔╝░╚████╔╝░██████╔╝░░░██║░░░', red)
  addLine('  ██║░░██╗██╔══██╗░░╚██╔╝░░██╔═══╝░░░░██║░░░', red)
  addLine('  ╚█████╔╝██║░░██║░░░██║░░░██║░░░░░░░░██║░░░', red)
  addLine('  ░╚════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░░░░░░╚═╝░░░', red)
  addLine('  ██████╗░░█████╗░░█████╗░███╗░░░███╗', red)
  addLine('  ██╔══██╗██╔══██╗██╔══██╗████╗░████║', red)
  addLine('  ██║░░██║██║░░██║██║░░██║██╔████╔██║', red)
  addLine('  ██║░░██║██║░░██║██║░░██║██║╚██╔╝██║', red)
  addLine('  ██████╔╝╚█████╔╝╚█████╔╝██║░╚═╝░██║', red)
  addLine('  ╚═════╝░░╚════╝░░╚════╝░╚═╝░░░░░╚═╝', red)
  await delay(2000)
  addLine('', undefined)
  addLine('  LAUNCHING IN 3...', red)
  await delay(1000)
  addLine('  2...', red)
  await delay(1000)
  addLine('  1...', red)
  await delay(1000)

  // Close terminal and launch DOOM
  close()
  launchDoomGame()
}
