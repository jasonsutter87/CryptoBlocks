import { describe, it, expect, beforeEach, vi } from 'vitest'
import { achievements } from '../definitions'
import { checkAchievements, loadUnlocked, isUnlocked } from '../tracker'
import type { AchievementContext } from '../tracker'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('Achievement System', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('Achievement Definitions', () => {
    it('has all 15 achievements with valid fields', () => {
      expect(achievements).toHaveLength(15)

      for (const achievement of achievements) {
        expect(achievement.id).toBeTruthy()
        expect(achievement.name).toBeTruthy()
        expect(achievement.description).toBeTruthy()
        expect(achievement.icon).toBeTruthy()
        expect(['common', 'rare', 'epic', 'legendary']).toContain(achievement.rarity)
      }
    })

    it('has no duplicate IDs', () => {
      const ids = achievements.map((a) => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('has exactly 3 secret achievements', () => {
      const secretAchievements = achievements.filter((a) => a.secret)
      expect(secretAchievements).toHaveLength(3)
      expect(secretAchievements.map((a) => a.id)).toContain('easter-egg-hunter')
      expect(secretAchievements.map((a) => a.id)).toContain('turtle-power')
      expect(secretAchievements.map((a) => a.id)).toContain('the-answer')
    })
  })

  describe('Achievement Tracker', () => {
    it('returns first-run on first run event', () => {
      const context: AchievementContext = {
        event: 'run',
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      expect(unlocked).toHaveLength(1)
      expect(unlocked[0].id).toBe('first-run')
    })

    it('returns hello-world when output matches', () => {
      const context: AchievementContext = {
        event: 'run',
        output: ['Hello World!'],
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      const helloWorld = unlocked.find((a) => a.id === 'hello-world')
      expect(helloWorld).toBeDefined()
      expect(helloWorld!.name).toBe('Hello World')
    })

    it('matches hello-world case-insensitively with flexible spacing', () => {
      const context1: AchievementContext = {
        event: 'run',
        output: ['HELLO WORLD'],
        language: 'javascript',
      }

      const unlocked1 = checkAchievements(context1)
      expect(unlocked1.some((a) => a.id === 'hello-world')).toBe(true)

      // Clear and test another variation
      localStorageMock.clear()

      const context2: AchievementContext = {
        event: 'run',
        output: ['helloworld'],
        language: 'javascript',
      }

      const unlocked2 = checkAchievements(context2)
      expect(unlocked2.some((a) => a.id === 'hello-world')).toBe(true)
    })

    it('returns the-answer when output is exactly "42"', () => {
      const context: AchievementContext = {
        event: 'run',
        output: ['42'],
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      const theAnswer = unlocked.find((a) => a.id === 'the-answer')
      expect(theAnswer).toBeDefined()
      expect(theAnswer!.name).toBe('The Answer')
    })

    it('does not unlock the-answer for non-exact matches', () => {
      const context: AchievementContext = {
        event: 'run',
        output: ['The answer is 42'],
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      const theAnswer = unlocked.find((a) => a.id === 'the-answer')
      expect(theAnswer).toBeUndefined()
    })

    it('returns block-party when blockCount >= 50', () => {
      const context: AchievementContext = {
        event: 'run',
        blockCount: 50,
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      const blockParty = unlocked.find((a) => a.id === 'block-party')
      expect(blockParty).toBeDefined()
      expect(blockParty!.name).toBe('Block Party')
    })

    it('returns mad-scientist with 5+ categories', () => {
      const context: AchievementContext = {
        event: 'run',
        categoriesUsed: ['Basics', 'Math', 'Logic', 'Text', 'Lists', 'Web'],
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      const madScientist = unlocked.find((a) => a.id === 'mad-scientist')
      expect(madScientist).toBeDefined()
      expect(madScientist!.name).toBe('Mad Scientist')
    })

    it('does not return mad-scientist with fewer than 5 categories', () => {
      const context: AchievementContext = {
        event: 'run',
        categoriesUsed: ['Basics', 'Math', 'Logic', 'Text'],
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      const madScientist = unlocked.find((a) => a.id === 'mad-scientist')
      expect(madScientist).toBeUndefined()
    })

    it('does not return already unlocked achievements again', () => {
      // First run
      const context1: AchievementContext = {
        event: 'run',
        language: 'javascript',
      }

      const unlocked1 = checkAchievements(context1)
      expect(unlocked1.some((a) => a.id === 'first-run')).toBe(true)

      // Second run - first-run should not be returned again
      const context2: AchievementContext = {
        event: 'run',
        language: 'javascript',
      }

      const unlocked2 = checkAchievements(context2)
      expect(unlocked2.some((a) => a.id === 'first-run')).toBe(false)
    })

    it('tracks polyglot achievement across multiple runs', () => {
      // Run JavaScript
      const jsContext: AchievementContext = {
        event: 'run',
        language: 'javascript',
      }
      checkAchievements(jsContext)

      // Verify polyglot not unlocked yet
      expect(isUnlocked('polyglot')).toBe(false)

      // Run Python
      const pyContext: AchievementContext = {
        event: 'run',
        language: 'python',
      }
      const unlocked = checkAchievements(pyContext)

      // Verify polyglot is now unlocked
      const polyglot = unlocked.find((a) => a.id === 'polyglot')
      expect(polyglot).toBeDefined()
      expect(polyglot!.name).toBe('Polyglot')
    })

    it('tracks total runs for centurion achievement', () => {
      // Run 99 times
      for (let i = 0; i < 99; i++) {
        const context: AchievementContext = {
          event: 'run',
          language: 'javascript',
        }
        checkAchievements(context)
      }

      // Verify centurion not unlocked yet
      expect(isUnlocked('centurion')).toBe(false)

      // 100th run
      const context: AchievementContext = {
        event: 'run',
        language: 'javascript',
      }
      const unlocked = checkAchievements(context)

      // Verify centurion is now unlocked
      const centurion = unlocked.find((a) => a.id === 'centurion')
      expect(centurion).toBeDefined()
      expect(centurion!.name).toBe('Centurion')
    })

    it('unlocks turtle-power when Pen category is used', () => {
      const context: AchievementContext = {
        event: 'run',
        categoriesUsed: ['Basics', 'Pen'],
        language: 'javascript',
      }

      const unlocked = checkAchievements(context)
      const turtlePower = unlocked.find((a) => a.id === 'turtle-power')
      expect(turtlePower).toBeDefined()
      expect(turtlePower!.secret).toBe(true)
    })

    it('unlocks event-based achievements', () => {
      // Golf complete
      const golfContext: AchievementContext = {
        event: 'golf-complete',
      }
      const golfUnlocked = checkAchievements(golfContext)
      expect(golfUnlocked.some((a) => a.id === 'code-golfer')).toBe(true)

      // Lab complete
      const labContext: AchievementContext = {
        event: 'lab-complete',
      }
      const labUnlocked = checkAchievements(labContext)
      expect(labUnlocked.some((a) => a.id === 'lab-rat')).toBe(true)

      // Hacker mode
      const hackerContext: AchievementContext = {
        event: 'hacker-mode',
      }
      const hackerUnlocked = checkAchievements(hackerContext)
      expect(hackerUnlocked.some((a) => a.id === 'easter-egg-hunter')).toBe(true)

      // Custom block
      const customContext: AchievementContext = {
        event: 'custom-block',
      }
      const customUnlocked = checkAchievements(customContext)
      expect(customUnlocked.some((a) => a.id === 'architect')).toBe(true)
    })

    it('unlocks challenge achievements', () => {
      // 3 stars
      const starsContext: AchievementContext = {
        event: 'challenge-complete',
        challengeStars: 3,
      }
      const starsUnlocked = checkAchievements(starsContext)
      expect(starsUnlocked.some((a) => a.id === 'eagle-eye')).toBe(true)

      localStorageMock.clear()

      // Speed demon (event indicates timing was already checked)
      const speedContext: AchievementContext = {
        event: 'challenge-complete',
      }
      const speedUnlocked = checkAchievements(speedContext)
      expect(speedUnlocked.some((a) => a.id === 'speed-demon')).toBe(true)
    })
  })

  describe('Load and Save', () => {
    it('loads empty array when no achievements unlocked', () => {
      const unlocked = loadUnlocked()
      expect(unlocked).toEqual([])
    })

    it('persists unlocked achievements to localStorage', () => {
      const context: AchievementContext = {
        event: 'run',
        language: 'javascript',
      }

      checkAchievements(context)

      const unlocked = loadUnlocked()
      expect(unlocked.length).toBeGreaterThan(0)
      expect(unlocked[0].achievementId).toBe('first-run')
      expect(unlocked[0].unlockedAt).toBeGreaterThan(0)
    })

    it('checks if achievement is unlocked', () => {
      expect(isUnlocked('first-run')).toBe(false)

      const context: AchievementContext = {
        event: 'run',
        language: 'javascript',
      }

      checkAchievements(context)

      expect(isUnlocked('first-run')).toBe(true)
    })
  })
})
