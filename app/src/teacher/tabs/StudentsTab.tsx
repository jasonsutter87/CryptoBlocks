/**
 * Students tab — teacher view of roster + per-student project stats.
 * Pure read of classroom data; no mutations.
 */

import type { ClassroomDetail } from '../api'
import { Avatar } from '../Avatar'

interface StudentsTabProps {
  classroom: ClassroomDetail
}

export default function StudentsTab({ classroom }: StudentsTabProps) {
  const students = classroom.members.filter((m) => m.role === 'student')

  if (students.length === 0) {
    return (
      <div className="px-6 py-4">
        <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Student Progress</h3>
        <p className="text-sm text-overlay italic">
          No students have joined yet. Share the join code:{' '}
          <span className="font-mono text-accent">{classroom.joinCode}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Student Progress</h3>
      <div className="flex flex-col gap-3">
        {students.map((student) => {
          const studentProjects = classroom.projects.filter((p) => p.authorId === student.userId)
          const totalBlocks = studentProjects.reduce((sum, p) => sum + Number(p.blockCount), 0)
          const totalLikes = studentProjects.reduce((sum, p) => sum + Number(p.likes), 0)

          return (
            <div key={student.userId} className="bg-base rounded-xl p-4 border border-surface-0">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={student.userName} src={student.userAvatar} size="lg" />
                <div>
                  <div className="text-sm font-bold text-text">{student.userName}</div>
                  <div className="text-[10px] text-overlay">
                    Joined {new Date(Number(student.joinedAt)).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <StatCell value={studentProjects.length} label="Projects" color="#89b4fa" />
                <StatCell value={totalBlocks} label="Total Blocks" color="#a6e3a1" />
                <StatCell value={totalLikes} label="Likes Earned" color="#f38ba8" />
              </div>

              {studentProjects.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] text-overlay uppercase tracking-wider mb-1">Recent Projects</div>
                  {studentProjects.slice(0, 3).map((p) => (
                    <div key={p.id} className="text-xs text-subtext py-0.5">
                      {p.name} <span className="text-overlay">· {p.category} · {p.blockCount} blocks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCell({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-mantle rounded-lg p-2 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] text-overlay">{label}</div>
    </div>
  )
}
