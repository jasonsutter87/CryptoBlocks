/**
 * Classrooms API client for the Teacher Dashboard.
 */

const API = '/api/classrooms'

export interface Classroom {
  id: string
  name: string
  joinCode: string
  teacherId: string
  teacherName: string
  memberCount: number
  createdAt: number
}

export interface ClassMember {
  userId: string
  userName: string
  userAvatar: string
  role: 'teacher' | 'student'
  joinedAt: number
}

export interface StudentProject {
  id: string
  name: string
  authorId: string
  authorName: string
  category: string
  blockCount: number
  likes: number
  createdAt: number
}

export interface ClassroomDetail {
  id: string
  name: string
  description: string
  joinCode: string
  teacherId: string
  teacherName: string
  createdAt: number
  members: ClassMember[]
  projects: StudentProject[]
}

async function authHeaders(getToken: () => Promise<string | null>): Promise<Record<string, string>> {
  const token = await getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function fetchClassrooms(getToken: () => Promise<string | null>): Promise<Classroom[]> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(API, { headers })
    if (!res.ok) return []
    const data = await res.json()
    return data.classrooms ?? []
  } catch {
    return []
  }
}

export async function fetchClassroom(id: string): Promise<ClassroomDetail | null> {
  try {
    const res = await fetch(`${API}/${id}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function createClassroom(
  name: string,
  getToken: () => Promise<string | null>,
): Promise<{ id: string; joinCode: string } | null> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(API, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// -- Assignments --

export interface Assignment {
  id: string
  classroomId: string
  title: string
  description: string
  dueDate: number | null
  createdAt: number
  submissionCount: number
}

export interface Submission {
  id: string
  studentId: string
  studentName: string
  blockCount: number
  submittedAt: number
  feedback: string
  status: string
}

export async function fetchAssignments(classroomId: string): Promise<Assignment[]> {
  try {
    const res = await fetch(`${API}/${classroomId}/assignments`)
    if (!res.ok) return []
    const data = await res.json()
    return data.assignments ?? []
  } catch {
    return []
  }
}

export async function createAssignment(
  classroomId: string,
  title: string,
  description: string,
  dueDate: number | null,
  getToken: () => Promise<string | null>,
): Promise<{ id: string } | null> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/${classroomId}/assignments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, description, dueDate }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function submitAssignment(
  classroomId: string,
  assignmentId: string,
  workspaceJson: string,
  blockCount: number,
  getToken: () => Promise<string | null>,
): Promise<{ id: string } | null> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/${classroomId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ workspaceJson, blockCount }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchSubmissions(classroomId: string, assignmentId: string): Promise<Submission[]> {
  try {
    const res = await fetch(`${API}/${classroomId}/assignments/${assignmentId}/submissions`)
    if (!res.ok) return []
    const data = await res.json()
    return data.submissions ?? []
  } catch {
    return []
  }
}

export async function sendFeedback(
  classroomId: string,
  assignmentId: string,
  submissionId: string,
  feedback: string,
  status: string,
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/${classroomId}/assignments/${assignmentId}/feedback/${submissionId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ feedback, status }),
    })
    return res.ok
  } catch {
    return false
  }
}

// -- Discussions --

export interface Discussion {
  id: string
  title: string
  body: string
  authorName: string
  authorAvatar: string
  replyCount: number
  createdAt: number
}

export interface Reply {
  id: string
  body: string
  authorName: string
  authorAvatar: string
  createdAt: number
}

export async function fetchDiscussions(classroomId: string): Promise<Discussion[]> {
  try {
    const res = await fetch(`${API}/${classroomId}/discussions`)
    if (!res.ok) return []
    const data = await res.json()
    return data.discussions ?? []
  } catch { return [] }
}

export async function createDiscussion(
  classroomId: string, title: string, body: string,
  getToken: () => Promise<string | null>,
): Promise<{ id: string } | null> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/${classroomId}/discussions`, {
      method: 'POST', headers, body: JSON.stringify({ title, body }),
    })
    return res.ok ? await res.json() : null
  } catch { return null }
}

export async function fetchReplies(classroomId: string, discussionId: string): Promise<Reply[]> {
  try {
    const res = await fetch(`${API}/${classroomId}/discussions/${discussionId}/replies`)
    if (!res.ok) return []
    const data = await res.json()
    return data.replies ?? []
  } catch { return [] }
}

export async function postReply(
  classroomId: string, discussionId: string, body: string,
  getToken: () => Promise<string | null>,
): Promise<{ id: string } | null> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/${classroomId}/discussions/${discussionId}/reply`, {
      method: 'POST', headers, body: JSON.stringify({ body }),
    })
    return res.ok ? await res.json() : null
  } catch { return null }
}

// -- Chat --

export interface ChatMessage {
  id: string
  body: string
  authorName: string
  authorAvatar: string
  authorId: string
  createdAt: number
}

export async function fetchChat(
  classroomId: string, after?: number, signal?: AbortSignal,
): Promise<ChatMessage[]> {
  try {
    const params = after ? `?after=${after}` : ''
    const res = await fetch(`${API}/${classroomId}/chat${params}`, { signal })
    if (!res.ok) return []
    const data = await res.json()
    return data.messages ?? []
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') throw err
    return []
  }
}

export async function sendChat(
  classroomId: string, message: string,
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/${classroomId}/chat`, {
      method: 'POST', headers, body: JSON.stringify({ message }),
    })
    return res.ok
  } catch { return false }
}

// -- Description --

export async function updateDescription(
  classroomId: string, description: string,
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/${classroomId}/description`, {
      method: 'POST', headers, body: JSON.stringify({ description }),
    })
    return res.ok
  } catch { return false }
}

export async function joinClassroom(
  code: string,
  getToken: () => Promise<string | null>,
): Promise<{ classroomId: string; classroomName: string } | null> {
  try {
    const headers = await authHeaders(getToken)
    const res = await fetch(`${API}/join`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
