/**
 * Sprite Library Sync — Turso = source of truth, localStorage = runtime cache.
 *
 * `sprite_editor_image` (a runtime block) reads localStorage synchronously
 * inside game loops, so we never await network on lookup. This module keeps
 * localStorage primed: fetch on sign-in, write-through on save, push-up on
 * first authenticated load to migrate any pre-Turso sprites.
 */

import { getClerkToken } from '../auth'

const STORAGE_KEY = 'cryptoblocks-sprites'
const MIGRATED_KEY = 'cryptoblocks-sprites-migrated'

export interface UserSprite {
  /** PNG data URL */
  dataUrl: string
  /** Frame count in the sprite sheet */
  frames: number
  /** Pixel width  */
  width?: number
  /** Pixel height */
  height?: number
  /** @deprecated kept for legacy localStorage entries */
  size?: number
  /** Server timestamp (ms) of last update — present after sync */
  updatedAt?: number
}

type Library = Record<string, UserSprite>

function loadLibrary(): Library {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Library }
  catch { return {} }
}

function saveLibrary(lib: Library): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lib))
}

async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getClerkToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> ?? {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(url, { ...init, headers })
}

/**
 * Pull every sprite this user owns from Turso into localStorage.
 * Server wins on conflict — server is the source of truth.
 */
export async function fetchUserSprites(): Promise<Library> {
  const local = loadLibrary()
  try {
    const res = await authedFetch('/api/sprites/me')
    if (!res.ok) return local
    const data = await res.json() as { sprites: Array<UserSprite & { name: string }> }
    const merged: Library = { ...local }
    for (const s of data.sprites ?? []) {
      const { name, ...rest } = s
      merged[name] = rest
    }
    saveLibrary(merged)
    return merged
  } catch {
    return local
  }
}

/**
 * Write a sprite to localStorage immediately, then push to Turso in the
 * background. Returns the local entry so callers can render right away.
 */
export function pushSprite(name: string, sprite: UserSprite): UserSprite {
  const lib = loadLibrary()
  lib[name] = sprite
  saveLibrary(lib)
  void authedFetch(`/api/sprites/me/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify({
      dataUrl: sprite.dataUrl,
      frames: sprite.frames,
      width: sprite.width ?? sprite.size ?? 16,
      height: sprite.height ?? sprite.size ?? 16,
    }),
  }).catch(() => {})
  return sprite
}

export async function deleteSprite(name: string): Promise<void> {
  const lib = loadLibrary()
  delete lib[name]
  saveLibrary(lib)
  await authedFetch(`/api/sprites/me/${encodeURIComponent(name)}`, { method: 'DELETE' }).catch(() => {})
}

/**
 * One-shot migration on first authenticated load: any sprite that exists in
 * localStorage but not on the server gets pushed up. Marker in localStorage
 * prevents re-running. Safe to call on every sign-in.
 */
export async function migrateLocalToServer(): Promise<void> {
  if (localStorage.getItem(MIGRATED_KEY)) return
  const local = loadLibrary()
  const names = Object.keys(local)
  if (names.length === 0) {
    localStorage.setItem(MIGRATED_KEY, String(Date.now()))
    return
  }
  // Pull current server set first so we don't clobber newer server entries
  const serverNames = new Set<string>()
  try {
    const res = await authedFetch('/api/sprites/me')
    if (res.ok) {
      const data = await res.json() as { sprites: Array<{ name: string }> }
      for (const s of data.sprites ?? []) serverNames.add(s.name)
    }
  } catch { /* ignore — best effort */ }

  for (const name of names) {
    if (serverNames.has(name)) continue
    const sprite = local[name]
    if (!sprite?.dataUrl) continue
    try {
      await authedFetch(`/api/sprites/me/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: JSON.stringify({
          dataUrl: sprite.dataUrl,
          frames: sprite.frames ?? 1,
          width: sprite.width ?? sprite.size ?? 16,
          height: sprite.height ?? sprite.size ?? 16,
        }),
      })
    } catch { /* keep going; partial migrations are fine */ }
  }
  localStorage.setItem(MIGRATED_KEY, String(Date.now()))
}
