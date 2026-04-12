/**
 * ClassroomDetail — tabbed view for a selected classroom.
 * Tabs: Overview, Discussions, Chat, Assignments, Projects
 */

import { useState, useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import type {
  ClassroomDetail as ClassroomDetailType,
  Assignment, Submission, Discussion, Reply, ChatMessage,
} from './api'
import {
  fetchAssignments, createAssignment, submitAssignment, fetchSubmissions, sendFeedback,
  fetchDiscussions, createDiscussion, fetchReplies, postReply,
  fetchChat, sendChat, updateDescription,
} from './api'

type Tab = 'overview' | 'students' | 'discussions' | 'chat' | 'assignments' | 'projects'

interface ClassroomDetailProps {
  classroom: ClassroomDetailType
  onClose: () => void
}

function formatAge(ts: number): string {
  const ms = Date.now() - Number(ts)
  if (ms < 60_000) return 'just now'
  const min = Math.floor(ms / 60_000)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

export default function ClassroomDetail({ classroom, onClose }: ClassroomDetailProps) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>('overview')

  // Description
  const [desc, setDesc] = useState(String(classroom.description || ''))
  const [editingDesc, setEditingDesc] = useState(false)
  const isTeacher = user?.id === classroom.teacherId

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAssignDesc, setNewAssignDesc] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  // Discussions
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [discTitle, setDiscTitle] = useState('')
  const [discBody, setDiscBody] = useState('')
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyText, setReplyText] = useState('')

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchAssignments(classroom.id).then(setAssignments)
    fetchDiscussions(classroom.id).then(setDiscussions)
    fetchChat(classroom.id).then(setMessages)
  }, [classroom.id])

  // Chat polling
  useEffect(() => {
    if (tab !== 'chat') return
    const poll = () => {
      const last = messages.length > 0 ? Number(messages[messages.length - 1].createdAt) : 0
      fetchChat(classroom.id, last).then((newMsgs) => {
        if (newMsgs.length > 0) setMessages((prev) => [...prev, ...newMsgs])
      })
    }
    pollRef.current = setInterval(poll, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [tab, classroom.id, messages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatInput('')
    await sendChat(classroom.id, msg, getToken)
    const latest = messages.length > 0 ? Number(messages[messages.length - 1].createdAt) : 0
    const newMsgs = await fetchChat(classroom.id, latest)
    if (newMsgs.length > 0) setMessages((prev) => [...prev, ...newMsgs])
  }

  const handleSelectAssignment = async (a: Assignment) => {
    setSelectedAssignment(a)
    const subs = await fetchSubmissions(classroom.id, a.id)
    setSubmissions(subs)
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
        tab === t ? 'bg-[#89b4fa] text-[#1e1e2e]' : 'text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="bg-[#181825] border border-[#313244] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#313244] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#cdd6f4]">{classroom.name}</h2>
          <div className="text-sm text-[#6c7086] mt-0.5">
            Join code: <span className="font-mono text-[#89b4fa] tracking-wider">{classroom.joinCode}</span>
            <span className="ml-3">{classroom.members.length} members</span>
          </div>
        </div>
        <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4] p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b border-[#313244] flex gap-2 bg-[#1e1e2e]">
        {tabBtn('overview', 'Overview')}
        {tabBtn('students', `Students (${classroom.members.filter(m => m.role === 'student').length})`)}
        {tabBtn('discussions', `Discussions (${discussions.length})`)}
        {tabBtn('chat', 'Chat')}
        {tabBtn('assignments', `Assignments (${assignments.length})`)}
        {tabBtn('projects', `Projects (${classroom.projects.length})`)}
      </div>

      {/* Tab content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {/* === Overview === */}
        {tab === 'overview' && (
          <div className="px-6 py-4 flex flex-col gap-4">
            {/* Class-wide stats */}
            {isTeacher && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-[#89b4fa]">{classroom.members.filter(m => m.role === 'student').length}</div>
                  <div className="text-[10px] text-[#6c7086]">Students</div>
                </div>
                <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-[#a6e3a1]">{assignments.length}</div>
                  <div className="text-[10px] text-[#6c7086]">Assignments</div>
                </div>
                <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-[#f9e2af]">{classroom.projects.length}</div>
                  <div className="text-[10px] text-[#6c7086]">Projects Shared</div>
                </div>
                <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-[#cba6f7]">{discussions.length}</div>
                  <div className="text-[10px] text-[#6c7086]">Discussions</div>
                </div>
              </div>
            )}

            {/* Course description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">Course Description</h3>
                <div className="flex gap-2">
                  {isTeacher && !editingDesc && (
                    <button onClick={() => setEditingDesc(true)} className="text-xs text-[#89b4fa]">Edit</button>
                  )}
                  {isTeacher && (
                    <a
                      href={`/api/classrooms/${classroom.id}/export`}
                      download
                      className="text-xs text-[#a6e3a1] hover:text-[#a6e3a1]/80"
                    >
                      Export All Data (JSON)
                    </a>
                  )}
                </div>
              </div>
              {editingDesc ? (
                <div>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#89b4fa] resize-none mb-2"
                    placeholder="Describe your course — objectives, schedule, expectations..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingDesc(false)} className="px-3 py-1 text-xs text-[#6c7086]">Cancel</button>
                    <button
                      onClick={async () => {
                        await updateDescription(classroom.id, desc, getToken)
                        setEditingDesc(false)
                      }}
                      className="px-3 py-1 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#a6adc8] whitespace-pre-wrap">
                  {desc || 'No course description yet.'}
                </p>
              )}
            </div>

            {/* Members */}
            <div>
              <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">Members</h3>
              <div className="flex flex-wrap gap-2">
                {classroom.members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-2 bg-[#1e1e2e] rounded-lg px-3 py-2">
                    {m.userAvatar ? (
                      <img src={m.userAvatar} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#89b4fa] flex items-center justify-center text-[10px] font-bold text-[#1e1e2e]">
                        {m.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-[#cdd6f4]">{m.userName}</span>
                    {m.role === 'teacher' && (
                      <span className="text-[10px] text-[#f9e2af] bg-[#f9e2af]/10 px-1.5 py-0.5 rounded font-semibold">Teacher</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Students (teacher view) === */}
        {tab === 'students' && (
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Student Progress</h3>
            {classroom.members.filter(m => m.role === 'student').length === 0 ? (
              <p className="text-sm text-[#6c7086] italic">No students have joined yet. Share the join code: <span className="font-mono text-[#89b4fa]">{classroom.joinCode}</span></p>
            ) : (
              <div className="flex flex-col gap-3">
                {classroom.members.filter(m => m.role === 'student').map((student) => {
                  const studentProjects = classroom.projects.filter(p => p.authorId === student.userId)
                  const totalBlocks = studentProjects.reduce((sum, p) => sum + Number(p.blockCount), 0)
                  const totalLikes = studentProjects.reduce((sum, p) => sum + Number(p.likes), 0)

                  return (
                    <div key={student.userId} className="bg-[#1e1e2e] rounded-xl p-4 border border-[#313244]">
                      <div className="flex items-center gap-3 mb-3">
                        {student.userAvatar ? (
                          <img src={student.userAvatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#89b4fa] flex items-center justify-center text-sm font-bold text-[#1e1e2e]">
                            {student.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-[#cdd6f4]">{student.userName}</div>
                          <div className="text-[10px] text-[#6c7086]">
                            Joined {new Date(Number(student.joinedAt)).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#181825] rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-[#89b4fa]">{studentProjects.length}</div>
                          <div className="text-[9px] text-[#6c7086]">Projects</div>
                        </div>
                        <div className="bg-[#181825] rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-[#a6e3a1]">{totalBlocks}</div>
                          <div className="text-[9px] text-[#6c7086]">Total Blocks</div>
                        </div>
                        <div className="bg-[#181825] rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-[#f38ba8]">{totalLikes}</div>
                          <div className="text-[9px] text-[#6c7086]">Likes Earned</div>
                        </div>
                      </div>

                      {studentProjects.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[10px] text-[#6c7086] uppercase tracking-wider mb-1">Recent Projects</div>
                          {studentProjects.slice(0, 3).map(p => (
                            <div key={p.id} className="text-xs text-[#a6adc8] py-0.5">
                              {p.name} <span className="text-[#6c7086]">· {p.category} · {p.blockCount} blocks</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* === Discussions === */}
        {tab === 'discussions' && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">Discussions</h3>
              <button onClick={() => setShowNewDiscussion(true)} className="text-xs text-[#89b4fa] font-semibold">+ New Post</button>
            </div>

            {showNewDiscussion && (
              <div className="bg-[#1e1e2e] rounded-lg p-4 mb-3 border border-[#313244]">
                <input
                  type="text" value={discTitle} onChange={(e) => setDiscTitle(e.target.value)}
                  placeholder="Discussion title"
                  className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-2"
                  autoFocus
                />
                <textarea
                  value={discBody} onChange={(e) => setDiscBody(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-2 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNewDiscussion(false)} className="px-3 py-1.5 text-xs text-[#6c7086]">Cancel</button>
                  <button
                    onClick={async () => {
                      if (!discTitle.trim() || !discBody.trim()) return
                      await createDiscussion(classroom.id, discTitle.trim(), discBody.trim(), getToken)
                      setDiscTitle(''); setDiscBody(''); setShowNewDiscussion(false)
                      const d = await fetchDiscussions(classroom.id); setDiscussions(d)
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {selectedDiscussion ? (
              <div>
                <button onClick={() => { setSelectedDiscussion(null); setReplies([]) }} className="text-xs text-[#89b4fa] mb-3">← Back to discussions</button>
                <div className="bg-[#1e1e2e] rounded-lg p-4 border border-[#313244] mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedDiscussion.authorAvatar ? (
                      <img src={selectedDiscussion.authorAvatar} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#89b4fa] flex items-center justify-center text-[10px] font-bold text-[#1e1e2e]">
                        {selectedDiscussion.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-[#cdd6f4]">{selectedDiscussion.authorName}</span>
                    <span className="text-[10px] text-[#6c7086]">{formatAge(selectedDiscussion.createdAt)}</span>
                  </div>
                  <h4 className="text-base font-bold text-[#cdd6f4] mb-1">{selectedDiscussion.title}</h4>
                  <p className="text-sm text-[#a6adc8] whitespace-pre-wrap">{selectedDiscussion.body}</p>
                </div>

                {replies.map((r) => (
                  <div key={r.id} className="flex gap-2 mb-2 ml-4">
                    {r.authorAvatar ? (
                      <img src={r.authorAvatar} alt="" className="w-5 h-5 rounded-full mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#313244] flex items-center justify-center text-[9px] font-bold text-[#89b4fa] mt-0.5 shrink-0">
                        {r.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="bg-[#1e1e2e] rounded-lg px-3 py-2 flex-1">
                      <span className="text-xs font-semibold text-[#cdd6f4]">{r.authorName}</span>
                      <span className="text-[10px] text-[#6c7086] ml-2">{formatAge(r.createdAt)}</span>
                      <p className="text-sm text-[#a6adc8] mt-0.5">{r.body}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 mt-3 ml-4">
                  <input
                    type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa]"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && replyText.trim()) {
                        await postReply(classroom.id, selectedDiscussion.id, replyText.trim(), getToken)
                        setReplyText('')
                        const r = await fetchReplies(classroom.id, selectedDiscussion.id); setReplies(r)
                      }
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (!replyText.trim()) return
                      await postReply(classroom.id, selectedDiscussion.id, replyText.trim(), getToken)
                      setReplyText('')
                      const r = await fetchReplies(classroom.id, selectedDiscussion.id); setReplies(r)
                    }}
                    className="px-3 py-2 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ) : (
              discussions.length === 0 ? (
                <p className="text-sm text-[#6c7086] italic">No discussions yet. Start one!</p>
              ) : (
                discussions.map((d) => (
                  <button
                    key={d.id}
                    onClick={async () => {
                      setSelectedDiscussion(d)
                      const r = await fetchReplies(classroom.id, d.id); setReplies(r)
                    }}
                    className="w-full text-left bg-[#1e1e2e] rounded-lg px-4 py-3 mb-2 border border-[#313244] hover:border-[#45475a] transition-colors"
                  >
                    <div className="text-sm font-semibold text-[#cdd6f4]">{d.title}</div>
                    <div className="text-xs text-[#6c7086] mt-0.5">
                      {d.authorName} · {d.replyCount} replies · {formatAge(d.createdAt)}
                    </div>
                  </button>
                ))
              )
            )}
          </div>
        )}

        {/* === Chat === */}
        {tab === 'chat' && (
          <div className="flex flex-col h-[50vh]">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 && (
                <p className="text-sm text-[#6c7086] italic text-center py-8">No messages yet. Say hi!</p>
              )}
              {messages.map((m) => {
                const isMe = m.authorId === user?.id
                return (
                  <div key={m.id} className={`flex gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {m.authorAvatar ? (
                      <img src={m.authorAvatar} alt="" className="w-6 h-6 rounded-full mt-0.5 shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#313244] flex items-center justify-center text-[10px] font-bold text-[#89b4fa] mt-0.5 shrink-0">
                        {m.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
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
                type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa]"
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button onClick={handleSendChat} className="px-4 py-2 text-sm font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg">
                Send
              </button>
            </div>
          </div>
        )}

        {/* === Assignments === */}
        {tab === 'assignments' && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">Assignments</h3>
              {isTeacher && <button onClick={() => setShowCreateAssignment(true)} className="text-xs text-[#89b4fa] font-semibold">+ New Assignment</button>}
            </div>

            {showCreateAssignment && (
              <div className="bg-[#1e1e2e] rounded-lg p-4 mb-3 border border-[#313244]">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Assignment title" autoFocus
                  className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-2"
                />
                <textarea value={newAssignDesc} onChange={(e) => setNewAssignDesc(e.target.value)}
                  placeholder="Instructions" rows={2}
                  className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-2 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowCreateAssignment(false)} className="px-3 py-1.5 text-xs text-[#6c7086]">Cancel</button>
                  <button
                    onClick={async () => {
                      if (!newTitle.trim()) return
                      await createAssignment(classroom.id, newTitle.trim(), newAssignDesc.trim(), null, getToken)
                      setNewTitle(''); setNewAssignDesc(''); setShowCreateAssignment(false)
                      const a = await fetchAssignments(classroom.id); setAssignments(a)
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {assignments.map((a) => (
              <button
                key={a.id}
                onClick={() => handleSelectAssignment(a)}
                className={`w-full text-left bg-[#1e1e2e] rounded-lg px-4 py-3 mb-2 border transition-colors ${
                  selectedAssignment?.id === a.id ? 'border-[#89b4fa]' : 'border-[#313244] hover:border-[#45475a]'
                }`}
              >
                <div className="text-sm font-semibold text-[#cdd6f4]">{a.title}</div>
                <div className="text-xs text-[#6c7086] mt-0.5">{a.submissionCount} submissions</div>
              </button>
            ))}

            {selectedAssignment && (
              <div className="mt-3 bg-[#11111b] rounded-lg p-4 border border-[#313244]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold text-[#cdd6f4]">{selectedAssignment.title}</div>
                    {selectedAssignment.description && <p className="text-xs text-[#a6adc8] mt-1">{selectedAssignment.description}</p>}
                  </div>
                  <button
                    onClick={async () => {
                      const ws = localStorage.getItem('cryptoblocks_workspace') || '{}'
                      let bc = 0; try { bc = JSON.parse(ws)?.blocks?.blocks?.length ?? 0 } catch {}
                      await submitAssignment(classroom.id, selectedAssignment.id, ws, bc, getToken)
                      const s = await fetchSubmissions(classroom.id, selectedAssignment.id); setSubmissions(s)
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-[#1e1e2e] bg-[#a6e3a1] rounded-lg shrink-0"
                  >
                    Submit My Work
                  </button>
                </div>
                {submissions.map((s) => (
                  <div key={s.id} className="bg-[#1e1e2e] rounded-lg px-3 py-2.5 mb-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-[#cdd6f4] font-medium">{s.studentName}</span>
                        <span className="text-xs text-[#6c7086] ml-2">{s.blockCount} blocks</span>
                        <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded font-semibold ${s.status === 'reviewed' ? 'bg-[#a6e3a1]/10 text-[#a6e3a1]' : 'bg-[#f9e2af]/10 text-[#f9e2af]'}`}>{s.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`/api/classrooms/${classroom.id}/submissions/${s.id}/download`} className="text-xs text-[#89b4fa]" download>Download</a>
                        {isTeacher && <button onClick={() => { setFeedbackId(s.id); setFeedbackText(s.feedback || '') }} className="text-xs text-[#cba6f7]">Feedback</button>}
                      </div>
                    </div>
                    {s.feedback && <div className="mt-1 text-xs text-[#a6adc8] bg-[#181825] rounded px-2 py-1">💬 {s.feedback}</div>}
                    {feedbackId === s.id && (
                      <div className="mt-2 flex gap-2">
                        <input type="text" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Write feedback..." autoFocus
                          className="flex-1 bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#89b4fa]"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              await sendFeedback(classroom.id, selectedAssignment.id, s.id, feedbackText.trim(), 'reviewed', getToken)
                              setFeedbackId(null)
                              const subs = await fetchSubmissions(classroom.id, selectedAssignment.id); setSubmissions(subs)
                            }
                          }}
                        />
                        <button onClick={async () => {
                          await sendFeedback(classroom.id, selectedAssignment.id, s.id, feedbackText.trim(), 'reviewed', getToken)
                          setFeedbackId(null)
                          const subs = await fetchSubmissions(classroom.id, selectedAssignment.id); setSubmissions(subs)
                        }} className="px-2 py-1.5 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded">Send</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === Projects === */}
        {tab === 'projects' && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">Student Projects</h3>
              <button
                onClick={async () => {
                  const ws = localStorage.getItem('cryptoblocks_workspace')
                  if (!ws || ws === '{}') {
                    alert('Build something in the editor first, then come back to upload.')
                    return
                  }
                  const name = prompt('Project name:')
                  if (!name) return
                  try {
                    const token = await getToken()
                    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
                    if (token) headers['Authorization'] = `Bearer ${token}`
                    const res = await fetch('/api/projects', {
                      method: 'POST', headers,
                      body: JSON.stringify({
                        name,
                        authorName: user?.fullName || user?.username || 'Student',
                        description: `Shared in classroom: ${classroom.name}`,
                        category: 'General',
                        workspaceJson: ws,
                        tags: ['classroom'],
                        blockCount: (() => { try { return JSON.parse(ws)?.blocks?.blocks?.length ?? 0 } catch { return 0 } })(),
                      }),
                    })
                    if (res.ok) alert('Project uploaded! Refresh to see it.')
                  } catch { alert('Upload failed — try again.') }
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#1e1e2e] bg-[#a6e3a1] hover:bg-[#a6e3a1]/80 rounded-lg"
              >
                Upload from Editor
              </button>
            </div>
            {classroom.projects.length === 0 ? (
              <p className="text-sm text-[#6c7086] italic">No projects shared yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classroom.projects.map((p) => (
                  <div key={p.id} className="bg-[#1e1e2e] rounded-lg px-4 py-3">
                    <div className="text-sm font-semibold text-[#cdd6f4]">{p.name}</div>
                    <div className="text-xs text-[#6c7086] mt-0.5">
                      by {p.authorName} · {p.category} · {p.blockCount} blocks
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
