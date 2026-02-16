import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetIds,
  block,
  blockWithStatements,
  textVal,
  numVal,
  boolVal,
  colorVal,
  chain,
  workspace,
} from '../workspaces'

describe('workspace builder helpers', () => {
  beforeEach(() => {
    resetIds()
  })

  describe('resetIds', () => {
    it('resets counter so IDs restart from ex_1', () => {
      block('test_a')
      block('test_b')
      resetIds()
      const b = block('test_c')
      expect(b.id).toBe('ex_1')
    })
  })

  describe('block()', () => {
    it('creates a block with type and auto-generated id', () => {
      const b = block('cb_print')
      expect(b.type).toBe('cb_print')
      expect(b.id).toBe('ex_1')
    })

    it('includes x/y when provided', () => {
      const b = block('cb_print', undefined, undefined, 50, 100)
      expect(b.x).toBe(50)
      expect(b.y).toBe(100)
    })

    it('omits x/y when not provided', () => {
      const b = block('cb_print')
      expect(b.x).toBeUndefined()
      expect(b.y).toBeUndefined()
    })

    it('includes fields when provided', () => {
      const b = block('cb_print', { TEXT: 'hello' })
      expect(b.fields).toEqual({ TEXT: 'hello' })
    })

    it('wraps inputs in {block: val} format', () => {
      const inner = textVal('hi')
      const b = block('cb_print', undefined, { message: inner })
      expect(b.inputs).toBeDefined()
      expect(b.inputs!.message).toEqual({ block: inner })
    })

    it('omits inputs when not provided', () => {
      const b = block('cb_print')
      expect(b.inputs).toBeUndefined()
    })
  })

  describe('blockWithStatements()', () => {
    it('merges value and statement inputs correctly', () => {
      const cond = boolVal(true)
      const body = block('cb_print', undefined, { message: textVal('yes') })
      const b = blockWithStatements(
        'cb_if',
        undefined,
        { CONDITION: cond },
        { DO: body },
      )
      expect(b.type).toBe('cb_if')
      expect(b.inputs!.CONDITION).toEqual({ block: cond })
      expect(b.inputs!.DO).toEqual({ block: body })
    })

    it('includes fields when provided', () => {
      const b = blockWithStatements('cb_repeat', { LABEL: 'loop' }, {}, {})
      expect(b.fields).toEqual({ LABEL: 'loop' })
    })

    it('includes x/y when provided', () => {
      const b = blockWithStatements('cb_if', undefined, {}, {}, 10, 20)
      expect(b.x).toBe(10)
      expect(b.y).toBe(20)
    })
  })

  describe('textVal()', () => {
    it('creates a text block with TEXT field', () => {
      const t = textVal('hello')
      expect(t.type).toBe('text')
      expect(t.fields).toEqual({ TEXT: 'hello' })
      expect(t.id).toBeDefined()
    })
  })

  describe('numVal()', () => {
    it('creates a math_number block with NUM field', () => {
      const n = numVal(42)
      expect(n.type).toBe('math_number')
      expect(n.fields).toEqual({ NUM: 42 })
    })
  })

  describe('boolVal()', () => {
    it('creates TRUE for true', () => {
      const b = boolVal(true)
      expect(b.type).toBe('logic_boolean')
      expect(b.fields).toEqual({ BOOL: 'TRUE' })
    })

    it('creates FALSE for false', () => {
      const b = boolVal(false)
      expect(b.type).toBe('logic_boolean')
      expect(b.fields).toEqual({ BOOL: 'FALSE' })
    })
  })

  describe('colorVal()', () => {
    it('creates a cb_color block with COLOR field', () => {
      const c = colorVal('#FF0000')
      expect(c.type).toBe('cb_color')
      expect(c.fields).toEqual({ COLOR: '#FF0000' })
    })
  })

  describe('chain()', () => {
    it('links blocks via .next.block pointers', () => {
      const a = block('cb_print')
      const b = block('cb_set_global')
      const c = block('cb_print')
      const first = chain(a, b, c)
      expect(first).toBe(a)
      expect(a.next!.block).toBe(b)
      expect(b.next!.block).toBe(c)
      expect(c.next).toBeUndefined()
    })

    it('returns single block with no next pointer', () => {
      const a = block('cb_print')
      const first = chain(a)
      expect(first).toBe(a)
      expect(a.next).toBeUndefined()
    })
  })

  describe('workspace()', () => {
    it('wraps blocks in correct structure', () => {
      const a = block('cb_print')
      const ws = workspace(a)
      expect(ws).toEqual({
        blocks: {
          languageVersion: 0,
          blocks: [a],
        },
      })
    })

    it('accepts multiple top-level blocks', () => {
      const a = block('cb_print')
      const b = block('cb_set_global')
      const ws = workspace(a, b)
      expect((ws.blocks as { blocks: unknown[] }).blocks).toHaveLength(2)
    })
  })

  describe('ID uniqueness', () => {
    it('generates unique IDs across multiple calls', () => {
      const ids = new Set<string>()
      ids.add(block('a').id!)
      ids.add(block('b').id!)
      ids.add(textVal('x').id!)
      ids.add(numVal(1).id!)
      ids.add(boolVal(true).id!)
      ids.add(colorVal('#000').id!)
      expect(ids.size).toBe(6)
    })

    it('IDs restart after reset', () => {
      block('a')
      block('b')
      resetIds()
      expect(block('c').id).toBe('ex_1')
      expect(block('d').id).toBe('ex_2')
    })
  })
})
