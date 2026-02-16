import { describe, it, expect } from 'vitest'
import { validateOutput, calculateStars, countBlocks } from '../validator'

describe('validateOutput', () => {
  it('matches exact lines', () => {
    expect(validateOutput(['Hello World'], ['Hello World'])).toBe(true)
  })

  it('matches multiple lines', () => {
    expect(validateOutput(['3', '2', '1', 'GO!'], ['3', '2', '1', 'GO!'])).toBe(true)
  })

  it('trims whitespace', () => {
    expect(validateOutput(['  Hello  ', ' World '], ['Hello', 'World'])).toBe(true)
  })

  it('returns false on content mismatch', () => {
    expect(validateOutput(['Hello'], ['World'])).toBe(false)
  })

  it('returns false on line count mismatch', () => {
    expect(validateOutput(['Hello', 'World'], ['Hello'])).toBe(false)
  })

  it('returns false on empty actual vs non-empty expected', () => {
    expect(validateOutput([], ['Hello'])).toBe(false)
  })

  it('matches empty arrays', () => {
    expect(validateOutput([], [])).toBe(true)
  })
})

describe('calculateStars', () => {
  it('returns 3 stars for block count <= par - 2 (eagle)', () => {
    expect(calculateStars(3, 5)).toBe(3)
    expect(calculateStars(2, 5)).toBe(3)
    expect(calculateStars(1, 5)).toBe(3)
  })

  it('returns 2 stars for block count <= par', () => {
    expect(calculateStars(5, 5)).toBe(2)
    expect(calculateStars(4, 5)).toBe(2)
  })

  it('returns 1 star for block count > par', () => {
    expect(calculateStars(6, 5)).toBe(1)
    expect(calculateStars(10, 5)).toBe(1)
  })

  it('handles par of 2 correctly', () => {
    expect(calculateStars(0, 2)).toBe(3)
    expect(calculateStars(2, 2)).toBe(2)
    expect(calculateStars(3, 2)).toBe(1)
  })
})

describe('countBlocks', () => {
  it('counts blocks from workspace', () => {
    const mockWorkspace = {
      getAllBlocks: () => [1, 2, 3],
    }
    expect(countBlocks(mockWorkspace)).toBe(3)
  })

  it('returns 0 for empty workspace', () => {
    const mockWorkspace = {
      getAllBlocks: () => [],
    }
    expect(countBlocks(mockWorkspace)).toBe(0)
  })
})
