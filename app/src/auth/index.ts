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
