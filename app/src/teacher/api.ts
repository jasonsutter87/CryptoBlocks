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
