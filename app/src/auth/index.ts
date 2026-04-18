/**
 * Auth module — the one place the app talks to Clerk.
 *
 * All components and hooks import from here, not from `@clerk/clerk-react`
 * directly. If Clerk is replaced, the swap happens in this file plus
 * `netlify/functions/_lib/auth-adapter.ts` on the backend, and nothing
 * else needs to change.
 *
 * The hook signatures are intentionally narrow (just what the app uses).
 * Adding a new auth surface means exposing it here deliberately, not
 * pulling in whatever Clerk happens to export.
 */

export {
  useAuth,
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  ClerkProvider,
} from '@clerk/clerk-react'

type ClerkWindow = {
  Clerk?: {
    session?: { getToken: () => Promise<string> }
    user?: { fullName?: string; username?: string }
  }
}

/** Read a Clerk JWT from the global Clerk object without a React context.
 *  Use this only in non-hook code (trackers, file-ops, sprite editor).
 *  Hook-based code should prefer `useAuth().getToken()` instead. */
export async function getClerkToken(): Promise<string | null> {
  return (window as unknown as ClerkWindow).Clerk?.session?.getToken() ?? null
}

/** Read the current user's display name from the global Clerk object.
 *  Returns 'Anonymous' if no user is signed in. */
export function getClerkUserName(): string {
  const u = (window as unknown as ClerkWindow).Clerk?.user
  return u?.username || u?.fullName || 'Anonymous'
}
