import { describe, it, expect } from 'vitest'
import { secretBlocks } from '../definitions/secrets'

describe('Secret Blocks', () => {
  it('defines exactly 10 blocks', () => {
    expect(secretBlocks).toHaveLength(10)
  })

  it('all blocks belong to the ??? category', () => {
    for (const b of secretBlocks) {
      expect(b.category).toBe('???')
    }
  })

  it('contains all expected block names', () => {
    const names = secretBlocks.map((b) => b.name)
    expect(names).toContain('the_answer')
    expect(names).toContain('vogon_poetry')
    expect(names).toContain('golden_ticket')
    expect(names).toContain('dont_panic')
    expect(names).toContain('beware_leopard')
    expect(names).toContain('xyzzy')
    expect(names).toContain('taxicab')
    expect(names).toContain('towel')
    expect(names).toContain('so_long_fish')
    expect(names).toContain('improbability_drive')
  })

  it('the_answer returns 42', () => {
    const block = secretBlocks.find((b) => b.name === 'the_answer')!
    expect(block.implementations.javascript).toContain('42')
    expect(block.implementations.python).toContain('42')
    expect(block.tests[0].expected).toEqual({ answer: 42 })
  })

  it('taxicab returns 1729 (Hardy-Ramanujan number)', () => {
    const block = secretBlocks.find((b) => b.name === 'taxicab')!
    expect(block.implementations.javascript).toContain('1729')
    expect(block.description).toContain('two cubes')
  })

  it('vogon_poetry generates random poetry', () => {
    const block = secretBlocks.find((b) => b.name === 'vogon_poetry')!
    expect(block.implementations.javascript).toContain('putrid')
    expect(block.implementations.javascript).toContain('earwax')
    expect(block.implementations.javascript).toContain('squelch')
  })

  it('golden_ticket and so_long_fish are statement blocks', () => {
    const ticket = secretBlocks.find((b) => b.name === 'golden_ticket')!
    const fish = secretBlocks.find((b) => b.name === 'so_long_fish')!
    expect(ticket.shape).toBe('statement')
    expect(fish.shape).toBe('statement')
  })

  it('value blocks have correct shape', () => {
    const valueBlocks = secretBlocks.filter((b) => b.shape === 'value')
    expect(valueBlocks.length).toBe(8)
    for (const b of valueBlocks) {
      expect(b.outputs.length).toBeGreaterThan(0)
    }
  })

  it('all blocks have both JS and Python implementations', () => {
    for (const b of secretBlocks) {
      expect(b.implementations.javascript).toBeTruthy()
      expect(b.implementations.python).toBeTruthy()
    }
  })

  it('xyzzy references Colossal Cave Adventure', () => {
    const block = secretBlocks.find((b) => b.name === 'xyzzy')!
    expect(block.implementations.javascript).toContain('Nothing happens.')
    expect(block.author).toBe('Will Crowther')
    expect(block.version).toBe('1976.0.0')
  })

  it('authors are literary/historical references', () => {
    const authors = secretBlocks.map((b) => b.author)
    expect(authors).toContain('Deep Thought')
    expect(authors).toContain('Prostetnic Vogon Jeltz')
    expect(authors).toContain('Charlie Bucket')
    expect(authors).toContain('Ford Prefect')
    expect(authors).toContain('Arthur Dent')
    expect(authors).toContain('Srinivasa Ramanujan')
    expect(authors).toContain('Zaphod Beeblebrox')
  })

  it('golden_ticket uses the special gold color', () => {
    const block = secretBlocks.find((b) => b.name === 'golden_ticket')!
    expect(block.color).toBe('#FFD700')
  })

  it('most blocks use matrix green color', () => {
    const greenBlocks = secretBlocks.filter((b) => b.color === '#00ff41')
    expect(greenBlocks.length).toBe(9) // all except golden_ticket
  })
})
