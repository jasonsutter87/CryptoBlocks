/**
 * Shared library for Netlify Functions.
 *
 * Import everything from here:
 *   import { json, cors, errorResponse, verifyFromRequest, tursoExecute, moderateContent } from './_lib'
 */

export { json, cors, errorResponse, logError, extractBearer, parsePath, getQueryParam, parsePagination } from './http.js'
export { tursoExecute, isTursoConfigured } from './turso.js'
export type { TursoRow, TursoResult } from './turso.js'
export { verifyClerkToken, verifyFromRequest, isAdmin, secureRandomCode } from './auth.js'
export type { ClerkUser } from './auth.js'
export { moderateContent } from './moderation.js'
export { createNotification } from './notifications.js'
export {
  requireAuth,
  requireClassroomMember,
  requireClassroomTeacher,
  requireTeacherViaAssignment,
} from './guards.js'
