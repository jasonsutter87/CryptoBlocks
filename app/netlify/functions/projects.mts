/**
 * Netlify Function — Shareplace projects API.
 *
 * Routes:
 *   GET  /api/projects          → list projects (paginated, filterable)
 *   GET  /api/projects/:id      → single project
 *   POST /api/projects          → publish a new project
 *   POST /api/projects/:id/like → increment likes
 *
 * Env vars required:
 *   TURSO_URL          — libsql://...
 *   TURSO_AUTH_TOKEN    — JWT from `turso db tokens create`
 */

import { createClient } from '@libsql/client/web'
import type { Context } from '@netlify/functions'

function getDb() {
  return createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
}

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

export default async function handler(req: Request, context: Context) {
  if (req.method === 'OPTIONS') return cors()

  const url = new URL(req.url)
  const segments = url.pathname.replace('/api/projects', '').split('/').filter(Boolean)
  const db = getDb()

  try {
    // POST /api/projects — publish a project
    if (req.method === 'POST' && segments.length === 0) {
      const body = await req.json()
      const { name, authorName, description, category, workspaceJson, tags, blockCount, parentId } = body

      if (!name || !workspaceJson) {
        return json({ error: 'name and workspaceJson are required' }, 400)
      }

      const id = crypto.randomUUID()
      const now = Date.now()

      await db.execute({
        sql: `INSERT INTO projects (id, name, author_name, description, category, workspace_json, tags, block_count, parent_id, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
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
      })

      return json({ id, name, createdAt: now }, 201)
    }

    // POST /api/projects/:id/like — increment likes
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'like') {
      const projectId = segments[0]
      await db.execute({
        sql: 'UPDATE projects SET likes = likes + 1 WHERE id = ?',
        args: [projectId],
      })
      return json({ ok: true })
    }

    // GET /api/projects/:id — single project
    if (req.method === 'GET' && segments.length === 1) {
      const projectId = segments[0]
      const result = await db.execute({
        sql: 'SELECT * FROM projects WHERE id = ?',
        args: [projectId],
      })
      if (result.rows.length === 0) {
        return json({ error: 'Project not found' }, 404)
      }
      return json(formatProject(result.rows[0]))
    }

    // GET /api/projects — list projects
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

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ')
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
      args.push(limit, offset)

      const result = await db.execute({ sql, args })
      const projects = result.rows.map(formatProject)

      return json({ projects, limit, offset })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    console.error('Projects API error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
}

function formatProject(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    authorId: row.author_id,
    authorName: row.author_name,
    description: row.description,
    category: row.category,
    workspaceJson: row.workspace_json,
    tags: tryParse(row.tags as string),
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

export const config = {
  path: '/api/projects/*',
}
