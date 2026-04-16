/**
 * Single source of truth for the app's top-level view modes.
 *
 * "sandbox" is the default editor. Browser modes ("challenges",
 * "blocksets", ...) show a selection grid. "active-*" modes show the
 * editor with a mode-specific panel banner.
 */

export const APP_MODES = [
  'sandbox',
  'challenges', 'active-challenge',
  'blocksets', 'active-blockset',
  'code-golf', 'active-golf',
  'code-lab', 'active-lab',
] as const

export type AppMode = (typeof APP_MODES)[number]

export function isBrowserMode(m: AppMode): boolean {
  return m === 'challenges' || m === 'blocksets' || m === 'code-golf' || m === 'code-lab'
}

export function isActiveMode(m: AppMode): boolean {
  return m.startsWith('active-')
}
