export { isHackerModeActive, toggleHackerMode, restoreHackerMode } from './hacker-mode'
export { initKonamiListener, destroyKonamiListener } from './konami'
export { printConsoleArt } from './console-art'

import { restoreHackerMode } from './hacker-mode'
import { initKonamiListener } from './konami'
import { printConsoleArt } from './console-art'

let initialized = false

/** Initialize all easter eggs. Call once on app mount. */
export function initEasterEggs(): void {
  if (initialized) return
  initialized = true

  restoreHackerMode()
  initKonamiListener()
  printConsoleArt()
}
