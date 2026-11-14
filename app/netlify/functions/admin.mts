/**
 * Netlify Function — Admin API. ALL endpoints require admin email allowlist.
 *
 * GET  /api/admin/stats       → dashboard metrics
 * GET  /api/admin/overrides   → list free overrides
 * POST /api/admin/overrides   → add a free override (FreeOverrideInput)
 * DELETE /api/admin/overrides → remove a free override (by email)
 * GET  /api/admin/analytics   → block usage, categories, hour heatmap
 * GET  /api/admin/tables      → row counts per known table
 */

import {
  json, cors, logError, withRequest, parsePath, verifyFromRequest, tursoExecute, isTursoConfigured,
  isAdmin,
} from './_lib/index.js'
import { FreeOverrideInput, Email } from '../../src/schema/index.js'

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const user = await verifyFromRequest(req)
  if (!isAdmin(user)) return json({ error: 'Admin access required' }, 403)
  if (!isTursoConfigured()) return json({ error: 'DB not configured' }, 500)

  const segments = parsePath(req, 'admin')

  try {
    // GET /api/admin/stats — dashboard metrics
    if (segments[0] === 'stats') {
      const [projects, users, classrooms, assignments, submissions, discussions, chats, dailyScores, notifications, subs] = await Promise.all([
        tursoExecute('SELECT COUNT(*) as c FROM projects'),
        tursoExecute('SELECT COUNT(DISTINCT author_id) as c FROM projects WHERE author_name != ?', ['CryptoBlocks']),
        tursoExecute('SELECT COUNT(*) as c FROM classrooms'),
        tursoExecute('SELECT COUNT(*) as c FROM assignments'),
        tursoExecute('SELECT COUNT(*) as c FROM submissions'),
        tursoExecute('SELECT COUNT(*) as c FROM discussions'),
        tursoExecute('SELECT COUNT(*) as c FROM chat_messages'),
        tursoExecute('SELECT COUNT(*) as c FROM daily_scores'),
        tursoExecute('SELECT COUNT(*) as c FROM notifications'),
        tursoExecute('SELECT COUNT(*) as c FROM subscriptions WHERE status = ?', ['active']),
      ])

      // Projects per day (last 14 days)
      const projectsByDay = await tursoExecute(
        `SELECT date(created_at/1000, 'unixepoch') as day, COUNT(*) as count
         FROM projects WHERE created_at > ? GROUP BY day ORDER BY day`,
        [Date.now() - 14 * 86400000],
      )

      // Top authors
      const topAuthors = await tursoExecute(
        `SELECT author_name, COUNT(*) as projects, SUM(likes) as likes
         FROM projects WHERE author_name != 'CryptoBlocks'
         GROUP BY author_name ORDER BY projects DESC LIMIT 10`,
      )

      // Recent activity
      const recentProjects = await tursoExecute(
        'SELECT id, name, author_name, category, created_at FROM projects ORDER BY created_at DESC LIMIT 10',
      )

      return json({
        totals: {
          projects: Number(projects.rows[0]?.c ?? 0),
          uniqueAuthors: Number(users.rows[0]?.c ?? 0),
          classrooms: Number(classrooms.rows[0]?.c ?? 0),
          assignments: Number(assignments.rows[0]?.c ?? 0),
          submissions: Number(submissions.rows[0]?.c ?? 0),
          discussions: Number(discussions.rows[0]?.c ?? 0),
          chatMessages: Number(chats.rows[0]?.c ?? 0),
          dailySolves: Number(dailyScores.rows[0]?.c ?? 0),
          notifications: Number(notifications.rows[0]?.c ?? 0),
          activeSubscriptions: Number(subs.rows[0]?.c ?? 0),
        },
        projectsByDay: projectsByDay.rows.map(r => ({ day: r.day, count: Number(r.count) })),
        topAuthors: topAuthors.rows.map(r => ({ name: r.author_name, projects: Number(r.projects), likes: Number(r.likes) })),
        recentProjects: recentProjects.rows.map(r => ({
          id: r.id, name: r.name, author: r.author_name, category: r.category, createdAt: r.created_at,
        })),
      })
    }

    // GET /api/admin/overrides — list free overrides
    if (segments[0] === 'overrides' && req.method === 'GET') {
      const result = await tursoExecute('SELECT * FROM free_overrides ORDER BY created_at DESC')
      return json({
        overrides: result.rows.map(r => ({
          email: r.email, plan: r.plan, note: r.note, createdAt: r.created_at,
        })),
      })
    }

    // POST /api/admin/overrides — add a free override
    if (segments[0] === 'overrides' && req.method === 'POST') {
      const raw = await req.json().catch(() => null)
      const parsed = FreeOverrideInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { email, plan, note } = parsed.data
      await tursoExecute(
        'INSERT OR REPLACE INTO free_overrides (email, plan, note, created_at) VALUES (?, ?, ?, ?)',
        [email, plan ?? 'pro', note ?? '', Date.now()],
      )
      return json({ ok: true })
    }

    // DELETE /api/admin/overrides — remove a free override (by email)
    if (segments[0] === 'overrides' && req.method === 'DELETE') {
      const raw = await req.json().catch(() => null)
      const emailParsed = Email.safeParse((raw as { email?: unknown })?.email ?? '')
      if (!emailParsed.success) return json({ error: 'Invalid email' }, 400)
      await tursoExecute('DELETE FROM free_overrides WHERE email = ?', [emailParsed.data])
      return json({ ok: true })
    }

    // GET /api/admin/analytics — block usage, categories, activity patterns
    if (segments[0] === 'analytics') {
      // Parse workspace JSON from projects to count block usage.
      // Skip rows larger than MAX_WORKSPACE_BYTES — with a 2MB schema cap
      // and LIMIT 200, one dashboard load could otherwise hold ~400MB in
      // a single function invocation (caps memory usage to prevent OOM on admin dashboard load).
      const MAX_WORKSPACE_BYTES = 256 * 1024
      const workspaces = await tursoExecute(
        `SELECT workspace_json FROM projects
         WHERE workspace_json IS NOT NULL
           AND length(workspace_json) <= ?
         LIMIT 200`,
        [MAX_WORKSPACE_BYTES],
      )
      const blockCounts: Record<string, number> = {}
      const MAX_BLOCK_DEPTH = 50 // prevents stack overflow on cyclic/malicious workspace JSON
      for (const row of workspaces.rows) {
        try {
          const ws = JSON.parse(String(row.workspace_json))
          const blocks = ws?.blocks?.blocks || []
          const countBlocks = (block: Record<string, unknown>, depth: number): void => {
            if (!block || depth >= MAX_BLOCK_DEPTH) return
            if (block.type) {
              const k = String(block.type).replace('cb_', '')
              blockCounts[k] = (blockCounts[k] || 0) + 1
            }
            if (block.next && typeof block.next === 'object') {
              countBlocks((block.next as Record<string, unknown>).block as Record<string, unknown>, depth + 1)
            }
            if (block.inputs && typeof block.inputs === 'object') {
              for (const v of Object.values(block.inputs as Record<string, Record<string, unknown>>)) {
                if (v?.block) countBlocks(v.block as Record<string, unknown>, depth + 1)
                if (v?.shadow) countBlocks(v.shadow as Record<string, unknown>, depth + 1)
              }
            }
          }
          for (const b of blocks) countBlocks(b as Record<string, unknown>, 0)
        } catch (_e) { /* skip */ }
      }
      const topBlocks = Object.entries(blockCounts).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([name, count]) => ({ name, count }))

      const byCategory = await tursoExecute('SELECT category, COUNT(*) as count FROM projects GROUP BY category ORDER BY count DESC')
      const byHour = await tursoExecute(
        "SELECT CAST(((created_at / 1000) % 86400) / 3600 AS INTEGER) as hour, COUNT(*) as count FROM projects GROUP BY hour ORDER BY hour"
      )
      const classroomSizes = await tursoExecute(
        'SELECT c.name, COUNT(cm.user_id) as members FROM classrooms c LEFT JOIN class_members cm ON c.id = cm.classroom_id GROUP BY c.id ORDER BY members DESC LIMIT 10'
      )
      const likesData = await tursoExecute(
        "SELECT SUM(CASE WHEN likes = 0 THEN 1 ELSE 0 END) as z, SUM(CASE WHEN likes BETWEEN 1 AND 5 THEN 1 ELSE 0 END) as l, SUM(CASE WHEN likes > 5 THEN 1 ELSE 0 END) as h FROM projects"
      )

      return json({
        topBlocks,
        totalUniqueBlocks: Object.keys(blockCounts).length,
        totalBlockUsages: Object.values(blockCounts).reduce((a, b) => a + b, 0),
        byCategory: byCategory.rows.map(r => ({ category: r.category, count: Number(r.count) })),
        byHour: byHour.rows.map(r => ({ hour: Number(r.hour), count: Number(r.count) })),
        classroomSizes: classroomSizes.rows.map(r => ({ name: r.name, members: Number(r.members) })),
        likesDistribution: { zero: Number(likesData.rows[0]?.z ?? 0), low: Number(likesData.rows[0]?.l ?? 0), high: Number(likesData.rows[0]?.h ?? 0) },
      })
    }

    // GET /api/admin/tables — row counts (parallel)
    if (segments[0] === 'tables') {
      const ALLOWED_TABLES = ['projects', 'classrooms', 'class_members', 'assignments', 'submissions',
        'discussions', 'replies', 'chat_messages', 'daily_scores', 'notifications',
        'subscriptions', 'free_overrides'] as const
      const results = await Promise.all(
        ALLOWED_TABLES.map((t) =>
          tursoExecute(`SELECT COUNT(*) as c FROM "${t.replace(/"/g, '')}"`)
            .then((r) => [t, Number(r.rows[0]?.c ?? 0)] as const)
            .catch(() => [t, 0] as const),
        ),
      )
      const counts: Record<string, number> = Object.fromEntries(results)
      return json({ tables: counts })
    }

    // GET /api/admin/users/search?q=name — search users by name
    if (segments[0] === 'users' && segments[1] === 'search' && req.method === 'GET') {
      const q = new URL(req.url).searchParams.get('q')?.slice(0, 100)
      if (!q) return json({ users: [] })
      const result = await tursoExecute(
        `SELECT DISTINCT author_id, author_name, COUNT(*) as projects, SUM(likes) as likes
         FROM projects WHERE author_name LIKE ? AND author_id != 'system'
         GROUP BY author_id ORDER BY projects DESC LIMIT 20`,
        [`%${q}%`],
      )
      // Check ban status for each user
      const users = []
      for (const r of result.rows) {
        const ban = await tursoExecute(
          'SELECT expires_at, reason FROM user_bans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
          [String(r.author_id)],
        ).catch(() => ({ rows: [] }))
        const activeBan = ban.rows.length > 0 && Number(ban.rows[0].expires_at) > Date.now()
          ? { expiresAt: Number(ban.rows[0].expires_at), reason: String(ban.rows[0].reason) }
          : null
        users.push({
          userId: r.author_id,
          name: r.author_name,
          projects: Number(r.projects),
          likes: Number(r.likes),
          ban: activeBan,
        })
      }
      return json({ users })
    }

    // POST /api/admin/users/ban — ban a user for N days
    if (segments[0] === 'users' && segments[1] === 'ban' && req.method === 'POST') {
      const raw = await req.json().catch(() => null)
      const userId = (raw as { userId?: string })?.userId
      const days = (raw as { days?: number })?.days
      const reason = (raw as { reason?: string })?.reason || 'Admin action'
      if (!userId || !days || days < 1 || days > 365) {
        return json({ error: 'Invalid input — userId and days (1-365) required' }, 400)
      }
      // Create bans table if needed
      await tursoExecute(`CREATE TABLE IF NOT EXISTS user_bans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        admin_id TEXT NOT NULL
      )`).catch(() => {})

      const expiresAt = Date.now() + days * 86400000
      await tursoExecute(
        'INSERT INTO user_bans (id, user_id, reason, expires_at, created_at, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), userId, reason, expiresAt, Date.now(), user!.sub],
      )
      return json({ ok: true, expiresAt })
    }

    // POST /api/admin/users/unban — remove active bans
    if (segments[0] === 'users' && segments[1] === 'unban' && req.method === 'POST') {
      const raw = await req.json().catch(() => null)
      const userId = (raw as { userId?: string })?.userId
      if (!userId) return json({ error: 'userId required' }, 400)
      await tursoExecute('DELETE FROM user_bans WHERE user_id = ?', [userId])
      return json({ ok: true })
    }

    // DELETE /api/admin/users/:userId — delete all user data (orphan remixes)
    if (segments[0] === 'users' && segments.length === 2 && req.method === 'DELETE') {
      const userId = segments[1]

      // Anonymize their projects (orphan remixes)
      await tursoExecute(
        "UPDATE projects SET author_name = '[deleted]', author_id = 'deleted' WHERE author_id = ?",
        [userId],
      )
      // Delete their achievements, likes, notifications, classroom memberships
      await Promise.all([
        tursoExecute('DELETE FROM user_achievements WHERE user_id = ?', [userId]).catch(() => {}),
        tursoExecute('DELETE FROM project_likes WHERE user_id = ?', [userId]).catch(() => {}),
        tursoExecute('DELETE FROM sprite_likes WHERE user_id = ?', [userId]).catch(() => {}),
        tursoExecute('DELETE FROM notifications WHERE user_id = ?', [userId]).catch(() => {}),
        tursoExecute('DELETE FROM class_members WHERE user_id = ?', [userId]).catch(() => {}),
        tursoExecute('DELETE FROM daily_scores WHERE user_id = ?', [userId]).catch(() => {}),
        tursoExecute('DELETE FROM project_reports WHERE reporter_id = ?', [userId]).catch(() => {}),
        tursoExecute('DELETE FROM user_bans WHERE user_id = ?', [userId]).catch(() => {}),
      ])

      return json({ ok: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('admin', err)
    return json({ error: 'Internal error' }, 500)
  }
}

export default withRequest(handler)
