import { describe, it, expect } from 'vitest'
import { allBlocksetPacks, getBlocksetById, getNextBlockset, getTotalBlocksetCount } from '../index'

describe('Blockset data smoke tests', () => {
  it('has 6 packs', () => {
    expect(allBlocksetPacks).toHaveLength(6)
  })

  it('has 30 total blocksets', () => {
    expect(getTotalBlocksetCount()).toBe(30)
  })

  for (const pack of allBlocksetPacks) {
    describe(`pack: ${pack.name}`, () => {
      it('has 5 blocksets', () => {
        expect(pack.blocksets).toHaveLength(5)
      })

      it('has valid pack metadata', () => {
        expect(pack.id).toBeTruthy()
        expect(pack.name).toBeTruthy()
        expect(pack.description).toBeTruthy()
        expect(pack.icon).toBeTruthy()
        expect(pack.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })

      for (const blockset of pack.blocksets) {
        describe(`blockset: ${blockset.title}`, () => {
          it('has a valid id', () => {
            expect(blockset.id).toBeTruthy()
          })

          it('has a valid title and description', () => {
            expect(blockset.title).toBeTruthy()
            expect(blockset.description).toBeTruthy()
          })

          it('has non-empty expectedOutput', () => {
            expect(blockset.expectedOutput.length).toBeGreaterThan(0)
          })

          it('has par > 0', () => {
            expect(blockset.par).toBeGreaterThan(0)
          })

          it('has a valid difficulty', () => {
            expect(['beginner', 'intermediate', 'advanced']).toContain(blockset.difficulty)
          })

          it('has at least 2 steps', () => {
            expect(blockset.steps.length).toBeGreaterThanOrEqual(2)
          })

          it('has allowedCategories', () => {
            expect(blockset.allowedCategories.length).toBeGreaterThan(0)
          })

          it('has estimatedMinutes > 0', () => {
            expect(blockset.estimatedMinutes).toBeGreaterThan(0)
          })
        })
      }
    })
  }

  it('has no duplicate blockset IDs', () => {
    const ids = allBlocksetPacks.flatMap((p) => p.blocksets.map((b) => b.id))
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('getBlocksetById finds all blocksets', () => {
    for (const pack of allBlocksetPacks) {
      for (const blockset of pack.blocksets) {
        expect(getBlocksetById(blockset.id)).toEqual(blockset)
      }
    }
  })

  it('getBlocksetById returns null for unknown id', () => {
    expect(getBlocksetById('nonexistent')).toBeNull()
  })

  it('getNextBlockset returns correct next blockset', () => {
    for (const pack of allBlocksetPacks) {
      for (let i = 0; i < pack.blocksets.length - 1; i++) {
        const next = getNextBlockset(pack.blocksets[i].id)
        expect(next).toEqual(pack.blocksets[i + 1])
      }
    }
  })

  it('getNextBlockset returns null for last blockset in pack', () => {
    for (const pack of allBlocksetPacks) {
      const last = pack.blocksets[pack.blocksets.length - 1]
      expect(getNextBlockset(last.id)).toBeNull()
    }
  })
})
