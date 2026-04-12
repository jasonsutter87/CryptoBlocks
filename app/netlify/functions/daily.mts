/**
 * Netlify Function — Daily Challenge API.
 *
 * POST /api/daily/solve  → record a solve (auth required)
 * GET  /api/daily/board  → global leaderboard (top streaks + today's solvers)
 */

async function verifyClerkToken(token: string): Promise<{ sub: string; name?: string } | null> {
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
          return {
            sub: payload.sub,
            name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || undefined,
          }
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
  const path = url.pathname.replace('/.netlify/functions/daily', '').replace('/api/daily', '')
  const segments = path.split('/').filter(Boolean)

  try {
    if (!process.env.TURSO_URL) return json({ error: 'DB not configured' }, 500)

    // POST /api/daily/solve — record a solve
    if (req.method === 'POST' && segments[0] === 'solve') {
      const authHeader = req.headers.get('Authorization') || ''
      const user = await verifyClerkToken(authHeader.replace('Bearer ', ''))
      if (!user) return json({ error: 'Sign in to record your score' }, 401)

      const body = await req.json()
      const { dayNumber, blocksUsed } = body
      if (dayNumber == null || blocksUsed == null) return json({ error: 'dayNumber and blocksUsed required' }, 400)

      // Upsert — only replace if fewer blocks (better score)
      await tursoExecute(
        `INSERT INTO daily_scores (user_id, user_name, day_number, blocks_used, solved_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (user_id, day_number) DO UPDATE SET
           blocks_used = CASE WHEN excluded.blocks_used < daily_scores.blocks_used THEN excluded.blocks_used ELSE daily_scores.blocks_used END,
           user_name = excluded.user_name`,
        [user.sub, String(user.name || 'Coder').slice(0, 50), Number(dayNumber), Number(blocksUsed), Date.now()],
      )
      return json({ ok: true })
    }

    // GET /api/daily/board — global leaderboard
    if (req.method === 'GET' && segments[0] === 'board') {
      // Top streaks: users with the most consecutive days solved
      const streaks = await tursoExecute(`
        SELECT user_name, COUNT(*) as total_solved,
               MIN(blocks_used) as best_blocks
        FROM daily_scores
        GROUP BY user_id
        ORDER BY total_solved DESC
        LIMIT 20
      `)

      // Today's solvers (pass dayNumber as query param)
      const dayNumber = url.searchParams.get('day')
      let todaySolvers: TursoRow[] = []
      if (dayNumber) {
        const result = await tursoExecute(
          'SELECT user_name, blocks_used FROM daily_scores WHERE day_number = ? ORDER BY blocks_used ASC LIMIT 20',
          [Number(dayNumber)],
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
    return json({ error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) }, 500)
  }
}
