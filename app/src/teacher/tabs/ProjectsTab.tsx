/**
 * Projects tab — student-shared projects for this classroom, plus
 * "Upload from Editor" action that publishes the current local workspace
 * as a classroom project.
 */

import { useAuth, useUser } from '@clerk/clerk-react'
import type { ClassroomDetail } from '../api'
import { showToast } from '../../components/Toast'

interface ProjectsTabProps {
  classroom: ClassroomDetail
}

export default function ProjectsTab({ classroom }: ProjectsTabProps) {
  const { getToken } = useAuth()
  const { user } = useUser()

  const handleUpload = async () => {
    const ws = localStorage.getItem('cryptoblocks_workspace')
    if (!ws || ws === '{}') {
      showToast('Build something in the editor first!', 'info')
      return
    }
    const name = prompt('Project name:')
    if (!name) return
    try {
      const token = await getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          authorName: user?.fullName || user?.username || 'Student',
          description: `Shared in classroom: ${classroom.name}`,
          category: 'General',
          workspaceJson: ws,
          tags: ['classroom'],
          blockCount: (() => {
            try { return JSON.parse(ws)?.blocks?.blocks?.length ?? 0 } catch { return 0 }
          })(),
        }),
      })
      if (res.ok) showToast('Project uploaded!', 'success')
    } catch {
      showToast('Upload failed — try again.', 'error')
    }
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">Student Projects</h3>
        <button
          onClick={handleUpload}
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
  )
}
