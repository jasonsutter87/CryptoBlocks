/**
 * Netlify Function — sign in with Gatekeep (passkeys).
 *
 * GET /api/auth/login?next=/path  → Gatekeep (code flow with PKCE, state and nonce)
 * GET /api/auth/callback          ← back from Gatekeep: verify the ID token, resolve the
 *                                   account, hand the app a session in the URL fragment
 *
 * Only an email Gatekeep has verified may sign in: accounts carry over from Clerk by
 * email, so an unverified address could otherwise claim someone else's account.
 * The session token reaches the app in the fragment (#cb_session=…), which browsers
 * never send to a server or put in a Referer header.
 *
 * Env: CB_SESSION_SECRET (signs sessions and the login cookie), GATEKEEP_ISSUER
 * (optional, defaults to https://id.gatekeepauth.com).
 */
import { logError, parsePath } from './_lib/index.js'
import { accountIdFor, beginLogin, exchangeCode, unsealLogin, verifyIdToken, LOGIN_TTL_MS } from './_lib/gatekeep.js'
import { createSessionToken } from './_lib/session.js'

const COOKIE = 'cb_gk_login'

const setCookie = (value: string, maxAgeMs: number) =>
  `${COOKIE}=${value}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}`

const readCookie = (req: Request) =>
  (req.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)

function redirect(location: string, cookie?: string): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' })
  if (cookie) headers.append('Set-Cookie', cookie)
  return new Response(null, { status: 302, headers })
}

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
  const profile = Buffer.from(JSON.stringify({ id: sub, email, name, avatar })).toString('base64url')
  const fragment = new URLSearchParams({ cb_session: token, user: profile })
  return redirect(`${url.origin}${pending.next}#${fragment}`, setCookie('', 0))
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })
  const [step] = parsePath(req, 'auth')
  try {
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
