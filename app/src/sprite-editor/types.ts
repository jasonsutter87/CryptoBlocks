import type { RGBA } from './palette'

export interface SpriteFrame {
  /** 2D pixel grid — [row][col] as RGBA */
  pixels: RGBA[][]
  /** Frame name for the sprite sheet */
  name: string
}

export interface SpriteProject {
  /** Name of the sprite */
  name: string
  /** Grid size (e.g. 16, 24, 32, 48) */
  size: number
  /** All animation frames */
  frames: SpriteFrame[]
  /** Color palette used */
  palette: string[]
}

export type Tool = 'draw' | 'erase' | 'fill' | 'pick'
