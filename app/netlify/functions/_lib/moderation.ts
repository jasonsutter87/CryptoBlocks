/**
 * Content moderation — banned word list and URL detection.
 *
 * Used by user-generated content endpoints (projects, discussions, chat).
 */

const BANNED_WORDS = [
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'dick', 'pussy', 'cock', 'cunt',
  'nigger', 'nigga', 'faggot', 'retard', 'slut', 'whore', 'porn', 'xxx',
  'kill yourself', 'kys',
] as const

const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Check combined name + description for banned words (word-boundary matched)
 * and URLs. Returns a user-facing error message, or null when clean.
 */
export function moderateContent(name: string, description: string): string | null {
  const combined = ` ${name} ${description} `.toLowerCase()

  for (const word of BANNED_WORDS) {
    const re = new RegExp(`\\b${escapeRegex(word)}\\b`)
    if (re.test(combined)) {
      return 'Content contains inappropriate language. Please edit and try again.'
    }
  }

  if (URL_PATTERN.test(name) || URL_PATTERN.test(description)) {
    return 'URLs are not allowed in names or descriptions.'
  }

  return null
}
