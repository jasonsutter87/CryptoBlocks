/**
 * Sign-in with Gatekeep (OpenID Connect, passkeys): the pieces ../auth.mts uses.
 *
 * Accounts carry over from Clerk by verified email. scripts/export-clerk-identities.mjs
 * copies every Clerk user's (email, user id) into the identity_links table once; a
 * Gatekeep sign-in with one of those emails gets the old Clerk id as its account id,
 * so every project, classroom and achievement stays attached. Everyone else's
 * account id is their Gatekeep sub.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { tursoExecute, isTursoConfigured } from './turso.js'

export const CLIENT_ID = 'cryptoblocks'
export const LOGIN_TTL_MS = 10 * 60 * 1000

export const issuer = () => (process.env.GATEKEEP_ISSUER || 'https://id.gatekeepauth.com').replace(/\/$/, '')
export const redirectUri = (origin: string) => `${origin}/api/auth/callback`

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url')
const random = (n: number) => b64u(randomBytes(n))

// ---------------------------------------------------------------- signed login cookie

interface PendingLogin { verifier: string; state: string; nonce: string; next: string; exp: number }

const loginMac = (body: string) =>
  createHmac('sha256', `gatekeep-login:${process.env.CB_SESSION_SECRET ?? ''}`).update(body).digest('base64url')

export function sealLogin(p: PendingLogin): string {
  const body = b64u(JSON.stringify(p))
  return `${body}.${loginMac(body)}`
}

export function unsealLogin(raw: string | undefined, now = Date.now()): PendingLogin | null {
  const [body, sig] = String(raw ?? '').split('.')
  if (!body || !sig) return null
  const expected = Buffer.from(loginMac(body))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString()) as PendingLogin
    return p.exp > now ? p : null
  } catch {
    return null
  }
}

/** Only paths on this site, so the login can't be turned into an open redirect. */
export const safeNext = (next: string | null) =>
  typeof next === 'string' && /^\/(?!\/)[\w\-./]*$/.test(next) ? next : '/'

/** Everything needed to send the browser to Gatekeep's /authorize. */
export function beginLogin(origin: string, next: string | null, now = Date.now()) {
  const verifier = random(32)
  const state = random(16)
  const nonce = random(16)
  const challenge = b64u(createHash('sha256').update(verifier).digest())
  const q = new URLSearchParams({
    response_type: 'code', client_id: CLIENT_ID, redirect_uri: redirectUri(origin), scope: 'openid email',
    state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  })
  return {
    location: `${issuer()}/authorize?${q}`,
    cookie: sealLogin({ verifier, state, nonce, next: safeNext(next), exp: now + LOGIN_TTL_MS }),
  }
}

// ---------------------------------------------------------------- ID tokens

export interface GatekeepClaims {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
  [k: string]: unknown
}

let jwksCache: { at: number; keys: JsonWebKey[] & { kid?: string }[] } = { at: 0, keys: [] }
async function jwks(force = false): Promise<(JsonWebKey & { kid?: string })[]> {
  if (!force && Date.now() - jwksCache.at < 3600_000 && jwksCache.keys.length) return jwksCache.keys
  const res = await fetch(`${issuer()}/jwks.json`)
  if (!res.ok) throw new Error(`jwks ${res.status}`)
  jwksCache = { at: Date.now(), keys: ((await res.json()) as { keys?: [] }).keys ?? [] }
  return jwksCache.keys
}

/** A Gatekeep ID token's claims after checking its EdDSA signature, issuer, audience, expiry and nonce; else null. */
export async function verifyIdToken(token: string, nonce: string): Promise<GatekeepClaims | null> {
  const [h, p, s] = String(token).split('.')
  if (!h || !p || !s) return null
  const header = JSON.parse(Buffer.from(h, 'base64url').toString())
  const claims = JSON.parse(Buffer.from(p, 'base64url').toString())
  if (header.alg !== 'EdDSA') return null
  let jwk = (await jwks()).find((k) => k.kid === header.kid)
  if (!jwk) jwk = (await jwks(true)).find((k) => k.kid === header.kid) // keys rotate
  if (!jwk || jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519') return null
  const key = await crypto.subtle.importKey('jwk', { kty: 'OKP', crv: 'Ed25519', x: jwk.x }, { name: 'Ed25519' }, false, ['verify'])
  const ok = await crypto.subtle.verify({ name: 'Ed25519' }, key, Buffer.from(s, 'base64url'), new TextEncoder().encode(`${h}.${p}`))
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (!ok || claims.iss !== issuer() || !aud.includes(CLIENT_ID) || !(claims.exp * 1000 > Date.now()) || claims.nonce !== nonce || !claims.sub) {
    return null
  }
  return claims as GatekeepClaims
}

/** Exchange the authorization code for an ID token (Gatekeep has no CORS, so this runs server-side). */
export async function exchangeCode(origin: string, code: string, verifier: string): Promise<string | null> {
  const res = await fetch(`${issuer()}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(origin), client_id: CLIENT_ID, code_verifier: verifier }),
  })
  const tokens = (await res.json().catch(() => ({}))) as { id_token?: string }
  return res.ok && tokens.id_token ? tokens.id_token : null
}

// ---------------------------------------------------------------- accounts

let linksTableReady = false
async function ensureLinksTable() {
  if (linksTableReady) return
  await tursoExecute(`CREATE TABLE IF NOT EXISTS identity_links (
    email TEXT PRIMARY KEY,
    legacy_sub TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'clerk',
    linked_at INTEGER NOT NULL
  )`)
  linksTableReady = true
}

/** The account id for a verified email: its Clerk-era id if it had one, else the Gatekeep sub. */
export async function accountIdFor(email: string, gatekeepSub: string): Promise<string> {
  if (!isTursoConfigured()) return gatekeepSub
  await ensureLinksTable()
  const r = await tursoExecute('SELECT legacy_sub FROM identity_links WHERE email = ?', [email.toLowerCase()])
  const legacy = r.rows?.[0]?.legacy_sub
  return typeof legacy === 'string' && legacy ? legacy : gatekeepSub
}
