import { describe, it, expect } from 'vitest'
import { allLabPacks, getExerciseById, getNextExercise, getTotalExerciseCount } from '../index'

describe('Code Lab data smoke tests', () => {
  it('has 5 packs', () => {
    expect(allLabPacks).toHaveLength(5)
  })

  it('has 25 total exercises', () => {
    expect(getTotalExerciseCount()).toBe(25)
  })

  for (const pack of allLabPacks) {
    describe(`pack: ${pack.name}`, () => {
      it('has 5 exercises', () => {
        expect(pack.exercises).toHaveLength(5)
      })

      it('has valid pack metadata', () => {
        expect(pack.id).toBeTruthy()
        expect(pack.name).toBeTruthy()
        expect(pack.description).toBeTruthy()
        expect(pack.icon).toBeTruthy()
        expect(pack.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })

      for (const exercise of pack.exercises) {
        describe(`exercise: ${exercise.title}`, () => {
          it('has a valid id', () => {
            expect(exercise.id).toBeTruthy()
          })

          it('has a valid title and description', () => {
            expect(exercise.title).toBeTruthy()
            expect(exercise.description).toBeTruthy()
          })

          it('has non-empty expectedOutput', () => {
            expect(exercise.expectedOutput.length).toBeGreaterThan(0)
          })

          it('has a valid difficulty', () => {
            expect(['beginner', 'intermediate', 'advanced']).toContain(exercise.difficulty)
          })

          it('has at least one hint', () => {
            expect(exercise.hints.length).toBeGreaterThan(0)
          })
        })
      }
    })
  }

  it('has no duplicate exercise IDs', () => {
    const ids = allLabPacks.flatMap((p) => p.exercises.map((e) => e.id))
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('getExerciseById finds all exercises', () => {
    for (const pack of allLabPacks) {
      for (const exercise of pack.exercises) {
        expect(getExerciseById(exercise.id)).toEqual(exercise)
      }
    }
  })

  it('getExerciseById returns null for unknown id', () => {
    expect(getExerciseById('nonexistent')).toBeNull()
  })

  it('getNextExercise returns correct next exercise', () => {
    for (const pack of allLabPacks) {
      for (let i = 0; i < pack.exercises.length - 1; i++) {
        const next = getNextExercise(pack.exercises[i].id)
        expect(next).toEqual(pack.exercises[i + 1])
      }
    }
  })

  it('getNextExercise returns null for last exercise in pack', () => {
    for (const pack of allLabPacks) {
      const last = pack.exercises[pack.exercises.length - 1]
      expect(getNextExercise(last.id)).toBeNull()
    }
  })
})
