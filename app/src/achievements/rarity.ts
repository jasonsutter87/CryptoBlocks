export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export const RARITY_ORDER: Record<Rarity, number> = {
  legendary: 0,
  epic: 1,
  rare: 2,
  common: 3,
}

/** Hex color per rarity — used anywhere a raw CSS color value is needed
 *  (inline styles, canvas, SVG filters). */
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#6c7086',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
}

/** Display label per rarity. */
export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

/** Tailwind class bundles per rarity — used by BadgeShowcase and any other
 *  component that needs the full set of ring/glow/bg/text styles. */
export const RARITY_STYLES: Record<Rarity, { ring: string; glow: string; bg: string; text: string }> = {
  legendary: {
    ring: 'ring-2 ring-yellow-500/60',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
  },
  epic: {
    ring: 'ring-2 ring-purple-500/60',
    glow: 'shadow-[0_0_16px_rgba(168,85,247,0.35)]',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
  },
  rare: {
    ring: 'ring-2 ring-blue-500/50',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
  },
  common: {
    ring: 'ring-1 ring-surface-1',
    glow: '',
    bg: 'bg-surface-0',
    text: 'text-overlay',
  },
}
