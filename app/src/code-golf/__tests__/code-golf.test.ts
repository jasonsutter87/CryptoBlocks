import { describe, it, expect } from 'vitest'
import { allGolfPacks, getProblemById, getNextProblem, getTotalProblemCount } from '../index'

describe('Code Golf data smoke tests', () => {
  it('has 6 packs', () => {
    expect(allGolfPacks).toHaveLength(6)
  })

  it('has 72 total problems', () => {
    expect(getTotalProblemCount()).toBe(72)
  })

  for (const pack of allGolfPacks) {
    describe(`pack: ${pack.name}`, () => {
      it('has at least 6 problems', () => {
        expect(pack.problems.length).toBeGreaterThanOrEqual(6)
      })

      it('has valid pack metadata', () => {
        expect(pack.id).toBeTruthy()
        expect(pack.name).toBeTruthy()
        expect(pack.description).toBeTruthy()
        expect(pack.icon).toBeTruthy()
        expect(pack.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })

      for (const problem of pack.problems) {
        describe(`problem: ${problem.title}`, () => {
          it('has a valid id', () => {
            expect(problem.id).toBeTruthy()
          })

          it('has a valid title and description', () => {
            expect(problem.title).toBeTruthy()
            expect(problem.description).toBeTruthy()
          })

          it('has non-empty expectedOutput', () => {
            expect(problem.expectedOutput.length).toBeGreaterThan(0)
          })

          it('has par > 0', () => {
            expect(problem.par).toBeGreaterThan(0)
          })

          it('has a valid difficulty', () => {
            expect(['easy', 'medium', 'hard']).toContain(problem.difficulty)
          })
        })
      }
    })
  }

  it('has no duplicate problem IDs', () => {
    const ids = allGolfPacks.flatMap((p) => p.problems.map((pr) => pr.id))
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('getProblemById finds all problems', () => {
    for (const pack of allGolfPacks) {
      for (const problem of pack.problems) {
        expect(getProblemById(problem.id)).toEqual(problem)
      }
    }
  })

  it('getProblemById returns null for unknown id', () => {
    expect(getProblemById('nonexistent')).toBeNull()
  })

  it('getNextProblem returns correct next problem', () => {
    for (const pack of allGolfPacks) {
      for (let i = 0; i < pack.problems.length - 1; i++) {
        const next = getNextProblem(pack.problems[i].id)
        expect(next).toEqual(pack.problems[i + 1])
      }
    }
  })

  it('getNextProblem returns null for last problem in pack', () => {
    for (const pack of allGolfPacks) {
      const last = pack.problems[pack.problems.length - 1]
      expect(getNextProblem(last.id)).toBeNull()
    }
  })
})
