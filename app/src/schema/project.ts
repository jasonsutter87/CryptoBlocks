/**
 * Project schema — workspaces saved to Shareplace or Dashboard.
 */
import { z } from 'zod'
import {
  Id, Timestamp, ClerkUserId, Name, Text, Username, Category, Tags,
  Visibility, WorkspaceJson, BlockCount, Counter,
} from './primitives.js'

/** Full project row (as stored in DB, as returned by API) */
export const Project = z.object({
  id: Id,
  name: Name,
  authorId: ClerkUserId.or(z.literal('anonymous')),
  authorName: Username,
  description: Text.default(''),
  category: Category.default('General'),
  workspaceJson: WorkspaceJson,
  tags: Tags,
  blockCount: BlockCount,
  parentId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/).nullable().default(null),
  visibility: Visibility,
  downloads: Counter,
  likes: Counter,
  createdAt: Timestamp,
})
export type Project = z.infer<typeof Project>

/** Payload for POST /api/projects — derived from Project, drops server-set fields */
export const PublishProjectInput = Project.omit({
  id: true,
  authorId: true,
  downloads: true,
  likes: true,
  createdAt: true,
}).partial({
  authorName: true,
  description: true,
  category: true,
  tags: true,
  blockCount: true,
  parentId: true,
  visibility: true,
}).strict()
export type PublishProjectInput = z.infer<typeof PublishProjectInput>

/** Payload for POST /api/projects/:id/report */
export const ReportProjectInput = z.object({
  reason: z.enum(['inappropriate', 'spam', 'copyright', 'other']),
  detail: Text.optional().default(''),
}).strict()
export type ReportProjectInput = z.infer<typeof ReportProjectInput>

/** Response shape for GET /api/projects?... */
export const ProjectListResponse = z.object({
  projects: z.array(Project),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
})
export type ProjectListResponse = z.infer<typeof ProjectListResponse>
