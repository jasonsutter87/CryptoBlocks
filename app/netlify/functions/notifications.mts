/**
 * Netlify Function — Notifications API.
 *
 * GET  /api/notifications       → list unread + recent for current user
 * POST /api/notifications/read  → mark all as read
 *
 * Notifications are created server-side by other functions (like, remix,
 * classroom join) — not directly by the client. The createNotification helper
 * lives in _lib/notifications.ts.
 */

import {
  json, cors, logError, parsePath, verifyFromRequest, tursoExecute, isTursoConfigured,
  requireAuth,
} from './_lib/index.js'

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'notifications')
  const user = await verifyFromRequest(req)

  const authErr = requireAuth(user, 'Sign in to view notifications')
  if (authErr) return authErr
  if (!isTursoConfigured()) return json({ error: 'DB not configured' }, 500)

  try {
    // POST /api/notifications/read — mark all as read
    if (req.method === 'POST' && segments[0] === 'read') {
      await tursoExecute(
        'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0',
        [user!.sub],
      )
      return json({ ok: true })
    }

    // GET /api/notifications — list recent (last 50)
    if (req.method === 'GET' && segments.length === 0) {
      const result = await tursoExecute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [user!.sub],
      )
      const unreadCount = await tursoExecute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
        [user!.sub],
      )

      return json({
        notifications: result.rows.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          link: n.link,
          read: Number(n.read) === 1,
          createdAt: n.created_at,
        })),
        unreadCount: Number(unreadCount.rows[0]?.count ?? 0),
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('notifications', err)
    return json({ error: 'Internal server error' }, 500)
  }
}

// Re-export for back-compat: other functions previously imported createNotification from here
export { createNotification } from './_lib/notifications.js'
