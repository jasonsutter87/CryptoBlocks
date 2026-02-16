import type { GolfPack, GolfProblem } from './types'
import { warmup } from './data/warmup'
import { brainTeasers } from './data/brain-teasers'
import { mindBenders } from './data/mind-benders'
import { pebbleBeach } from './data/pebble-beach'
import { augustaNational } from './data/augusta-national'
import { stAndrews } from './data/st-andrews'

export const allGolfPacks: GolfPack[] = [
  warmup,
  brainTeasers,
  mindBenders,
  pebbleBeach,
  augustaNational,
  stAndrews,
]

export function getProblemById(id: string): GolfProblem | null {
  for (const pack of allGolfPacks) {
    const found = pack.problems.find((p) => p.id === id)
    if (found) return found
  }
  return null
}

export function getNextProblem(currentId: string): GolfProblem | null {
  for (const pack of allGolfPacks) {
    const idx = pack.problems.findIndex((p) => p.id === currentId)
    if (idx >= 0 && idx < pack.problems.length - 1) {
      return pack.problems[idx + 1]
    }
  }
  return null
}

export function getTotalProblemCount(): number {
  return allGolfPacks.reduce((sum, p) => sum + p.problems.length, 0)
}

export type { GolfProblem, GolfPack, GolfProgress } from './types'
