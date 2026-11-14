/**
 * Server-side session revocation. Sign-out records the session's `sid` here, so a
 * stolen copy of the cookie stops working immediately instead of living out its
 * 7 days. Rows are only needed until the token would have expired anyway.
 *
 * Fails closed: if Turso is configured but the lookup errors, the session is treated
 * as revoked. With no Turso (local dev, unit tests) there is nothing to check.
 */
import { tursoExecute, isTursoConfigured } from './turso.js'

let tableReady = false
async function ensureTable() {
  if (tableReady) return
  await tursoExecute(`CREATE TABLE IF NOT EXISTS revoked_sessions (
    sid TEXT PRIMARY KEY,
    exp INTEGER NOT NULL,
    revoked_at INTEGER NOT NULL
  )`)
  tableReady = true
}

export async function revokeSession(sid: string, expS: number, now = Date.now()): Promise<void> {
  if (!sid || !isTursoConfigured()) return
  await ensureTable()
  await tursoExecute('INSERT OR IGNORE INTO revoked_sessions (sid, exp, revoked_at) VALUES (?, ?, ?)', [sid, expS, now])
  // Housekeeping: drop rows for tokens that have expired on their own.
  await tursoExecute('DELETE FROM revoked_sessions WHERE exp < ?', [Math.floor(now / 1000)]).catch(() => undefined)
}

export async function isRevoked(sid: string | undefined): Promise<boolean> {
  if (!sid || !isTursoConfigured()) return false
  try {
    await ensureTable()
    const r = await tursoExecute('SELECT 1 FROM revoked_sessions WHERE sid = ?', [sid])
    return r.rows.length > 0
  } catch {
    return true
  }
}
