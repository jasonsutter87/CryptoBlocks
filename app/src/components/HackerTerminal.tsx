/**
 * HackerTerminal — a hidden dropdown terminal activated by backtick (`) key.
 *
 * Inspired by Stripe's dev console. A retro-styled CLI overlay where kids
 * can type commands, play games, and discover secrets. Their first terminal.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { launchSnakeGame } from '../easter-eggs/snake-game'
import { launchInvadersGame } from '../easter-eggs/invaders-game'
import { launchMatrixRain } from '../easter-eggs/matrix-rain'
import { launchDoomGame } from '../easter-eggs/doom-game'
import { launchWoprGame } from '../easter-eggs/wopr-game'
import { checkAchievements } from '../achievements/tracker'

const ASCII_LOGO = `
 ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗
██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗
██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║
██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║
╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝
 ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝
██████╗ ██╗      ██████╗  ██████╗██╗  ██╗███████╗
██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝
██████╔╝██║     ██║   ██║██║     █████╔╝ ███████╗
██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ╚════██║
██████╔╝███████╗╚██████╔╝╚██████╗██║  ██╗███████║
╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝`

const FORTUNES = [
  '"Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"The best error message is the one that never shows up." — Thomas Fuchs',
  '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
  '"Fix the cause, not the symptom." — Steve Maguire',
  '"Simplicity is the soul of efficiency." — Austin Freeman',
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"Every great developer you know got there by solving problems they were unqualified to solve." — Patrick McKenzie',
  '"The computer was born to solve problems that did not exist before." — Bill Gates',
  '"Deleted code is debugged code." — Jeff Sickel',
  '"If debugging is the process of removing bugs, then programming must be the process of putting them in." — Edsger Dijkstra',
  '"Programming is not about typing, it\'s about thinking." — Rich Hickey',
  '"A ship in port is safe, but that\'s not what ships are built for." — Grace Hopper',
  '"The most disastrous thing that you can ever learn is your first programming language." — Alan Kay',
]

const COWSAY = (text: string) => {
  const top = ' ' + '_'.repeat(text.length + 2)
  const bot = ' ' + '-'.repeat(text.length + 2)
  return `${top}\n< ${text} >\n${bot}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`
}

interface Line {
  text: string
  color?: string
}

interface HackerTerminalProps {
  blockCount?: number
}

export default function HackerTerminal({ blockCount = 0 }: HackerTerminalProps) {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [theme, setTheme] = useState<'green' | 'amber' | 'blue'>('green')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startTime = useRef(Date.now())

  const themeColors = {
    green: { text: '#a6e3a1', prompt: '#a6e3a1', dim: '#585b70', bg: '#11111b', border: '#313244' },
    amber: { text: '#f9e2af', prompt: '#f9e2af', dim: '#585b70', bg: '#11111b', border: '#313244' },
    blue: { text: '#89b4fa', prompt: '#89b4fa', dim: '#585b70', bg: '#11111b', border: '#313244' },
  }

  const tc = themeColors[theme]

  // Toggle on backtick
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
        // Don't trigger if typing in an input/textarea
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        setOpen(prev => {
          const next = !prev
          if (next) {
            setTimeout(() => inputRef.current?.focus(), 50)
          }
          return next
        })
      }
      // Escape to close
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  // Show welcome every time the terminal opens
  useEffect(() => {
    if (open) {
      setLines([
        { text: ASCII_LOGO, color: tc.prompt },
        { text: '' },
        { text: '─'.repeat(60), color: tc.dim },
        { text: "  Type 'help' to see available commands.", color: tc.dim },
        { text: '─'.repeat(60), color: tc.dim },
        { text: '' },
      ])
    }
  }, [open])

  const addLines = useCallback((...newLines: Line[]) => {
    setLines(prev => [...prev, ...newLines])
  }, [])

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    const args = trimmed.split(/\s+/)
    const command = args[0]

    // Add the command to output
    addLines({ text: `$ ${cmd}`, color: tc.prompt })

    if (!command) return

    // Add to history
    setHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)

    switch (command) {
      case 'help':
        addLines(
          { text: '' },
          { text: '  COMMANDS', color: tc.text },
          { text: '  ────────────────────────────────────', color: tc.dim },
          { text: '  help          show this menu', color: tc.dim },
          { text: '  whoami        who are you?', color: tc.dim },
          { text: '  neofetch      system info', color: tc.dim },
          { text: '  fortune       random wisdom', color: tc.dim },
          { text: '  cowsay <msg>  moo', color: tc.dim },
          { text: '  ping          pong', color: tc.dim },
          { text: '  echo <text>   repeat after me', color: tc.dim },
          { text: '  date          current date/time', color: tc.dim },
          { text: '  uptime        how long you been here', color: tc.dim },
          { text: '  count         blocks on workspace', color: tc.dim },
          { text: '  ls            list block categories', color: tc.dim },
          { text: '  matrix        enter the matrix', color: tc.dim },
          { text: '  rickroll      :)', color: tc.dim },
          { text: '  hack          initiate hack sequence', color: tc.dim },
          { text: '  snake         play snake (eats the page!)', color: tc.dim },
          { text: '  invaders      space invaders (aliens abduct your code!)', color: tc.dim },
          { text: '  doom          can it run doom? yes.', color: tc.dim },
          { text: '  theme <name>  green | amber | blue', color: tc.dim },
          { text: '  history       command history', color: tc.dim },
          { text: '  clear         clear terminal', color: tc.dim },
          { text: '  eggVault      🥚', color: tc.dim },
          { text: '  exit          close terminal', color: tc.dim },
          { text: '' },
          { text: '  TIP: Press ` (backtick) to toggle this terminal', color: '#6c7086' },
          { text: '' },
        )
        break

      case 'whoami':
        addLines(
          { text: '' },
          { text: `  user:    Coder${Math.floor(Math.random() * 9000) + 1000}`, color: tc.text },
          { text: `  level:   Block Hacker`, color: tc.text },
          { text: `  blocks:  ${blockCount} on workspace`, color: tc.text },
          { text: `  status:  curious`, color: '#a6e3a1' },
          { text: '' },
        )
        break

      case 'neofetch': {
        const upSec = Math.floor((Date.now() - startTime.current) / 1000)
        const upMin = Math.floor(upSec / 60)
        addLines(
          { text: '' },
          { text: '  ┌──┐┌──┐┌──┐     CryptoBlocks v0.4', color: tc.prompt },
          { text: '  │██││██││██│     ─────────────────────', color: tc.prompt },
          { text: '  └──┘└──┘└──┘     OS: Browser', color: tc.prompt },
          { text: `                    Blocks: ${blockCount}`, color: tc.dim },
          { text: `                    Categories: 23`, color: tc.dim },
          { text: `                    Languages: JS + Python`, color: tc.dim },
          { text: `                    Renderer: Zelos`, color: tc.dim },
          { text: `                    Uptime: ${upMin}m ${upSec % 60}s`, color: tc.dim },
          { text: `                    Terminal: HackerTerm v1.0`, color: tc.dim },
          { text: '' },
          { text: '  ███████████████████████████', color: '#f38ba8' },
          { text: '  ███████████████████████████', color: '#f9e2af' },
          { text: '  ███████████████████████████', color: '#a6e3a1' },
          { text: '  ███████████████████████████', color: '#89b4fa' },
          { text: '  ███████████████████████████', color: '#cba6f7' },
          { text: '' },
        )
        break
      }

      case 'fortune':
        addLines(
          { text: '' },
          { text: `  ${FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}`, color: tc.text },
          { text: '' },
        )
        break

      case 'cowsay': {
        const msg = args.slice(1).join(' ') || 'moo'
        addLines(
          { text: '' },
          { text: COWSAY(msg), color: tc.text },
          { text: '' },
        )
        break
      }

      case 'ping':
        addLines({ text: '  pong 🏓', color: tc.text })
        break

      case 'echo':
        addLines({ text: '  ' + args.slice(1).join(' '), color: tc.text })
        break

      case 'date':
        addLines({ text: `  ${new Date().toLocaleString()}`, color: tc.text })
        break

      case 'uptime': {
        const s = Math.floor((Date.now() - startTime.current) / 1000)
        const m = Math.floor(s / 60)
        const h = Math.floor(m / 60)
        addLines({ text: `  ${h}h ${m % 60}m ${s % 60}s`, color: tc.text })
        break
      }

      case 'count':
        addLines({ text: `  ${blockCount} blocks on workspace`, color: tc.text })
        break

      case 'ls':
        addLines(
          { text: '' },
          { text: '  Basics/    Math/      Text/      Logic/', color: '#4C97AF' },
          { text: '  Lists/     Data/      Database/  Web/', color: '#D97706' },
          { text: '  Art/       Crypto/    AI/        Sound/', color: '#EC4899' },
          { text: '  Games/     Hardware/  Pen/       Testing/', color: '#22C55E' },
          { text: '  Vision/    Functions/ Events/    HTML/', color: '#00BCD4' },
          { text: '  Libraries/ Values/    ???/', color: '#9C27B0' },
          { text: '' },
        )
        break

      case 'matrix':
        addLines(
          { text: '  Entering the Matrix... 💊', color: '#00ff00' },
          { text: '  Press ESC to unplug.', color: tc.dim },
        )
        setTimeout(() => {
          setOpen(false)
          launchMatrixRain()
        }, 500)
        break

      case 'rickroll':
        addLines(
          { text: '' },
          { text: '  Never gonna give you up 🎵', color: '#f38ba8' },
          { text: '  Never gonna let you down', color: '#f9e2af' },
          { text: '  Never gonna run around and desert you', color: '#a6e3a1' },
          { text: '  Never gonna make you cry', color: '#89b4fa' },
          { text: '  Never gonna say goodbye', color: '#cba6f7' },
          { text: '  Never gonna tell a lie and hurt you', color: '#f38ba8' },
          { text: '' },
          { text: '  🎶 https://youtu.be/dQw4w9WgXcQ', color: tc.dim },
          { text: '' },
        )
        break

      case 'hack': {
        const steps = [
          'Initializing hack sequence...',
          'Bypassing firewall... ████████████ OK',
          'Cracking encryption... ██████████░░ 83%',
          'Accessing mainframe...',
          'Downloading secrets... ████████████ OK',
          'Covering tracks...',
          '',
          'ACCESS GRANTED 🔓',
          '',
          'Just kidding. But you felt cool, right? 😎',
        ]
        steps.forEach((step, i) => {
          setTimeout(() => {
            addLines({ text: `  ${step}`, color: i === 7 ? '#a6e3a1' : i === 9 ? tc.dim : tc.text })
          }, i * 400)
        })
        break
      }

      case 'snake':
        addLines(
          { text: '  Launching Snake Mode... 🐍', color: '#a6e3a1' },
          { text: '  Arrow keys to move. Eat the page!', color: tc.dim },
        )
        setTimeout(() => {
          setOpen(false)
          launchSnakeGame()
          checkAchievements({ event: 'terminal-command', command: 'snake' })
        }, 500)
        break

      case 'invaders':
        addLines(
          { text: '  Launching Space Invaders... 👾', color: '#89b4fa' },
          { text: '  ←→ to move, SPACE to shoot!', color: tc.dim },
        )
        setTimeout(() => {
          setOpen(false)
          launchInvadersGame()
          checkAchievements({ event: 'terminal-command', command: 'invaders' })
        }, 500)
        break

      case 'doom':
        addLines(
          { text: '  Launching CryptDOOM... 💀', color: '#a6e3a1' },
          { text: '  WASD move, ←→ look, SPACE shoot, ESC quit', color: tc.dim },
        )
        setTimeout(() => {
          setOpen(false)
          launchDoomGame()
        }, 500)
        break

      case 'wopr':
        addLines(
          { text: '  Initiating WOPR connection...', color: '#a6e3a1' },
          { text: '  Stand by.', color: tc.dim },
        )
        setTimeout(() => {
          launchWoprGame({
            addLine: (text: string, color?: string) => addLines({ text: `  ${text}`, color }),
            addLines: (...lines: { text: string; color?: string }[]) => addLines(...lines.map(l => ({ text: `  ${l.text}`, color: l.color }))),
            clear: () => setLines([]),
            close: () => setOpen(false),
          })
        }, 500)
        break

      case 'theme':
        if (args[1] === 'green' || args[1] === 'amber' || args[1] === 'blue') {
          setTheme(args[1])
          addLines({ text: `  Theme set to ${args[1]}`, color: themeColors[args[1]].text })
        } else {
          addLines({ text: '  Usage: theme green | amber | blue', color: tc.dim })
        }
        break

      case 'history':
        if (history.length === 0) {
          addLines({ text: '  No commands yet.', color: tc.dim })
        } else {
          history.forEach((h, i) => {
            addLines({ text: `  ${i + 1}  ${h}`, color: tc.dim })
          })
        }
        break

      case 'clear':
        setLines([])
        break

      case 'exit':
        setOpen(false)
        break

      case 'sudo':
        addLines({ text: '  Nice try. 🙃', color: '#f38ba8' })
        break

      case 'rm':
        addLines({ text: '  Whoa there! This is a safe space. 🛡️', color: '#f38ba8' })
        break

      case 'cake':
        addLines(
          { text: '' },
          { text: '  The cake is a lie.', color: '#f38ba8' },
          { text: '  We lied, there is none here.', color: '#6c7086' },
          { text: '' },
        )
        checkAchievements({ event: 'terminal-command', command: 'cake' })
        break

      case 'eggvault':
      case 'eggVault':
        addLines(
          { text: '' },
          { text: '  ╔═══════════════════════════════════════╗', color: '#f9e2af' },
          { text: '  ║           🥚  EGG VAULT  🥚           ║', color: '#f9e2af' },
          { text: '  ╠═══════════════════════════════════════╣', color: '#f9e2af' },
          { text: '  ║                                       ║', color: '#f9e2af' },
          { text: '  ║  In the projects you might find,      ║', color: '#cdd6f4' },
          { text: '  ║  where some seeds are more divine.    ║', color: '#cdd6f4' },
          { text: '  ║                                       ║', color: '#f9e2af' },
          { text: '  ║  This is a CTF (Capture the Flag) —    ║', color: '#f38ba8' },
          { text: '  ║  a hacker treasure hunt buried in      ║', color: '#f38ba8' },
          { text: '  ║  the app. Real hackers find hidden     ║', color: '#f38ba8' },
          { text: '  ║  pages, crack codes, and earn secret   ║', color: '#f38ba8' },
          { text: '  ║  badges nobody else has.               ║', color: '#f38ba8' },
          { text: '  ║                                       ║', color: '#f9e2af' },
          { text: '  ║  Hints:                               ║', color: '#a6e3a1' },
          { text: '  ║  · Life, the universe, everything     ║', color: '#6c7086' },
          { text: '  ║  · A remarkably interesting taxi ride  ║', color: '#6c7086' },
          { text: '  ║  · Only the elite would know          ║', color: '#6c7086' },
          { text: '  ║  · Captain Crunch whistled this one   ║', color: '#6c7086' },
          { text: '  ║  · This page does not exist           ║', color: '#6c7086' },
          { text: '  ║                                       ║', color: '#f9e2af' },
          { text: '  ╚═══════════════════════════════════════╝', color: '#f9e2af' },
          { text: '' },
        )
        checkAchievements({ event: 'terminal-command', command: 'eggvault' })
        break

      default:
        addLines({ text: `  command not found: ${command}. Type 'help' for commands.`, color: '#f38ba8' })
    }
  }, [addLines, blockCount, history, tc, theme])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeCommand(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIndex)
      setInput(history[newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const newIndex = historyIndex + 1
      if (newIndex >= history.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal window */}
      <div
        className="mx-auto mt-8 w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl border flex flex-col"
        style={{
          background: tc.bg,
          borderColor: tc.border,
          maxHeight: 'calc(100vh - 100px)',
          fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-mantle border-b border-surface-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <div className="w-3 h-3 rounded-full bg-warn" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <span className="text-xs text-overlay font-mono">CONSOLE</span>
          <button onClick={() => setOpen(false)} className="text-overlay hover:text-text text-lg leading-none">
            ✕
          </button>
        </div>

        {/* Output */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap"
          style={{ color: tc.text, minHeight: '300px' }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.color || tc.text }}>{line.text}</div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-2 border-t border-surface-0">
          <span className="text-sm mr-2" style={{ color: tc.prompt }}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: tc.text, caretColor: tc.prompt }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>

      {/* Hint at bottom */}
      <div className="text-center mt-3 text-xs text-[#585b70]">
        Press <kbd className="px-1 py-0.5 bg-surface-0 rounded text-overlay">`</kbd> or <kbd className="px-1 py-0.5 bg-surface-0 rounded text-overlay">ESC</kbd> to close
      </div>
    </div>
  )
}
