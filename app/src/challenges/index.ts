import type { ThemePack, Challenge } from './types'
import { gettingStarted } from './data/getting-started'
import { minecraft } from './data/minecraft'
import { petSimulator } from './data/pet-simulator'
import { spaceExplorer } from './data/space-explorer'
import { robotFactory } from './data/robot-factory'
import { secretAgent } from './data/secret-agent'
import { treasureHunt } from './data/treasure-hunt'
import { gameBuilder } from './data/game-builder'
import { hackerTerminal } from './data/hacker-terminal'
import { musicFestival } from './data/music-festival'
import { scienceLab } from './data/science-lab'
import { startupSim } from './data/startup-sim'
import { eulerBlocks } from './data/euler-blocks'

export const allThemes: ThemePack[] = [
  gettingStarted,
  minecraft,
  petSimulator,
  spaceExplorer,
  robotFactory,
  secretAgent,
  treasureHunt,
  gameBuilder,
  hackerTerminal,
  musicFestival,
  scienceLab,
  startupSim,
  eulerBlocks,
]

export function getChallengeById(id: string): Challenge | null {
  for (const theme of allThemes) {
    const found = theme.challenges.find((c) => c.id === id)
    if (found) return found
  }
  return null
}

export function getNextChallenge(currentId: string): Challenge | null {
  for (const theme of allThemes) {
    const idx = theme.challenges.findIndex((c) => c.id === currentId)
    if (idx >= 0 && idx < theme.challenges.length - 1) {
      return theme.challenges[idx + 1]
    }
  }
  return null
}

export function getTotalChallengeCount(): number {
  return allThemes.reduce((sum, t) => sum + t.challenges.length, 0)
}

export type { Challenge, ThemePack, ChallengeProgress } from './types'
