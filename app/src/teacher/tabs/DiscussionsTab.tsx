/**
 * Discussions tab — list + thread view for classroom discussions.
 * Owns its own state for draft post, selected thread, and replies.
 * Parent owns the discussion list itself (for tab count badge) and passes
 * it + a refresh callback down.
 */

import { useState } from 'react'
import { useAuth } from '../../auth'
import type { Discussion, Reply } from '../api'
import { createDiscussion, fetchReplies, postReply } from '../api'
import { Md } from '../Md'
import { formatAge } from '../formatAge'
import { Avatar } from '../Avatar'

interface DiscussionsTabProps {
  classroomId: string
  discussions: Discussion[]
  onRefresh: () => void
}

export default function DiscussionsTab({ classroomId, discussions, onRefresh }: DiscussionsTabProps) {
  const { getToken } = useAuth()
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selected, setSelected] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyText, setReplyText] = useState('')

  const openThread = async (d: Discussion) => {
    setSelected(d)
    setReplies(await fetchReplies(classroomId, d.id))
  }

  const createPost = async () => {
    if (!title.trim() || !body.trim()) return
    await createDiscussion(classroomId, title.trim(), body.trim(), getToken)
    setTitle(''); setBody(''); setShowNew(false)
    onRefresh()
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return
    await postReply(classroomId, selected.id, replyText.trim(), getToken)
    setReplyText('')
    setReplies(await fetchReplies(classroomId, selected.id))
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider">Discussions</h3>
        <button onClick={() => setShowNew(true)} className="text-xs text-accent font-semibold">+ New Post</button>
      </div>

      {showNew && (
        <div className="bg-base rounded-lg p-4 mb-3 border border-surface-0">
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Discussion title" autoFocus
            className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 placeholder-overlay focus:outline-none focus:border-accent mb-2"
          />
          <textarea
            value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?" rows={3}
            className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 placeholder-overlay focus:outline-none focus:border-accent mb-2 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-xs text-overlay">Cancel</button>
            <button onClick={createPost} className="px-3 py-1.5 text-xs font-bold text-base bg-accent rounded-lg">Post</button>
          </div>
        </div>
      )}

      {selected ? (
        <div>
          <button
            onClick={() => { setSelected(null); setReplies([]) }}
            className="text-xs text-accent mb-3"
          >
            ← Back to discussions
          </button>
          <div className="bg-base rounded-lg p-4 border border-surface-0 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Avatar name={selected.authorName} src={selected.authorAvatar} size="md" />
              <span className="text-sm font-semibold text-text">{selected.authorName}</span>
              <span className="text-[10px] text-overlay">{formatAge(selected.createdAt)}</span>
            </div>
            <h4 className="text-base font-bold text-text mb-1">{selected.title}</h4>
            <Md>{selected.body}</Md>
          </div>

          {replies.map((r) => (
            <div key={r.id} className="flex gap-2 mb-2 ml-4">
              <Avatar name={r.authorName} src={r.authorAvatar} size="sm" variant="muted" className="mt-0.5 shrink-0" />
              <div className="bg-base rounded-lg px-3 py-2 flex-1">
                <span className="text-xs font-semibold text-text">{r.authorName}</span>
                <span className="text-[10px] text-overlay ml-2">{formatAge(r.createdAt)}</span>
                <div className="mt-0.5"><Md>{r.body}</Md></div>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-3 ml-4">
            <input
              type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 placeholder-overlay focus:outline-none focus:border-accent"
              onKeyDown={(e) => { if (e.key === 'Enter') sendReply() }}
            />
            <button onClick={sendReply} className="px-3 py-2 text-xs font-bold text-base bg-accent rounded-lg">
              Reply
            </button>
          </div>
        </div>
      ) : discussions.length === 0 ? (
        <p className="text-sm text-overlay italic">No discussions yet. Start one!</p>
      ) : (
        discussions.map((d) => (
          <button
            key={d.id}
            onClick={() => openThread(d)}
            className="w-full text-left bg-base rounded-lg px-4 py-3 mb-2 border border-surface-0 hover:border-surface-1 transition-colors"
          >
            <div className="text-sm font-semibold text-text">{d.title}</div>
            <div className="text-xs text-overlay mt-0.5">
              {d.authorName} · {d.replyCount} replies · {formatAge(d.createdAt)}
            </div>
          </button>
        ))
      )}
    </div>
  )
}

