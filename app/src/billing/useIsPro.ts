/**
 * Hook to check if the current user has an active CryptoBlocks Pro subscription.
 * Caches the result in sessionStorage so we don't hit the API on every render.
 */

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '../auth'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)

const CACHE_KEY = 'cb-pro-status'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useIsPro(): { isPro: boolean; loading: boolean; isAdmin: boolean; plan: string; refresh: () => void } {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()

  // Admin check — admins always get Pro
  const email = user?.primaryEmailAddress?.emailAddress || ''
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase())

  const [isPro, setIsPro] = useState(() => {
    if (isAdmin) return true
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}')
      if (cached.ts && Date.now() - cached.ts < CACHE_TTL) return cached.isPro === true
    } catch {}
    return false
  })
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (isAdmin) { setIsPro(true); setPlan('admin'); return }
    if (!isSignedIn) {
      setIsPro(false); setPlan('free')
      return
    }
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/stripe/status', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        const pro = data.isPro === true
        setIsPro(pro)
        setPlan(data.plan || 'free')
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ isPro: pro, plan: data.plan, ts: Date.now() }))
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { check() }, [isSignedIn, isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isPro: isPro || isAdmin, loading, isAdmin, plan, refresh: check }
}

export async function openCheckout(getToken: () => Promise<string | null>, plan: 'pro' | 'teacher' = 'pro'): Promise<void> {
  try {
    const token = await getToken()
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ plan }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.url) window.location.href = data.url
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Checkout failed:', err)
  }
}

export async function openPortal(getToken: () => Promise<string | null>): Promise<void> {
  try {
    const token = await getToken()
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
    if (res.ok) {
      const data = await res.json()
      if (data.url) window.location.href = data.url
    }
  } catch {}
}
