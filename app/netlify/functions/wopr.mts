/**
 * Netlify Function — WOPR Signaling API (anonymous easter egg).
 *
 * Routes:
 *   POST /api/wopr/create            → create a session, return { sessionId }
 *   GET  /api/wopr/status/:sessionId → poll session status, return { status }
 *   POST /api/wopr/connect/:sessionId → update status ('phreaking' | 'connected')
 */

import {
  json, cors, logError, withRequest, parsePath,
  tursoExecute, isTursoConfigured,
} from './_lib/index.js'

const SESSION_TTL_MS = 10 * 60 * 1000 // 10 minutes

let migrated = false
let migrating: Promise<void> | null = null

async function ensureSchema(): Promise<void> {
  if (migrated) return
  if (migrating) { await migrating; return }
  migrating = (async () => {
    await tursoExecute(`CREATE TABLE IF NOT EXISTS wopr_sessions (
      session_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'waiting',
      created_at INTEGER NOT NULL
    )`).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      if (!/already exists/i.test(msg)) logError('wopr:migrate', err)
    })
    migrated = true
  })()
  await migrating
}

function randomHex8(): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'wopr')

  try {
    if (!isTursoConfigured()) {
      return json({ error: 'Database not configured' }, 500)
    }
    await ensureSchema()

    // POST /api/wopr/create — create a new session
    if (req.method === 'POST' && segments[0] === 'create') {
      const now = Date.now()
      const cutoff = now - SESSION_TTL_MS

      // Garbage collect expired sessions
      await tursoExecute(
        'DELETE FROM wopr_sessions WHERE created_at < ?',
        [cutoff],
      ).catch((err) => logError('wopr:gc', err))

      const sessionId = randomHex8()
      await tursoExecute(
        'INSERT INTO wopr_sessions (session_id, status, created_at) VALUES (?, ?, ?)',
        [sessionId, 'waiting', now],
      )

      return json({ sessionId })
    }

    // GET /api/wopr/status/:sessionId — poll session status
    if (req.method === 'GET' && segments[0] === 'status' && segments[1]) {
      const sessionId = segments[1]
      const result = await tursoExecute(
        'SELECT status FROM wopr_sessions WHERE session_id = ?',
        [sessionId],
      )

      if (result.rows.length === 0) {
        return json({ error: 'Session not found' }, 404)
      }

      return json({ status: String(result.rows[0].status) })
    }

    // POST /api/wopr/connect/:sessionId — phone updates session status
    if (req.method === 'POST' && segments[0] === 'connect' && segments[1]) {
      const sessionId = segments[1]

      const rawText = await req.text().catch(() => '')
      let raw: unknown
      try { raw = JSON.parse(rawText) } catch { raw = null }

      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return json({ error: 'Invalid input' }, 400)
      }

      const body = raw as Record<string, unknown>
      const status = body.status

      if (status !== 'phreaking' && status !== 'connected') {
        return json({ error: 'Invalid status' }, 400)
      }

      const result = await tursoExecute(
        'UPDATE wopr_sessions SET status = ? WHERE session_id = ?',
        [status, sessionId],
      )

      if (result.rowsAffected === 0) {
        return json({ error: 'Session not found' }, 404)
      }

      return json({ ok: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('wopr', err)
    return json({ error: 'Internal server error' }, 500)
  }
}

export default withRequest(handler)
