import { describe, it, expect } from 'vitest'
import { brickTreeToWorkspace, BrickTreeError } from '../brick-tree-to-workspace'

type Blk = Record<string, unknown>

function top(tree: unknown): Blk {
  const ws = brickTreeToWorkspace(tree).workspace as { blocks: { blocks: Blk[] } }
  return ws.blocks.blocks[0]
}

function input(blk: Blk, name: string): Blk {
  return (blk.inputs as Record<string, { block: Blk }>)[name].block
}

function next(blk: Blk): Blk {
  return (blk.next as { block: Blk }).block
}

describe('brickTreeToWorkspace', () => {
  describe('values', () => {
    it('wraps a bare value tree in a print block (werbos prints the result)', () => {
      const blk = top({ brick: 'hash_text', args: { text: { raw: '"hello"' } } })
      expect(blk.type).toBe('cb_print')
      const hash = input(blk, 'message')
      expect(hash.type).toBe('cb_hash_text')
      expect(input(hash, 'text')).toMatchObject({ type: 'text', fields: { TEXT: 'hello' } })
    })

    it('turns literals into text / number / boolean blocks', () => {
      expect(input(top({ print: 'hi' }), 'message')).toMatchObject({ type: 'text', fields: { TEXT: 'hi' } })
      expect(input(top({ print: 7 }), 'message')).toMatchObject({ type: 'math_number', fields: { NUM: 7 } })
      expect(input(top({ print: { raw: 'true' } }), 'message')).toMatchObject({ type: 'logic_boolean' })
    })

    it('reads variables with cb_get_global', () => {
      const v = input(top({ print: { var: 'score' } }), 'message')
      expect(v.type).toBe('cb_get_global')
      expect(input(v, 'name')).toMatchObject({ fields: { TEXT: 'score' } })
    })

    it('nests bricks by input name', () => {
      const add = input(top({ print: { brick: 'add', args: { a: 2, b: { brick: 'multiply', args: { a: 3, b: 4 } } } } }), 'message')
      expect(add.type).toBe('cb_add')
      expect(input(add, 'b').type).toBe('cb_multiply')
    })
  })

  describe('statements', () => {
    it('chains a program list with next pointers', () => {
      const first = top([{ set: 'x', to: 5 }, { print: { var: 'x' } }])
      expect(first.type).toBe('cb_set_global')
      expect(next(first).type).toBe('cb_print')
    })

    it('picks cb_if vs cb_if_else by whether there is an else body', () => {
      expect(top({ if: true, then: [{ print: 'a' }] }).type).toBe('cb_if')
      const ifElse = top({ if: true, then: [{ print: 'a' }], else: [{ print: 'b' }] })
      expect(ifElse.type).toBe('cb_if_else')
      expect(input(ifElse, 'ELSE').type).toBe('cb_print')
    })

    it('converts repeat and while loops', () => {
      const rep = top({ repeat: 3, do: [{ print: 'hi' }] })
      expect(rep.type).toBe('cb_repeat')
      expect(input(rep, 'TIMES')).toMatchObject({ fields: { NUM: 3 } })
      expect(input(rep, 'DO').type).toBe('cb_print')
      expect(top({ while: false, do: [{ print: 'x' }] }).type).toBe('cb_while')
    })

    it('walks a for-of loop with an index over a named list', () => {
      const first = top([{ set: '__src', to: 'abc' }, { for: 'item', in: { var: '__src' }, do: [{ print: { var: 'item' } }] }])
      const idxInit = next(first)
      expect(input(idxInit, 'name')).toMatchObject({ fields: { TEXT: '__idx' } })
      const loop = next(idxInit)
      expect(loop.type).toBe('cb_repeat')
      expect(input(loop, 'TIMES').type).toBe('cb_list_length')
      const setItem = input(loop, 'DO')
      expect(input(setItem, 'name')).toMatchObject({ fields: { TEXT: 'item' } })
      expect(next(setItem).type).toBe('cb_print')
    })
  })

  describe('abstains instead of crashing Blockly', () => {
    it('rejects bricks the Brick Bin does not have', () => {
      expect(() => brickTreeToWorkspace({ brick: 'no_such_brick', args: {} })).toThrow(BrickTreeError)
    })

    it('rejects raw code that is not a literal', () => {
      expect(() => brickTreeToWorkspace({ print: { raw: 'x.map(f)' } })).toThrow(BrickTreeError)
    })

    it('rejects lambdas and valued returns', () => {
      expect(() => brickTreeToWorkspace({ print: { lambda: { params: ['x'], expr: 1 } } })).toThrow(BrickTreeError)
      expect(() => brickTreeToWorkspace({ return: 1 })).toThrow(BrickTreeError)
    })

    it('rejects an empty program', () => {
      expect(() => brickTreeToWorkspace([])).toThrow(BrickTreeError)
    })
  })

  it('warns about args the block does not have', () => {
    const { warnings } = brickTreeToWorkspace({ brick: 'hash_text', args: { text: 'a', salt: 'b' } })
    expect(warnings).toEqual(['hash_text has no input "salt" — ignored'])
  })
})
