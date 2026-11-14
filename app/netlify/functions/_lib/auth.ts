/**
 * Who is calling: the CryptoBlocks session token from a Gatekeep sign-in.
 *
 * It arrives in the HttpOnly `cb_session` cookie. Sessions are issued by ../auth.mts after a passkey sign-in at Gatekeep; see
 * ./session.ts. The interface keeps its Clerk-era name so the functions and
 * guards that import it don't change.
 */
import { verifySessionToken, readSessionCookie } from './session.js'
import type { SessionClaims } from './session.js'
import { isRevoked } from './revocation.js'

export interface ClerkUser {
  /** Account id: the Clerk-era user id for accounts that carried over, else the Gatekeep sub. */
  sub: string
  name?: string
  email?: string
  avatar?: string
}

/** Verify a CryptoBlocks session token and return the user, or null. */
export async function verifyClerkToken(token: string): Promise<ClerkUser | null> {
  if (!token) return null
  const claims = verifySessionToken(token)
  if (!claims) return null
  return { sub: claims.sub, name: claims.name, email: claims.email, avatar: claims.avatar }
}

/**
 * CSRF defence for cookie-authenticated requests (a cookie rides along on any request
 * the browser makes, so state changes need proof the page itself sent them).
 * Rule: POST/PUT/PATCH/DELETE must carry `Origin` equal to this site's origin, or
 * `Sec-Fetch-Site: same-origin`. Both are set by the browser and can't be forged by
 * a page. A state-changing request with neither header is refused. On top of
 * SameSite=Lax on the cookie itself.
 */
export function isSameOriginRequest(req: Request): boolean {
  const origin = req.headers.get('Origin')
  if (origin) return origin === new URL(req.url).origin
  return req.headers.get('Sec-Fetch-Site') === 'same-origin'
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/** The verified claims behind the session cookie, if any (no CSRF or revocation check). */
export function cookieClaims(req: Request): SessionClaims | null {
  const raw = readSessionCookie(req)
  return raw ? verifySessionToken(raw) : null
}

/**
 * Who is calling: the `cb_session` HttpOnly cookie, else (temporarily) a Bearer token.
 *
 * @deprecate Bearer sessions, remove after 2026-12-31. Before the cookie change the app
 * kept the session token in localStorage and sent it as `Authorization: Bearer`; tabs
 * opened before the deploy still do. Delete the Bearer branch below (and
 * `extractBearer` use here) once those tokens have expired (7 days after release;
 * the date leaves a buffer). Run the code-janitor to find it.
 */
export async function verifyFromRequest(req: Request): Promise<ClerkUser | null> {
  const claims = cookieClaims(req)
  if (claims) {
    if (!SAFE_METHODS.has(req.method.toUpperCase()) && !isSameOriginRequest(req)) return null
    if (await isRevoked(claims.sid)) return null
    return { sub: claims.sub, name: claims.name, email: claims.email, avatar: claims.avatar }
  }
  // @deprecate remove after 2026-12-31: legacy Bearer sessions (see above). Not revocable (no sid).
  const header = req.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return null
  return verifyClerkToken(header.slice(7).trim())
}

/** Check if user is admin based on email allowlist */
export function isAdmin(user: ClerkUser | null): boolean {
  if (!user?.email) return false
  const admins = (process.env.ADMIN_EMAILS ?? process.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(user.email.toLowerCase())
}

/**
 * Generate a cryptographically strong random ID using getRandomValues.
 * Replaces Math.random() for security-adjacent tokens (join codes, etc.).
 */
export function secureRandomCode(length: number, alphabet: string): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let code = ''
  for (let i = 0; i < length; i++) {
    code += alphabet[bytes[i] % alphabet.length]
  }
  return code
}
