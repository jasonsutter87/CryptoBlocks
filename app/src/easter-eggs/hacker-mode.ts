/** Hacker mode state — toggled by Konami code or logo click sequence. */

const STORAGE_KEY = 'cb-hacker-mode'

let active = localStorage.getItem(STORAGE_KEY) === '1'

export function isHackerModeActive(): boolean {
  return active
}

export function toggleHackerMode(): boolean {
  active = !active
  localStorage.setItem(STORAGE_KEY, active ? '1' : '0')

  document.documentElement.classList.toggle('hacker-mode', active)
  window.dispatchEvent(new CustomEvent('cb:hacker-mode-changed', { detail: { active } }))

  if (active) {
    // eslint-disable-next-line no-console
    console.log(
      '%c🔓 HACKER MODE ACTIVATED',
      'color: #00ff41; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00ff41;'
    )
    // eslint-disable-next-line no-console
    console.log(
      '%cThe ??? blocks have been unlocked in the Brick Bin.\n"Beware of the Leopard."',
      'color: #00ff41; font-size: 12px;'
    )
  } else {
    // eslint-disable-next-line no-console
    console.log('%c🔒 Hacker mode deactivated', 'color: #666; font-size: 12px;')
  }

  return active
}

/** Restore hacker mode class on page load if it was previously active. */
export function restoreHackerMode(): void {
  if (active) {
    document.documentElement.classList.add('hacker-mode')
  }
}
