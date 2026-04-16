/**
 * GitHub integration input schemas. Validates user-supplied repo names,
 * filenames, and file content before they reach the GitHub API.
 */
import { z } from 'zod'
import { Text } from './primitives.js'

/** GitHub repo name — alphanumeric + dash/underscore/period, max 100 */
export const RepoName = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9._-]+$/, { message: 'Invalid repo name' })

/** owner/repo full name — `octocat/hello-world` style */
export const RepoFullName = z
  .string()
  .min(3)
  .max(200)
  .regex(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/, { message: 'Invalid repo full name' })

/**
 * Filename — no leading slash, no `..` segments, restricted charset.
 * Prevents path traversal in GitHub API URLs.
 */
export const SafeFilename = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9._/-]+$/, { message: 'Filename contains invalid characters' })
  .refine((s) => !s.includes('..') && !s.startsWith('/'), {
    message: 'Filename cannot contain .. or start with /',
  })

/** GitHub commit message */
export const CommitMessage = Text

/** Bounded file content — caps at 1MB raw bytes (GitHub's limit anyway) */
export const FileContent = z.string().max(1_000_000)

export const CreateRepoInput = z.object({
  name: RepoName,
  description: Text.optional().default(''),
}).strict()
export type CreateRepoInput = z.infer<typeof CreateRepoInput>

export const PushFileInput = z.object({
  repo: RepoFullName,
  filename: SafeFilename,
  content: FileContent,
  message: CommitMessage.optional(),
}).strict()
export type PushFileInput = z.infer<typeof PushFileInput>
