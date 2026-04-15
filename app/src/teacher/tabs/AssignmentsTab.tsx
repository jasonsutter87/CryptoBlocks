/**
 * Assignments tab — list, create (teacher), submit (student), and review
 * submissions with feedback (teacher).
 */

import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import type { Assignment, Submission } from '../api'
import { createAssignment, submitAssignment, fetchSubmissions, sendFeedback } from '../api'
import { Md } from '../Md'

interface AssignmentsTabProps {
  classroomId: string
  assignments: Assignment[]
  isTeacher: boolean
  onRefresh: () => void
}

export default function AssignmentsTab({ classroomId, assignments, isTeacher, onRefresh }: AssignmentsTabProps) {
  const { getToken } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const openAssignment = async (a: Assignment) => {
    setSelected(a)
    setSubmissions(await fetchSubmissions(classroomId, a.id))
  }

  const create = async () => {
    if (!title.trim()) return
    await createAssignment(classroomId, title.trim(), desc.trim(), null, getToken)
    setTitle(''); setDesc(''); setShowCreate(false)
    onRefresh()
  }

  const submitMyWork = async () => {
    if (!selected) return
    const ws = localStorage.getItem('cryptoblocks_workspace') || '{}'
    let bc = 0
    try { bc = JSON.parse(ws)?.blocks?.blocks?.length ?? 0 } catch { /* empty */ }
    await submitAssignment(classroomId, selected.id, ws, bc, getToken)
    setSubmissions(await fetchSubmissions(classroomId, selected.id))
  }

  const saveFeedback = async (submissionId: string) => {
    if (!selected) return
    await sendFeedback(classroomId, selected.id, submissionId, feedbackText.trim(), 'reviewed', getToken)
    setFeedbackId(null)
    setSubmissions(await fetchSubmissions(classroomId, selected.id))
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">Assignments</h3>
        {isTeacher && (
          <button onClick={() => setShowCreate(true)} className="text-xs text-[#89b4fa] font-semibold">
            + New Assignment
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-[#1e1e2e] rounded-lg p-4 mb-3 border border-[#313244]">
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title" autoFocus
            className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-2"
          />
          <textarea
            value={desc} onChange={(e) => setDesc(e.target.value)}
            placeholder="Instructions" rows={2}
            className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-2 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-[#6c7086]">Cancel</button>
            <button onClick={create} className="px-3 py-1.5 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg">Create</button>
          </div>
        </div>
      )}

      {assignments.map((a) => (
        <button
          key={a.id}
          onClick={() => openAssignment(a)}
          className={`w-full text-left bg-[#1e1e2e] rounded-lg px-4 py-3 mb-2 border transition-colors ${
            selected?.id === a.id ? 'border-[#89b4fa]' : 'border-[#313244] hover:border-[#45475a]'
          }`}
        >
          <div className="text-sm font-semibold text-[#cdd6f4]">{a.title}</div>
          <div className="text-xs text-[#6c7086] mt-0.5">{a.submissionCount} submissions</div>
        </button>
      ))}

      {selected && (
        <div className="mt-3 bg-[#11111b] rounded-lg p-4 border border-[#313244]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-[#cdd6f4]">{selected.title}</div>
              {selected.description && <div className="mt-1"><Md>{selected.description}</Md></div>}
            </div>
            <button
              onClick={submitMyWork}
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
                  <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded font-semibold ${s.status === 'reviewed' ? 'bg-[#a6e3a1]/10 text-[#a6e3a1]' : 'bg-[#f9e2af]/10 text-[#f9e2af]'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/classrooms/${classroomId}/submissions/${s.id}/download`}
                    className="text-xs text-[#89b4fa]"
                    download
                  >
                    Download
                  </a>
                  {isTeacher && (
                    <button
                      onClick={() => { setFeedbackId(s.id); setFeedbackText(s.feedback || '') }}
                      className="text-xs text-[#cba6f7]"
                    >
                      Feedback
                    </button>
                  )}
                </div>
              </div>
              {s.feedback && (
                <div className="mt-1 text-xs text-[#a6adc8] bg-[#181825] rounded px-2 py-1">💬 {s.feedback}</div>
              )}
              {feedbackId === s.id && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Write feedback..." autoFocus
                    className="flex-1 bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#89b4fa]"
                    onKeyDown={(e) => { if (e.key === 'Enter') saveFeedback(s.id) }}
                  />
                  <button
                    onClick={() => saveFeedback(s.id)}
                    className="px-2 py-1.5 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
