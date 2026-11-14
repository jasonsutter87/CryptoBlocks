/**
 * CryptoBlocks session tokens.
 *
 * After a Gatekeep sign-in (see ./gatekeep.ts and ../auth.mts) the user gets a
 * compact HS256 JWT signed with CB_SESSION_SECRET. It lives in an HttpOnly
 * cookie (`cb_session`) the page's JavaScript can never read; verifyFromRequest
 * (./auth.ts) checks it on every API call. Each token carries a session id
 * (`sid`) so sign-out can revoke it server-side (see ./revocation.ts).
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

export interface SessionClaims {
  /** The account id: the Clerk-era user id for linked accounts, else the Gatekeep sub. */
  sub: string
  email: string
  name?: string
  avatar?: string
  /** Session id, revocable at sign-out. Absent on tokens issued before the cookie change. */
  sid?: string
  iat: number
  exp: number
}

export const SESSION_TTL_S = 7 * 24 * 60 * 60
export const SESSION_COOKIE = 'cb_session'

/** Set-Cookie value for the session: HttpOnly so scripts can't read it, Lax so cross-site POSTs don't carry it. */
export const sessionCookie = (token: string, maxAgeS = SESSION_TTL_S) =>
  `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeS}`

/** The raw session cookie value on a request, or ''. */
export const readSessionCookie = (req: Request): string =>
  (req.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1) ?? ''

const b64u = (s: string | Buffer) => Buffer.from(s).toString('base64url')

function secret(): string {
  const s = process.env.CB_SESSION_SECRET ?? ''
  if (s.length < 32) throw new Error('CB_SESSION_SECRET must be set (at least 32 characters)')
  return s
}

const mac = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url')

export function createSessionToken(user: Omit<SessionClaims, 'iat' | 'exp' | 'sid'>, now = Date.now()): string {
  const iat = Math.floor(now / 1000)
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64u(JSON.stringify({ ...user, sid: randomUUID(), iat, exp: iat + SESSION_TTL_S }))
  return `${head}.${body}.${mac(`${head}.${body}`)}`
}

/** The session's claims, or null if the token is malformed, forged or expired. */
export function verifySessionToken(token: string, now = Date.now()): SessionClaims | null {
  const [head, body, sig] = String(token ?? '').split('.')
  if (!head || !body || !sig) return null
  let expected: Buffer
  try {
    expected = Buffer.from(mac(`${head}.${body}`))
  } catch {
    return null // no secret configured: nobody is signed in
  }
  const given = Buffer.from(sig)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const header = JSON.parse(Buffer.from(head, 'base64url').toString())
    if (header.alg !== 'HS256') return null
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionClaims
    if (typeof claims.sub !== 'string' || !claims.sub || typeof claims.exp !== 'number') return null
    return claims.exp * 1000 > now ? claims : null
  } catch {
    return null
  }
}
