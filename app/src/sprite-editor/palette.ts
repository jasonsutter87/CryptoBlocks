/**
 * Default color palettes for the sprite editor.
 * Catppuccin-inspired + classic pixel art colors.
 */

export const DEFAULT_PALETTE = [
  // Row 1 — Basics
  '#000000', '#ffffff', '#f38ba8', '#fab387',
  '#f9e2af', '#a6e3a1', '#89b4fa', '#cba6f7',
  // Row 2 — Skin/nature
  '#eba0ac', '#f2cdcd', '#94e2d5', '#89dceb',
  '#74c7ec', '#b4befe', '#cdd6f4', '#585b70',
  // Row 3 — Pixel art classics
  '#e64539', '#f78135', '#ffd964', '#7bc96f',
  '#3a9efd', '#9b5de5', '#ff6b9d', '#c2855a',
  // Row 4 — Dark/shadow
  '#1e1e2e', '#313244', '#45475a', '#6c7086',
  '#181825', '#11111b', '#332200', '#003322',
] as const

export type RGBA = [number, number, number, number]

export function hexToRgba(hex: string): RGBA {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b, 255]
}

export function rgbaToHex(rgba: RGBA): string {
  return '#' + rgba.slice(0, 3).map(c => c.toString(16).padStart(2, '0')).join('')
}

export const TRANSPARENT: RGBA = [0, 0, 0, 0]
