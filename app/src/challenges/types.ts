import type { BlockCategory } from '../types/block'

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  theme: string
  expectedOutput: string[]
  par: number
  hints: string[]
  solution?: string
  allowedCategories?: BlockCategory[]
  starterBlocks?: Record<string, unknown>
}

export interface ThemePack {
  id: string
  name: string
  description: string
  icon: string
  color: string
  challenges: Challenge[]
}

export interface ChallengeProgress {
  challengeId: string
  completed: boolean
  stars: number
  bestBlockCount: number
  attempts: number
}
