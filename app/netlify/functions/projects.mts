/**
 * Netlify Function — Shareplace projects API.
 *
 * Routes:
 *   GET  /api/projects          → list projects (paginated, filterable, public only)
 *   GET  /api/projects/my       → list own projects (private + public)
 *   GET  /api/projects/:id      → single project (private only visible to owner)
 *   POST /api/projects          → publish a new project (auth required)
 *   POST /api/projects/:id/like → increment likes (auth required)
 *   POST /api/projects/:id/download → increment download count
 *   POST /api/projects/:id/report   → report for review (auth required)
 *   DELETE /api/projects/:id    → admin or owner only
 */

import {
  json, cors, parsePath, verifyFromRequest, tursoExecute, isTursoConfigured,
  moderateContent, requireAuth, isAdmin,
} from './_lib/index.js'
import type { ClerkUser, TursoRow } from './_lib/index.js'
import {
  PublishProjectInput, ReportProjectInput, PageParams, Category,
} from '../../src/schema/index.js'

declare global {
  // eslint-disable-next-line no-var
  var __visibilityMigrated: boolean | undefined
}

async function ensureVisibilityColumn(): Promise<void> {
  if (globalThis.__visibilityMigrated) return
  await tursoExecute(
    "ALTER TABLE projects ADD COLUMN visibility TEXT DEFAULT 'public'",
  ).catch(() => { /* already exists */ })
  globalThis.__visibilityMigrated = true
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'projects')

  try {
    if (!isTursoConfigured()) {
      return json({ error: 'Database not configured' }, 500)
    }
    await ensureVisibilityColumn()

    const user: ClerkUser | null = await verifyFromRequest(req)

    // POST /api/projects — publish a project (requires Clerk auth)
    if (req.method === 'POST' && segments.length === 0) {
      const authErr = requireAuth(user, 'Sign in to upload projects')
      if (authErr) return authErr

      const raw = await req.json().catch(() => null)
      const parsed = PublishProjectInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)

      const {
        name, authorName, description, category, workspaceJson, tags,
        blockCount, parentId, visibility,
      } = parsed.data

      // Content moderation
      const modErr = moderateContent(name, description ?? '')
      if (modErr) return json({ error: modErr }, 400)

      const id = crypto.randomUUID()
      const now = Date.now()
      const finalAuthorName = (authorName || user!.name || 'Anonymous').slice(0, 50)

      await tursoExecute(
        `INSERT INTO projects (id, name, author_id, author_name, description, category, workspace_json, tags, block_count, parent_id, visibility, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, name, user!.sub, finalAuthorName,
          description ?? '', category ?? 'General',
          workspaceJson, JSON.stringify(tags ?? []),
          blockCount ?? 0, parentId ?? null,
          visibility ?? 'public', now,
        ],
      )

      // Notify original author on remix (don't block response on failure)
      if (parentId) {
        const parent = await tursoExecute('SELECT author_id, name FROM projects WHERE id = ?', [parentId])
        const parentAuthor = parent.rows[0]?.author_id
        if (parentAuthor && parentAuthor !== user!.sub) {
          await createNotificationDirect(
            String(parentAuthor), 'remix',
            'Your project was remixed!',
            `Someone remixed "${parent.rows[0]?.name}" into "${name.slice(0, 50)}"`,
            `/shareplace`,
          ).catch(() => { /* notification failure non-fatal */ })
        }
      }

      return json({ id, name, createdAt: now }, 201)
    }

    // DELETE /api/projects/:id — admin or owner
    if (req.method === 'DELETE' && segments.length === 1) {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      if (!isAdmin(user)) {
        // Non-admins can only delete their own projects
        const project = await tursoExecute('SELECT author_id FROM projects WHERE id = ?', [segments[0]])
        if (project.rows.length === 0) return json({ error: 'Not found' }, 404)
        if (project.rows[0].author_id !== user!.sub) {
          return json({ error: 'You can only delete your own projects' }, 403)
        }
      }
      await tursoExecute('DELETE FROM projects WHERE id = ?', [segments[0]])
      return json({ ok: true })
    }

    // POST /api/projects/:id/report — flag a project for review
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'report') {
      const authErr = requireAuth(user, 'Sign in to report')
      if (authErr) return authErr

      const raw = await req.json().catch(() => null)
      const parsed = ReportProjectInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)

      // eslint-disable-next-line no-console
      console.log(`[REPORT] Project ${segments[0]} reported by ${user!.sub}: ${parsed.data.reason} ${parsed.data.detail ?? ''}`.slice(0, 500))
      return json({ ok: true, message: 'Thank you for reporting. We will review this project.' })
    }

    // POST /api/projects/:id/download — increment download count (no auth by design)
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'download') {
      await tursoExecute(
        'UPDATE projects SET downloads = downloads + 1 WHERE id = ?',
        [segments[0]],
      )
      return json({ ok: true })
    }

    // POST /api/projects/:id/like — auth required, dedup enforced
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'like') {
      const authErr = requireAuth(user, 'Sign in to like projects')
      if (authErr) return authErr

      // Dedup: skip if this user already liked (non-fatal — table may not exist yet)
      const projectId = segments[0]
      try {
        const existing = await tursoExecute(
          'SELECT 1 FROM project_likes WHERE project_id = ? AND user_id = ?',
          [projectId, user!.sub],
        )
        if (existing.rows.length > 0) return json({ ok: true, alreadyLiked: true })
        await tursoExecute(
          'INSERT INTO project_likes (project_id, user_id, created_at) VALUES (?, ?, ?)',
          [projectId, user!.sub, Date.now()],
        )
      } catch { /* table may not exist yet — skip dedup, still count the like */ }

      await tursoExecute(
        'UPDATE projects SET likes = likes + 1 WHERE id = ?',
        [projectId],
      )

      // Notify author (non-fatal)
      const project = await tursoExecute('SELECT author_id, name FROM projects WHERE id = ?', [projectId])
      const authorId = project.rows[0]?.author_id
      if (authorId && authorId !== user!.sub) {
        await createNotificationDirect(
          String(authorId), 'like',
          'New like!',
          `Someone liked your project "${project.rows[0]?.name}"`,
          `/shareplace`,
        ).catch(() => { /* non-fatal */ })
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

    // GET /api/projects/:id — public projects visible to all, private only to owner
    if (req.method === 'GET' && segments.length === 1 && segments[0] !== 'my') {
      const result = await tursoExecute(
        'SELECT * FROM projects WHERE id = ?',
        [segments[0]],
      )
      if (result.rows.length === 0) return json({ error: 'Not found' }, 404)
      const project = result.rows[0]
      if (project.visibility === 'private') {
        if (!user || user.sub !== project.author_id) {
          return json({ error: 'Not found' }, 404)
        }
      }
      return json(formatProject(project))
    }

    // GET /api/projects/my — user's own projects (private + public)
    if (req.method === 'GET' && segments[0] === 'my') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const qs = new URL(req.url).searchParams
      const pageParsed = PageParams.safeParse({
        limit: qs.get('limit') ?? undefined,
        offset: qs.get('offset') ?? undefined,
      })
      if (!pageParsed.success) return json({ error: 'Invalid pagination' }, 400)
      const { limit, offset } = pageParsed.data

      const result = await tursoExecute(
        'SELECT * FROM projects WHERE author_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [user!.sub, limit, offset],
      )
      return json({ projects: result.rows.map(formatProject), limit, offset })
    }

    // GET /api/projects — public listing (excludes private projects)
    if (req.method === 'GET' && segments.length === 0) {
      const qs = new URL(req.url).searchParams

      const pageParsed = PageParams.safeParse({
        limit: qs.get('limit') ?? undefined,
        offset: qs.get('offset') ?? undefined,
      })
      if (!pageParsed.success) return json({ error: 'Invalid pagination' }, 400)
      const { limit, offset } = pageParsed.data

      // Validate category — reject unknown values instead of passing them to SQL
      const rawCategory = qs.get('category')
      let category: string | null = null
      if (rawCategory && rawCategory !== 'All') {
        const cat = Category.safeParse(rawCategory)
        if (!cat.success) return json({ error: 'Invalid category' }, 400)
        category = cat.data
      }

      // Bound search term
      const rawSearch = qs.get('search')
      const search = rawSearch ? rawSearch.slice(0, 100) : null

      let sql = 'SELECT * FROM projects'
      const args: (string | number)[] = []
      const conditions: string[] = ["(visibility IS NULL OR visibility = 'public')"]

      if (category) {
        conditions.push('category = ?')
        args.push(category)
      }
      if (search) {
        conditions.push('(name LIKE ? OR description LIKE ?)')
        args.push(`%${search}%`, `%${search}%`)
      }
      sql += ' WHERE ' + conditions.join(' AND ')
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
      args.push(limit, offset)

      const result = await tursoExecute(sql, args)
      return json({ projects: result.rows.map(formatProject), limit, offset })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    console.error('Projects API error:', err instanceof Error ? err.message : String(err))
    return json({ error: 'Internal server error' }, 500)
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
    visibility: row.visibility || 'public',
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
