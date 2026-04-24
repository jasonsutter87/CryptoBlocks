/**
 * Default color palettes for the sprite editor.
 * Catppuccin-inspired + classic pixel art colors.
 */

export const DEFAULT_PALETTE = [
  // Row 1 — Grayscale
  '#000000', '#1e1e2e', '#313244', '#45475a',
  '#6c7086', '#9399b2', '#cdd6f4', '#ffffff',
  // Row 2 — Reds / pinks
  '#7f0a1e', '#b91c1c', '#e64539', '#f38ba8',
  '#ff6b9d', '#eba0ac', '#f2cdcd', '#fce7f3',
  // Row 3 — Oranges / browns
  '#4a2510', '#78350f', '#c2410c', '#f78135',
  '#fab387', '#c2855a', '#a16207', '#ca8a04',
  // Row 4 — Yellows
  '#713f12', '#a16207', '#eab308', '#ffd964',
  '#f9e2af', '#fef08a', '#fef9c3', '#fffbeb',
  // Row 5 — Greens
  '#14532d', '#166534', '#15803d', '#22c55e',
  '#7bc96f', '#a6e3a1', '#94e2d5', '#d1fae5',
  // Row 6 — Blues / teals
  '#0c4a6e', '#0369a1', '#0ea5e9', '#3a9efd',
  '#89b4fa', '#89dceb', '#74c7ec', '#b4befe',
  // Row 7 — Purples
  '#3b0764', '#6b21a8', '#9333ea', '#9b5de5',
  '#cba6f7', '#d8b4fe', '#e9d5ff', '#f3e8ff',
  // Row 8 — Mario classics (NES palette picks)
  '#e53935', '#fbc02d', '#43a047', '#1976d2',
  '#6d4c41', '#ffccbc', '#f5deb3', '#5d4037',
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
