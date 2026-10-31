/**
 * Auth module — the one place the app knows how sign-in works.
 *
 * All components and hooks import from here. Sign-in is Gatekeep (passkeys):
 * /api/auth/login sends the browser to Gatekeep, and /api/auth/callback comes back
 * with a CryptoBlocks session in the URL fragment (#cb_session=…), which this module
 * stores and serves as the Bearer token for API calls (see
 * netlify/functions/_lib/session.ts).
 *
 * The exports keep the Clerk-shaped API the app was written against (useAuth,
 * useUser, SignedIn, SignInButton, UserButton, …), limited to what the app uses.
 */
import { createElement, cloneElement, isValidElement, useState, useSyncExternalStore } from 'react'
import type { ReactElement, ReactNode } from 'react'

const STORAGE_KEY = 'cb_session'
const GATEKEEP_URL = 'https://id.gatekeepauth.com'

interface SessionUser {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface Session {
  token: string
  user: SessionUser
  /** Expiry in ms since epoch, from the token's exp claim. */
  exp: number
}

// ---------------------------------------------------------------- session store

const listeners = new Set<() => void>()
let current: Session | null = null

function tokenExp(token: string): number {
  try {
    const body = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return Number(JSON.parse(atob(body)).exp) * 1000 || 0
  } catch {
    return 0
  }
}

function read(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Session | null
    return s && s.token && s.user?.id && s.exp > Date.now() ? s : null
  } catch {
    return null
  }
}

function write(s: Session | null) {
  current = s
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable (private mode): the session lives for this page only.
  }
  listeners.forEach((l) => l())
}

/** Take a session handed over by /api/auth/callback in the URL fragment, then clean the address bar. */
function takeHandoff() {
  if (typeof window === 'undefined' || !window.location.hash.includes('cb_session=')) return
  const params = new URLSearchParams(window.location.hash.slice(1))
  const token = params.get('cb_session') ?? ''
  let user: SessionUser | null = null
  try {
    const b64 = (params.get('user') ?? '').replace(/-/g, '+').replace(/_/g, '/')
    user = JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch {
    user = null
  }
  history.replaceState(null, '', window.location.pathname + window.location.search)
  if (token && user?.id) write({ token, user, exp: tokenExp(token) })
}

if (typeof window !== 'undefined') {
  current = read()
  takeHandoff()
  // Sign-in or sign-out in another tab.
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      current = read()
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** The live session, or null once it has expired. */
function session(): Session | null {
  if (current && current.exp <= Date.now()) write(null)
  return current
}

function useSession(): Session | null {
  return useSyncExternalStore(subscribe, session, () => null)
}

export function signIn(next = typeof window !== 'undefined' ? window.location.pathname : '/') {
  window.location.href = `/api/auth/login?next=${encodeURIComponent(next)}`
}

export function signOut(redirectTo = '/') {
  write(null)
  window.location.href = redirectTo
}

// ---------------------------------------------------------------- hooks

/** Stable across renders, so effects that depend on getToken don't re-run forever. */
const getToken = async (): Promise<string | null> => session()?.token ?? null

export function useAuth() {
  const s = useSession()
  return { isLoaded: true, isSignedIn: !!s, userId: s?.user.id ?? null, getToken, signOut }
}

export function useUser() {
  const s = useSession()
  const user = s
    ? {
        id: s.user.id,
        fullName: s.user.name ?? null,
        username: s.user.name ?? null,
        imageUrl: s.user.avatar ?? '',
        primaryEmailAddress: { emailAddress: s.user.email },
      }
    : null
  return { isLoaded: true, isSignedIn: !!s, user }
}

// ---------------------------------------------------------------- components

export function AuthProvider({ children }: { children: ReactNode }) {
  return createElement('div', { style: { display: 'contents' } }, children)
}

export function SignedIn({ children }: { children: ReactNode }) {
  return useSession() ? createElement('div', { style: { display: 'contents' } }, children) : null
}

export function SignedOut({ children }: { children: ReactNode }) {
  return useSession() ? null : createElement('div', { style: { display: 'contents' } }, children)
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
  const s = useSession()
  const [open, setOpen] = useState(false)
  if (!s) return null

  const label = s.user.name || s.user.email
  const avatar = s.user.avatar
    ? createElement('img', { src: s.user.avatar, alt: '', className: 'w-8 h-8 rounded-full' })
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
      createElement('div', { className: 'px-3 py-2 text-xs text-subtext truncate' }, s.user.email),
      createElement('a', { role: 'menuitem', href: GATEKEEP_URL, target: '_blank', rel: 'noopener noreferrer', className: item }, 'Manage passkeys'),
      createElement('button', { role: 'menuitem', type: 'button', onClick: () => signOut(), className: item }, 'Sign out'),
    ),
  )
}

// ---------------------------------------------------------------- non-hook access

/** The session token for code outside React (trackers, file-ops, sprite editor). */
export async function getClerkToken(): Promise<string | null> {
  return session()?.token ?? null
}

/** The signed-in user's display name, or 'Anonymous'. */
export function getClerkUserName(): string {
  const s = session()
  return s?.user.name || s?.user.email?.split('@')[0] || 'Anonymous'
}
