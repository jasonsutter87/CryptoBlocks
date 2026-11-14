/**
 * Netlify Function — sign in with Gatekeep (passkeys).
 *
 * GET /api/auth/login?next=/path  → Gatekeep (code flow with PKCE, state and nonce)
 * GET /api/auth/callback          ← back from Gatekeep: verify the ID token, resolve the
 *                                   account, set the session as an HttpOnly cookie
 * GET /api/auth/me                → the signed-in user's non-secret profile (401 if none)
 * POST /api/auth/logout           → revoke the session, clear the cookie, return the
 *                                   Gatekeep end-session URL (RP-initiated logout)
 *
 * Only an email Gatekeep has verified may sign in: accounts carry over from Clerk by
 * email, so an unverified address could otherwise claim someone else's account.
 * The session is the `cb_session` cookie (HttpOnly; Secure; SameSite=Lax): page scripts
 * never see the token, only the profile from /me. Sign-out revokes the session id in
 * Turso, so a copied cookie dies with it.
 *
 * Env: CB_SESSION_SECRET (signs sessions and the login cookie), GATEKEEP_ISSUER
 * (optional, defaults to https://id.gatekeepauth.com).
 */
import { logError, parsePath, verifyFromRequest } from './_lib/index.js'
import { accountIdFor, beginLogin, exchangeCode, issuer, safeNext, unsealLogin, verifyIdToken, LOGIN_TTL_MS } from './_lib/gatekeep.js'
import { createSessionToken, sessionCookie, SESSION_COOKIE } from './_lib/session.js'
import { cookieClaims, isSameOriginRequest } from './_lib/auth.js'
import { revokeSession } from './_lib/revocation.js'

const COOKIE = 'cb_gk_login'

const setCookie = (value: string, maxAgeMs: number) =>
  `${COOKIE}=${value}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}`

const readCookie = (req: Request) =>
  (req.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)

function redirect(location: string, ...cookies: string[]): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' })
  for (const c of cookies) headers.append('Set-Cookie', c)
  return new Response(null, { status: 302, headers })
}

const noStoreJson = (data: unknown, status = 200, cookies: string[] = []) => {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  for (const c of cookies) headers.append('Set-Cookie', c)
  return new Response(JSON.stringify(data), { status, headers })
}

const clearSession = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`

/** Back to the app with a reason the sign-in page can show. */
const failed = (origin: string, code: string) => redirect(`${origin}/?signin_error=${code}`, setCookie('', 0))

async function finish(req: Request, url: URL): Promise<Response> {
  const pending = unsealLogin(readCookie(req))
  if (!pending || pending.state !== url.searchParams.get('state')) return failed(url.origin, 'expired')
  const code = url.searchParams.get('code')
  if (!code) return failed(url.origin, 'cancelled')

  const idToken = await exchangeCode(url.origin, code, pending.verifier)
  if (!idToken) return failed(url.origin, 'signin')
  const claims = await verifyIdToken(idToken, pending.nonce)
  if (!claims) return failed(url.origin, 'signin')
  const email = String(claims.email ?? '').trim().toLowerCase()
  if (!email || claims.email_verified !== true) return failed(url.origin, 'unverified')

  const sub = await accountIdFor(email, claims.sub)
  const name = typeof claims.name === 'string' ? claims.name : email.split('@')[0]
  const avatar = typeof claims.picture === 'string' ? claims.picture : undefined
  const token = createSessionToken({ sub, email, name, ...(avatar ? { avatar } : {}) })
  // No token in the URL: it rides only in the HttpOnly cookie. `next` is re-checked here
  // (it was already checked at login) so a tampered or old login cookie can't open-redirect.
  return redirect(`${url.origin}${safeNext(pending.next)}`, setCookie('', 0), sessionCookie(token))
}

/** GET /api/auth/me — the profile for the page to display. Never the token. */
async function me(req: Request): Promise<Response> {
  const user = await verifyFromRequest(req)
  if (!user) return noStoreJson({ error: 'Not signed in' }, 401)
  return noStoreJson({ user: { id: user.sub, email: user.email, name: user.name, avatar: user.avatar } })
}

/** POST /api/auth/logout — revoke this session, clear the cookie, point the browser at Gatekeep's end-session endpoint. */
async function logout(req: Request, url: URL): Promise<Response> {
  if (!isSameOriginRequest(req)) return noStoreJson({ error: 'Cross-origin request refused' }, 403)
  const claims = cookieClaims(req)
  let revoked = !claims?.sid
  if (claims?.sid) {
    try { await revokeSession(claims.sid, claims.exp); revoked = true } catch (err) { logError('auth', err) }
  }
  const back = new URLSearchParams({ post_logout_redirect_uri: `${url.origin}/` })
  return noStoreJson({ ok: true, revoked, logoutUrl: `${issuer()}/logout?${back}` }, 200, [clearSession()])
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const [step] = parsePath(req, 'auth')
  try {
    if (step === 'logout') {
      return req.method === 'POST' ? await logout(req, url) : new Response('Method not allowed', { status: 405 })
    }
    if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })
    if (step === 'me') return await me(req)
    if (step === 'login') {
      const { location, cookie } = beginLogin(url.origin, url.searchParams.get('next'))
      return redirect(location, setCookie(cookie, LOGIN_TTL_MS))
    }
    if (step === 'callback') return await finish(req, url)
    return new Response('Not found', { status: 404 })
  } catch (err) {
    logError('auth', err)
    return failed(url.origin, 'unavailable')
  }
}
