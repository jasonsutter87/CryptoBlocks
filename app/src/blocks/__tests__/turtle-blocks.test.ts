import { describe, it, expect } from 'vitest'
import { turtleBlocks } from '../definitions/turtle'

describe('Pen Blocks', () => {
  it('defines exactly 10 blocks', () => {
    expect(turtleBlocks).toHaveLength(10)
  })

  it('all blocks belong to the Pen category', () => {
    for (const b of turtleBlocks) {
      expect(b.category).toBe('Pen')
    }
  })

  it('all blocks use the correct color', () => {
    for (const b of turtleBlocks) {
      expect(b.color).toBe('#14B8A6')
    }
  })

  it('contains all expected block names', () => {
    const names = turtleBlocks.map((b) => b.name)
    expect(names).toContain('pen_start')
    expect(names).toContain('pen_forward')
    expect(names).toContain('pen_backward')
    expect(names).toContain('pen_right')
    expect(names).toContain('pen_left')
    expect(names).toContain('pen_up')
    expect(names).toContain('pen_down')
    expect(names).toContain('pen_set_color')
    expect(names).toContain('pen_set_width')
    expect(names).toContain('pen_go_to')
  })

  it('all blocks are statement blocks', () => {
    for (const b of turtleBlocks) {
      expect(b.shape).toBe('statement')
      expect(b.outputs).toHaveLength(0)
    }
  })

  it('all Python implementations show JS-only message', () => {
    for (const b of turtleBlocks) {
      expect(b.implementations.python).toContain('only available in JavaScript')
    }
  })

  it('pen_start creates canvas and initializes state', () => {
    const block = turtleBlocks.find((b) => b.name === 'pen_start')!
    expect(block.implementations.javascript).toContain('cb-canvas')
    expect(block.implementations.javascript).toContain('__turtle')
    expect(block.implementations.javascript).toContain('heading')
    expect(block.implementations.javascript).toContain('penDown')
  })

  it('pen_forward uses trigonometry for movement', () => {
    const block = turtleBlocks.find((b) => b.name === 'pen_forward')!
    expect(block.implementations.javascript).toContain('Math.sin')
    expect(block.implementations.javascript).toContain('Math.cos')
    expect(block.implementations.javascript).toContain('stroke')
  })

  it('heading-based blocks modify heading', () => {
    const right = turtleBlocks.find((b) => b.name === 'pen_right')!
    const left = turtleBlocks.find((b) => b.name === 'pen_left')!
    expect(right.implementations.javascript).toContain('heading')
    expect(left.implementations.javascript).toContain('heading')
    // Left should handle wrap-around
    expect(left.implementations.javascript).toContain('360')
  })

  it('pen blocks toggle penDown state', () => {
    const up = turtleBlocks.find((b) => b.name === 'pen_up')!
    const down = turtleBlocks.find((b) => b.name === 'pen_down')!
    expect(up.implementations.javascript).toContain('false')
    expect(down.implementations.javascript).toContain('true')
  })
})
