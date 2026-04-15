/**
 * ClassroomDetail — tabbed view for a selected classroom.
 *
 * Thin shell: header + tab bar + tab content switch. Each tab owns its
 * own state and data fetching. The parent keeps the assignment and
 * discussion *lists* only to show counts on the tab bar; each tab calls
 * onRefresh after a mutation so those counts stay in sync.
 */

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import type { ClassroomDetail as ClassroomDetailType, Assignment, Discussion } from './api'
import { fetchAssignments, fetchDiscussions } from './api'
import ChatTab from './tabs/ChatTab'
import OverviewTab from './tabs/OverviewTab'
import StudentsTab from './tabs/StudentsTab'
import DiscussionsTab from './tabs/DiscussionsTab'
import AssignmentsTab from './tabs/AssignmentsTab'
import ProjectsTab from './tabs/ProjectsTab'

type Tab = 'overview' | 'students' | 'discussions' | 'chat' | 'assignments' | 'projects'

interface ClassroomDetailProps {
  classroom: ClassroomDetailType
  onClose: () => void
}

export default function ClassroomDetail({ classroom, onClose }: ClassroomDetailProps) {
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>('overview')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])

  const isTeacher = user?.id === classroom.teacherId
  const studentCount = classroom.members.filter((m) => m.role === 'student').length

  const refreshAssignments = () => { fetchAssignments(classroom.id).then(setAssignments) }
  const refreshDiscussions = () => { fetchDiscussions(classroom.id).then(setDiscussions) }

  useEffect(() => {
    refreshAssignments()
    refreshDiscussions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom.id])

  return (
    <div className="bg-[#181825] border border-[#313244] rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-[#313244] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#cdd6f4]">{classroom.name}</h2>
          <div className="text-sm text-[#6c7086] mt-0.5">
            Join code: <span className="font-mono text-[#89b4fa] tracking-wider">{classroom.joinCode}</span>
            <span className="ml-3">{classroom.members.length} members</span>
          </div>
        </div>
        <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4] p-1" aria-label="Close">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-6 py-2 border-b border-[#313244] flex gap-2 bg-[#1e1e2e]">
        <TabButton tab="overview" current={tab} onClick={setTab}>Overview</TabButton>
        <TabButton tab="students" current={tab} onClick={setTab}>Students ({studentCount})</TabButton>
        <TabButton tab="discussions" current={tab} onClick={setTab}>Discussions ({discussions.length})</TabButton>
        <TabButton tab="chat" current={tab} onClick={setTab}>Chat</TabButton>
        <TabButton tab="assignments" current={tab} onClick={setTab}>Assignments ({assignments.length})</TabButton>
        <TabButton tab="projects" current={tab} onClick={setTab}>Projects ({classroom.projects.length})</TabButton>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {tab === 'overview' && (
          <OverviewTab
            classroom={classroom}
            isTeacher={isTeacher}
            assignmentCount={assignments.length}
            discussionCount={discussions.length}
          />
        )}
        {tab === 'students' && <StudentsTab classroom={classroom} />}
        {tab === 'discussions' && (
          <DiscussionsTab classroomId={classroom.id} discussions={discussions} onRefresh={refreshDiscussions} />
        )}
        {tab === 'chat' && <ChatTab classroomId={classroom.id} active={tab === 'chat'} />}
        {tab === 'assignments' && (
          <AssignmentsTab
            classroomId={classroom.id}
            assignments={assignments}
            isTeacher={isTeacher}
            onRefresh={refreshAssignments}
          />
        )}
        {tab === 'projects' && <ProjectsTab classroom={classroom} />}
      </div>
    </div>
  )
}

interface TabButtonProps {
  tab: Tab
  current: Tab
  onClick: (t: Tab) => void
  children: React.ReactNode
}

function TabButton({ tab, current, onClick, children }: TabButtonProps) {
  const active = tab === current
  return (
    <button
      onClick={() => onClick(tab)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
        active ? 'bg-[#89b4fa] text-[#1e1e2e]' : 'text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]'
      }`}
    >
      {children}
    </button>
  )
}
