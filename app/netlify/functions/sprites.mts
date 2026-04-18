/**
 * Netlify Function — Sprite Shareplace.
 *
 * POST   /api/sprites         → upload a sprite (auth required)
 * GET    /api/sprites         → browse community sprites (public, paginated)
 * GET    /api/sprites/:id     → single sprite with full data URL
 * POST   /api/sprites/:id/like → like a sprite (auth required)
 * DELETE /api/sprites/:id     → owner or admin only
 */

import {
  json, cors, logError, withRequest, parsePath, getQueryParam,
  verifyFromRequest, tursoExecute, isTursoConfigured,
  requireAuth, isAdmin, moderateContent,
} from './_lib/index.js'
import { Name } from '../../src/schema/index.js'

let spriteMigrated = false
let spriteMigrating: Promise<void> | null = null

async function ensureSpriteTable(): Promise<void> {
  if (spriteMigrated) return
  if (spriteMigrating) { await spriteMigrating; return }
  spriteMigrating = (async () => {
    const expected = (msg: string) => /already exists|duplicate column/i.test(msg)
    const migrate = (label: string, sql: string) =>
      tursoExecute(sql).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err)
        if (!expected(msg)) logError(`sprites:migrate:${label}`, err)
      })

    await Promise.all([
      migrate('create-sprites', `CREATE TABLE IF NOT EXISTS sprites (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        data_url TEXT NOT NULL,
        frames INTEGER DEFAULT 1,
        size INTEGER DEFAULT 16,
        tags TEXT DEFAULT '[]',
        likes INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )`),
      migrate('create-sprite-likes', `CREATE TABLE IF NOT EXISTS sprite_likes (
        sprite_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (sprite_id, user_id)
      )`),
    ])
    spriteMigrated = true
  })()
  await spriteMigrating
}

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'sprites')
  const user = await verifyFromRequest(req)

  try {
    if (!isTursoConfigured()) return json({ error: 'Database not configured' }, 500)
    await ensureSpriteTable()

    // POST /api/sprites — upload a sprite
    if (req.method === 'POST' && segments.length === 0) {
      const authErr = requireAuth(user, 'Sign in to share sprites')
      if (authErr) return authErr

      const raw = await req.json().catch(() => null)
      if (!raw || typeof raw !== 'object') return json({ error: 'Invalid input' }, 400)

      const nameResult = Name.safeParse(raw.name)
      if (!nameResult.success) return json({ error: 'Invalid sprite name' }, 400)

      const name = nameResult.data
      const dataUrl = typeof raw.dataUrl === 'string' ? raw.dataUrl : ''
      const frames = typeof raw.frames === 'number' ? Math.max(1, Math.min(raw.frames, 64)) : 1
      const size = typeof raw.size === 'number' ? Math.max(8, Math.min(raw.size, 256)) : 16
      const tags = Array.isArray(raw.tags) ? raw.tags.filter((t: unknown) => typeof t === 'string').slice(0, 10) : []

      if (!dataUrl.startsWith('data:image/')) return json({ error: 'Invalid image data' }, 400)
      if (dataUrl.length > 500_000) return json({ error: 'Sprite too large (max 500KB)' }, 400)

      const modErr = moderateContent(name, tags.join(' '))
      if (modErr) return json({ error: modErr }, 400)

      const id = crypto.randomUUID()
      const now = Date.now()

      await tursoExecute(
        `INSERT INTO sprites (id, name, author_id, author_name, data_url, frames, size, tags, likes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [id, name, user!.sub, (user!.name || 'Artist').slice(0, 50), dataUrl, frames, size, JSON.stringify(tags), now],
      )
      return json({ id, name, createdAt: now }, 201)
    }

    // POST /api/sprites/:id/like — like a sprite (one per user, PK enforced)
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'like') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const spriteId = segments[0]
      const existing = await tursoExecute(
        'SELECT 1 FROM sprite_likes WHERE sprite_id = ? AND user_id = ?',
        [spriteId, user!.sub],
      )
      if (existing.rows.length > 0) return json({ ok: true, alreadyLiked: true })

      await tursoExecute(
        'INSERT INTO sprite_likes (sprite_id, user_id, created_at) VALUES (?, ?, ?)',
        [spriteId, user!.sub, Date.now()],
      )
      await tursoExecute('UPDATE sprites SET likes = likes + 1 WHERE id = ?', [spriteId])
      return json({ ok: true })
    }

    // DELETE /api/sprites/:id — owner or admin
    if (req.method === 'DELETE' && segments.length === 1) {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      if (!isAdmin(user)) {
        const sprite = await tursoExecute('SELECT author_id FROM sprites WHERE id = ?', [segments[0]])
        if (sprite.rows.length === 0 || sprite.rows[0].author_id !== user!.sub) {
          return json({ error: 'Not found' }, 404)
        }
      }
      await tursoExecute('DELETE FROM sprites WHERE id = ?', [segments[0]])
      return json({ ok: true })
    }

    // GET /api/sprites/:id — single sprite with full data
    if (req.method === 'GET' && segments.length === 1) {
      const result = await tursoExecute('SELECT * FROM sprites WHERE id = ?', [segments[0]])
      if (result.rows.length === 0) return json({ error: 'Not found' }, 404)
      const s = result.rows[0]
      return json({
        id: s.id, name: s.name,
        authorName: s.author_name,
        dataUrl: s.data_url,
        frames: Number(s.frames),
        size: Number(s.size),
        tags: JSON.parse(String(s.tags || '[]')),
        likes: Number(s.likes),
        createdAt: s.created_at,
      })
    }

    // GET /api/sprites — browse (paginated, newest first)
    if (req.method === 'GET' && segments.length === 0) {
      const limit = Math.min(Number(getQueryParam(req, 'limit') ?? 24), 50)
      const offset = Math.max(Number(getQueryParam(req, 'offset') ?? 0), 0)

      const result = await tursoExecute(
        `SELECT id, name, author_name, data_url, frames, size, tags, likes, created_at
         FROM sprites ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      )
      return json({
        sprites: result.rows.map((s) => ({
          id: s.id,
          name: s.name,
          authorName: s.author_name,
          dataUrl: s.data_url,
          frames: Number(s.frames),
          size: Number(s.size),
          tags: JSON.parse(String(s.tags || '[]')),
          likes: Number(s.likes),
          createdAt: s.created_at,
        })),
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('sprites', err)
    return json({ error: 'Internal error' }, 500)
  }
}

export default withRequest(handler)
