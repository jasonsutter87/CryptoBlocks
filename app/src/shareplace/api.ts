/**
 * Shareplace API client.
 *
 * Talks to the Netlify Function at /api/projects which proxies to
 * Turso (libSQL). Falls back gracefully to empty results if the
 * function isn't deployed yet (local dev without `netlify dev`).
 */

import type { SharedProject } from '../types/shareplace'

const API_BASE = '/api/projects'

interface ApiProject {
  id: string
  name: string
  authorId: string
  authorName: string
  description: string
  category: string
  workspaceJson: string
  tags: string[]
  blockCount: number
  parentId: string | null
  downloads: number
  likes: number
  createdAt: number
}

function toSharedProject(p: ApiProject): SharedProject {
  return {
    id: p.id,
    name: p.name,
    author: p.authorName,
    description: p.description,
    category: p.category,
    blockCount: p.blockCount,
    downloads: p.downloads,
    likes: p.likes,
    createdAt: new Date(p.createdAt).toISOString().slice(0, 10),
    tags: p.tags,
  }
}

export interface FetchProjectsOptions {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export async function fetchProjects(opts: FetchProjectsOptions = {}): Promise<SharedProject[]> {
  try {
    const params = new URLSearchParams()
    if (opts.category && opts.category !== 'All') params.set('category', opts.category)
    if (opts.search) params.set('search', opts.search)
    if (opts.limit) params.set('limit', String(opts.limit))
    if (opts.offset) params.set('offset', String(opts.offset))

    const url = `${API_BASE}${params.toString() ? '?' + params : ''}`
    const res = await fetch(url)
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn('[shareplace] fetch failed:', res.status, res.statusText)
      return []
    }
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('json')) {
      // eslint-disable-next-line no-console
      console.warn('[shareplace] unexpected content-type:', contentType, '— is the API redirect working?')
      return []
    }
    const data = await res.json()
    return (data.projects ?? []).map(toSharedProject)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[shareplace] fetch error:', err)
    return []
  }
}

export async function fetchProject(id: string): Promise<(SharedProject & { workspaceJson: string }) | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`)
    if (!res.ok) return null
    const p: ApiProject = await res.json()
    return { ...toSharedProject(p), workspaceJson: p.workspaceJson }
  } catch {
    return null
  }
}

export interface PublishPayload {
  name: string
  authorName?: string
  description?: string
  category?: string
  workspaceJson: string
  tags?: string[]
  blockCount?: number
  parentId?: string
}

export async function publishProject(payload: PublishPayload): Promise<{ id: string } | null> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function likeProject(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${id}/like`, { method: 'POST' })
    return res.ok
  } catch {
    return false
  }
}
