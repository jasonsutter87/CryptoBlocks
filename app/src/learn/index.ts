import type { Chapter } from './types'
import { chapter1 } from './data/chapter-1-what-is-code'

export const ALL_CHAPTERS: Chapter[] = [
  chapter1,
]

export function getChapter(id: string): Chapter | undefined {
  return ALL_CHAPTERS.find(c => c.id === id)
}
