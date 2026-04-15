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

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** UUID v4, used for all primary keys */
export const Id = z.string().uuid()

/** Unix millisecond timestamp — stored as INTEGER in Turso */
export const Timestamp = z.number().int().min(0).max(4_102_444_800_000) // year 2100

/** Clerk user ID — not a UUID, format: user_xxxxxxxxxxxx */
export const ClerkUserId = z.string().min(5).max(50).regex(/^[a-zA-Z0-9_-]+$/)

/** Bounded name (projects, classrooms, assignments, titles) */
export const Name = z.string().max(MAX_NAME).trim().refine((s) => s.length > 0, {
  message: 'Name cannot be empty or whitespace only',
})

/** Bounded short text (descriptions, feedback) */
export const Text = z.string().max(MAX_TEXT)

/** Bounded long content (messages, discussion bodies) */
export const Content = z.string().min(1).max(MAX_CONTENT)

/** Bounded URL/path string */
export const UrlString = z.string().max(MAX_URL)

/** Bounded hex color */
export const ColorString = z.string().max(MAX_COLOR).regex(/^#?[a-zA-Z0-9(),. %-]*$/)

/** Email with length cap */
export const Email = z.string().email().max(MAX_EMAIL).toLowerCase()

/** Username — visible to other users */
export const Username = z.string().min(1).max(MAX_USERNAME).trim()

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

/** Workspace JSON string — size-bounded, must parse as JSON */
export const WorkspaceJson = z
  .string()
  .min(2)
  .max(MAX_BLOB)
  .refine((s) => {
    try { JSON.parse(s); return true } catch { return false }
  }, { message: 'Must be valid JSON' })
