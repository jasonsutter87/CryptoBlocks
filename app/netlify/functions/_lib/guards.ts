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

/** Check if user is banned. Returns a Response if banned, null if clear. */
export async function checkBan(user: ClerkUser | null): Promise<Response | null> {
  if (!user) return null // not authed = not banned (requireAuth handles this separately)
  try {
    const result = await tursoExecute(
      'SELECT expires_at, reason FROM user_bans WHERE user_id = ? AND expires_at > ? ORDER BY expires_at DESC LIMIT 1',
      [user.sub, Date.now()],
    )
    if (result.rows.length > 0) {
      const expiresAt = Number(result.rows[0].expires_at)
      const daysLeft = Math.ceil((expiresAt - Date.now()) / 86400000)
      return json({
        error: 'Account suspended',
        reason: String(result.rows[0].reason),
        daysLeft,
      }, 403)
    }
  } catch { /* table may not exist yet — not banned */ }
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
