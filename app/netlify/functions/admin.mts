/**
 * Netlify Function — Admin API.
 *
 * GET  /api/admin/stats       → dashboard metrics
 * GET  /api/admin/users       → recent users from projects/classrooms
 * GET  /api/admin/overrides   → list free overrides
 * POST /api/admin/overrides   → add/remove free override
 * GET  /api/admin/reported    → reported projects
 * GET  /api/admin/tables      → row counts per table
 */

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
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  })
}

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.sub || !process.env.CLERK_SECRET_KEY) return false
    const res = await fetch(`https://api.clerk.com/v1/users/${payload.sub}`, {
      headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (!res.ok) return false
    const user = await res.json()
    const email = user.email_addresses?.[0]?.email_address?.toLowerCase() || ''
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
    return adminEmails.includes(email)
  } catch (_e) { return false }
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } })

  if (!await verifyAdmin(req)) return json({ error: 'Admin access required' }, 403)
  if (!process.env.TURSO_URL) return json({ error: 'DB not configured' }, 500)

  const url = new URL(req.url)
  const path = url.pathname.replace('/.netlify/functions/admin', '').replace('/api/admin', '')
  const segments = path.split('/').filter(Boolean)

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

    // POST /api/admin/overrides — add override
    if (segments[0] === 'overrides' && req.method === 'POST') {
      const body = await req.json() as { email: string; plan: string; note?: string }
      if (!body.email) return json({ error: 'email required' }, 400)
      await tursoExecute(
        'INSERT OR REPLACE INTO free_overrides (email, plan, note, created_at) VALUES (?, ?, ?, ?)',
        [body.email.toLowerCase().trim(), body.plan || 'pro', body.note || '', Date.now()],
      )
      return json({ ok: true })
    }

    // DELETE /api/admin/overrides — remove override
    if (segments[0] === 'overrides' && req.method === 'DELETE') {
      const body = await req.json() as { email: string }
      if (!body.email) return json({ error: 'email required' }, 400)
      await tursoExecute('DELETE FROM free_overrides WHERE email = ?', [body.email.toLowerCase().trim()])
      return json({ ok: true })
    }

    // GET /api/admin/analytics — block usage, categories, activity patterns
    if (segments[0] === 'analytics') {
      // Parse workspace JSON from projects to count block usage
      const workspaces = await tursoExecute('SELECT workspace_json FROM projects WHERE workspace_json IS NOT NULL LIMIT 200')
      const blockCounts: Record<string, number> = {}
      for (const row of workspaces.rows) {
        try {
          const ws = JSON.parse(String(row.workspace_json))
          const blocks = ws?.blocks?.blocks || []
          const countBlocks = (block: Record<string, unknown>): void => {
            if (!block) return
            if (block.type) blockCounts[String(block.type).replace('cb_', '')] = (blockCounts[String(block.type).replace('cb_', '')] || 0) + 1
            if (block.next && typeof block.next === 'object') countBlocks((block.next as Record<string, unknown>).block as Record<string, unknown>)
            if (block.inputs && typeof block.inputs === 'object') {
              for (const v of Object.values(block.inputs as Record<string, Record<string, unknown>>)) {
                if (v?.block) countBlocks(v.block as Record<string, unknown>)
                if (v?.shadow) countBlocks(v.shadow as Record<string, unknown>)
              }
            }
          }
          for (const b of blocks) countBlocks(b as Record<string, unknown>)
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

    // GET /api/admin/tables — row counts
    if (segments[0] === 'tables') {
      const ALLOWED_TABLES = new Set(['projects', 'classrooms', 'class_members', 'assignments', 'submissions',
        'discussions', 'replies', 'chat_messages', 'daily_scores', 'notifications',
        'subscriptions', 'free_overrides'])
      const counts: Record<string, number> = {}
      for (const table of ALLOWED_TABLES) {
        const r = await tursoExecute(`SELECT COUNT(*) as c FROM "${table.replace(/"/g, '')}"`)
        counts[table] = Number(r.rows[0]?.c ?? 0)
      }
      return json({ tables: counts })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return json({ error: 'Internal error', detail: err instanceof Error ? err.message : String(err) }, 500)
  }
}
