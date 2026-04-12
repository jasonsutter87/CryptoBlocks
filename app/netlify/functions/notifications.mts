/**
 * Netlify Function — Notifications API.
 *
 * GET  /api/notifications       → list unread + recent for current user
 * POST /api/notifications/read  → mark all as read
 *
 * Notifications are created server-side by other functions (like, remix,
 * classroom join) — not directly by the client.
 */

async function verifyClerkToken(token: string): Promise<{ sub: string } | null> {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.sub) return null
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const res = await fetch(`https://api.clerk.com/v1/users/${payload.sub}`, {
          headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` },
        })
        if (res.ok) {
          const user = await res.json()
          return { sub: payload.sub }
        }
      } catch {}
    }
    return { sub: payload.sub }
  } catch {
    return null
  }
}

interface TursoRow { [key: string]: unknown }

async function tursoExecute(sql: string, args: (string | number | null)[] = []): Promise<{ rows: TursoRow[] }> {
  const baseUrl = (process.env.TURSO_URL || '').replace('libsql://', 'https://')
  const token = process.env.TURSO_AUTH_TOKEN || ''
  const res = await fetch(`${baseUrl}/v3/pipeline`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map((a) => {
          if (a === null) return { type: 'null', value: null }
          if (typeof a === 'number') return { type: Number.isInteger(a) ? 'integer' : 'float', value: String(a) }
          return { type: 'text', value: String(a) }
        }) } },
        { type: 'close' },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Turso ${res.status}`)
  const data = await res.json()
  const result = data?.results?.[0]?.response?.result
  if (!result) return { rows: [] }
  const cols: string[] = result.cols.map((c: { name: string }) => c.name)
  return {
    rows: result.rows.map((row: Array<{ value: unknown }>) => {
      const obj: TursoRow = {}
      for (let i = 0; i < cols.length; i++) obj[cols[i]] = row[i]?.value ?? null
      return obj
    }),
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  })
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } })

  const url = new URL(req.url)
  const path = url.pathname.replace('/.netlify/functions/notifications', '').replace('/api/notifications', '')
  const segments = path.split('/').filter(Boolean)

  const authHeader = req.headers.get('Authorization') || ''
  const user = await verifyClerkToken(authHeader.replace('Bearer ', ''))

  if (!user) return json({ error: 'Sign in to view notifications' }, 401)
  if (!process.env.TURSO_URL) return json({ error: 'DB not configured' }, 500)

  try {
    // POST /api/notifications/read — mark all as read
    if (req.method === 'POST' && segments[0] === 'read') {
      await tursoExecute(
        'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0',
        [user.sub],
      )
      return json({ ok: true })
    }

    // GET /api/notifications — list recent (last 50)
    if (req.method === 'GET' && segments.length === 0) {
      const result = await tursoExecute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [user.sub],
      )
      const unreadCount = await tursoExecute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
        [user.sub],
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
    return json({ error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) }, 500)
  }
}

/**
 * Helper to create a notification for another user. Called by other functions
 * (projects, classrooms) — not exported as an HTTP endpoint.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link: string,
): Promise<void> {
  const baseUrl = (process.env.TURSO_URL || '').replace('libsql://', 'https://')
  const token = process.env.TURSO_AUTH_TOKEN || ''
  if (!baseUrl || !token) return

  const id = crypto.randomUUID()
  const sql = 'INSERT INTO notifications (id, user_id, type, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  const args = [id, userId, type, title, body, link, Date.now()]

  try {
    await fetch(`${baseUrl}/v3/pipeline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql, args: args.map((a) => {
            if (a === null) return { type: 'null', value: null }
            if (typeof a === 'number') return { type: Number.isInteger(a) ? 'integer' : 'float', value: String(a) }
            return { type: 'text', value: String(a) }
          }) } },
          { type: 'close' },
        ],
      }),
    })
  } catch {}
}
