/**
 * Chat — persistent room chat backed by the same Y.Doc that powers collab.
 *
 * Messages live in a Y.Array<ChatMessage> named 'chat' on the room's Y.Doc,
 * so they sync/persist for free alongside the block workspace. No new backend.
 *
 * Unread tracking: lastSeenAt is stored per-room in localStorage; unreadCount
 * counts messages whose timestamp > lastSeenAt and whose author isn't the
 * current user.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import * as Y from 'yjs'
import type { CollabUser } from './types'

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  userColor: string
  text: string
  /** Epoch ms */
  timestamp: number
}

function storageKey(roomKey: string): string {
  return `cryptoblocks-chat-lastseen:${roomKey}`
}

export interface UseChatResult {
  messages: ChatMessage[]
  sendMessage: (text: string) => void
  unreadCount: number
  markAllRead: () => void
}

export function useChat(
  ydoc: Y.Doc | null,
  user: CollabUser | null,
  roomKey: string,
  isOpen: boolean,
): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [lastSeenAt, setLastSeenAt] = useState<number>(() => {
    if (!roomKey) return 0
    const raw = localStorage.getItem(storageKey(roomKey))
    return raw ? Number(raw) || 0 : 0
  })

  const yarray = useMemo<Y.Array<ChatMessage> | null>(() => {
    if (!ydoc) return null
    return ydoc.getArray<ChatMessage>('chat')
  }, [ydoc])

  useEffect(() => {
    if (!yarray) {
      setMessages([])
      return
    }
    const sync = () => setMessages(yarray.toArray())
    sync()
    yarray.observe(sync)
    return () => yarray.unobserve(sync)
  }, [yarray])

  const sendMessage = useCallback((text: string) => {
    if (!yarray || !user) return
    const trimmed = text.trim()
    if (!trimmed) return
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userColor: user.color || '#8B5CF6',
      text: trimmed.slice(0, 2000),
      timestamp: Date.now(),
    }
    yarray.push([msg])
  }, [yarray, user])

  const markAllRead = useCallback(() => {
    const now = Date.now()
    setLastSeenAt(now)
    if (roomKey) localStorage.setItem(storageKey(roomKey), String(now))
  }, [roomKey])

  // If the panel is open, auto-advance lastSeenAt as new messages arrive
  useEffect(() => {
    if (!isOpen) return
    if (messages.length === 0) return
    const latest = messages[messages.length - 1].timestamp
    if (latest > lastSeenAt) {
      setLastSeenAt(latest)
      if (roomKey) localStorage.setItem(storageKey(roomKey), String(latest))
    }
  }, [isOpen, messages, lastSeenAt, roomKey])

  const unreadCount = useMemo(() => {
    if (!user) return 0
    let count = 0
    for (const m of messages) {
      if (m.timestamp > lastSeenAt && m.userId !== user.id) count++
    }
    return count
  }, [messages, lastSeenAt, user])

  return { messages, sendMessage, unreadCount, markAllRead }
}
