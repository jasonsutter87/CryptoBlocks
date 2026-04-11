import { describe, it, expect } from 'vitest'
import { EXAMPLES, type Example } from '../index'

describe('EXAMPLES array', () => {
  it('has at least 12 entries', () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(12)
  })

  it('each entry has required fields', () => {
    for (const ex of EXAMPLES) {
      expect(typeof ex.id).toBe('string')
      expect(ex.id.length).toBeGreaterThan(0)
      expect(typeof ex.name).toBe('string')
      expect(ex.name.length).toBeGreaterThan(0)
      expect(typeof ex.description).toBe('string')
      expect(ex.description.length).toBeGreaterThan(0)
      expect(['beginner', 'intermediate', 'advanced', 'pro']).toContain(ex.difficulty)
      expect(Array.isArray(ex.tags)).toBe(true)
      expect(ex.tags.length).toBeGreaterThan(0)
      expect(typeof ex.workspace).toBe('object')
    }
  })

  it('IDs are unique', () => {
    const ids = EXAMPLES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('difficulties are valid enum values', () => {
    const valid = new Set(['beginner', 'intermediate', 'advanced', 'pro'])
    for (const ex of EXAMPLES) {
      expect(valid.has(ex.difficulty)).toBe(true)
    }
  })

  it('tags are non-empty string arrays', () => {
    for (const ex of EXAMPLES) {
      expect(ex.tags.length).toBeGreaterThan(0)
      for (const tag of ex.tags) {
        expect(typeof tag).toBe('string')
        expect(tag.length).toBeGreaterThan(0)
      }
    }
  })

  it('workspace objects have valid blocks.blocks array structure', () => {
    for (const ex of EXAMPLES) {
      const ws = ex.workspace as { blocks: { languageVersion: number; blocks: unknown[] } }
      expect(ws.blocks).toBeDefined()
      expect(ws.blocks.languageVersion).toBe(0)
      expect(Array.isArray(ws.blocks.blocks)).toBe(true)
      expect(ws.blocks.blocks.length).toBeGreaterThan(0)
    }
  })

  it('includes expected example IDs', () => {
    const ids = EXAMPLES.map((e) => e.id)
    expect(ids).toContain('hello-world')
    expect(ids).toContain('quick-math')
    expect(ids).toContain('countdown')
    expect(ids).toContain('coin-flip')
    expect(ids).toContain('rainbow-art')
    expect(ids).toContain('api-explorer')
  })

  it('has at least one example of each difficulty', () => {
    const difficulties = new Set(EXAMPLES.map((e) => e.difficulty))
    expect(difficulties.has('beginner')).toBe(true)
    expect(difficulties.has('intermediate')).toBe(true)
    expect(difficulties.has('advanced')).toBe(true)
  })

  it('all workspace blocks have type and id', () => {
    for (const ex of EXAMPLES) {
      const ws = ex.workspace as { blocks: { blocks: Array<{ type: string; id: string }> } }
      for (const b of ws.blocks.blocks) {
        expect(typeof b.type).toBe('string')
        expect(typeof b.id).toBe('string')
      }
    }
  })
})
