/**
 * Shared schema primitives. Single source of truth for all bounded fields.
 *
 * Every API payload, every DB row, every user input flows through these
 * types. Change a bound here and it propagates everywhere.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Size bounds — keep these at the top, one place to tune
// ---------------------------------------------------------------------------

export const MAX_NAME = 100 // project/classroom/assignment names
export const MAX_TEXT = 500 // descriptions, short messages
export const MAX_CONTENT = 5_000 // long messages (discussion body, chat)
export const MAX_BLOB = 2_000_000 // workspace JSON (Scratch projects are ~500KB typical)
export const MAX_URL = 2_048
export const MAX_COLOR = 25
export const MAX_EMAIL = 320 // RFC 5321
export const MAX_USERNAME = 50
export const MAX_TAG = 30
export const MAX_TAGS = 10
export const MAX_ITEMS_PER_PAGE = 50
export const MAX_BLOCK_COUNT = 10_000 // sanity cap on any workspace
export const MAX_JSON_DEPTH = 20 // prevents nested-JSON DoS
export const MAX_PAGE_SIZE = 50
export const MAX_PAGE_OFFSET = 10_000 // don't let anyone paginate past this

/** Control characters that should never appear in user-visible strings */
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/ // eslint-disable-line no-control-regex

/** Protocols blocked in URLs (case-insensitive, tolerates whitespace) */
const DANGEROUS_PROTOCOL_RE = /^\s*(javascript\s*:|data\s*:\s*text\/html|vbscript\s*:|file\s*:)/i

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** UUID v4, used for all primary keys */
export const Id = z.string().uuid()

/** Unix millisecond timestamp — stored as INTEGER in Turso */
export const Timestamp = z.number().int().min(0).max(4_102_444_800_000) // year 2100

/** Clerk user ID — not a UUID, format: user_xxxxxxxxxxxx */
export const ClerkUserId = z.string().min(5).max(50).regex(/^[a-zA-Z0-9_-]+$/)

/** Reject strings containing control characters (except tab/newline) */
const noControlChars = (s: string) => !CONTROL_CHAR_RE.test(s)
const NO_CONTROL_MSG = { message: 'Contains invalid control characters' }

/** Bounded name (projects, classrooms, assignments, titles) */
export const Name = z.string().max(MAX_NAME).trim()
  .refine((s) => s.length > 0, { message: 'Name cannot be empty or whitespace only' })
  .refine(noControlChars, NO_CONTROL_MSG)

/** Bounded short text (descriptions, feedback) */
export const Text = z.string().max(MAX_TEXT).refine(noControlChars, NO_CONTROL_MSG)

/** Bounded long content (messages, discussion bodies) — allows newlines/tabs */
export const Content = z.string().min(1).max(MAX_CONTENT)
  .refine(noControlChars, NO_CONTROL_MSG)

/** Bounded URL/path string — rejects dangerous protocols */
export const UrlString = z.string().max(MAX_URL)
  .refine((s) => !DANGEROUS_PROTOCOL_RE.test(s.trim()), {
    message: 'URL protocol is not allowed',
  })
  .refine(noControlChars, NO_CONTROL_MSG)

/** Bounded hex color */
export const ColorString = z.string().max(MAX_COLOR).regex(/^#?[a-zA-Z0-9(),. %-]*$/)

/** Email with length cap */
export const Email = z.string().email().max(MAX_EMAIL).toLowerCase()

/** Username — visible to other users, no control chars */
export const Username = z.string().max(MAX_USERNAME).trim()
  .refine((s) => s.length > 0, { message: 'Username cannot be empty' })
  .refine(noControlChars, NO_CONTROL_MSG)

/** Category slug — one of the known block categories */
export const Category = z.enum([
  'General', 'Basics', 'Math', 'Text', 'Lists', 'Logic', 'Web', 'Games',
  'Sound', 'Art', 'Data', 'Database', 'Crypto', 'AI', 'Hardware',
  'micro:bit', 'Vision', 'Education',
])

/** Tag: lowercase, alphanumeric + dashes only */
export const Tag = z.string().min(1).max(MAX_TAG).regex(/^[a-z0-9-]+$/)

/** Bounded tag array */
export const Tags = z.array(Tag).max(MAX_TAGS).default([])

/** Visibility: public (Shareplace) or private (dashboard only) */
export const Visibility = z.enum(['public', 'private']).default('private')

/** 6-character join code (classrooms) */
export const JoinCode = z.string().length(6).regex(/^[A-Z0-9]{6}$/)

// ---------------------------------------------------------------------------
// Mixins — spread into schemas that share fields
// ---------------------------------------------------------------------------

/** Mixin: createdAt + updatedAt */
export const Timestamps = {
  createdAt: Timestamp,
  updatedAt: Timestamp,
} as const

/** Mixin: authored-by fields */
export const Authored = {
  authorId: ClerkUserId,
  authorName: Username,
} as const

// ---------------------------------------------------------------------------
// Workspace JSON — the big blob, validated only for size + parseability
// ---------------------------------------------------------------------------

/** Recursively count max depth of a parsed JSON value (for DoS prevention) */
function jsonDepth(v: unknown, limit: number): number {
  if (limit <= 0) return 9999
  if (Array.isArray(v)) {
    let max = 1
    for (const item of v) max = Math.max(max, 1 + jsonDepth(item, limit - 1))
    return max
  }
  if (v && typeof v === 'object') {
    let max = 1
    for (const key in v as Record<string, unknown>) {
      max = Math.max(max, 1 + jsonDepth((v as Record<string, unknown>)[key], limit - 1))
    }
    return max
  }
  return 1
}

/** Workspace JSON string — size-bounded, must parse, depth-capped */
export const WorkspaceJson = z
  .string()
  .min(2)
  .max(MAX_BLOB)
  .refine((s) => {
    try {
      const parsed = JSON.parse(s)
      return jsonDepth(parsed, MAX_JSON_DEPTH + 1) <= MAX_JSON_DEPTH
    } catch { return false }
  }, { message: 'Invalid JSON or too deeply nested' })

/** Pagination — bounded limit/offset */
export const PageParams = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  offset: z.coerce.number().int().min(0).max(MAX_PAGE_OFFSET).default(0),
})
export type PageParams = z.infer<typeof PageParams>
