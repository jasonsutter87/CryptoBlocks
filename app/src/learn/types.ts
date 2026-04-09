export interface LessonBlock {
  type: 'heading' | 'paragraph' | 'code' | 'callout' | 'exercise'
  // For heading
  level?: 1 | 2 | 3
  // For heading, paragraph, callout
  text?: string
  // For callout
  variant?: 'info' | 'tip' | 'warning'
  // For code
  code?: string
  language?: 'javascript' | 'html'
  runnable?: boolean
  // For exercise
  exerciseId?: string
}

export interface LessonExercise {
  id: string
  prompt: string
  starterCode: string
  expectedOutput: string[]
  hints: string[]
}

export interface Lesson {
  id: string
  title: string
  estimatedMinutes: number
  blocks: LessonBlock[]
  exercises: LessonExercise[]
}

export interface Chapter {
  id: string
  number: number
  title: string
  description: string
  icon: string
  color: string
  lessons: Lesson[]
}

export interface LearnProgress {
  lessonId: string
  completed: boolean
  exercisesCompleted: string[]
}
