import type { BlockCategory } from '../types/block'

export interface GolfProblem {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  expectedOutput: string[]
  par: number
  allowedCategories?: BlockCategory[]
}

export interface GolfPack {
  id: string
  name: string
  description: string
  icon: string
  color: string
  problems: GolfProblem[]
}

export interface GolfProgress {
  problemId: string
  completed: boolean
  bestBlockCount: number
  attempts: number
}
