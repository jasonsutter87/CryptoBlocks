/**
 * Project schema — workspaces saved to Shareplace or Dashboard.
 *
 * Shape matches the `projects` table in Turso.
 */
import { z } from 'zod'
import {
  Id, Timestamp, ClerkUserId, Name, Text, Username, Category, Tags,
  Visibility, WorkspaceJson, MAX_BLOCK_COUNT,
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
  blockCount: z.number().int().min(0).max(MAX_BLOCK_COUNT).default(0),
  parentId: Id.nullable().default(null),
  visibility: Visibility,
  downloads: z.number().int().min(0).default(0),
  likes: z.number().int().min(0).default(0),
  createdAt: Timestamp,
})
export type Project = z.infer<typeof Project>

/** Payload for POST /api/projects */
export const PublishProjectInput = z.object({
  name: Name,
  authorName: Username.optional(),
  description: Text.optional().default(''),
  category: Category.optional().default('General'),
  workspaceJson: WorkspaceJson,
  tags: Tags.optional(),
  blockCount: z.number().int().min(0).max(MAX_BLOCK_COUNT).optional(),
  parentId: Id.optional(),
  visibility: Visibility.optional(),
})
export type PublishProjectInput = z.infer<typeof PublishProjectInput>

/** Payload for POST /api/projects/:id/report */
export const ReportProjectInput = z.object({
  reason: z.enum(['inappropriate', 'spam', 'copyright', 'other']),
  detail: Text.optional().default(''),
})
export type ReportProjectInput = z.infer<typeof ReportProjectInput>

/** Response shape for GET /api/projects?... */
export const ProjectListResponse = z.object({
  projects: z.array(Project),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
})
export type ProjectListResponse = z.infer<typeof ProjectListResponse>
