/**
 * Netlify Function — Shareplace projects API.
 *
 * Routes:
 *   GET  /api/projects          → list projects (paginated, filterable, public only)
 *   GET  /api/projects/my       → list own projects (private + public)
 *   GET  /api/projects/:id      → single project (private only visible to owner)
 *   POST /api/projects          → publish a new project (auth required)
 *   PATCH /api/projects/:id     → update an existing project (owner only)
 *   POST /api/projects/:id/like → increment likes (auth required)
 *   POST /api/projects/:id/download → increment download count
 *   POST /api/projects/:id/report   → report for review (auth required)
 *   DELETE /api/projects/:id    → admin or owner only
 */

import {
  json, cors, logError, withRequest, parsePath, parsePagination, getQueryParam,
  verifyFromRequest, tursoExecute, isTursoConfigured,
  moderateContent, requireAuth, isAdmin,
} from './_lib/index.js'
import type { ClerkUser, TursoRow } from './_lib/index.js'
import {
  PublishProjectInput, ReportProjectInput, Category,
} from '../../src/schema/index.js'

// Per-instance migration state. These live at module scope (not on
// globalThis) because a Netlify function instance is its own module
// instance — the values reset on cold start and stay set across warm
// invocations. No reason for them to be visible to anything else.
let migrated = false
let migrating: Promise<void> | null = null

/**
 * One-time schema migration. Serialized per instance: on a cold-start burst
 * of N parallel requests against the same instance, the first one runs the
 * migration and the rest await the same promise instead of each issuing
 * their own ALTER/CREATE (defends against a prior incident where parallel
 * cold-start requests duplicated migration work).
 *
 * Drop this once a real migration tool replaces the in-handler ALTERs.
 */
async function ensureSchema(): Promise<void> {
  if (migrated) return
  if (migrating) {
    await migrating
    return
  }
  migrating = (async () => {
    // Migration steps log under their own scope so a real failure (DB down,
    // bad credentials) is still observable in Netlify logs. The "column
    // already exists" / "table already exists" errors that are EXPECTED on
    // every run after the first are filtered to a debug line.
    const expected = (msg: string) =>
      /already exists|duplicate column/i.test(msg)
    const migrate = (label: string, sql: string) =>
      tursoExecute(sql).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err)
        if (!expected(msg)) logError(`projects:migrate:${label}`, err)
      })

    await Promise.all([
      migrate('add-visibility', "ALTER TABLE projects ADD COLUMN visibility TEXT DEFAULT 'public'"),
      migrate('create-likes', `CREATE TABLE IF NOT EXISTS project_likes (
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (project_id, user_id)
      )`),
      migrate('create-reports', `CREATE TABLE IF NOT EXISTS project_reports (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        reporter_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        detail TEXT,
        created_at INTEGER NOT NULL
      )`),
      // One-time cleanup: rows inserted before the visibility column existed
      // have NULL. Normalize so every subsequent check can assume a concrete
      // value and we can drop the `visibility IS NULL OR ...` branch.
      migrate('backfill-visibility', "UPDATE projects SET visibility = 'public' WHERE visibility IS NULL"),
      // Fix projects saved with hardcoded 'User' before the Clerk name fix.
      // Looks up the real name from the most recent project by the same author_id
      // that has a non-'User' name, or falls back to enrichment on next edit.
      migrate('fix-user-authorname', `
        UPDATE projects SET author_name = (
          SELECT p2.author_name FROM projects p2
          WHERE p2.author_id = projects.author_id
            AND p2.author_name != 'User'
            AND p2.author_name != 'Anonymous'
          ORDER BY p2.created_at DESC LIMIT 1
        ) WHERE author_name = 'User'
          AND EXISTS (
            SELECT 1 FROM projects p2
            WHERE p2.author_id = projects.author_id
              AND p2.author_name != 'User'
              AND p2.author_name != 'Anonymous'
          )
      `),
    ])
    migrated = true
  })()
  await migrating
}

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'projects')

  try {
    if (!isTursoConfigured()) {
      return json({ error: 'Database not configured' }, 500)
    }
    await ensureSchema()

    const user: ClerkUser | null = await verifyFromRequest(req)

    // POST /api/projects — publish a project (requires Clerk auth)
    if (req.method === 'POST' && segments.length === 0) {
      const authErr = requireAuth(user, 'Sign in to upload projects')
      if (authErr) return authErr

      const raw = await req.json().catch(() => null)
      const parsed = PublishProjectInput.safeParse(raw)
      if (!parsed.success) {
        logError('projects:validate', new Error(JSON.stringify(parsed.error.issues)))
        return json({ error: 'Invalid input', detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }, 400)
      }

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

      // Notify original author on remix
      if (parentId) {
        await notifyAuthor(parentId, user!.sub, 'remix', 'Your project was remixed!',
          (parentName) => `Someone remixed "${parentName}" into "${name.slice(0, 50)}"`,
          '/shareplace')
      }

      return json({ id, name, createdAt: now }, 201)
    }

    // PATCH /api/projects/:id — update an existing project (owner only).
    // Lets the dashboard's "Open" → edit → save round-trip update the
    // same row instead of creating a new copy each save.
    if (req.method === 'PATCH' && segments.length === 1) {
      const authErr = requireAuth(user, 'Sign in to update projects')
      if (authErr) return authErr

      const projectId = segments[0]
      const owner = await tursoExecute('SELECT author_id FROM projects WHERE id = ?', [projectId])
      // Return 404 for both "does not exist" and "not yours" so an attacker
      // cannot enumerate valid project ids through response-code probing.
      if (owner.rows.length === 0 || owner.rows[0].author_id !== user!.sub) {
        return json({ error: 'Not found' }, 404)
      }

      const raw = await req.json().catch(() => null)
      const parsed = PublishProjectInput.safeParse(raw)
      if (!parsed.success) {
        logError('projects:validate', new Error(JSON.stringify(parsed.error.issues)))
        return json({ error: 'Invalid input', detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }, 400)
      }
      const { name, description, category, workspaceJson, tags, blockCount, visibility } = parsed.data

      const modErr = moderateContent(name, description ?? '')
      if (modErr) return json({ error: modErr }, 400)

      // Scope by author_id on the UPDATE itself as defense-in-depth
      // against TOCTOU between the SELECT and the UPDATE.
      await tursoExecute(
        `UPDATE projects SET
           name = ?, description = ?, category = ?, workspace_json = ?,
           tags = ?, block_count = ?, visibility = ?
         WHERE id = ? AND author_id = ?`,
        [
          name, description ?? '', category ?? 'General', workspaceJson,
          JSON.stringify(tags ?? []), blockCount ?? 0,
          visibility ?? 'public', projectId, user!.sub,
        ],
      )
      return json({ id: projectId, updatedAt: Date.now() })
    }

    // DELETE /api/projects/:id — admin or owner
    if (req.method === 'DELETE' && segments.length === 1) {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      if (!isAdmin(user)) {
        // Non-admins can only delete their own projects. Use 404 for both
        // "does not exist" and "not yours" to prevent id-enumeration.
        const project = await tursoExecute('SELECT author_id FROM projects WHERE id = ?', [segments[0]])
        if (project.rows.length === 0 || project.rows[0].author_id !== user!.sub) {
          return json({ error: 'Not found' }, 404)
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

      await tursoExecute(
        'INSERT INTO project_reports (id, project_id, reporter_id, reason, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), segments[0], user!.sub, parsed.data.reason, parsed.data.detail ?? '', Date.now()],
      )
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

    // POST /api/projects/:id/like — auth required, one like per user (PK enforced)
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'like') {
      const authErr = requireAuth(user, 'Sign in to like projects')
      if (authErr) return authErr

      const projectId = segments[0]
      const existing = await tursoExecute(
        'SELECT 1 FROM project_likes WHERE project_id = ? AND user_id = ?',
        [projectId, user!.sub],
      )
      if (existing.rows.length > 0) return json({ ok: true, alreadyLiked: true })

      await tursoExecute(
        'INSERT INTO project_likes (project_id, user_id, created_at) VALUES (?, ?, ?)',
        [projectId, user!.sub, Date.now()],
      )
      await tursoExecute(
        'UPDATE projects SET likes = likes + 1 WHERE id = ?',
        [projectId],
      )

      await notifyAuthor(projectId, user!.sub, 'like', 'New like!',
        (name) => `Someone liked your project "${name}"`,
        '/shareplace')
      return json({ ok: true })
    }

    // GET /api/projects/:id/tree — remix lineage (ancestors + descendants)
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'tree') {
      const projectId = segments[0]

      // Ancestors via recursive CTE — one round-trip, bounded depth, cycle-safe
      // (MAX_ANCESTORS limits iterations even if parent_id ever formed a loop)
      const MAX_ANCESTORS = 50
      const ancestors = await tursoExecute(
        `WITH RECURSIVE anc(id, name, author_name, parent_id, created_at, likes, depth) AS (
           SELECT id, name, author_name, parent_id, created_at, likes, 0 FROM projects WHERE id = ?
           UNION ALL
           SELECT p.id, p.name, p.author_name, p.parent_id, p.created_at, p.likes, a.depth + 1
           FROM projects p JOIN anc a ON p.id = a.parent_id
           WHERE a.depth < ?
         )
         SELECT id, name, author_name, parent_id, created_at, likes
         FROM anc WHERE id != ? ORDER BY depth DESC`,
        [projectId, MAX_ANCESTORS, projectId],
      )

      // Direct children (one level)
      const children = await tursoExecute(
        'SELECT id, name, author_name, parent_id, created_at, likes FROM projects WHERE parent_id = ? ORDER BY created_at ASC',
        [projectId],
      )

      // Total recursive remix count
      const allDescendants = await tursoExecute(
        `WITH RECURSIVE tree(id, depth) AS (
           SELECT id, 0 FROM projects WHERE parent_id = ?
           UNION ALL
           SELECT p.id, t.depth + 1 FROM projects p JOIN tree t ON p.parent_id = t.id
           WHERE t.depth < 100
         )
         SELECT COUNT(*) as count FROM tree`,
        [projectId],
      )
      const remixCount = Number(allDescendants.rows[0]?.count ?? 0)

      return json({
        ancestors: ancestors.rows.map(formatTreeNode),
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

      const page = parsePagination(req)
      if (page instanceof Response) return page
      const { limit, offset } = page

      const result = await tursoExecute(
        'SELECT * FROM projects WHERE author_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [user!.sub, limit, offset],
      )
      return json({ projects: result.rows.map(formatProject), limit, offset })
    }

    // GET /api/projects — public listing (excludes private projects)
    if (req.method === 'GET' && segments.length === 0) {
      const page = parsePagination(req)
      if (page instanceof Response) return page
      const { limit, offset } = page

      // Validate category — reject unknown values instead of passing them to SQL
      const rawCategory = getQueryParam(req, 'category')
      let category: string | null = null
      if (rawCategory && rawCategory !== 'All') {
        const cat = Category.safeParse(rawCategory)
        if (!cat.success) return json({ error: 'Invalid category' }, 400)
        category = cat.data
      }

      // Bound search term
      const rawSearch = getQueryParam(req, 'search')
      const search = rawSearch ? rawSearch.slice(0, 100) : null

      let sql = 'SELECT * FROM projects'
      const args: (string | number)[] = []
      const conditions: string[] = ["visibility = 'public'"]

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
    logError('projects', err)
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

/** Tree node — subset of formatProject for the remix-lineage endpoint */
function formatTreeNode(row: TursoRow) {
  const { id, name, authorName, parentId, createdAt, likes } = formatProject(row)
  return { id, name, authorName, parentId, createdAt, likes }
}

function tryParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return [] }
}

async function createNotification(
  userId: string, type: string, title: string, body: string, link: string,
): Promise<void> {
  await tursoExecute(
    'INSERT INTO notifications (id, user_id, type, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [crypto.randomUUID(), userId, type, title, body, link, Date.now()],
  ).catch((err) => logError('projects:createNotification', err))
}

/** Notify a project author of an event, unless they're the actor themselves */
async function notifyAuthor(
  projectId: string, actorSub: string,
  type: string, title: string, bodyTemplate: (name: string) => string, link: string,
): Promise<void> {
  const project = await tursoExecute('SELECT author_id, name FROM projects WHERE id = ?', [projectId])
  const row = project.rows[0]
  if (!row) return
  const authorId = String(row.author_id ?? '')
  if (!authorId || authorId === actorSub) return
  await createNotification(authorId, type, title, bodyTemplate(String(row.name ?? '')), link)
}

export default withRequest(handler)
