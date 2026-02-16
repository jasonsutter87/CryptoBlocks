import { describe, it, expect } from 'vitest'
import { gamesBlocks } from '../definitions/games'

describe('Games Blocks', () => {
  it('defines exactly 10 blocks', () => {
    expect(gamesBlocks).toHaveLength(10)
  })

  it('all blocks belong to the Games category', () => {
    for (const block of gamesBlocks) {
      expect(block.category).toBe('Games')
    }
  })

  it('all blocks use the correct color', () => {
    for (const block of gamesBlocks) {
      expect(block.color).toBe('#EA580C')
    }
  })

  const expectedNames = [
    'create_sprite',
    'move_sprite',
    'set_sprite_position',
    'get_sprite_x',
    'get_sprite_y',
    'sprites_touching',
    'remove_sprite',
    'draw_all_sprites',
    'set_score',
    'get_score',
  ]

  it('contains all expected block names', () => {
    const names = gamesBlocks.map((b) => b.name)
    for (const name of expectedNames) {
      expect(names).toContain(name)
    }
  })

  const statementBlocks = ['create_sprite', 'move_sprite', 'set_sprite_position', 'remove_sprite', 'draw_all_sprites', 'set_score']
  const valueBlocks = ['get_sprite_x', 'get_sprite_y', 'sprites_touching', 'get_score']

  it('statement blocks have no outputs', () => {
    for (const name of statementBlocks) {
      const block = gamesBlocks.find((b) => b.name === name)!
      expect(block.outputs).toHaveLength(0)
    }
  })

  it('value blocks have outputs and value shape', () => {
    for (const name of valueBlocks) {
      const block = gamesBlocks.find((b) => b.name === name)!
      expect(block.outputs.length).toBeGreaterThan(0)
      expect(block.shape).toBe('value')
    }
  })

  it('all JS implementations use window.__game', () => {
    for (const block of gamesBlocks) {
      expect(block.implementations.javascript).toContain('window.__game')
    }
  })

  it('all Python implementations show JS-only message', () => {
    for (const block of gamesBlocks) {
      expect(block.implementations.python).toContain('[Games are only available in JavaScript mode]')
    }
  })

  it('all blocks are synchronous', () => {
    for (const block of gamesBlocks) {
      expect(block.implementations.javascript).not.toMatch(/^async /)
      expect(block.implementations.python).not.toMatch(/^async /)
    }
  })

  it('sprites_touching implements AABB collision', () => {
    const block = gamesBlocks.find((b) => b.name === 'sprites_touching')!
    const js = block.implementations.javascript
    expect(js).toContain('.x')
    expect(js).toContain('.w')
    expect(js).toContain('.y')
    expect(js).toContain('.h')
  })

  it('draw_all_sprites uses canvas', () => {
    const block = gamesBlocks.find((b) => b.name === 'draw_all_sprites')!
    expect(block.implementations.javascript).toContain('cb-canvas')
    expect(block.implementations.javascript).toContain('clearRect')
  })
})
