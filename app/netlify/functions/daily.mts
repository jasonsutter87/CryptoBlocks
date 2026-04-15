/**
 * Netlify Function — Daily Challenge API.
 *
 * POST /api/daily/solve  → record a solve (auth required)
 * GET  /api/daily/board  → global leaderboard (top streaks + today's solvers)
 */

import {
  json, cors, logError, parsePath, getQueryParam,
  verifyFromRequest, tursoExecute, isTursoConfigured,
  requireAuth,
} from './_lib/index.js'
import type { TursoRow } from './_lib/index.js'
import { SubmitDailyScoreInput, DayNumber } from '../../src/schema/index.js'

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'daily')
  const user = await verifyFromRequest(req)

  try {
    if (!isTursoConfigured()) return json({ error: 'DB not configured' }, 500)

    // POST /api/daily/solve — record a solve
    if (req.method === 'POST' && segments[0] === 'solve') {
      const authErr = requireAuth(user, 'Sign in to record your score')
      if (authErr) return authErr

      const raw = await req.json().catch(() => null)
      const parsed = SubmitDailyScoreInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { dayNumber, blocksUsed } = parsed.data

      // Upsert — only replace if fewer blocks (better score)
      await tursoExecute(
        `INSERT INTO daily_scores (user_id, user_name, day_number, blocks_used, solved_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (user_id, day_number) DO UPDATE SET
           blocks_used = CASE WHEN excluded.blocks_used < daily_scores.blocks_used THEN excluded.blocks_used ELSE daily_scores.blocks_used END,
           user_name = excluded.user_name`,
        [user!.sub, (user!.name || 'Coder').slice(0, 50), dayNumber, blocksUsed, Date.now()],
      )
      return json({ ok: true })
    }

    // GET /api/daily/board — global leaderboard
    if (req.method === 'GET' && segments[0] === 'board') {
      const streaks = await tursoExecute(`
        SELECT user_name, COUNT(*) as total_solved, MIN(blocks_used) as best_blocks
        FROM daily_scores
        GROUP BY user_id
        ORDER BY total_solved DESC
        LIMIT 20
      `)

      // Today's solvers — validate `day` param
      let todaySolvers: TursoRow[] = []
      const rawDay = getQueryParam(req, 'day')
      if (rawDay !== null) {
        const dayParsed = DayNumber.safeParse(Number(rawDay))
        if (!dayParsed.success) return json({ error: 'Invalid day number' }, 400)
        const result = await tursoExecute(
          'SELECT user_name, blocks_used FROM daily_scores WHERE day_number = ? ORDER BY blocks_used ASC LIMIT 20',
          [dayParsed.data],
        )
        todaySolvers = result.rows
      }

      return json({
        topSolvers: streaks.rows.map((r) => ({
          userName: r.user_name,
          totalSolved: Number(r.total_solved),
          bestBlocks: Number(r.best_blocks),
        })),
        todaySolvers: todaySolvers.map((r) => ({
          userName: r.user_name,
          blocksUsed: Number(r.blocks_used),
        })),
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('daily', err)
    return json({ error: 'Internal server error' }, 500)
  }
}
