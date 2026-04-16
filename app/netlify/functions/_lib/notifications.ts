/**
 * Notification creation helper — called from any function to drop a
 * notification on a user's queue. Non-fatal: failures are logged, never thrown.
 */

import { tursoExecute } from './turso.js'
import { logError } from './http.js'

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link: string,
): Promise<void> {
  await tursoExecute(
    'INSERT INTO notifications (id, user_id, type, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [crypto.randomUUID(), userId, type, title, body, link, Date.now()],
  ).catch((err) => {
    logError('createNotification', err)
  })
}
