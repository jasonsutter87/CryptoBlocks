import type { BlockCategory } from '../types/block'

export interface BlocksetStep {
  instruction: string
  hint?: string
}

export interface Blockset {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: BlocksetStep[]
  allowedCategories: BlockCategory[]
  expectedOutput: string[]
  par: number
  estimatedMinutes: number
}

export interface BlocksetPack {
  id: string
  name: string
  description: string
  icon: string
  color: string
  blocksets: Blockset[]
}

export interface BlocksetProgress {
  blocksetId: string
  completed: boolean
  attempts: number
}
