// @vitest-environment node
/**
 * Sign-in with Gatekeep end to end: /api/auth/login → fake Gatekeep (real EdDSA
 * ID tokens) → /api/auth/callback → session token → verifyFromRequest, plus the
 * Clerk-era account carry-over through identity_links.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import http from 'node:http'
import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto'
import type { AddressInfo } from 'node:net'

process.env.CB_SESSION_SECRET = 'test-session-secret-0123456789abcdefghijklmnop'

// identity_links in memory: email -> Clerk-era id
const links = new Map<string, string>()
let tursoImpl: (sql: string, args?: unknown[]) => Promise<{ rows: unknown[] }> = async () => ({ rows: [] })
vi.mock('../_lib/turso.js', () => ({
  isTursoConfigured: () => true,
  tursoExecute: vi.fn(async (sql: string, args: unknown[] = []) => {
    if (sql.startsWith('SELECT legacy_sub')) {
      const id = links.get(String(args[0]))
      return { rows: id ? [{ legacy_sub: id }] : [] }
    }
    return tursoImpl(sql, args)
  }),
}))

const { default: handler } = await import('../auth.mts')
const { verifyFromRequest } = await import('../_lib/auth.js')
const { createSessionToken, verifySessionToken, SESSION_TTL_S } = await import('../_lib/session.js')

// revoked_sessions in memory
const revoked = new Set<string>()
tursoImpl = async (sql: string, args: unknown[] = []) => {
  if (sql.startsWith('INSERT OR IGNORE INTO revoked_sessions')) { revoked.add(String(args[0])); return { rows: [] } }
  if (sql.startsWith('SELECT 1 FROM revoked_sessions')) return { rows: revoked.has(String(args[0])) ? [{ 1: 1 }] : [] }
  return { rows: [] }
}

// ---------------------------------------------------------------- fake Gatekeep

const { publicKey, privateKey } = generateKeyPairSync('ed25519') as { publicKey: KeyObject; privateKey: KeyObject }
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'EdDSA', use: 'sig' }
let nextClaims: Record<string, unknown> = {}
let issuer = ''

const b64u = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
function idToken(claims: Record<string, unknown>) {
  const head = b64u({ alg: 'EdDSA', kid: 'k1', typ: 'JWT' })
  const body = b64u(claims)
  return `${head}.${body}.${sign(null, Buffer.from(`${head}.${body}`), privateKey).toString('base64url')}`
}

const server = http.createServer((req, res) => {
  if (req.url === '/jwks.json') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ keys: [jwk] }))
    return
  }
  if (req.url === '/token' && req.method === 'POST') {
    req.resume()
    req.on('end', () => {
      const now = Math.floor(Date.now() / 1000)
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ id_token: idToken({ iss: issuer, aud: 'cryptoblocks', sub: 'gk_sub_1', iat: now, exp: now + 900, email_verified: true, ...nextClaims }) }))
    })
    return
  }
  res.writeHead(404)
  res.end()
})

beforeAll(async () => {
  await new Promise<void>((r) => server.listen(0, r))
  issuer = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  process.env.GATEKEEP_ISSUER = issuer
})
afterAll(() => { server.close() })
beforeEach(() => { links.clear(); revoked.clear(); nextClaims = {} })

// ---------------------------------------------------------------- helpers

const SITE = 'https://app.getcryptoblocks.com'
const get = (path: string, cookie?: string) => handler(new Request(`${SITE}${path}`, { headers: cookie ? { cookie } : {} }))

async function start(next?: string) {
  const res = await get(`/api/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`)
  const params = new URL(res.headers.get('location')!).searchParams
  const cookie = res.headers.get('set-cookie')!.split(';')[0]
  return { res, params, cookie }
}

async function finish(login: { params: URLSearchParams; cookie: string }, o: { claims?: Record<string, unknown>; state?: string; cookie?: string } = {}) {
  nextClaims = { nonce: login.params.get('nonce'), ...o.claims }
  return get(`/api/auth/callback?code=abc&state=${o.state ?? login.params.get('state')}`, o.cookie ?? login.cookie)
}

/** The session cookie value the callback set, as the browser would send it back. */
const sessionCookieOf = (res: Response) => res.headers.getSetCookie().find((c) => c.startsWith('cb_session='))!.split(';')[0]
const api = (cookie: string, init: RequestInit & { headers?: Record<string, string> } = {}) =>
  new Request(`${SITE}/api/projects`, { ...init, headers: { cookie, ...init.headers } })
const bearer = (token: string, method = 'GET') => new Request(`${SITE}/api/projects`, { method, headers: { Authorization: `Bearer ${token}` } })

// ---------------------------------------------------------------- tests

describe('/api/auth/login', () => {
  it('sends the browser to Gatekeep with PKCE, state and nonce', async () => {
    const { res, params } = await start()
    expect(res.status).toBe(302)
    expect(res.headers.get('location')!.startsWith(`${issuer}/authorize?`)).toBe(true)
    expect(params.get('client_id')).toBe('cryptoblocks')
    expect(params.get('redirect_uri')).toBe(`${SITE}/api/auth/callback`)
    expect(params.get('code_challenge_method')).toBe('S256')
    expect(res.headers.get('set-cookie')).toMatch(/cb_gk_login=.+; Path=\/api\/auth; HttpOnly; Secure; SameSite=Lax/)
  })
})

describe('/api/auth/callback', () => {
  it('signs a new user in with their Gatekeep id, and the session works on the API', async () => {
    const res = await finish(await start('/dashboard'), { claims: { email: 'New@Example.com', name: 'New Person' } })
    const loc = new URL(res.headers.get('location')!)
    expect(loc.pathname).toBe('/dashboard')
    expect(loc.search).toBe('')
    const user = await verifyFromRequest(api(sessionCookieOf(res)))
    expect(user).toEqual({ sub: 'gk_sub_1', email: 'new@example.com', name: 'New Person', avatar: undefined })
  })

  it('keeps a Clerk-era account: a linked verified email gets the old Clerk id', async () => {
    links.set('jason@example.com', 'user_2clerkJason')
    const res = await finish(await start(), { claims: { email: 'jason@example.com' } })
    const cookie = sessionCookieOf(res)
    expect((await verifyFromRequest(api(cookie)))?.sub).toBe('user_2clerkJason')
    const me = await (await get('/api/auth/me', cookie)).json()
    expect(me.user.id).toBe('user_2clerkJason')
  })

  it('refuses an unverified email (it could otherwise claim a linked account)', async () => {
    links.set('jason@example.com', 'user_2clerkJason')
    const res = await finish(await start(), { claims: { email: 'jason@example.com', email_verified: false } })
    expect(res.headers.get('location')).toBe(`${SITE}/?signin_error=unverified`)
  })

  it('refuses tokens for another login, another app, or that have expired', async () => {
    expect((await finish(await start(), { claims: { email: 'a@example.com', nonce: 'other' } })).headers.get('location')).toBe(`${SITE}/?signin_error=signin`)
    expect((await finish(await start(), { claims: { email: 'a@example.com', aud: 'zta' } })).headers.get('location')).toBe(`${SITE}/?signin_error=signin`)
    const past = Math.floor(Date.now() / 1000) - 60
    expect((await finish(await start(), { claims: { email: 'a@example.com', exp: past } })).headers.get('location')).toBe(`${SITE}/?signin_error=signin`)
  })

  it('refuses a forged state or a tampered login cookie', async () => {
    const login = await start()
    expect((await finish(login, { state: 'forged' })).headers.get('location')).toBe(`${SITE}/?signin_error=expired`)
    expect((await finish(login, { cookie: `${login.cookie.slice(0, -2)}xx` })).headers.get('location')).toBe(`${SITE}/?signin_error=expired`)
    expect((await finish(login, { cookie: '' })).headers.get('location')).toBe(`${SITE}/?signin_error=expired`)
  })

  it('only returns to paths on this site', async () => {
    for (const next of ['//evil.example/', 'https://evil.example/', '/\\evil.example', '/%2f%2fevil.example', 'javascript:alert(1)']) {
      const loc = new URL((await finish(await start(next), { claims: { email: 'a@example.com' } })).headers.get('location')!)
      expect(loc.origin).toBe(SITE)
      expect(loc.pathname).toBe('/')
    }
  })
})

describe('session tokens', () => {
  it('reject forged, wrongly-signed, expired and missing tokens', async () => {
    const good = createSessionToken({ sub: 'u1', email: 'a@example.com' })
    expect(verifySessionToken(good)?.sub).toBe('u1')
    const [h, , s] = good.split('.')
    const forgedBody = Buffer.from(JSON.stringify({ sub: 'admin', email: 'boss@example.com', exp: 9e9 })).toString('base64url')
    expect(verifySessionToken(`${h}.${forgedBody}.${s}`)).toBeNull()
    expect(verifySessionToken(good, Date.now() + (SESSION_TTL_S + 1) * 1000)).toBeNull()
    expect(await verifyFromRequest(new Request(SITE))).toBeNull()
    expect(await verifyFromRequest(bearer('not.a.token'))).toBeNull()
  })
})

describe('the session cookie', () => {
  it('is HttpOnly, Secure, SameSite=Lax, Path=/ with the session lifetime, and no token reaches the URL', async () => {
    const res = await finish(await start('/dashboard'), { claims: { email: 'a@example.com' } })
    const set = res.headers.getSetCookie().find((c) => c.startsWith('cb_session='))!
    expect(set).toMatch(/; Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800$/)
    expect(SESSION_TTL_S).toBe(604800)
    const loc = res.headers.get('location')!
    expect(loc).toBe(`${SITE}/dashboard`)
    const token = set.split(';')[0].slice('cb_session='.length)
    expect(loc).not.toContain(token)
    expect(loc).not.toContain('#')
  })

  it('GET /api/auth/me returns only the profile, from the cookie', async () => {
    const res = await finish(await start(), { claims: { email: 'a@example.com', name: 'Ann', picture: 'https://img.example/a.png' } })
    const r = await get('/api/auth/me', sessionCookieOf(res))
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body).toEqual({ user: { id: 'gk_sub_1', email: 'a@example.com', name: 'Ann', avatar: 'https://img.example/a.png' } })
    expect(JSON.stringify(body)).not.toMatch(/eyJ/)
    expect((await get('/api/auth/me')).status).toBe(401)
  })

  it('authenticates API calls, and the legacy Bearer still works for now', async () => {
    const res = await finish(await start(), { claims: { email: 'a@example.com' } })
    expect((await verifyFromRequest(api(sessionCookieOf(res))))?.sub).toBe('gk_sub_1')
    const legacy = createSessionToken({ sub: 'u1', email: 'old@example.com' })
    expect((await verifyFromRequest(bearer(legacy)))?.sub).toBe('u1')
    expect((await verifyFromRequest(bearer(legacy, 'POST')))?.sub).toBe('u1') // Bearer is not CSRF-able, so no Origin needed
  })

  it('refuses cookie-authenticated state changes from another origin', async () => {
    const cookie = sessionCookieOf(await finish(await start(), { claims: { email: 'a@example.com' } }))
    const post = (headers: Record<string, string>) => verifyFromRequest(api(cookie, { method: 'POST', headers }))
    expect(await post({ Origin: 'https://evil.example' })).toBeNull()
    expect(await post({ 'Sec-Fetch-Site': 'cross-site' })).toBeNull()
    expect(await post({})).toBeNull() // no Origin, no Sec-Fetch-Site
    expect((await post({ Origin: SITE }))?.sub).toBe('gk_sub_1')
    expect((await post({ 'Sec-Fetch-Site': 'same-origin' }))?.sub).toBe('gk_sub_1')
    // Reads need no Origin.
    expect((await verifyFromRequest(api(cookie)))?.sub).toBe('gk_sub_1')
  })
})

describe('sign-out', () => {
  const logout = (cookie: string, headers: Record<string, string> = { Origin: SITE }) =>
    handler(new Request(`${SITE}/api/auth/logout`, { method: 'POST', headers: { cookie, ...headers } }))

  it('revokes the session: the old cookie is rejected afterwards, and the cookie is cleared', async () => {
    const cookie = sessionCookieOf(await finish(await start(), { claims: { email: 'a@example.com' } }))
    expect((await verifyFromRequest(api(cookie)))?.sub).toBe('gk_sub_1')
    const res = await logout(cookie)
    expect(res.status).toBe(200)
    expect(res.headers.getSetCookie().find((c) => c.startsWith('cb_session='))).toMatch(/^cb_session=;.*Max-Age=0/)
    const body = await res.json()
    expect(body.revoked).toBe(true)
    expect(body.logoutUrl).toBe(`${issuer}/logout?post_logout_redirect_uri=${encodeURIComponent(`${SITE}/`)}`)
    expect(await verifyFromRequest(api(cookie))).toBeNull()
    expect((await get('/api/auth/me', cookie)).status).toBe(401)
  })

  it('does not end another session of the same user', async () => {
    const a = sessionCookieOf(await finish(await start(), { claims: { email: 'a@example.com' } }))
    const b = sessionCookieOf(await finish(await start(), { claims: { email: 'a@example.com' } }))
    await logout(a)
    expect(await verifyFromRequest(api(a))).toBeNull()
    expect((await verifyFromRequest(api(b)))?.sub).toBe('gk_sub_1')
  })

  it('refuses a cross-origin sign-out and a GET', async () => {
    const cookie = sessionCookieOf(await finish(await start(), { claims: { email: 'a@example.com' } }))
    expect((await logout(cookie, { Origin: 'https://evil.example' })).status).toBe(403)
    expect((await verifyFromRequest(api(cookie)))?.sub).toBe('gk_sub_1')
    expect((await get('/api/auth/logout', cookie)).status).toBe(405)
  })
})
