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

// -- Clerk JWT verification (lightweight, no SDK dependency) ----------------

interface ClerkTokenPayload {
  sub: string
  name?: string
  email?: string
}

async function verifyClerkToken(token: string): Promise<ClerkTokenPayload | null> {
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
            email: user.email_addresses?.[0]?.email_address,
          }
        }
      } catch {}
    }
    return { sub: payload.sub }
  } catch {
    return null
  }
}

// -- Content moderation -----------------------------------------------------

const BANNED_WORDS = [
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'dick', 'pussy', 'cock', 'cunt',
  'nigger', 'nigga', 'faggot', 'retard', 'slut', 'whore', 'porn', 'xxx',
  'kill yourself', 'kys',
]

const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi

function moderateContent(name: string, description: string): string | null {
  const combined = `${name} ${description}`.toLowerCase()

  for (const word of BANNED_WORDS) {
    if (combined.includes(word)) {
      return 'Project contains inappropriate language. Please edit and try again.'
    }
  }

  if (URL_PATTERN.test(name) || URL_PATTERN.test(description)) {
    return 'URLs are not allowed in project names or descriptions.'
  }

  return null
}

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

    // POST /api/projects — publish a project (requires Clerk auth)
    if (req.method === 'POST' && segments.length === 0) {
      // Verify Clerk JWT from Authorization header
      const authHeader = req.headers.get('Authorization') || ''
      const token = authHeader.replace('Bearer ', '')
      const clerkUser = await verifyClerkToken(token)

      if (!clerkUser && process.env.CLERK_SECRET_KEY) {
        return json({ error: 'Sign in to upload projects' }, 401)
      }

      const body = await req.json()
      const { name, authorName, description, category, workspaceJson, tags, blockCount, parentId } = body

      if (!name || !workspaceJson) {
        return json({ error: 'name and workspaceJson are required' }, 400)
      }

      // --- Content moderation ---
      const moderationError = moderateContent(String(name), String(description || ''))
      if (moderationError) {
        return json({ error: moderationError }, 400)
      }

      const id = crypto.randomUUID()
      const now = Date.now()

      await tursoExecute(
        `INSERT INTO projects (id, name, author_id, author_name, description, category, workspace_json, tags, block_count, parent_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          String(name).slice(0, 100),
          clerkUser?.sub || 'anonymous',
          String(authorName || clerkUser?.name || 'Anonymous').slice(0, 50),
          String(description || '').slice(0, 500),
          String(category || 'General').slice(0, 50),
          String(workspaceJson),
          JSON.stringify(tags || []),
          Number(blockCount) || 0,
          parentId || null,
          now,
        ],
      )

      // Notify the original author if this is a remix
      if (parentId && clerkUser) {
        const parent = await tursoExecute('SELECT author_id, name FROM projects WHERE id = ?', [parentId])
        const parentAuthor = parent.rows[0]?.author_id
        if (parentAuthor && parentAuthor !== clerkUser.sub) {
          await createNotificationDirect(
            String(parentAuthor), 'remix',
            'Your project was remixed!',
            `Someone remixed "${parent.rows[0]?.name}" into "${String(name).slice(0, 50)}"`,
            `/shareplace`,
          )
        }
      }

      return json({ id, name, createdAt: now }, 201)
    }

    // POST /api/projects/:id/report — flag a project for review
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'report') {
      const reportAuth = req.headers.get('Authorization') || ''
      const reportUser = await verifyClerkToken(reportAuth.replace('Bearer ', ''))
      if (!reportUser && process.env.CLERK_SECRET_KEY) {
        return json({ error: 'Sign in to report' }, 401)
      }
      const body = await req.json()
      const reason = String(body.reason || 'No reason given').slice(0, 500)
      // eslint-disable-next-line no-console
      console.log(`[REPORT] Project ${segments[0]} reported by ${reportUser?.sub || 'anon'}: ${reason}`)
      return json({ ok: true, message: 'Thank you for reporting. We will review this project.' })
    }

    // POST /api/projects/:id/download — increment download count
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'download') {
      await tursoExecute(
        'UPDATE projects SET downloads = downloads + 1 WHERE id = ?',
        [segments[0]],
      )
      return json({ ok: true })
    }

    // POST /api/projects/:id/like (auth required to prevent spam)
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'like') {
      const authHeader = req.headers.get('Authorization') || ''
      const likeToken = authHeader.replace('Bearer ', '')
      const likeUser = await verifyClerkToken(likeToken)
      if (!likeUser && process.env.CLERK_SECRET_KEY) {
        return json({ error: 'Sign in to like projects' }, 401)
      }
      await tursoExecute(
        'UPDATE projects SET likes = likes + 1 WHERE id = ?',
        [segments[0]],
      )
      // Notify the project author
      if (likeUser) {
        const project = await tursoExecute('SELECT author_id, name FROM projects WHERE id = ?', [segments[0]])
        const authorId = project.rows[0]?.author_id
        if (authorId && authorId !== likeUser.sub) {
          await createNotificationDirect(
            String(authorId), 'like',
            'New like!',
            `Someone liked your project "${project.rows[0]?.name}"`,
            `/shareplace`,
          )
        }
      }
      return json({ ok: true })
    }

    // GET /api/projects/:id/tree — remix lineage (ancestors + descendants)
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'tree') {
      const projectId = segments[0]

      // Get ancestors (walk parent_id chain up)
      const ancestors: TursoRow[] = []
      let currentId: string | null = projectId
      while (currentId) {
        const row = await tursoExecute(
          'SELECT id, name, author_name, parent_id, created_at, likes FROM projects WHERE id = ?',
          [currentId],
        )
        if (row.rows.length === 0) break
        const r = row.rows[0]
        if (String(r.id) !== projectId) ancestors.unshift(r)
        currentId = r.parent_id ? String(r.parent_id) : null
      }

      // Get direct descendants (one level — children that have parent_id = this project)
      const children = await tursoExecute(
        'SELECT id, name, author_name, parent_id, created_at, likes FROM projects WHERE parent_id = ? ORDER BY created_at ASC',
        [projectId],
      )

      // Get total remix count (recursive — all descendants)
      const allDescendants = await tursoExecute(
        `WITH RECURSIVE tree AS (
           SELECT id FROM projects WHERE parent_id = ?
           UNION ALL
           SELECT p.id FROM projects p JOIN tree t ON p.parent_id = t.id
         )
         SELECT COUNT(*) as count FROM tree`,
        [projectId],
      )
      const remixCount = Number(allDescendants.rows[0]?.count ?? 0)

      return json({
        ancestors: ancestors.map(formatTreeNode),
        children: children.rows.map(formatTreeNode),
        remixCount,
      })
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

function formatTreeNode(row: TursoRow) {
  return {
    id: row.id,
    name: row.name,
    authorName: row.author_name,
    parentId: row.parent_id,
    createdAt: row.created_at,
    likes: row.likes,
  }
}

function tryParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return [] }
}

async function createNotificationDirect(userId: string, type: string, title: string, body: string, link: string): Promise<void> {
  try {
    const baseUrl = (process.env.TURSO_URL || '').replace('libsql://', 'https://')
    const token = process.env.TURSO_AUTH_TOKEN || ''
    if (!baseUrl || !token) return
    await tursoExecute(
      'INSERT INTO notifications (id, user_id, type, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), userId, type, title, body, link, Date.now()],
    )
  } catch {}
}
