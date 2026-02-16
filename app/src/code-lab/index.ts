import type { LabPack, LabExercise } from './types'
import { beginner } from './data/beginner'
import { intermediate } from './data/intermediate'
import { advanced } from './data/advanced'
import { bigO } from './data/big-o'
import { sorting } from './data/sorting'
import { linkedLists } from './data/linked-lists'

export const allLabPacks: LabPack[] = [
  beginner,
  intermediate,
  advanced,
  bigO,
  sorting,
  linkedLists,
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
