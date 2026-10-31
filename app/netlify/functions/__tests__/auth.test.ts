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
vi.mock('../_lib/turso.js', () => ({
  isTursoConfigured: () => true,
  tursoExecute: vi.fn(async (sql: string, args: unknown[] = []) => {
    if (sql.startsWith('SELECT legacy_sub')) {
      const id = links.get(String(args[0]))
      return { rows: id ? [{ legacy_sub: id }] : [] }
    }
    return { rows: [] }
  }),
}))

const { default: handler } = await import('../auth.mts')
const { verifyFromRequest } = await import('../_lib/auth.js')
const { createSessionToken, verifySessionToken, SESSION_TTL_S } = await import('../_lib/session.js')

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
beforeEach(() => { links.clear(); nextClaims = {} })

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

const handedOver = (res: Response) => new URLSearchParams(new URL(res.headers.get('location')!).hash.slice(1))
const api = (token: string) => new Request(`${SITE}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })

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
    const token = handedOver(res).get('cb_session')!
    const user = await verifyFromRequest(api(token))
    expect(user).toEqual({ sub: 'gk_sub_1', email: 'new@example.com', name: 'New Person', avatar: undefined })
  })

  it('keeps a Clerk-era account: a linked verified email gets the old Clerk id', async () => {
    links.set('jason@example.com', 'user_2clerkJason')
    const res = await finish(await start(), { claims: { email: 'jason@example.com' } })
    const user = await verifyFromRequest(api(handedOver(res).get('cb_session')!))
    expect(user?.sub).toBe('user_2clerkJason')
    const profile = JSON.parse(Buffer.from(handedOver(res).get('user')!, 'base64url').toString())
    expect(profile.id).toBe('user_2clerkJason')
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
    for (const next of ['//evil.example/', 'https://evil.example/']) {
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
    expect(await verifyFromRequest(api('not.a.token'))).toBeNull()
  })
})
