/**
 * Overview tab — class-wide stats (teacher only), course description
 * (editable by teacher), and member list.
 */

import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import type { ClassroomDetail } from '../api'
import { updateDescription } from '../api'
import { Md } from '../Md'
import { Avatar } from '../Avatar'

interface OverviewTabProps {
  classroom: ClassroomDetail
  isTeacher: boolean
  assignmentCount: number
  discussionCount: number
}

export default function OverviewTab({ classroom, isTeacher, assignmentCount, discussionCount }: OverviewTabProps) {
  const { getToken } = useAuth()
  const [desc, setDesc] = useState(String(classroom.description || ''))
  const [editing, setEditing] = useState(false)

  const studentCount = classroom.members.filter((m) => m.role === 'student').length

  return (
    <div className="px-6 py-4 flex flex-col gap-4">
      {isTeacher && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox value={studentCount} label="Students" color="#89b4fa" />
          <StatBox value={assignmentCount} label="Assignments" color="#a6e3a1" />
          <StatBox value={classroom.projects.length} label="Projects Shared" color="#f9e2af" />
          <StatBox value={discussionCount} label="Discussions" color="#cba6f7" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">Course Description</h3>
          <div className="flex gap-2">
            {isTeacher && !editing && (
              <button onClick={() => setEditing(true)} className="text-xs text-[#89b4fa]">Edit</button>
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
        {editing ? (
          <div>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#89b4fa] resize-none mb-2"
              placeholder="Describe your course — objectives, schedule, expectations..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs text-[#6c7086]">Cancel</button>
              <button
                onClick={async () => {
                  await updateDescription(classroom.id, desc, getToken)
                  setEditing(false)
                }}
                className="px-3 py-1 text-xs font-bold text-[#1e1e2e] bg-[#89b4fa] rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        ) : desc ? (
          <Md>{desc}</Md>
        ) : (
          <p className="text-sm text-[#6c7086] italic">No course description yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">Members</h3>
        <div className="flex flex-wrap gap-2">
          {classroom.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-2 bg-[#1e1e2e] rounded-lg px-3 py-2">
              <Avatar name={m.userName} src={m.userAvatar} size="md" />
              <span className="text-sm text-[#cdd6f4]">{m.userName}</span>
              {m.role === 'teacher' && (
                <span className="text-[10px] text-[#f9e2af] bg-[#f9e2af]/10 px-1.5 py-0.5 rounded font-semibold">Teacher</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-[#6c7086]">{label}</div>
    </div>
  )
}
