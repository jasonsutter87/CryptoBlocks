/**
 * Netlify Function — Global Leaderboard.
 *
 * GET /api/leaderboard — returns top builders, most loved, and most remixed.
 * All computed from the existing projects table — no new schema needed.
 */

interface TursoRow { [key: string]: unknown }

async function tursoExecute(sql: string, args: (string | number | null)[] = []): Promise<{ rows: TursoRow[] }> {
  const baseUrl = (process.env.TURSO_URL || '').replace('libsql://', 'https://')
  const token = process.env.TURSO_AUTH_TOKEN || ''

  const res = await fetch(`${baseUrl}/v3/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map((a) => {
              if (a === null) return { type: 'null', value: null }
              if (typeof a === 'number') return { type: Number.isInteger(a) ? 'integer' : 'float', value: String(a) }
              return { type: 'text', value: String(a) }
            }),
          },
        },
        { type: 'close' },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Turso HTTP ${res.status}: ${body.slice(0, 200)}`)
  }

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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export default async function handler() {
  try {
    if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
      return json({ error: 'Database not configured' }, 500)
    }

    // Top Builders — most projects shared (exclude seed author "CryptoBlocks")
    const builders = await tursoExecute(`
      SELECT author_name, COUNT(*) as project_count, SUM(likes) as total_likes
      FROM projects
      WHERE author_name != 'CryptoBlocks'
      GROUP BY author_name
      ORDER BY project_count DESC, total_likes DESC
      LIMIT 20
    `)

    // Most Loved — individual projects with most likes
    const loved = await tursoExecute(`
      SELECT id, name, author_name, likes, category
      FROM projects
      WHERE likes > 0
      ORDER BY likes DESC
      LIMIT 20
    `)

    // Most Remixed — projects with the most direct children
    const remixed = await tursoExecute(`
      SELECT p.id, p.name, p.author_name, p.category,
             COUNT(c.id) as remix_count
      FROM projects p
      JOIN projects c ON c.parent_id = p.id
      GROUP BY p.id
      ORDER BY remix_count DESC
      LIMIT 20
    `)

    // Global stats
    const globalStats = await tursoExecute(`
      SELECT
        COUNT(*) as total_projects,
        COUNT(DISTINCT author_name) as total_builders,
        SUM(likes) as total_likes,
        COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as total_remixes
      FROM projects
      WHERE author_name != 'CryptoBlocks'
    `)

    return json({
      topBuilders: builders.rows.map((r) => ({
        authorName: r.author_name,
        projectCount: Number(r.project_count),
        totalLikes: Number(r.total_likes),
      })),
      mostLoved: loved.rows.map((r) => ({
        id: r.id,
        name: r.name,
        authorName: r.author_name,
        likes: Number(r.likes),
        category: r.category,
      })),
      mostRemixed: remixed.rows.map((r) => ({
        id: r.id,
        name: r.name,
        authorName: r.author_name,
        category: r.category,
        remixCount: Number(r.remix_count),
      })),
      global: globalStats.rows[0] ? {
        totalProjects: Number(globalStats.rows[0].total_projects),
        totalBuilders: Number(globalStats.rows[0].total_builders),
        totalLikes: Number(globalStats.rows[0].total_likes),
        totalRemixes: Number(globalStats.rows[0].total_remixes),
      } : { totalProjects: 0, totalBuilders: 0, totalLikes: 0, totalRemixes: 0 },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Leaderboard error:', message)
    return json({ error: 'Internal server error', detail: message }, 500)
  }
}
