import type { Chapter } from './types'
import { chapter1 } from './data/chapter-1-what-is-code'
import { chapter2 } from './data/chapter-2-values-and-types'
import { chapter3 } from './data/chapter-3-variables'
import { chapter4 } from './data/chapter-4-math'
import { chapter5 } from './data/chapter-5-text'
import { chapter6 } from './data/chapter-6-logic'
import { chapter7 } from './data/chapter-7-lists'
import { chapter8 } from './data/chapter-8-objects'
import { chapter9 } from './data/chapter-9-loops'
import { chapter10 } from './data/chapter-10-functions'

export const ALL_CHAPTERS: Chapter[] = [
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
  chapter6,
  chapter7,
  chapter8,
  chapter9,
  chapter10,
]

export function getChapter(id: string): Chapter | undefined {
  return ALL_CHAPTERS.find(c => c.id === id)
}
