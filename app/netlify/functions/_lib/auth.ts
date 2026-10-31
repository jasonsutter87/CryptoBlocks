/**
 * Who is calling: the CryptoBlocks session token from a Gatekeep sign-in.
 *
 * The app sends it as `Authorization: Bearer`, as it did Clerk's session token.
 * Sessions are issued by ../auth.mts after a passkey sign-in at Gatekeep; see
 * ./session.ts. The interface keeps its Clerk-era name so the functions and
 * guards that import it don't change.
 */
import { verifySessionToken } from './session.js'

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
