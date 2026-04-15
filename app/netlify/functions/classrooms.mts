/**
 * Netlify Function — Classrooms API for the Teacher Dashboard.
 *
 * Routes:
 *   POST /api/classrooms           → create a classroom (teacher, auth required)
 *   GET  /api/classrooms           → list my classrooms (teacher + student)
 *   GET  /api/classrooms/:id       → classroom detail + members + their projects
 *   POST /api/classrooms/join      → join with a code (student, auth required)
 */

import {
  json, cors, parsePath, verifyFromRequest, tursoExecute, isTursoConfigured,
} from './_lib/index.js'
import type { TursoRow } from './_lib/index.js'

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'classrooms')

  try {
    if (!isTursoConfigured()) {
      return json({ error: 'Database not configured' }, 500)
    }

    const user = await verifyFromRequest(req)

    // POST /api/classrooms — create a classroom
    if (req.method === 'POST' && segments.length === 0) {
      if (!user) return json({ error: 'Sign in to create a classroom' }, 401)

      const body = await req.json()
      const { name } = body
      if (!name) return json({ error: 'name is required' }, 400)

      const id = crypto.randomUUID()
      const joinCode = generateJoinCode()
      const now = Date.now()

      await tursoExecute(
        'INSERT INTO classrooms (id, name, join_code, teacher_id, teacher_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, String(name).slice(0, 100), joinCode, user.sub, String(user.name || 'Teacher').slice(0, 50), now],
      )

      // Also add the teacher as a member with role "teacher"
      await tursoExecute(
        'INSERT INTO class_members (classroom_id, user_id, user_name, user_avatar, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, user.sub, String(user.name || 'Teacher').slice(0, 50), user.avatar || '', 'teacher', now],
      )

      return json({ id, name, joinCode, createdAt: now }, 201)
    }

    // POST /api/classrooms/join — join with a code
    if (req.method === 'POST' && segments.length === 1 && segments[0] === 'join') {
      if (!user) return json({ error: 'Sign in to join a classroom' }, 401)

      const body = await req.json()
      const code = String(body.code || '').toUpperCase().trim()
      if (!code) return json({ error: 'Join code is required' }, 400)

      const classroom = await tursoExecute(
        'SELECT id, name FROM classrooms WHERE join_code = ?',
        [code],
      )
      if (classroom.rows.length === 0) {
        return json({ error: 'Invalid join code' }, 404)
      }

      const classroomId = String(classroom.rows[0].id)
      const classroomName = String(classroom.rows[0].name)

      // Check if already a member
      const existing = await tursoExecute(
        'SELECT 1 FROM class_members WHERE classroom_id = ? AND user_id = ?',
        [classroomId, user.sub],
      )
      if (existing.rows.length === 0) {
        await tursoExecute(
          'INSERT INTO class_members (classroom_id, user_id, user_name, user_avatar, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
          [classroomId, user.sub, String(user.name || 'Student').slice(0, 50), user.avatar || '', 'student', Date.now()],
        )
      }

      return json({ classroomId, classroomName })
    }

    // GET /api/classrooms/:id — classroom detail + members + their projects
    if (req.method === 'GET' && segments.length === 1) {
      const classroomId = segments[0]

      const classroom = await tursoExecute(
        'SELECT * FROM classrooms WHERE id = ?',
        [classroomId],
      )
      if (classroom.rows.length === 0) return json({ error: 'Not found' }, 404)

      const members = await tursoExecute(
        'SELECT * FROM class_members WHERE classroom_id = ? ORDER BY joined_at ASC',
        [classroomId],
      )

      // Fetch projects by class members
      const memberIds = members.rows.map((m) => String(m.user_id))
      let projects: TursoRow[] = []
      if (memberIds.length > 0) {
        const placeholders = memberIds.map(() => '?').join(',')
        const result = await tursoExecute(
          `SELECT id, name, author_id, author_name, category, block_count, likes, created_at
           FROM projects WHERE author_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 50`,
          memberIds,
        )
        projects = result.rows
      }

      const c = classroom.rows[0]
      return json({
        id: c.id,
        name: c.name,
        description: c.description || '',
        joinCode: c.join_code,
        teacherId: c.teacher_id,
        teacherName: c.teacher_name,
        createdAt: c.created_at,
        members: members.rows.map((m) => ({
          userId: m.user_id,
          userName: m.user_name,
          userAvatar: m.user_avatar,
          role: m.role,
          joinedAt: m.joined_at,
        })),
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          authorId: p.author_id,
          authorName: p.author_name,
          category: p.category,
          blockCount: p.block_count,
          likes: p.likes,
          createdAt: p.created_at,
        })),
      })
    }

    // GET /api/classrooms — list my classrooms
    if (req.method === 'GET' && segments.length === 0) {
      if (!user) return json({ error: 'Sign in to see your classrooms' }, 401)

      const result = await tursoExecute(
        `SELECT c.id, c.name, c.join_code, c.teacher_id, c.teacher_name, c.created_at,
                (SELECT COUNT(*) FROM class_members WHERE classroom_id = c.id) as member_count
         FROM classrooms c
         WHERE c.id IN (SELECT classroom_id FROM class_members WHERE user_id = ?)
         ORDER BY c.created_at DESC`,
        [user.sub],
      )

      return json({
        classrooms: result.rows.map((c) => ({
          id: c.id,
          name: c.name,
          joinCode: c.join_code,
          teacherId: c.teacher_id,
          teacherName: c.teacher_name,
          memberCount: Number(c.member_count),
          createdAt: c.created_at,
        })),
      })
    }

    // POST /api/classrooms/:id/assignments — create an assignment (teacher only)
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'assignments') {
      if (!user) return json({ error: 'Sign in to create assignments' }, 401)

      const classroomId = segments[0]
      const body = await req.json()
      const { title, description, dueDate } = body
      if (!title) return json({ error: 'title is required' }, 400)

      const id = crypto.randomUUID()
      const now = Date.now()

      await tursoExecute(
        'INSERT INTO assignments (id, classroom_id, title, description, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, classroomId, String(title).slice(0, 200), String(description || '').slice(0, 1000), dueDate || null, now],
      )

      return json({ id, title, createdAt: now }, 201)
    }

    // GET /api/classrooms/:id/assignments — list assignments for a classroom
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'assignments') {
      const classroomId = segments[0]

      const assignments = await tursoExecute(
        'SELECT * FROM assignments WHERE classroom_id = ? ORDER BY created_at DESC',
        [classroomId],
      )

      // For each assignment, get submission count
      const result = []
      for (const a of assignments.rows) {
        const subs = await tursoExecute(
          'SELECT COUNT(*) as count FROM submissions WHERE assignment_id = ?',
          [String(a.id)],
        )
        result.push({
          id: a.id,
          classroomId: a.classroom_id,
          title: a.title,
          description: a.description,
          dueDate: a.due_date,
          createdAt: a.created_at,
          submissionCount: Number(subs.rows[0]?.count ?? 0),
        })
      }

      return json({ assignments: result })
    }

    // POST /api/classrooms/:classroomId/assignments/:assignmentId/submit — student submits work
    // segments: ['classroomId', 'assignments', 'assignmentId', 'submit']
    if (req.method === 'POST' && segments.length === 4 && segments[1] === 'assignments' && segments[3] === 'submit') {
      if (!user) return json({ error: 'Sign in to submit' }, 401)

      const assignmentId = segments[2]
      const body = await req.json()
      const { workspaceJson, blockCount } = body
      if (!workspaceJson) return json({ error: 'workspaceJson is required' }, 400)

      const id = crypto.randomUUID()
      const now = Date.now()

      await tursoExecute(
        'INSERT INTO submissions (id, assignment_id, student_id, student_name, workspace_json, block_count, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, assignmentId, user.sub, String(user.name || 'Student').slice(0, 50), String(workspaceJson), Number(blockCount) || 0, now],
      )

      return json({ id, submittedAt: now }, 201)
    }

    // GET /api/classrooms/:classroomId/assignments/:assignmentId/submissions — list submissions
    // segments: ['classroomId', 'assignments', 'assignmentId', 'submissions']
    if (req.method === 'GET' && segments.length === 4 && segments[1] === 'assignments' && segments[3] === 'submissions') {
      const assignmentId = segments[2]

      const subs = await tursoExecute(
        'SELECT id, student_id, student_name, block_count, submitted_at, feedback, status FROM submissions WHERE assignment_id = ? ORDER BY submitted_at DESC',
        [assignmentId],
      )

      return json({
        submissions: subs.rows.map((s) => ({
          id: s.id,
          studentId: s.student_id,
          studentName: s.student_name,
          blockCount: Number(s.block_count),
          submittedAt: s.submitted_at,
          feedback: s.feedback,
          status: s.status,
        })),
      })
    }

    // POST /api/classrooms/:classroomId/assignments/:assignmentId/feedback/:submissionId — teacher feedback
    // segments: ['classroomId', 'assignments', 'assignmentId', 'feedback', 'submissionId']
    if (req.method === 'POST' && segments.length === 5 && segments[1] === 'assignments' && segments[3] === 'feedback') {
      if (!user) return json({ error: 'Sign in to give feedback' }, 401)

      const submissionId = segments[4]
      const body = await req.json()
      const { feedback, status } = body

      await tursoExecute(
        'UPDATE submissions SET feedback = ?, status = ? WHERE id = ?',
        [String(feedback || '').slice(0, 500), String(status || 'reviewed'), submissionId],
      )

      return json({ ok: true })
    }

    // GET /api/classrooms/:id/export — download all classroom data as JSON (teacher record)
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'export') {
      const classroomId = segments[0]
      const classroom = await tursoExecute('SELECT * FROM classrooms WHERE id = ?', [classroomId])
      if (classroom.rows.length === 0) return json({ error: 'Not found' }, 404)

      const members = await tursoExecute('SELECT * FROM class_members WHERE classroom_id = ?', [classroomId])
      const assignments = await tursoExecute('SELECT * FROM assignments WHERE classroom_id = ?', [classroomId])

      const allSubmissions = []
      for (const a of assignments.rows) {
        const subs = await tursoExecute('SELECT * FROM submissions WHERE assignment_id = ?', [String(a.id)])
        for (const s of subs.rows) {
          allSubmissions.push({ assignmentTitle: a.title, ...s })
        }
      }

      const discussions = await tursoExecute('SELECT * FROM discussions WHERE classroom_id = ?', [classroomId])
      const allReplies = []
      for (const d of discussions.rows) {
        const replies = await tursoExecute('SELECT * FROM replies WHERE discussion_id = ?', [String(d.id)])
        for (const r of replies.rows) {
          allReplies.push({ discussionTitle: d.title, ...r })
        }
      }

      const chatMessages = await tursoExecute(
        'SELECT * FROM chat_messages WHERE classroom_id = ? ORDER BY created_at ASC',
        [classroomId],
      )

      const exportData = {
        exportedAt: new Date().toISOString(),
        classroom: classroom.rows[0],
        members: members.rows,
        assignments: assignments.rows,
        submissions: allSubmissions,
        discussions: discussions.rows,
        replies: allReplies,
        chatMessages: chatMessages.rows,
      }

      const c = classroom.rows[0]
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="classroom-${String(c.name).replace(/[^a-zA-Z0-9]/g, '_')}-export.json"`,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // POST /api/classrooms/:id/description — update classroom description (teacher)
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'description') {
      if (!user) return json({ error: 'Sign in' }, 401)
      const body = await req.json()
      await tursoExecute(
        'UPDATE classrooms SET description = ? WHERE id = ?',
        [String(body.description || '').slice(0, 2000), segments[0]],
      )
      return json({ ok: true })
    }

    // --- Discussions ---

    // POST /api/classrooms/:id/discussions — create a discussion post
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'discussions') {
      if (!user) return json({ error: 'Sign in to post' }, 401)
      const body = await req.json()
      if (!body.title || !body.body) return json({ error: 'title and body required' }, 400)
      const id = crypto.randomUUID()
      await tursoExecute(
        'INSERT INTO discussions (id, classroom_id, author_id, author_name, author_avatar, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, segments[0], user.sub, String(user.name || 'Student').slice(0, 50), user.avatar || '', String(body.title).slice(0, 200), String(body.body).slice(0, 5000), Date.now()],
      )
      return json({ id }, 201)
    }

    // GET /api/classrooms/:id/discussions — list discussions
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'discussions') {
      const result = await tursoExecute(
        `SELECT d.*, (SELECT COUNT(*) FROM replies WHERE discussion_id = d.id) as reply_count
         FROM discussions d WHERE d.classroom_id = ? ORDER BY d.created_at DESC LIMIT 50`,
        [segments[0]],
      )
      return json({
        discussions: result.rows.map((d) => ({
          id: d.id, title: d.title, body: d.body,
          authorName: d.author_name, authorAvatar: d.author_avatar,
          replyCount: Number(d.reply_count), createdAt: d.created_at,
        })),
      })
    }

    // GET /api/classrooms/:classroomId/discussions/:discussionId — get discussion + replies
    if (req.method === 'GET' && segments.length === 2 && segments[0] !== 'join' && !['assignments', 'discussions', 'chat', 'description'].includes(segments[1])) {
      // This is handled by the existing /:id route above
    }

    // POST /api/classrooms/:classroomId/discussions/:discussionId/reply — add a reply
    // segments: ['classroomId', 'discussions', 'discussionId', 'reply']
    if (req.method === 'POST' && segments.length === 4 && segments[1] === 'discussions' && segments[3] === 'reply') {
      if (!user) return json({ error: 'Sign in to reply' }, 401)
      const body = await req.json()
      if (!body.body) return json({ error: 'body required' }, 400)
      const id = crypto.randomUUID()
      const discussionId = segments[2]
      await tursoExecute(
        'INSERT INTO replies (id, discussion_id, author_id, author_name, author_avatar, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, discussionId, user.sub, String(user.name || 'Student').slice(0, 50), user.avatar || '', String(body.body).slice(0, 5000), Date.now()],
      )
      return json({ id }, 201)
    }

    // GET /api/classrooms/:classroomId/discussions/:discussionId/replies — get replies
    // segments: ['classroomId', 'discussions', 'discussionId', 'replies']
    if (req.method === 'GET' && segments.length === 4 && segments[1] === 'discussions' && segments[3] === 'replies') {
      const result = await tursoExecute(
        'SELECT * FROM replies WHERE discussion_id = ? ORDER BY created_at ASC',
        [segments[2]],
      )
      return json({
        replies: result.rows.map((r) => ({
          id: r.id, body: r.body,
          authorName: r.author_name, authorAvatar: r.author_avatar,
          createdAt: r.created_at,
        })),
      })
    }

    // --- Chat ---

    // POST /api/classrooms/:id/chat — send a message
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'chat') {
      if (!user) return json({ error: 'Sign in to chat' }, 401)
      const body = await req.json()
      if (!body.message) return json({ error: 'message required' }, 400)
      const id = crypto.randomUUID()
      await tursoExecute(
        'INSERT INTO chat_messages (id, classroom_id, author_id, author_name, author_avatar, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, segments[0], user.sub, String(user.name || 'Student').slice(0, 50), user.avatar || '', String(body.message).slice(0, 1000), Date.now()],
      )
      return json({ id }, 201)
    }

    // GET /api/classrooms/:id/chat — get recent messages
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'chat') {
      const after = new URL(req.url).searchParams.get('after')
      let sql = 'SELECT * FROM chat_messages WHERE classroom_id = ?'
      const args: (string | number)[] = [segments[0]]
      if (after) {
        sql += ' AND created_at > ?'
        args.push(Number(after))
      }
      sql += ' ORDER BY created_at DESC LIMIT 100'
      const result = await tursoExecute(sql, args)
      return json({
        messages: result.rows.reverse().map((m) => ({
          id: m.id, body: m.body,
          authorName: m.author_name, authorAvatar: m.author_avatar,
          authorId: m.author_id, createdAt: m.created_at,
        })),
      })
    }

    // --- Download submission ---

    // GET /api/classrooms/:classroomId/submissions/:submissionId/download
    // segments: ['classroomId', 'submissions', 'submissionId', 'download']
    if (req.method === 'GET' && segments.length === 4 && segments[1] === 'submissions' && segments[3] === 'download') {
      const sub = await tursoExecute(
        'SELECT workspace_json, student_name FROM submissions WHERE id = ?',
        [segments[2]],
      )
      if (sub.rows.length === 0) return json({ error: 'Not found' }, 404)
      return new Response(String(sub.rows[0].workspace_json), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${String(sub.rows[0].student_name).replace(/[^a-zA-Z0-9]/g, '_')}-submission.blocks"`,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Classrooms API error:', message)
    return json({ error: 'Internal server error', detail: message }, 500)
  }
}
