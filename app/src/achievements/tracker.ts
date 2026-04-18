import type { Achievement, UnlockedAchievement } from './types'
import { achievements } from './definitions'
import { getClerkToken } from '../auth'

const STORAGE_KEY = 'cb-achievements'
const LANGUAGES_KEY = 'cb-languages-used'
const RUNS_KEY = 'cb-total-runs'

/** Well-known IDs for seeded example projects. Hackable by design —
 *  nerds who recognize the numbers earn secret badges. */
export const HELLO_WORLD_SEED_ID = 'cb-seed-hello-world'

const SEED_BADGES: Record<string, string> = {
  'cb-seed-hello-world': 'hello-indeed',
  'cb-seed-42': 'deep-thought',
  'cb-seed-1729': 'taxicab',
  'cb-seed-1337': 'elite',
  'cb-seed-2600': 'phreaker',
  'cb-seed-404': 'not-found',
}

export interface AchievementContext {
  event: 'run' | 'challenge-complete' | 'golf-complete' | 'lab-complete' | 'hacker-mode' | 'custom-block' | 'remix'
  output?: string[]
  hasError?: boolean
  blockCount?: number
  categoriesUsed?: string[]
  language?: string
  challengeStars?: number
  parentProjectId?: string
}

export function loadUnlocked(): UnlockedAchievement[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function isUnlocked(id: string): boolean {
  const unlocked = loadUnlocked()
  return unlocked.some((u) => u.achievementId === id)
}

function saveUnlocked(unlocked: UnlockedAchievement[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
}

function getLanguagesUsed(): string[] {
  try {
    const data = localStorage.getItem(LANGUAGES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function addLanguageUsed(language: string): void {
  const languages = getLanguagesUsed()
  if (!languages.includes(language)) {
    languages.push(language)
    localStorage.setItem(LANGUAGES_KEY, JSON.stringify(languages))
  }
}

function getTotalRuns(): number {
  try {
    const data = localStorage.getItem(RUNS_KEY)
    return data ? parseInt(data, 10) : 0
  } catch {
    return 0
  }
}

function incrementTotalRuns(): number {
  const count = getTotalRuns() + 1
  localStorage.setItem(RUNS_KEY, count.toString())
  return count
}

function checkAchievement(achievement: Achievement, context: AchievementContext): boolean {
  // Skip if already unlocked
  if (isUnlocked(achievement.id)) {
    return false
  }

  switch (achievement.id) {
    case 'first-run':
      return context.event === 'run'

    case 'hello-world':
      if (!context.output) return false
      return context.output.some((line) => /hello\s*world/i.test(line))

    case 'polyglot': {
      const languages = getLanguagesUsed()
      return languages.includes('javascript') && languages.includes('python')
    }

    case 'block-party':
      return (context.blockCount ?? 0) >= 50

    case 'night-owl': {
      const hour = new Date().getHours()
      return hour >= 23 || hour < 5
    }

    case 'speed-demon':
      return context.event === 'challenge-complete'

    case 'eagle-eye':
      return context.challengeStars === 3

    case 'easter-egg-hunter':
      return context.event === 'hacker-mode'

    case 'code-golfer':
      return context.event === 'golf-complete'

    case 'lab-rat':
      return context.event === 'lab-complete'

    case 'centurion': {
      const totalRuns = getTotalRuns()
      return totalRuns >= 100
    }

    case 'architect':
      return context.event === 'custom-block'

    case 'turtle-power':
      return context.categoriesUsed?.includes('Pen') ?? false

    case 'mad-scientist':
      return (context.categoriesUsed?.length ?? 0) >= 5

    case 'the-answer':
      if (!context.output) return false
      return context.output.some((line) => line.trim() === '42')

    default: {
      // Seed badges — remix a hidden seed project to earn its secret badge
      if (context.event !== 'remix' || !context.parentProjectId) return false
      return SEED_BADGES[context.parentProjectId] === achievement.id
    }
  }
}

export function checkAchievements(context: AchievementContext): Achievement[] {
  // Track language usage
  if (context.event === 'run' && context.language) {
    addLanguageUsed(context.language)
  }

  // Increment total runs counter
  if (context.event === 'run') {
    incrementTotalRuns()
  }

  // Check all achievements
  const newlyUnlocked: Achievement[] = []
  const unlocked = loadUnlocked()

  for (const achievement of achievements) {
    if (checkAchievement(achievement, context)) {
      const unlockedAchievement: UnlockedAchievement = {
        achievementId: achievement.id,
        unlockedAt: Date.now(),
      }
      unlocked.push(unlockedAchievement)
      newlyUnlocked.push(achievement)
    }
  }

  // Save updated unlocked list
  if (newlyUnlocked.length > 0) {
    saveUnlocked(unlocked)
    // Sync to server in background (fire-and-forget)
    syncToServer(newlyUnlocked.map((a) => a.id))
  }

  return newlyUnlocked
}

/** Fire-and-forget sync of newly unlocked achievements to the server. */
async function syncToServer(achievementIds: string[]): Promise<void> {
  try {
    const token = await getClerkToken()
    if (!token) return
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    await Promise.all(achievementIds.map((id) =>
      fetch('/api/achievements/unlock', {
        method: 'POST', headers,
        body: JSON.stringify({ achievementId: id }),
      }).catch(() => { /* offline — localStorage is the fallback */ }),
    ))
  } catch { /* silent */ }
}

/** Pull server-side unlocks into localStorage (call on sign-in). */
export async function syncFromServer(): Promise<void> {
  try {
    const token = await getClerkToken()
    if (!token) return
    const res = await fetch('/api/achievements/my', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) return
    const data = await res.json()
    const serverUnlocks: { achievementId: string; unlockedAt: number }[] = data.unlocked ?? []
    if (serverUnlocks.length === 0) return

    const local = loadUnlocked()
    const localIds = new Set(local.map((u) => u.achievementId))

    // Merge server → local (server wins on conflicts)
    let changed = false
    for (const s of serverUnlocks) {
      if (!localIds.has(s.achievementId)) {
        local.push({ achievementId: s.achievementId, unlockedAt: s.unlockedAt })
        changed = true
      }
    }
    if (changed) saveUnlocked(local)

    // Push any local-only unlocks to server
    const serverIds = new Set(serverUnlocks.map((u) => u.achievementId))
    const localOnly = local.filter((u) => !serverIds.has(u.achievementId)).map((u) => u.achievementId)
    if (localOnly.length > 0) syncToServer(localOnly)
  } catch { /* offline */ }
}
