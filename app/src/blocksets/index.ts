import type { BlocksetPack, Blockset } from './types'
import { basics101 } from './data/basics-101'
import { loopsAndLogic } from './data/loops-and-logic'
import { textTricks } from './data/text-tricks'
import { listBuilder } from './data/list-builder'
import { dataStructures } from './data/data-structures'
import { creativeCoding } from './data/creative-coding'

export const allBlocksetPacks: BlocksetPack[] = [
  basics101,
  loopsAndLogic,
  textTricks,
  listBuilder,
  dataStructures,
  creativeCoding,
]

export function getBlocksetById(id: string): Blockset | null {
  for (const pack of allBlocksetPacks) {
    const found = pack.blocksets.find((b) => b.id === id)
    if (found) return found
  }
  return null
}

export function getNextBlockset(currentId: string): Blockset | null {
  for (const pack of allBlocksetPacks) {
    const idx = pack.blocksets.findIndex((b) => b.id === currentId)
    if (idx >= 0 && idx < pack.blocksets.length - 1) {
      return pack.blocksets[idx + 1]
    }
  }
  return null
}

export function getTotalBlocksetCount(): number {
  return allBlocksetPacks.reduce((sum, p) => sum + p.blocksets.length, 0)
}

export type { Blockset, BlocksetPack, BlocksetProgress, BlocksetStep } from './types'
