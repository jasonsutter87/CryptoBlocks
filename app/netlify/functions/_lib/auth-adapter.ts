/**
 * Auth adapter — quarantines the Clerk dependency behind an interface.
 *
 * Every function that needs to know "who is this user?" calls
 * `getAuthAdapter().verifyRequest(req)` instead of importing Clerk
 * internals directly. If Clerk disappears, is replaced, or we need a
 * test double, this is the ONE file that changes.
 *
 * The default adapter verifies CryptoBlocks session tokens issued after a
 * Gatekeep sign-in (./session.ts). Swap with setAuthAdapter in tests.
 */

import { verifyFromRequest, isAdmin } from './auth.js'
import type { ClerkUser } from './auth.js'

export interface AuthUser {
  sub: string
  name?: string
  email?: string
  avatar?: string
}

export interface AuthAdapter {
  verifyRequest(req: Request): Promise<AuthUser | null>
  isAdmin(user: AuthUser | null): boolean
}

const sessionAdapter: AuthAdapter = {
  verifyRequest: (req) => verifyFromRequest(req) as Promise<AuthUser | null>,
  isAdmin: (user) => isAdmin(user as ClerkUser | null),
}

let adapter: AuthAdapter = sessionAdapter

export function getAuthAdapter(): AuthAdapter {
  return adapter
}

export function setAuthAdapter(a: AuthAdapter): void {
  adapter = a
}
