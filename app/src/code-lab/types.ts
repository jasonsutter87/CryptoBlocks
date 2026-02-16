export interface LabExercise {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  expectedOutput: string[]
  starterCode?: string
  hints: string[]
}

export interface LabPack {
  id: string
  name: string
  description: string
  icon: string
  color: string
  exercises: LabExercise[]
}

export interface LabProgress {
  exerciseId: string
  completed: boolean
  attempts: number
}
