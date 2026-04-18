/**
 * Single source of truth for all runtime schemas.
 *
 * Usage:
 *   import { Project, PublishProjectInput } from '@/schema'
 *   const result = PublishProjectInput.safeParse(body)
 *   if (!result.success) return json({ error: 'Invalid input' }, 400)
 */

export * from './primitives.js'
export * from './project.js'
export * from './classroom.js'
export * from './user.js'
export * from './github.js'
export * from './achievement.js'
