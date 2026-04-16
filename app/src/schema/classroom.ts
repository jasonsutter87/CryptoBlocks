/**
 * Classroom schema — teacher dashboards, student enrollment, assignments,
 * submissions, discussions, replies, and chat messages.
 */
import { z } from 'zod'
import {
  Id, Timestamp, ClerkUserId, Name, Text, Content, Username, UrlString,
  JoinCode, WorkspaceJson, BlockCount, AuthoredWithAvatar,
} from './primitives.js'

/** Classroom */
export const Classroom = z.object({
  id: Id,
  name: Name,
  joinCode: JoinCode,
  teacherId: ClerkUserId,
  teacherName: Username,
  description: Text.default(''),
  createdAt: Timestamp,
})
export type Classroom = z.infer<typeof Classroom>

export const CreateClassroomInput = z.object({
  name: Name,
  description: Text.optional(),
}).strict()
export type CreateClassroomInput = z.infer<typeof CreateClassroomInput>

/** Class member */
export const MemberRole = z.enum(['teacher', 'student'])
export const ClassMember = z.object({
  classroomId: Id,
  userId: ClerkUserId,
  userName: Username,
  userAvatar: UrlString.nullable().default(null),
  role: MemberRole,
  joinedAt: Timestamp,
})
export type ClassMember = z.infer<typeof ClassMember>

/** Assignment */
export const Assignment = z.object({
  id: Id,
  classroomId: Id,
  title: Name,
  description: Text.default(''),
  dueDate: Timestamp.nullable().default(null),
  createdAt: Timestamp,
})
export type Assignment = z.infer<typeof Assignment>

export const CreateAssignmentInput = z.object({
  title: Name,
  description: Text.optional(),
  dueDate: Timestamp.optional(),
}).strict()
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentInput>

/** Submission */
export const SubmissionStatus = z.enum(['pending', 'reviewed', 'returned'])
export const Submission = z.object({
  id: Id,
  assignmentId: Id,
  studentId: ClerkUserId,
  studentName: Username,
  workspaceJson: WorkspaceJson,
  blockCount: BlockCount,
  feedback: Text.nullable().default(null),
  status: SubmissionStatus.default('pending'),
  submittedAt: Timestamp,
})
export type Submission = z.infer<typeof Submission>

export const SubmitAssignmentInput = z.object({
  workspaceJson: WorkspaceJson,
  blockCount: BlockCount.optional(),
}).strict()
export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentInput>

export const FeedbackInput = z.object({
  feedback: Text,
  status: SubmissionStatus.optional(),
}).strict()
export type FeedbackInput = z.infer<typeof FeedbackInput>

/** Discussion */
export const Discussion = z.object({
  id: Id,
  classroomId: Id,
  ...AuthoredWithAvatar,
  title: Name,
  body: Content,
  createdAt: Timestamp,
})
export type Discussion = z.infer<typeof Discussion>

export const CreateDiscussionInput = z.object({
  title: Name,
  body: Content,
}).strict()
export type CreateDiscussionInput = z.infer<typeof CreateDiscussionInput>

/** Reply */
export const Reply = z.object({
  id: Id,
  discussionId: Id,
  ...AuthoredWithAvatar,
  body: Content,
  createdAt: Timestamp,
})
export type Reply = z.infer<typeof Reply>

export const CreateReplyInput = z.object({
  body: Content,
}).strict()
export type CreateReplyInput = z.infer<typeof CreateReplyInput>

/** Chat message */
export const ChatMessage = z.object({
  id: Id,
  classroomId: Id,
  ...AuthoredWithAvatar,
  body: Content,
  createdAt: Timestamp,
})
export type ChatMessage = z.infer<typeof ChatMessage>

export const SendChatInput = z.object({
  body: Content,
}).strict()
export type SendChatInput = z.infer<typeof SendChatInput>
