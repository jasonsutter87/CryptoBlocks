import { describe, it, expect } from 'vitest'
import { turtleBlocks } from '../definitions/turtle'

describe('Turtle Blocks', () => {
  it('defines exactly 10 blocks', () => {
    expect(turtleBlocks).toHaveLength(10)
  })

  it('all blocks belong to the Turtle category', () => {
    for (const b of turtleBlocks) {
      expect(b.category).toBe('Turtle')
    }
  })

  it('all blocks use the correct color', () => {
    for (const b of turtleBlocks) {
      expect(b.color).toBe('#14B8A6')
    }
  })

  it('contains all expected block names', () => {
    const names = turtleBlocks.map((b) => b.name)
    expect(names).toContain('turtle_start')
    expect(names).toContain('turtle_forward')
    expect(names).toContain('turtle_backward')
    expect(names).toContain('turtle_right')
    expect(names).toContain('turtle_left')
    expect(names).toContain('turtle_pen_up')
    expect(names).toContain('turtle_pen_down')
    expect(names).toContain('turtle_set_color')
    expect(names).toContain('turtle_set_width')
    expect(names).toContain('turtle_go_to')
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

  it('turtle_start creates canvas and initializes state', () => {
    const block = turtleBlocks.find((b) => b.name === 'turtle_start')!
    expect(block.implementations.javascript).toContain('cb-canvas')
    expect(block.implementations.javascript).toContain('__turtle')
    expect(block.implementations.javascript).toContain('heading')
    expect(block.implementations.javascript).toContain('penDown')
  })

  it('turtle_forward uses trigonometry for movement', () => {
    const block = turtleBlocks.find((b) => b.name === 'turtle_forward')!
    expect(block.implementations.javascript).toContain('Math.sin')
    expect(block.implementations.javascript).toContain('Math.cos')
    expect(block.implementations.javascript).toContain('stroke')
  })

  it('heading-based blocks modify heading', () => {
    const right = turtleBlocks.find((b) => b.name === 'turtle_right')!
    const left = turtleBlocks.find((b) => b.name === 'turtle_left')!
    expect(right.implementations.javascript).toContain('heading')
    expect(left.implementations.javascript).toContain('heading')
    // Left should handle wrap-around
    expect(left.implementations.javascript).toContain('360')
  })

  it('pen blocks toggle penDown state', () => {
    const up = turtleBlocks.find((b) => b.name === 'turtle_pen_up')!
    const down = turtleBlocks.find((b) => b.name === 'turtle_pen_down')!
    expect(up.implementations.javascript).toContain('false')
    expect(down.implementations.javascript).toContain('true')
  })
})
