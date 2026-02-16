import { describe, it, expect } from 'vitest'
import { registry } from '../registry'

describe('Block smoke tests', () => {
  const allBlocks = registry.getAll()

  it('has blocks loaded', () => {
    expect(allBlocks.length).toBeGreaterThan(0)
  })

  for (const block of allBlocks) {
    describe(`block: ${block.name}`, () => {
      it('has a valid name', () => {
        expect(block.name).toBeTruthy()
        expect(typeof block.name).toBe('string')
        expect(block.name).toMatch(/^[a-z][a-z0-9_]*$/)
      })

      it('has a valid category', () => {
        expect(block.category).toBeTruthy()
        expect(typeof block.category).toBe('string')
      })

      it('has a valid color', () => {
        expect(block.color).toBeTruthy()
        expect(block.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })

      // Secret (???) blocks use inline code / IIFEs, not function definitions
      if (block.category !== '???') {
        it('has a JavaScript implementation', () => {
          const js = block.implementations.javascript
          expect(js).toBeTruthy()
          expect(js).toMatch(/function\s+\w+/)
        })

        it('has a Python implementation', () => {
          const py = block.implementations.python
          expect(py).toBeTruthy()
          expect(py).toMatch(/def\s+\w+/)
        })
      } else {
        it('has implementations', () => {
          expect(block.implementations.javascript).toBeTruthy()
          expect(block.implementations.python).toBeTruthy()
        })
      }
    })
  }

  it('has no duplicate block names', () => {
    const names = allBlocks.map((b) => b.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })
})
