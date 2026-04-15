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
  json, cors, logError, parsePath, verifyFromRequest, tursoExecute, isTursoConfigured,
  moderateContent, secureRandomCode,
  requireAuth, requireClassroomMember, requireClassroomTeacher,
} from './_lib/index.js'
import type { TursoRow } from './_lib/index.js'
import {
  CreateClassroomInput, CreateAssignmentInput, SubmitAssignmentInput,
  FeedbackInput, CreateDiscussionInput, CreateReplyInput, SendChatInput,
  JoinCode,
} from '../../src/schema/index.js'

const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function generateJoinCode(): string {
  return secureRandomCode(6, JOIN_CODE_ALPHABET)
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors(req)

  const segments = parsePath(req, 'classrooms')

  try {
    if (!isTursoConfigured()) {
      return json({ error: 'Database not configured' }, 500)
    }

    const user = await verifyFromRequest(req)

    // POST /api/classrooms — create a classroom
    if (req.method === 'POST' && segments.length === 0) {
      if (!user) return json({ error: 'Sign in to create a classroom' }, 401)

      const raw = await req.json().catch(() => null)
      const parsed = CreateClassroomInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { name, description } = parsed.data

      const modErr = moderateContent(name, description ?? '')
      if (modErr) return json({ error: modErr }, 400)

      const id = crypto.randomUUID()
      const joinCode = generateJoinCode()
      const now = Date.now()
      const teacherName = (user.name || 'Teacher').slice(0, 50)

      await tursoExecute(
        'INSERT INTO classrooms (id, name, join_code, teacher_id, teacher_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, joinCode, user.sub, teacherName, now],
      )
      await tursoExecute(
        'INSERT INTO class_members (classroom_id, user_id, user_name, user_avatar, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, user.sub, teacherName, user.avatar || '', 'teacher', now],
      )

      return json({ id, name, joinCode, createdAt: now }, 201)
    }

    // POST /api/classrooms/join — join with a code
    if (req.method === 'POST' && segments.length === 1 && segments[0] === 'join') {
      if (!user) return json({ error: 'Sign in to join a classroom' }, 401)

      const raw = await req.json().catch(() => null)
      const rawCode = String((raw as { code?: unknown })?.code ?? '').toUpperCase().trim()
      const parsed = JoinCode.safeParse(rawCode)
      if (!parsed.success) return json({ error: 'Invalid join code format' }, 400)
      const code = parsed.data

      // Rate-limit guessers. 6-char codes over a 32-char alphabet = ~10^9
      // space; without a limit, one account at 1 req/ms enumerates it in
      // ~11 days. Allow 10 wrong guesses per rolling hour per user.
      const MAX_FAILS = 10
      const WINDOW_MS = 60 * 60 * 1000
      await tursoExecute(
        `CREATE TABLE IF NOT EXISTS join_attempts (
          user_id TEXT PRIMARY KEY,
          fails INTEGER NOT NULL DEFAULT 0,
          last_fail_at INTEGER NOT NULL DEFAULT 0
        )`,
      ).catch(() => { /* concurrent create */ })
      const now = Date.now()
      const prev = await tursoExecute(
        'SELECT fails, last_fail_at FROM join_attempts WHERE user_id = ?',
        [user.sub],
      )
      const fails = Number(prev.rows[0]?.fails ?? 0)
      const lastFail = Number(prev.rows[0]?.last_fail_at ?? 0)
      if (fails >= MAX_FAILS && now - lastFail < WINDOW_MS) {
        return json({ error: 'Too many attempts — try again in an hour.' }, 429)
      }
      // Window expired — reset the counter.
      if (fails > 0 && now - lastFail >= WINDOW_MS) {
        await tursoExecute(
          'UPDATE join_attempts SET fails = 0 WHERE user_id = ?',
          [user.sub],
        )
      }

      const classroom = await tursoExecute(
        'SELECT id, name FROM classrooms WHERE join_code = ?',
        [code],
      )
      if (classroom.rows.length === 0) {
        await tursoExecute(
          `INSERT INTO join_attempts (user_id, fails, last_fail_at) VALUES (?, 1, ?)
           ON CONFLICT (user_id) DO UPDATE SET
             fails = fails + 1, last_fail_at = excluded.last_fail_at`,
          [user.sub, now],
        )
        return json({ error: 'Invalid join code' }, 404)
      }

      const classroomId = String(classroom.rows[0].id)
      const classroomName = String(classroom.rows[0].name)

      // Successful match — reset the attempt counter.
      await tursoExecute(
        'DELETE FROM join_attempts WHERE user_id = ?',
        [user.sub],
      ).catch(() => { /* nothing to delete is fine */ })

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

    // GET /api/classrooms/:id — classroom detail + members + their projects (members only)
    if (req.method === 'GET' && segments.length === 1) {
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

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
      // Join code is a credential — only the teacher sees it. A student who
      // had the code and later left the class could otherwise share it to
      // auto-enroll alts, or leak it publicly.
      const viewerIsTeacher = user?.sub === String(c.teacher_id)
      return json({
        id: c.id,
        name: c.name,
        description: c.description || '',
        joinCode: viewerIsTeacher ? c.join_code : null,
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
          // See detail endpoint: join code is teacher-only.
          joinCode: String(c.teacher_id) === user.sub ? c.join_code : null,
          teacherId: c.teacher_id,
          teacherName: c.teacher_name,
          memberCount: Number(c.member_count),
          createdAt: c.created_at,
        })),
      })
    }

    // POST /api/classrooms/:id/assignments — create an assignment (teacher only)
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'assignments') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomTeacher(classroomId, user)
      if (guardErr) return guardErr

      const raw = await req.json().catch(() => null)
      const parsed = CreateAssignmentInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { title, description, dueDate } = parsed.data
      const modErr = moderateContent(title, description ?? '')
      if (modErr) return json({ error: modErr }, 400)

      const id = crypto.randomUUID()
      const now = Date.now()

      await tursoExecute(
        'INSERT INTO assignments (id, classroom_id, title, description, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, classroomId, title, description ?? '', dueDate ?? null, now],
      )

      return json({ id, title, createdAt: now }, 201)
    }

    // GET /api/classrooms/:id/assignments — list assignments (members only)
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'assignments') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

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
      const classroomId = segments[0]
      const assignmentId = segments[2]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

      const raw = await req.json().catch(() => null)
      const parsed = SubmitAssignmentInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { workspaceJson, blockCount } = parsed.data

      const id = crypto.randomUUID()
      const now = Date.now()

      await tursoExecute(
        'INSERT INTO submissions (id, assignment_id, student_id, student_name, workspace_json, block_count, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, assignmentId, user.sub, (user.name || 'Student').slice(0, 50), workspaceJson, blockCount ?? 0, now],
      )

      return json({ id, submittedAt: now }, 201)
    }

    // GET /api/classrooms/:classroomId/assignments/:assignmentId/submissions — list (teacher only)
    // segments: ['classroomId', 'assignments', 'assignmentId', 'submissions']
    if (req.method === 'GET' && segments.length === 4 && segments[1] === 'assignments' && segments[3] === 'submissions') {
      const classroomId = segments[0]
      const assignmentId = segments[2]
      const guardErr = await requireClassroomTeacher(classroomId, user)
      if (guardErr) return guardErr

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
      const classroomId = segments[0]
      const submissionId = segments[4]
      const guardErr = await requireClassroomTeacher(classroomId, user)
      if (guardErr) return guardErr

      const raw = await req.json().catch(() => null)
      const parsed = FeedbackInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { feedback, status } = parsed.data

      await tursoExecute(
        'UPDATE submissions SET feedback = ?, status = ? WHERE id = ?',
        [feedback, status ?? 'reviewed', submissionId],
      )

      return json({ ok: true })
    }

    // GET /api/classrooms/:id/export — download all classroom data as JSON (teacher record)
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'export') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomTeacher(classroomId, user)
      if (guardErr) return guardErr
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
      const classroomId = segments[0]
      const guardErr = await requireClassroomTeacher(classroomId, user)
      if (guardErr) return guardErr

      const raw = await req.json().catch(() => null)
      const rawDesc = typeof (raw as { description?: unknown })?.description === 'string'
        ? (raw as { description: string }).description
        : ''
      const description = rawDesc.slice(0, 2000)
      const modErr = moderateContent('', description)
      if (modErr) return json({ error: modErr }, 400)

      await tursoExecute(
        'UPDATE classrooms SET description = ? WHERE id = ?',
        [description, classroomId],
      )
      return json({ ok: true })
    }

    // --- Discussions ---

    // POST /api/classrooms/:id/discussions — create a discussion post
    if (req.method === 'POST' && segments.length === 2 && segments[1] === 'discussions') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

      const raw = await req.json().catch(() => null)
      const parsed = CreateDiscussionInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { title, body } = parsed.data
      const modErr = moderateContent(title, body)
      if (modErr) return json({ error: modErr }, 400)
      const id = crypto.randomUUID()
      await tursoExecute(
        'INSERT INTO discussions (id, classroom_id, author_id, author_name, author_avatar, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, classroomId, user.sub, (user.name || 'Student').slice(0, 50), user.avatar || '', title, body, Date.now()],
      )
      return json({ id }, 201)
    }

    // GET /api/classrooms/:id/discussions — list discussions (members only)
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'discussions') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

      const result = await tursoExecute(
        `SELECT d.*, (SELECT COUNT(*) FROM replies WHERE discussion_id = d.id) as reply_count
         FROM discussions d WHERE d.classroom_id = ? ORDER BY d.created_at DESC LIMIT 50`,
        [classroomId],
      )
      return json({
        discussions: result.rows.map((d) => ({
          id: d.id, title: d.title, body: d.body,
          authorName: d.author_name, authorAvatar: d.author_avatar,
          replyCount: Number(d.reply_count), createdAt: d.created_at,
        })),
      })
    }

    // POST /api/classrooms/:classroomId/discussions/:discussionId/reply — add a reply
    // segments: ['classroomId', 'discussions', 'discussionId', 'reply']
    if (req.method === 'POST' && segments.length === 4 && segments[1] === 'discussions' && segments[3] === 'reply') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

      const raw = await req.json().catch(() => null)
      const parsed = CreateReplyInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { body } = parsed.data
      const modErr = moderateContent('', body)
      if (modErr) return json({ error: modErr }, 400)
      const id = crypto.randomUUID()
      const discussionId = segments[2]
      await tursoExecute(
        'INSERT INTO replies (id, discussion_id, author_id, author_name, author_avatar, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, discussionId, user.sub, (user.name || 'Student').slice(0, 50), user.avatar || '', body, Date.now()],
      )
      return json({ id }, 201)
    }

    // GET /api/classrooms/:classroomId/discussions/:discussionId/replies — get replies (members only)
    // segments: ['classroomId', 'discussions', 'discussionId', 'replies']
    if (req.method === 'GET' && segments.length === 4 && segments[1] === 'discussions' && segments[3] === 'replies') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

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
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

      const raw = await req.json().catch(() => null)
      // Accept both body.message (legacy) and body.body (schema)
      const normalized = raw && typeof raw === 'object'
        ? { body: (raw as { body?: unknown; message?: unknown }).body ?? (raw as { message?: unknown }).message }
        : null
      const parsed = SendChatInput.safeParse(normalized)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { body } = parsed.data
      const modErr = moderateContent('', body)
      if (modErr) return json({ error: modErr }, 400)
      const id = crypto.randomUUID()
      await tursoExecute(
        'INSERT INTO chat_messages (id, classroom_id, author_id, author_name, author_avatar, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, classroomId, user.sub, (user.name || 'Student').slice(0, 50), user.avatar || '', body, Date.now()],
      )
      return json({ id }, 201)
    }

    // GET /api/classrooms/:id/chat — get recent messages (members only)
    if (req.method === 'GET' && segments.length === 2 && segments[1] === 'chat') {
      const classroomId = segments[0]
      const guardErr = await requireClassroomMember(classroomId, user)
      if (guardErr) return guardErr

      const after = new URL(req.url).searchParams.get('after')
      let sql = 'SELECT * FROM chat_messages WHERE classroom_id = ?'
      const args: (string | number)[] = [classroomId]
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
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const classroomId = segments[0]
      const submissionId = segments[2]

      // Fetch submission + verify it belongs to this classroom
      const sub = await tursoExecute(
        `SELECT s.workspace_json, s.student_name, s.student_id, c.teacher_id
         FROM submissions s
         JOIN assignments a ON s.assignment_id = a.id
         JOIN classrooms c ON a.classroom_id = c.id
         WHERE s.id = ? AND c.id = ?`,
        [submissionId, classroomId],
      )
      if (sub.rows.length === 0) return json({ error: 'Not found' }, 404)

      const row = sub.rows[0]
      // Authorization: own submission OR classroom teacher
      const isOwner = row.student_id === user!.sub
      const isTeacher = row.teacher_id === user!.sub
      if (!isOwner && !isTeacher) return json({ error: 'Forbidden' }, 403)

      const safeFilename = String(row.student_name).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50) || 'submission'
      return new Response(String(row.workspace_json), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${safeFilename}-submission.blocks"`,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('classrooms', err)
    return json({ error: 'Internal server error' }, 500)
  }
}
