/**
 * Toast notification system — replaces all browser alert() calls.
 *
 * Usage:
 *   import { showToast } from './Toast'
 *   showToast('Message here')
 *   showToast('Sign in required', 'signin')
 *   showToast('Error!', 'error')
 *   showToast('Done!', 'success')
 */

import { useState, useEffect, useCallback } from 'react'
import { SignInButton } from '../auth'

type ToastType = 'info' | 'success' | 'error' | 'signin'

interface ToastData {
  id: number
  message: string
  type: ToastType
}

let _toastId = 0
let _addToast: ((toast: ToastData) => void) | null = null

export function showToast(message: string, type: ToastType = 'info'): void {
  _addToast?.({ id: ++_toastId, message, type })
}

const COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  info: { bg: 'bg-surface-0', border: 'border-surface-1', text: 'text-text', icon: 'ℹ️' },
  success: { bg: 'bg-[#1a3e2a]', border: 'border-success/30', text: 'text-success', icon: '✅' },
  error: { bg: 'bg-[#3e1a1a]', border: 'border-danger/30', text: 'text-danger', icon: '❌' },
  signin: { bg: 'bg-[#1e1e3e]', border: 'border-accent/30', text: 'text-text', icon: '🔐' },
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toast: ToastData) => {
    setToasts((prev) => [...prev, toast])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    _addToast = addToast
    return () => { _addToast = null }
  }, [addToast])

  // Auto-remove after 5 seconds (except signin which stays until dismissed)
  useEffect(() => {
    const timers = toasts
      .filter((t) => t.type !== 'signin')
      .map((t) => setTimeout(() => removeToast(t.id), 5000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const c = COLORS[toast.type]
        return (
          <div
            key={toast.id}
            className={`${c.bg} border ${c.border} rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-[slideIn_0.3s_ease]`}
          >
            <span className="text-lg shrink-0">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${c.text}`}>{toast.message}</p>
              {toast.type === 'signin' && (
                <div className="mt-2">
                  <SignInButton mode="modal">
                    <button className="px-4 py-1.5 bg-purple text-base rounded-lg text-xs font-bold hover:bg-purple/80 transition-colors">
                      Sign In — it's free
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-overlay hover:text-text shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
