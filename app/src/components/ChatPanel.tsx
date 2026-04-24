/**
 * ChatPanel — docked floating chat for the current collab room.
 *
 * Renders a right-anchored panel with message list + compose input. Messages
 * are backed by the room's Y.Doc (see collab/chat.ts) — no new backend.
 */

import { useEffect, useRef, useState } from 'react'
import { useChat } from '../collab/chat'
import { useCollabDoc } from '../collab'
import type { CollabUser } from '../collab/types'

interface ChatPanelProps {
  user: CollabUser | null
  roomKey: string
  onClose: () => void
  isOpen: boolean
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPanel({ user, roomKey, onClose, isOpen }: ChatPanelProps) {
  const ydoc = useCollabDoc()
  const { messages, sendMessage } = useChat(ydoc, user, roomKey, isOpen)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  function handleSend() {
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 w-80 max-h-[60vh] flex flex-col bg-mantle border border-surface-0 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">💬</span>
          <span className="text-sm font-bold text-text">Room Chat</span>
        </div>
        <button
          onClick={onClose}
          className="text-overlay hover:text-text text-lg leading-none px-1"
          title="Close chat"
        >
          ×
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-overlay text-xs py-8">No messages yet — say hi.</div>
        ) : (
          messages.map(m => {
            const mine = m.userId === user?.id
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 text-[10px] text-overlay mb-0.5">
                  <span className="font-semibold" style={{ color: m.userColor || '#a78bfa' }}>
                    {mine ? 'you' : m.userName}
                  </span>
                  <span>{formatTime(m.timestamp)}</span>
                </div>
                <div
                  className={`text-xs px-2.5 py-1.5 rounded-lg max-w-[85%] break-words ${
                    mine ? 'bg-accent text-base' : 'bg-surface-0 text-text'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex items-center gap-1 px-2 py-2 border-t border-surface-0">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder={user ? 'Message the room…' : 'Join a room to chat'}
          disabled={!user || !ydoc}
          className="flex-1 bg-surface-0 border border-surface-1 rounded-md px-2 py-1 text-xs text-text outline-none focus:border-accent/60 disabled:opacity-50"
          maxLength={2000}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || !user || !ydoc}
          className="px-2.5 py-1 text-xs font-bold rounded-md bg-accent text-base hover:bg-sapphire disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  )
}
