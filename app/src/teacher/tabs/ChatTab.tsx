/**
 * Classroom chat tab. Owns its own polling + send lifecycle so the parent
 * doesn't have to. Cursor is tracked in a ref so the polling effect stays
 * subscribed across renders (Purple Team A1).
 */

import { useEffect, useRef, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { fetchChat, sendChat } from '../api'
import type { ChatMessage } from '../api'
import { formatAge } from '../formatAge'
import { Avatar } from '../Avatar'

interface ChatTabProps {
  classroomId: string
  /** True when this tab is the visible one — gates the polling interval. */
  active: boolean
}

export default function ChatTab({ classroomId, active }: ChatTabProps) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastCursorRef = useRef(0)

  // Initial load — runs once per classroom.
  useEffect(() => {
    fetchChat(classroomId).then((msgs) => {
      setMessages(msgs)
      lastCursorRef.current = msgs.length > 0 ? Number(msgs[msgs.length - 1].createdAt) : 0
    })
  }, [classroomId])

  // Polling — stable subscription, cancels on tab switch / unmount.
  useEffect(() => {
    if (!active) return
    const ctrl = new AbortController()
    const poll = async () => {
      try {
        const newMsgs = await fetchChat(classroomId, lastCursorRef.current, ctrl.signal)
        if (ctrl.signal.aborted || newMsgs.length === 0) return
        lastCursorRef.current = Number(newMsgs[newMsgs.length - 1].createdAt)
        setMessages((prev) => mergeUnique(prev, newMsgs))
      } catch { /* aborted or network blip */ }
    }
    const id = setInterval(poll, 3000)
    return () => {
      ctrl.abort()
      clearInterval(id)
    }
  }, [active, classroomId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatInput('')
    await sendChat(classroomId, msg, getToken)
    const newMsgs = await fetchChat(classroomId, lastCursorRef.current)
    if (newMsgs.length > 0) {
      lastCursorRef.current = Number(newMsgs[newMsgs.length - 1].createdAt)
      setMessages((prev) => mergeUnique(prev, newMsgs))
    }
  }

  // When the poll and a manual send race, both can fetch the same tail.
  // Dedup by message id so the user never sees their own message twice.
  function mergeUnique(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const seen = new Set(prev.map((m) => m.id))
    const fresh = incoming.filter((m) => !seen.has(m.id))
    return fresh.length === 0 ? prev : [...prev, ...fresh]
  }

  return (
    <div className="flex flex-col h-[50vh]">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-[#6c7086] italic text-center py-8">No messages yet. Say hi!</p>
        )}
        {messages.map((m) => {
          const isMe = m.authorId === user?.id
          return (
            <div key={m.id} className={`flex gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar name={m.authorName} src={m.authorAvatar} size="md" variant="muted" className="mt-0.5 shrink-0" />
              <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMe ? 'bg-[#89b4fa]/20' : 'bg-[#1e1e2e]'}`}>
                {!isMe && <div className="text-[10px] font-semibold text-[#89b4fa] mb-0.5">{m.authorName}</div>}
                <p className="text-sm text-[#cdd6f4]">{m.body}</p>
                <div className="text-[9px] text-[#6c7086] mt-0.5 text-right">{formatAge(m.createdAt)}</div>
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="px-6 py-3 border-t border-[#313244] flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa]"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="px-4 py-2 text-sm font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg">
          Send
        </button>
      </div>
    </div>
  )
}
