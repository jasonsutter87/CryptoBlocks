/** Konami Code listener: ↑↑↓↓←→←→BA */

import { toggleHackerMode } from './hacker-mode'

const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

let buffer: string[] = []
let timer: ReturnType<typeof setTimeout> | null = null

function handleKeyDown(e: KeyboardEvent): void {
  buffer.push(e.key)

  // Reset after 2 seconds of no input
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { buffer = [] }, 2000)

  // Only keep the last N keys
  if (buffer.length > KONAMI.length) {
    buffer = buffer.slice(-KONAMI.length)
  }

  // Check for match
  if (buffer.length === KONAMI.length && buffer.every((k, i) => k === KONAMI[i])) {
    buffer = []
    toggleHackerMode()
  }
}

export function initKonamiListener(): void {
  document.addEventListener('keydown', handleKeyDown)
}

export function destroyKonamiListener(): void {
  document.removeEventListener('keydown', handleKeyDown)
}
