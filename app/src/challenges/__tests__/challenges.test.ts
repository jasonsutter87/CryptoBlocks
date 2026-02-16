import { describe, it, expect } from 'vitest'
import { allThemes, getChallengeById, getNextChallenge } from '../index'

describe('Challenge data smoke tests', () => {
  it('has 12 themes', () => {
    expect(allThemes).toHaveLength(12)
  })

  for (const theme of allThemes) {
    describe(`theme: ${theme.name}`, () => {
      it('has at least 3 challenges', () => {
        expect(theme.challenges.length).toBeGreaterThanOrEqual(3)
      })

      it('has valid theme metadata', () => {
        expect(theme.id).toBeTruthy()
        expect(theme.name).toBeTruthy()
        expect(theme.description).toBeTruthy()
        expect(theme.icon).toBeTruthy()
        expect(theme.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })

      for (const challenge of theme.challenges) {
        describe(`challenge: ${challenge.title}`, () => {
          it('has a valid id', () => {
            expect(challenge.id).toBeTruthy()
            expect(typeof challenge.id).toBe('string')
          })

          it('has a valid title', () => {
            expect(challenge.title).toBeTruthy()
            expect(typeof challenge.title).toBe('string')
          })

          it('has a valid description', () => {
            expect(challenge.description).toBeTruthy()
            expect(typeof challenge.description).toBe('string')
          })

          it('has non-empty expectedOutput', () => {
            expect(challenge.expectedOutput.length).toBeGreaterThan(0)
          })

          it('has par > 0', () => {
            expect(challenge.par).toBeGreaterThan(0)
          })

          it('has a valid difficulty', () => {
            expect(['beginner', 'intermediate', 'advanced']).toContain(challenge.difficulty)
          })

          it('has hints', () => {
            expect(challenge.hints.length).toBeGreaterThan(0)
          })
        })
      }
    })
  }

  it('has no duplicate challenge IDs', () => {
    const ids = allThemes.flatMap((t) => t.challenges.map((c) => c.id))
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('getChallengeById finds all challenges', () => {
    for (const theme of allThemes) {
      for (const challenge of theme.challenges) {
        expect(getChallengeById(challenge.id)).toEqual(challenge)
      }
    }
  })

  it('getChallengeById returns null for unknown id', () => {
    expect(getChallengeById('nonexistent')).toBeNull()
  })

  it('getNextChallenge returns correct next challenge', () => {
    for (const theme of allThemes) {
      for (let i = 0; i < theme.challenges.length - 1; i++) {
        const next = getNextChallenge(theme.challenges[i].id)
        expect(next).toEqual(theme.challenges[i + 1])
      }
    }
  })

  it('getNextChallenge returns null for last challenge in theme', () => {
    for (const theme of allThemes) {
      const last = theme.challenges[theme.challenges.length - 1]
      expect(getNextChallenge(last.id)).toBeNull()
    }
  })
})
