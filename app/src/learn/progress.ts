import type { LearnProgress } from './types'

const STORAGE_KEY = 'cryptoblocks-learn-progress'

export function loadLearnProgress(): Record<string, LearnProgress> {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json) {
      const parsed = JSON.parse(json)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, LearnProgress>
      }
    }
  } catch {
    // corrupted data, ignore
  }
  return {}
}

function saveLearnProgress(progress: Record<string, LearnProgress>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markLessonComplete(lessonId: string): void {
  const all = loadLearnProgress()
  const existing = all[lessonId]
  all[lessonId] = {
    lessonId,
    completed: true,
    exercisesCompleted: existing?.exercisesCompleted ?? [],
  }
  saveLearnProgress(all)
}

export function markExerciseComplete(lessonId: string, exerciseId: string): void {
  const all = loadLearnProgress()
  const existing = all[lessonId]
  const exercisesCompleted = existing?.exercisesCompleted ?? []
  if (!exercisesCompleted.includes(exerciseId)) {
    exercisesCompleted.push(exerciseId)
  }
  all[lessonId] = {
    lessonId,
    completed: existing?.completed ?? false,
    exercisesCompleted,
  }
  saveLearnProgress(all)
}

export function isLessonComplete(lessonId: string): boolean {
  const all = loadLearnProgress()
  return all[lessonId]?.completed ?? false
}
