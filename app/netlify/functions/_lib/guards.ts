/**
 * Authorization guards — DB-backed role/membership checks.
 *
 * Each guard returns:
 *   - null when the user is authorized → continue
 *   - Response when blocked → return it directly from the handler
 *
 * Centralizing prevents "forgotten check" mistakes when adding new routes.
 */

import { json } from './http.js'
import { tursoExecute } from './turso.js'
import type { ClerkUser } from './auth.js'

/** Require authenticated user */
export function requireAuth(user: ClerkUser | null, message = 'Sign in required'): Response | null {
  if (!user) return json({ error: message }, 401)
  return null
}

/** Require user is a member of the classroom */
export async function requireClassroomMember(
  classroomId: string,
  user: ClerkUser | null,
): Promise<Response | null> {
  const authErr = requireAuth(user)
  if (authErr) return authErr
  const result = await tursoExecute(
    'SELECT 1 FROM class_members WHERE classroom_id = ? AND user_id = ?',
    [classroomId, user!.sub],
  )
  if (result.rows.length === 0) {
    return json({ error: 'Not a member of this classroom' }, 403)
  }
  return null
}

/** Require user is the teacher of the classroom */
export async function requireClassroomTeacher(
  classroomId: string,
  user: ClerkUser | null,
): Promise<Response | null> {
  const authErr = requireAuth(user)
  if (authErr) return authErr
  const result = await tursoExecute(
    'SELECT 1 FROM classrooms WHERE id = ? AND teacher_id = ?',
    [classroomId, user!.sub],
  )
  if (result.rows.length === 0) {
    return json({ error: 'Only the teacher can do this' }, 403)
  }
  return null
}

/** Require user is the teacher of the classroom that owns the given assignment */
export async function requireTeacherViaAssignment(
  assignmentId: string,
  user: ClerkUser | null,
): Promise<Response | null> {
  const authErr = requireAuth(user)
  if (authErr) return authErr
  const result = await tursoExecute(
    `SELECT 1 FROM assignments a
     JOIN classrooms c ON a.classroom_id = c.id
     WHERE a.id = ? AND c.teacher_id = ?`,
    [assignmentId, user!.sub],
  )
  if (result.rows.length === 0) {
    return json({ error: 'Only the teacher can do this' }, 403)
  }
  return null
}
