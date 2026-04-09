import type { LabPack, LabExercise } from './types'
import { fromBlocksBeginner } from './data/from-blocks-beginner'
import { fromBlocksPuzzles } from './data/from-blocks-puzzles'
import { fromBlocksBrainTrainer } from './data/from-blocks-brain-trainer'
import { fromBlocksCryptoPuzzles } from './data/from-blocks-crypto-puzzles'
import { fromBlocksDataWizard } from './data/from-blocks-data-wizard'
import { fromBlocksEuler } from './data/from-blocks-euler'
import { fromBlocksMinecraft } from './data/from-blocks-minecraft'
import { fromBlocksScienceLab } from './data/from-blocks-science-lab'
import { fromBlocksSecretAgent } from './data/from-blocks-secret-agent'
import { fromBlocksTreasureHunt } from './data/from-blocks-treasure-hunt'
import { fromBlocksStartupSim } from './data/from-blocks-startup-sim'
import { beginner } from './data/beginner'
import { intermediate } from './data/intermediate'
import { advanced } from './data/advanced'
import { bigO } from './data/big-o'
import { sorting } from './data/sorting'
import { linkedLists } from './data/linked-lists'
import { stacksQueues } from './data/stacks-queues'
import { trees } from './data/trees'
import { hashMaps } from './data/hash-maps'
import { recursion } from './data/recursion'
import { graphs } from './data/graphs'
import { binarySearch } from './data/binary-search'
import { dynamicProgramming } from './data/dynamic-programming'
import { strings } from './data/strings'
import { arrays } from './data/arrays'
import { mathFundamentals } from './data/math-fundamentals'
import { bitManipulation } from './data/bit-manipulation'
import { greedy } from './data/greedy'
import { twoPointers } from './data/two-pointers'
import { slidingWindow } from './data/sliding-window'
import { backtracking } from './data/backtracking'
import { sets } from './data/sets'
import { matrices } from './data/matrices'
import { patternMatching } from './data/pattern-matching'
import { functional } from './data/functional'
import { errorHandling } from './data/error-handling'
import { asyncPromises } from './data/async-promises'

export const allLabPacks: LabPack[] = [
  fromBlocksBeginner,
  fromBlocksPuzzles,
  fromBlocksBrainTrainer,
  fromBlocksCryptoPuzzles,
  fromBlocksDataWizard,
  fromBlocksEuler,
  fromBlocksMinecraft,
  fromBlocksScienceLab,
  fromBlocksSecretAgent,
  fromBlocksTreasureHunt,
  fromBlocksStartupSim,
  beginner,
  intermediate,
  advanced,
  bigO,
  sorting,
  linkedLists,
  stacksQueues,
  trees,
  hashMaps,
  recursion,
  graphs,
  binarySearch,
  dynamicProgramming,
  strings,
  arrays,
  mathFundamentals,
  bitManipulation,
  greedy,
  twoPointers,
  slidingWindow,
  backtracking,
  sets,
  matrices,
  patternMatching,
  functional,
  errorHandling,
  asyncPromises,
]

export function getExerciseById(id: string): LabExercise | null {
  for (const pack of allLabPacks) {
    const found = pack.exercises.find((e) => e.id === id)
    if (found) return found
  }
  return null
}

export function getNextExercise(currentId: string): LabExercise | null {
  for (const pack of allLabPacks) {
    const idx = pack.exercises.findIndex((e) => e.id === currentId)
    if (idx >= 0 && idx < pack.exercises.length - 1) {
      return pack.exercises[idx + 1]
    }
  }
  return null
}

export function getTotalExerciseCount(): number {
  return allLabPacks.reduce((sum, p) => sum + p.exercises.length, 0)
}

export type { LabExercise, LabPack, LabProgress } from './types'
