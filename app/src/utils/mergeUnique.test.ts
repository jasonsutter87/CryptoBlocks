import { describe, it, expect } from 'vitest'
import { mergeUnique } from './mergeUnique'

describe('mergeUnique', () => {
  it('appends items with new ids', () => {
    const existing = [{ id: 'a' }, { id: 'b' }]
    const incoming = [{ id: 'c' }]
    const result = mergeUnique(existing, incoming)
    expect(result).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
  })

  it('filters out items already present', () => {
    const existing = [{ id: 'a' }, { id: 'b' }]
    const incoming = [{ id: 'b' }, { id: 'c' }]
    const result = mergeUnique(existing, incoming)
    expect(result).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
  })

  it('returns same reference when all incoming are duplicates', () => {
    const existing = [{ id: 'a' }, { id: 'b' }]
    const incoming = [{ id: 'a' }, { id: 'b' }]
    const result = mergeUnique(existing, incoming)
    expect(result).toBe(existing)
  })

  it('returns same reference when incoming is empty', () => {
    const existing = [{ id: 'a' }]
    const result = mergeUnique(existing, [])
    expect(result).toBe(existing)
  })

  it('handles empty existing', () => {
    const result = mergeUnique([], [{ id: 'a' }])
    expect(result).toEqual([{ id: 'a' }])
  })

  it('handles both empty', () => {
    const existing: { id: string }[] = []
    expect(mergeUnique(existing, [])).toBe(existing)
  })

  it('preserves extra properties', () => {
    const existing = [{ id: 'a', body: 'hello' }]
    const incoming = [{ id: 'b', body: 'world' }]
    const result = mergeUnique(existing, incoming)
    expect(result[1]).toEqual({ id: 'b', body: 'world' })
  })
})
