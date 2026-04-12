/**
 * Netlify Function — Classrooms API for the Teacher Dashboard.
 *
 * Routes:
 *   POST /api/classrooms           → create a classroom (teacher, auth required)
 *   GET  /api/classrooms           → list my classrooms (teacher + student)
 *   GET  /api/classrooms/:id       → classroom detail + members + their projects
 *   POST /api/classrooms/join      → join with a code (student, auth required)
 */

// -- Clerk JWT verification ------------------------------------------------

async function verifyClerkToken(token: string): Promise<{ sub: string; name?: string; avatar?: string } | null> {
  if (!token || !process.env.CLERK_SECRET_KEY) return null
  try {
    const res = await fetch('https://api.clerk.com/v1/tokens/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { sub: data.sub || data.user_id || '', name: data.name, avatar: data.image_url }
  } catch {
    return null
  }
}

// -- Turso HTTP client (same as projects function) -------------------------

interface TursoRow { [key: string]: unknown }
interface TursoResult { rows: TursoRow[] }

async function tursoExecute(sql: string, args: (string | number | null)[] = []): Promise<TursoResult> {
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// -- Handler ----------------------------------------------------------------

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const url = new URL(req.url)
  const cleanPath = url.pathname
    .replace('/.netlify/functions/classrooms', '')
    .replace('/api/classrooms', '')
  const segments = cleanPath.split('/').filter(Boolean)

  try {
    if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
      return json({ error: 'Database not configured' }, 500)
    }

    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    const user = await verifyClerkToken(token)

    // POST /api/classrooms — create a classroom
    if (req.method === 'POST' && segments.length === 0) {
      if (!user) return json({ error: 'Sign in to create a classroom' }, 401)

      const body = await req.json()
      const { name } = body
      if (!name) return json({ error: 'name is required' }, 400)

      const id = crypto.randomUUID()
      const joinCode = generateJoinCode()
      const now = Date.now()

      await tursoExecute(
        'INSERT INTO classrooms (id, name, join_code, teacher_id, teacher_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, String(name).slice(0, 100), joinCode, user.sub, String(user.name || 'Teacher').slice(0, 50), now],
      )

      // Also add the teacher as a member with role "teacher"
      await tursoExecute(
        'INSERT INTO class_members (classroom_id, user_id, user_name, user_avatar, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, user.sub, String(user.name || 'Teacher').slice(0, 50), user.avatar || '', 'teacher', now],
      )

      return json({ id, name, joinCode, createdAt: now }, 201)
    }

    // POST /api/classrooms/join — join with a code
    if (req.method === 'POST' && segments.length === 1 && segments[0] === 'join') {
      if (!user) return json({ error: 'Sign in to join a classroom' }, 401)

      const body = await req.json()
      const code = String(body.code || '').toUpperCase().trim()
      if (!code) return json({ error: 'Join code is required' }, 400)

      const classroom = await tursoExecute(
        'SELECT id, name FROM classrooms WHERE join_code = ?',
        [code],
      )
      if (classroom.rows.length === 0) {
        return json({ error: 'Invalid join code' }, 404)
      }

      const classroomId = String(classroom.rows[0].id)
      const classroomName = String(classroom.rows[0].name)

      // Check if already a member
      const existing = await tursoExecute(
        'SELECT 1 FROM class_members WHERE classroom_id = ? AND user_id = ?',
        [classroomId, user.sub],
      )
      if (existing.rows.length === 0) {
        await tursoExecute(
          'INSERT INTO class_members (classroom_id, user_id, user_name, user_avatar, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
          [classroomId, user.sub, String(user.name || 'Student').slice(0, 50), user.avatar || '', 'student', Date.now()],
        )
      }

      return json({ classroomId, classroomName })
    }

    // GET /api/classrooms/:id — classroom detail + members + their projects
    if (req.method === 'GET' && segments.length === 1) {
      const classroomId = segments[0]

      const classroom = await tursoExecute(
        'SELECT * FROM classrooms WHERE id = ?',
        [classroomId],
      )
      if (classroom.rows.length === 0) return json({ error: 'Not found' }, 404)

      const members = await tursoExecute(
        'SELECT * FROM class_members WHERE classroom_id = ? ORDER BY joined_at ASC',
        [classroomId],
      )

      // Fetch projects by class members
      const memberIds = members.rows.map((m) => String(m.user_id))
      let projects: TursoRow[] = []
      if (memberIds.length > 0) {
        const placeholders = memberIds.map(() => '?').join(',')
        const result = await tursoExecute(
          `SELECT id, name, author_id, author_name, category, block_count, likes, created_at
           FROM projects WHERE author_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 50`,
          memberIds,
        )
        projects = result.rows
      }

      const c = classroom.rows[0]
      return json({
        id: c.id,
        name: c.name,
        joinCode: c.join_code,
        teacherId: c.teacher_id,
        teacherName: c.teacher_name,
        createdAt: c.created_at,
        members: members.rows.map((m) => ({
          userId: m.user_id,
          userName: m.user_name,
          userAvatar: m.user_avatar,
          role: m.role,
          joinedAt: m.joined_at,
        })),
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          authorId: p.author_id,
          authorName: p.author_name,
          category: p.category,
          blockCount: p.block_count,
          likes: p.likes,
          createdAt: p.created_at,
        })),
      })
    }

    // GET /api/classrooms — list my classrooms
    if (req.method === 'GET' && segments.length === 0) {
      if (!user) return json({ error: 'Sign in to see your classrooms' }, 401)

      const result = await tursoExecute(
        `SELECT c.id, c.name, c.join_code, c.teacher_id, c.teacher_name, c.created_at,
                (SELECT COUNT(*) FROM class_members WHERE classroom_id = c.id) as member_count
         FROM classrooms c
         WHERE c.id IN (SELECT classroom_id FROM class_members WHERE user_id = ?)
         ORDER BY c.created_at DESC`,
        [user.sub],
      )

      return json({
        classrooms: result.rows.map((c) => ({
          id: c.id,
          name: c.name,
          joinCode: c.join_code,
          teacherId: c.teacher_id,
          teacherName: c.teacher_name,
          memberCount: Number(c.member_count),
          createdAt: c.created_at,
        })),
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Classrooms API error:', message)
    return json({ error: 'Internal server error', detail: message }, 500)
  }
}
