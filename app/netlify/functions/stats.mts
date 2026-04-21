/**
 * Netlify Function — User Stats API.
 *
 * Routes:
 *   GET  /api/stats/my   → get user's synced stats
 *   POST /api/stats/sync → merge local stats with server (server wins on conflicts)
 */

import {
  json, cors, logError, withRequest, parsePath,
  verifyFromRequest, tursoExecute, isTursoConfigured,
  requireAuth,
} from './_lib/index.js'
import type { ClerkUser } from './_lib/index.js'

let migrated = false
let migrating: Promise<void> | null = null

async function ensureSchema(): Promise<void> {
  if (migrated) return
  if (migrating) { await migrating; return }
  migrating = (async () => {
    await tursoExecute(`CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY,
      stats_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      if (!/already exists/i.test(msg)) logError('stats:migrate', err)
    })
    migrated = true
  })()
  await migrating
}

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'stats')

  try {
    if (!isTursoConfigured()) {
      return json({ error: 'Database not configured' }, 500)
    }
    await ensureSchema()

    const user: ClerkUser | null = await verifyFromRequest(req)

    // GET /api/stats/my — get user's synced stats
    if (req.method === 'GET' && segments[0] === 'my') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const result = await tursoExecute(
        'SELECT stats_json FROM user_stats WHERE user_id = ?',
        [user!.sub],
      )
      if (result.rows.length === 0) {
        return json({ stats: null })
      }
      try {
        return json({ stats: JSON.parse(String(result.rows[0].stats_json)) })
      } catch {
        return json({ stats: null })
      }
    }

    // POST /api/stats/sync — merge local stats with server
    if (req.method === 'POST' && segments[0] === 'sync') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      // Limit request body size to 64 KB to prevent storage abuse
      const contentLength = Number(req.headers.get('Content-Length') ?? 0)
      if (contentLength > 65_536) {
        return json({ error: 'Payload too large' }, 413)
      }

      const rawText = await req.text().catch(() => '')
      if (rawText.length > 65_536) {
        return json({ error: 'Payload too large' }, 413)
      }

      let raw: unknown
      try { raw = JSON.parse(rawText) } catch { raw = null }
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return json({ error: 'Invalid input' }, 400)
      }

      const localStats = raw as Record<string, unknown>

      // Get existing server stats
      const existing = await tursoExecute(
        'SELECT stats_json FROM user_stats WHERE user_id = ?',
        [user!.sub],
      )

      let merged: Record<string, unknown>

      if (existing.rows.length === 0) {
        // First sync — just save local stats
        merged = localStats
      } else {
        // Merge: take the MAX of numeric fields, merge runsByDate
        try {
          const server = JSON.parse(String(existing.rows[0].stats_json)) as Record<string, unknown>

          merged = { ...server }

          // Numeric fields — take the max
          const numericFields = [
            'totalRuns', 'totalBlocks', 'totalLinesGenerated',
            'challengesCompleted', 'golfSolved', 'labExercises',
            'longestProgram', 'currentStreak', 'bestStreak', 'achievementsUnlocked',
          ]
          for (const field of numericFields) {
            merged[field] = Math.max(
              Number(server[field] ?? 0),
              Number(localStats[field] ?? 0),
            )
          }

          // Timestamps — take earliest first, latest last
          merged.firstRunDate = Math.min(
            Number(server.firstRunDate ?? Infinity) || Infinity,
            Number(localStats.firstRunDate ?? Infinity) || Infinity,
          )
          if (merged.firstRunDate === Infinity) merged.firstRunDate = 0
          merged.lastRunDate = Math.max(
            Number(server.lastRunDate ?? 0),
            Number(localStats.lastRunDate ?? 0),
          )

          // runsPerLanguage — take max per language
          const serverLangs = (server.runsPerLanguage ?? {}) as Record<string, number>
          const localLangs = (localStats.runsPerLanguage ?? {}) as Record<string, number>
          merged.runsPerLanguage = {
            javascript: Math.max(serverLangs.javascript ?? 0, localLangs.javascript ?? 0),
            python: Math.max(serverLangs.python ?? 0, localLangs.python ?? 0),
            html: Math.max(serverLangs.html ?? 0, localLangs.html ?? 0),
          }

          // runsByDate — merge, take max per date (cap at 400 entries ≈ ~13 months)
          const MAX_DATE_ENTRIES = 400
          const serverDates = (server.runsByDate ?? {}) as Record<string, number>
          const localDates = (localStats.runsByDate ?? {}) as Record<string, number>
          const mergedDates: Record<string, number> = {}
          // Validate date keys: must match YYYY-MM-DD format
          const dateRe = /^\d{4}-\d{2}-\d{2}$/
          for (const [date, count] of Object.entries(serverDates)) {
            if (dateRe.test(date) && typeof count === 'number' && isFinite(count)) {
              mergedDates[date] = Math.max(0, Math.min(count, 1_000_000))
            }
          }
          for (const [date, count] of Object.entries(localDates)) {
            if (!dateRe.test(date) || typeof count !== 'number' || !isFinite(count)) continue
            const safeCount = Math.max(0, Math.min(count, 1_000_000))
            mergedDates[date] = Math.max(mergedDates[date] ?? 0, safeCount)
          }
          // Keep only most recent entries if over limit
          const dateKeys = Object.keys(mergedDates).sort()
          if (dateKeys.length > MAX_DATE_ENTRIES) {
            for (const key of dateKeys.slice(0, dateKeys.length - MAX_DATE_ENTRIES)) {
              delete mergedDates[key]
            }
          }
          merged.runsByDate = mergedDates
        } catch {
          merged = localStats
        }
      }

      const now = Date.now()
      await tursoExecute(
        `INSERT INTO user_stats (user_id, stats_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET stats_json = ?, updated_at = ?`,
        [user!.sub, JSON.stringify(merged), now, JSON.stringify(merged), now],
      )

      return json({ stats: merged })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('stats', err)
    return json({ error: 'Internal server error' }, 500)
  }
}

export default withRequest(handler)
