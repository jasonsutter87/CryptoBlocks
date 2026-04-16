/**
 * Notification bell — shows unread count badge, dropdown with recent notifications.
 * Polls every 60s when the user is signed in.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string
  read: boolean
  createdAt: number
}

export default function NotificationBell() {
  const { getToken } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {}
  }, [getToken])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const markRead = async () => {
    try {
      const token = await getToken()
      if (!token) return
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleToggle = () => {
    if (!open && unreadCount > 0) markRead()
    setOpen((o) => !o)
  }

  const formatAge = (ts: number) => {
    const ms = Date.now() - Number(ts)
    if (ms < 60_000) return 'just now'
    const min = Math.floor(ms / 60_000)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    return `${Math.floor(hr / 24)}d ago`
  }

  const typeIcon: Record<string, string> = {
    like: '❤️',
    remix: '🔀',
    classroom: '🏫',
    assignment: '📝',
    feedback: '💬',
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center w-8 h-8 rounded-md bg-surface-0 hover:bg-surface-1 text-text transition-colors"
        title="Notifications"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-danger text-base text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-80 bg-surface-0 border border-surface-1 rounded-lg shadow-xl z-50 max-h-96 overflow-auto">
            <div className="px-3 py-2 border-b border-surface-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Notifications</span>
              {notifications.length > 0 && (
                <button onClick={markRead} className="text-[10px] text-accent hover:text-sapphire">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-overlay">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 border-b border-surface-1/50 hover:bg-surface-1 transition-colors ${!n.read ? 'bg-surface-1/30' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-text">{n.title}</div>
                      <div className="text-[11px] text-subtext truncate">{n.body}</div>
                      <div className="text-[10px] text-overlay mt-0.5">{formatAge(n.createdAt)}</div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                  </div>
                </a>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
