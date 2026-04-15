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
 * Normalize text before matching. Unicode NFKC folds lookalikes
 * (`ｆｕｃｋ` → `fuck`), and stripping zero-width joiners / non-joiners
 * prevents `f\u200buck` from slipping past the banned-word regex.
 */
function normalize(s: string): string {
  return s
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase()
}

/**
 * Check combined name + description for banned words (word-boundary matched)
 * and URLs. Returns a user-facing error message, or null when clean.
 *
 * Not a content-safety replacement — a kid determined to swear will find a
 * way. This is a speed bump that catches the obvious cases without needing
 * a third-party moderation API.
 */
export function moderateContent(name: string, description: string): string | null {
  const combined = ` ${normalize(name)} ${normalize(description)} `

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
