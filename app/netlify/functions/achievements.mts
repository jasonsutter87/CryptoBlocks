/**
 * Netlify Function — Achievements API.
 *
 * Routes:
 *   GET  /api/achievements          → full achievement catalog
 *   GET  /api/achievements/my       → current user's unlocked badges
 *   POST /api/achievements/unlock   → unlock a badge (idempotent)
 *   GET  /api/achievements/showcase/:userId → another user's badges
 *   GET  /api/achievements/leaderboard     → top users by rarity-weighted score
 */

import {
  json, cors, logError, withRequest, parsePath,
  verifyFromRequest, tursoExecute, isTursoConfigured,
  requireAuth,
} from './_lib/index.js'
import type { ClerkUser, TursoRow } from './_lib/index.js'
import { UnlockInput } from '../../src/schema/index.js'
import { achievements } from '../../src/achievements/definitions.js'

let migrated = false
let migrating: Promise<void> | null = null

async function ensureSchema(): Promise<void> {
  if (migrated) return
  if (migrating) { await migrating; return }
  migrating = (async () => {
    await tursoExecute(`CREATE TABLE IF NOT EXISTS user_achievements (
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, achievement_id)
    )`).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      if (!/already exists/i.test(msg)) logError('achievements:migrate', err)
    })
    migrated = true
  })()
  await migrating
}

/** Rarity weights for leaderboard scoring */
const RARITY_WEIGHT: Record<string, number> = {
  common: 1, rare: 3, epic: 10, legendary: 25,
}

const achievementMap = new Map(achievements.map((a) => [a.id, a]))

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'achievements')

  try {
    if (!isTursoConfigured()) {
      return json({ error: 'Database not configured' }, 500)
    }
    await ensureSchema()

    const user: ClerkUser | null = await verifyFromRequest(req)

    // GET /api/achievements — full catalog
    if (req.method === 'GET' && segments.length === 0) {
      return json({
        achievements: achievements.map((a) => ({
          id: a.id,
          name: a.secret ? '???' : a.name,
          description: a.secret ? 'Hidden achievement' : a.description,
          icon: a.secret ? '🔒' : a.icon,
          rarity: a.rarity,
          secret: a.secret ?? false,
        })),
      })
    }

    // GET /api/achievements/my — user's unlocked badges
    if (req.method === 'GET' && segments[0] === 'my') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const result = await tursoExecute(
        'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC',
        [user!.sub],
      )
      return json({
        unlocked: result.rows.map((r: TursoRow) => ({
          achievementId: r.achievement_id,
          unlockedAt: r.unlocked_at,
        })),
      })
    }

    // POST /api/achievements/unlock — idempotent unlock
    if (req.method === 'POST' && segments[0] === 'unlock') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const raw = await req.json().catch(() => null)
      const parsed = UnlockInput.safeParse(raw)
      if (!parsed.success) {
        return json({ error: 'Invalid input' }, 400)
      }

      const { achievementId } = parsed.data
      if (!achievementMap.has(achievementId)) {
        return json({ error: 'Unknown achievement' }, 400)
      }

      const now = Date.now()
      await tursoExecute(
        'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)',
        [user!.sub, achievementId, now],
      )

      // Return the actual unlocked_at (may be earlier if already unlocked)
      const result = await tursoExecute(
        'SELECT unlocked_at FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [user!.sub, achievementId],
      )
      return json({
        achievementId,
        unlockedAt: result.rows[0]?.unlocked_at ?? now,
      })
    }

    // GET /api/achievements/showcase/:userId — public profile badges
    if (req.method === 'GET' && segments[0] === 'showcase' && segments.length === 2) {
      const userId = segments[1]
      const result = await tursoExecute(
        'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC',
        [userId],
      )
      return json({
        unlocked: result.rows.map((r: TursoRow) => ({
          achievementId: r.achievement_id,
          unlockedAt: r.unlocked_at,
        })),
      })
    }

    // GET /api/achievements/leaderboard — top 20 by rarity-weighted score
    if (req.method === 'GET' && segments[0] === 'leaderboard') {
      const result = await tursoExecute(
        'SELECT user_id, GROUP_CONCAT(achievement_id) as badges FROM user_achievements GROUP BY user_id',
        [],
      )

      const scores: { userId: string; score: number; count: number }[] = []
      for (const row of result.rows) {
        const badges = String(row.badges ?? '').split(',')
        let score = 0
        for (const id of badges) {
          const a = achievementMap.get(id)
          if (a) score += RARITY_WEIGHT[a.rarity] ?? 1
        }
        scores.push({ userId: String(row.user_id), score, count: badges.length })
      }

      scores.sort((a, b) => b.score - a.score)
      return json({ leaderboard: scores.slice(0, 20) })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('achievements', err)
    return json({ error: 'Internal server error' }, 500)
  }
}

export default withRequest(handler)
