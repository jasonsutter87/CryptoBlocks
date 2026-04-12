/**
 * Netlify Function — Shareplace projects API.
 *
 * Uses Turso's raw Hrana HTTP API (fetch-based, no @libsql/client needed)
 * to avoid bundler/runtime compatibility issues in Netlify Functions.
 *
 * Routes:
 *   GET  /api/projects          → list projects (paginated, filterable)
 *   GET  /api/projects/:id      → single project
 *   POST /api/projects          → publish a new project
 *   POST /api/projects/:id/like → increment likes
 */

// -- Minimal Turso HTTP client via fetch -----------------------------------

interface TursoRow {
  [key: string]: unknown
}

interface TursoResult {
  rows: TursoRow[]
}

async function tursoExecute(
  sql: string,
  args: (string | number | null)[] = [],
): Promise<TursoResult> {
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

  if (!result) {
    // DDL or write operations might not return result rows
    return { rows: [] }
  }

  // Convert columnar response → array of objects
  const cols: string[] = result.cols.map((c: { name: string }) => c.name)
  const rows: TursoRow[] = result.rows.map((row: Array<{ value: unknown }>) => {
    const obj: TursoRow = {}
    for (let i = 0; i < cols.length; i++) {
      obj[cols[i]] = row[i]?.value ?? null
    }
    return obj
  })

  return { rows }
}

// -- HTTP helpers -----------------------------------------------------------

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// -- Handler ----------------------------------------------------------------

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const url = new URL(req.url)
  const cleanPath = url.pathname
    .replace('/.netlify/functions/projects', '')
    .replace('/api/projects', '')
  const segments = cleanPath.split('/').filter(Boolean)

  try {
    if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
      return json({ error: 'Database not configured' }, 500)
    }

    // POST /api/projects — publish a project
    if (req.method === 'POST' && segments.length === 0) {
      const body = await req.json()
      const { name, authorName, description, category, workspaceJson, tags, blockCount, parentId } = body

      if (!name || !workspaceJson) {
        return json({ error: 'name and workspaceJson are required' }, 400)
      }

      const id = crypto.randomUUID()
      const now = Date.now()

      await tursoExecute(
        `INSERT INTO projects (id, name, author_name, description, category, workspace_json, tags, block_count, parent_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          String(name).slice(0, 100),
          String(authorName || 'Anonymous').slice(0, 50),
          String(description || '').slice(0, 500),
          String(category || 'General').slice(0, 50),
          String(workspaceJson),
          JSON.stringify(tags || []),
          Number(blockCount) || 0,
          parentId || null,
          now,
        ],
      )

      return json({ id, name, createdAt: now }, 201)
    }

    // POST /api/projects/:id/like
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'like') {
      await tursoExecute(
        'UPDATE projects SET likes = likes + 1 WHERE id = ?',
        [segments[0]],
      )
      return json({ ok: true })
    }

    // GET /api/projects/:id
    if (req.method === 'GET' && segments.length === 1) {
      const result = await tursoExecute(
        'SELECT * FROM projects WHERE id = ?',
        [segments[0]],
      )
      if (result.rows.length === 0) return json({ error: 'Not found' }, 404)
      return json(formatProject(result.rows[0]))
    }

    // GET /api/projects — list
    if (req.method === 'GET' && segments.length === 0) {
      const category = url.searchParams.get('category')
      const search = url.searchParams.get('search')
      const limit = Math.min(50, Number(url.searchParams.get('limit')) || 20)
      const offset = Number(url.searchParams.get('offset')) || 0

      let sql = 'SELECT * FROM projects'
      const args: (string | number)[] = []
      const conditions: string[] = []

      if (category && category !== 'All') {
        conditions.push('category = ?')
        args.push(category)
      }
      if (search) {
        conditions.push('(name LIKE ? OR description LIKE ?)')
        args.push(`%${search}%`, `%${search}%`)
      }
      if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ')
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
      args.push(limit, offset)

      const result = await tursoExecute(sql, args)
      return json({ projects: result.rows.map(formatProject), limit, offset })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Projects API error:', message)
    return json({ error: 'Internal server error', detail: message }, 500)
  }
}

function formatProject(row: TursoRow) {
  return {
    id: row.id,
    name: row.name,
    authorId: row.author_id,
    authorName: row.author_name,
    description: row.description,
    category: row.category,
    workspaceJson: row.workspace_json,
    tags: tryParse(String(row.tags || '[]')),
    blockCount: row.block_count,
    parentId: row.parent_id,
    downloads: row.downloads,
    likes: row.likes,
    createdAt: row.created_at,
  }
}

function tryParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return [] }
}
