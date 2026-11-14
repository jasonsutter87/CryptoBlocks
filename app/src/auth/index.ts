/**
 * Auth module — the one place the app knows how sign-in works.
 *
 * All components and hooks import from here. Sign-in is Gatekeep (passkeys):
 * /api/auth/login sends the browser to Gatekeep, and /api/auth/callback comes back
 * with a CryptoBlocks session in an HttpOnly cookie (cb_session) that scripts cannot
 * read (see netlify/functions/_lib/session.ts). This module only holds the non-secret
 * profile, fetched from /api/auth/me.
 *
 * The exports keep the Clerk-shaped API the app was written against (useAuth,
 * useUser, SignedIn, SignInButton, UserButton, …), limited to what the app uses.
 */
import { createElement, cloneElement, isValidElement, useState, useSyncExternalStore } from 'react'
import type { ReactElement, ReactNode } from 'react'

const PROFILE_KEY = 'cb_profile'
/** @deprecate Remove after 2026-12-31 along with the server's Bearer fallback: the old session-token key, wiped on load. */
const LEGACY_TOKEN_KEY = 'cb_session'
const GATEKEEP_URL = 'https://id.gatekeepauth.com'

/**
 * What getToken() returns while signed in. NOT a credential: the real session is an
 * HttpOnly cookie the browser sends by itself on same-origin requests, which scripts
 * cannot read. Callers across the app test the token for truthiness ("am I signed in?")
 * and add `Authorization: Bearer <it>`; the server ignores that header whenever the
 * cookie is present, so those call sites needed no change.
 */
export const COOKIE_SESSION = 'cookie-session'

interface SessionUser {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AuthState {
  /** False until the first /api/auth/me answer, unless a cached profile let us render at once. */
  loaded: boolean
  user: SessionUser | null
}

// ---------------------------------------------------------------- session store
// Only the non-secret profile lives here (memory, mirrored to localStorage for a fast
// first paint). It is a hint: /api/auth/me, answered from the cookie, is the truth.

const listeners = new Set<() => void>()

function readProfile(): SessionUser | null {
  try {
    const u = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null') as SessionUser | null
    return u && u.id ? u : null
  } catch {
    return null
  }
}

let state: AuthState = { loaded: false, user: null }

function setState(user: SessionUser | null, persist = true) {
  state = { loaded: true, user }
  if (persist) {
    try {
      if (user) localStorage.setItem(PROFILE_KEY, JSON.stringify(user))
      else localStorage.removeItem(PROFILE_KEY)
    } catch {
      // Storage unavailable (private mode): the profile lives for this page only.
    }
  }
  listeners.forEach((l) => l())
}

/** Ask the server who the cookie says we are. */
export async function refreshSession(): Promise<void> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
    if (res.ok) setState(((await res.json()) as { user?: SessionUser }).user ?? null)
    else if (res.status === 401) setState(null)
    else if (!state.loaded) setState(state.user, false) // server trouble: keep the cached hint, stop "loading"
  } catch {
    if (!state.loaded) setState(state.user, false) // offline: same
  }
}

if (typeof window !== 'undefined') {
  // @deprecate remove after 2026-12-31: the old build kept the bearer token in localStorage, readable by any script. Wipe it.
  try { localStorage.removeItem(LEGACY_TOKEN_KEY) } catch { /* ignore */ }
  const cached = readProfile()
  state = { loaded: !!cached, user: cached }
  void refreshSession()
  // Sign-in or sign-out in another tab.
  window.addEventListener('storage', (e) => {
    if (e.key === PROFILE_KEY) {
      state = { loaded: true, user: readProfile() }
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

const snapshot = () => state
const serverSnapshot: AuthState = { loaded: false, user: null }

/** The signed-in user, or null (also while still loading). */
function useSession(): SessionUser | null {
  return useSyncExternalStore(subscribe, snapshot, () => serverSnapshot).user
}

function useAuthState(): AuthState {
  return useSyncExternalStore(subscribe, snapshot, () => serverSnapshot)
}

export function signIn(next = typeof window !== 'undefined' ? window.location.pathname : '/') {
  window.location.href = `/api/auth/login?next=${encodeURIComponent(next)}`
}

/**
 * Sign out: the server revokes the session and clears the cookie, then we follow its
 * Gatekeep end-session URL (which ends the passkey session here too and comes back to `redirectTo`).
 */
export async function signOut(redirectTo = '/') {
  setState(null)
  let dest = redirectTo
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    const { logoutUrl } = (await res.json().catch(() => ({}))) as { logoutUrl?: string }
    if (res.ok && logoutUrl) {
      const u = new URL(logoutUrl)
      u.searchParams.set('post_logout_redirect_uri', new URL(redirectTo, window.location.origin).href)
      dest = u.href
    }
  } catch {
    // Offline: the profile is cleared locally; the cookie is cleared on the next successful call.
  }
  window.location.href = dest
}

// ---------------------------------------------------------------- hooks

/** Stable across renders, so effects that depend on getToken don't re-run forever. */
const getToken = async (): Promise<string | null> => (state.user ? COOKIE_SESSION : null)

export function useAuth() {
  const { loaded, user } = useAuthState()
  return { isLoaded: loaded, isSignedIn: !!user, userId: user?.id ?? null, getToken, signOut }
}

export function useUser() {
  const { loaded, user: u } = useAuthState()
  const user = u
    ? {
        id: u.id,
        fullName: u.name ?? null,
        username: u.name ?? null,
        imageUrl: u.avatar ?? '',
        primaryEmailAddress: { emailAddress: u.email },
      }
    : null
  return { isLoaded: loaded, isSignedIn: !!u, user }
}

// ---------------------------------------------------------------- components

export function AuthProvider({ children }: { children: ReactNode }) {
  return createElement('div', { style: { display: 'contents' } }, children)
}

export function SignedIn({ children }: { children: ReactNode }) {
  return useSession() ? createElement('div', { style: { display: 'contents' } }, children) : null
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { loaded, user } = useAuthState()
  return loaded && !user ? createElement('div', { style: { display: 'contents' } }, children) : null
}

/** Wraps a button: clicking it starts a Gatekeep sign-in and returns to this page. (`mode` is ignored.) */
export function SignInButton({ children }: { children?: ReactNode; mode?: string }) {
  const start = () => signIn()
  if (isValidElement(children)) {
    return cloneElement(children as ReactElement<{ onClick?: () => void }>, { onClick: start })
  }
  return createElement('button', { type: 'button', onClick: start }, children ?? 'Sign in')
}

/** The signed-in user's avatar, with a menu to manage passkeys or sign out. (`appearance` is ignored.) */
export function UserButton(props: { appearance?: unknown }) {
  void props
  const u = useSession()
  const [open, setOpen] = useState(false)
  if (!u) return null

  const label = u.name || u.email
  const avatar = u.avatar
    ? createElement('img', { src: u.avatar, alt: '', className: 'w-8 h-8 rounded-full' })
    : createElement('span', { className: 'w-8 h-8 rounded-full bg-purple text-base font-semibold flex items-center justify-center' }, label.charAt(0).toUpperCase())

  const item = 'block w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-0 rounded'
  // Close when focus leaves the menu (clicking elsewhere, or tabbing out).
  const onBlur = (e: { currentTarget: HTMLElement; relatedTarget: EventTarget | null }) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
  }
  return createElement('div', { className: 'relative', onBlur, onKeyDown: (e: { key: string }) => { if (e.key === 'Escape') setOpen(false) } },
    createElement('button', {
      type: 'button', onClick: () => setOpen((o) => !o), 'aria-haspopup': 'menu', 'aria-expanded': open,
      'aria-label': `Account menu for ${label}`, className: 'rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple',
    }, avatar),
    open && createElement('div', { role: 'menu', className: 'absolute right-0 mt-2 w-56 rounded-lg border border-surface-0 bg-base shadow-lg p-1 z-50' },
      createElement('div', { className: 'px-3 py-2 text-xs text-subtext truncate' }, u.email),
      createElement('a', { role: 'menuitem', href: GATEKEEP_URL, target: '_blank', rel: 'noopener noreferrer', className: item }, 'Manage passkeys'),
      createElement('button', { role: 'menuitem', type: 'button', onClick: () => signOut(), className: item }, 'Sign out'),
    ),
  )
}

// ---------------------------------------------------------------- non-hook access

/** A signed-in marker (see COOKIE_SESSION; not a credential) for code outside React (trackers, file-ops, sprite editor). */
export async function getClerkToken(): Promise<string | null> {
  return state.user ? COOKIE_SESSION : null
}

/** The signed-in user's display name, or 'Anonymous'. */
export function getClerkUserName(): string {
  const u = state.user
  return u?.name || u?.email?.split('@')[0] || 'Anonymous'
}
