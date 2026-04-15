/**
 * Clerk JWT verification with JWKS signature checking.
 *
 * Upgrades the previous unsigned-decode pattern — verifies the token
 * signature against Clerk's public keys before trusting the payload.
 *
 * Falls back to unsigned decode only when CLERK_JWKS_URL is unset
 * (dev mode with explicit opt-in via CLERK_ALLOW_UNSIGNED=true).
 */

export interface ClerkUser {
  sub: string
  name?: string
  email?: string
}

interface ClerkPayload {
  sub?: unknown
  exp?: unknown
  iat?: unknown
  azp?: unknown
  iss?: unknown
}

interface JwkKey {
  kid: string
  kty: string
  n: string
  e: string
  use?: string
  alg?: string
}

// In-memory JWKS cache (survives across warm invocations on same instance)
let jwksCache: { keys: JwkKey[]; fetchedAt: number } | null = null
const JWKS_TTL_MS = 10 * 60 * 1000 // 10 min

/** Base64URL decode → Uint8Array */
function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 2 ? '==' : input.length % 4 === 3 ? '=' : ''
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Base64URL decode → UTF-8 string */
function base64UrlDecodeText(input: string): string {
  return new TextDecoder().decode(base64UrlDecode(input))
}

/** Fetch + cache Clerk's JWKS */
async function getJwks(): Promise<JwkKey[] | null> {
  const url = process.env.CLERK_JWKS_URL
  if (!url) return null

  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys
  }

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data.keys)) return null
    jwksCache = { keys: data.keys, fetchedAt: Date.now() }
    return data.keys
  } catch {
    return null
  }
}

/** Import a JWK as a Web Crypto public key */
async function importJwk(jwk: JwkKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: jwk.alg ?? 'RS256', use: jwk.use ?? 'sig' },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )
}

/** Verify the signature + exp claim on a Clerk JWT */
async function verifyJwtSignature(token: string, keys: JwkKey[]): Promise<ClerkPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  let header: { kid?: string; alg?: string }
  try {
    header = JSON.parse(base64UrlDecodeText(parts[0]))
  } catch { return null }

  if (header.alg !== 'RS256') return null
  const kid = typeof header.kid === 'string' ? header.kid : null
  const jwk = kid ? keys.find((k) => k.kid === kid) : keys[0]
  if (!jwk) return null

  let key: CryptoKey
  try { key = await importJwk(jwk) } catch { return null }

  const signedData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  const signature = base64UrlDecode(parts[2])

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signature,
    signedData,
  )
  if (!valid) return null

  let payload: ClerkPayload
  try { payload = JSON.parse(base64UrlDecodeText(parts[1])) } catch { return null }

  // exp check — JWTs are dead after expiration
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return null

  return payload
}

/** Unsigned fallback — dev only, explicit opt-in */
function decodeUnsigned(token: string): ClerkPayload | null {
  if (process.env.CLERK_ALLOW_UNSIGNED !== 'true') return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(base64UrlDecodeText(parts[1]))
  } catch {
    return null
  }
}

/** Enrich payload with user profile from Clerk Backend API */
async function enrichFromClerk(sub: string): Promise<Partial<ClerkUser>> {
  if (!process.env.CLERK_SECRET_KEY) return {}
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(sub)}`, {
      headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (!res.ok) return {}
    const user = await res.json()
    return {
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || undefined,
      email: user.email_addresses?.[0]?.email_address,
    }
  } catch {
    return {}
  }
}

/**
 * Verify a Clerk session token and return user info.
 *
 * Returns null when:
 *   - token is empty
 *   - signature verification fails (and CLERK_ALLOW_UNSIGNED is not set)
 *   - token is expired
 *   - sub claim is missing
 */
export async function verifyClerkToken(token: string): Promise<ClerkUser | null> {
  if (!token) return null

  let payload: ClerkPayload | null = null

  const keys = await getJwks()
  if (keys) {
    payload = await verifyJwtSignature(token, keys)
  } else {
    // No JWKS configured — allow unsigned decode only if explicitly opted in
    payload = decodeUnsigned(token)
  }

  if (!payload || typeof payload.sub !== 'string' || payload.sub.length === 0) return null

  const enrichment = await enrichFromClerk(payload.sub)
  return { sub: payload.sub, ...enrichment }
}

/** Convenience: extract bearer + verify in one call */
export async function verifyFromRequest(req: Request): Promise<ClerkUser | null> {
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
