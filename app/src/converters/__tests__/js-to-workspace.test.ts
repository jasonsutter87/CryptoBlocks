import { describe, it, expect } from 'vitest'
import { jsToWorkspace } from '../js-to-workspace'

/** Helper to get the first top-level block from a workspace result. */
function firstBlock(result: ReturnType<typeof jsToWorkspace>) {
  const ws = result.workspace as { blocks: { blocks: Array<Record<string, unknown>> } }
  return ws.blocks.blocks[0]
}

/** Helper to get all top-level blocks from a workspace result. */
function allBlocks(result: ReturnType<typeof jsToWorkspace>) {
  const ws = result.workspace as { blocks: { blocks: Array<Record<string, unknown>> } }
  return ws.blocks.blocks
}

/** Unwrap an input from {block: {...}} wrapper. */
function inputBlock(blk: Record<string, unknown>, inputName: string): Record<string, unknown> {
  const inputs = blk.inputs as Record<string, { block: Record<string, unknown> }>
  return inputs[inputName].block
}

describe('jsToWorkspace', () => {
  describe('statements', () => {
    it('converts console.log("Hello") → cb_print', () => {
      const result = jsToWorkspace('console.log("Hello")')
      const blk = firstBlock(result)
      expect(blk.type).toBe('cb_print')
      const msg = inputBlock(blk, 'message')
      expect(msg.type).toBe('text')
      expect((msg.fields as Record<string, string>).TEXT).toBe('Hello')
    })

    it('converts let x = 5 → cb_set_global with numVal', () => {
      const result = jsToWorkspace('let x = 5')
      const blk = firstBlock(result)
      expect(blk.type).toBe('cb_set_global')
      const name = inputBlock(blk, 'name')
      expect((name.fields as Record<string, string>).TEXT).toBe('x')
      const value = inputBlock(blk, 'value')
      expect(value.type).toBe('math_number')
      expect((value.fields as Record<string, number>).NUM).toBe(5)
    })

    it('converts x = x + 1 → cb_set_global with cb_add nested', () => {
      const result = jsToWorkspace('let x = 0;\nx = x + 1')
      const blocks = allBlocks(result)
      // Second top-level chain or second block in chain
      // x = x + 1 is an assignment
      const setBlock = blocks.length > 1
        ? blocks[1]
        : (blocks[0] as Record<string, unknown> & { next?: { block: Record<string, unknown> } }).next?.block

      expect(setBlock).toBeDefined()
      expect(setBlock!.type).toBe('cb_set_global')
      const value = inputBlock(setBlock as Record<string, unknown>, 'value')
      expect(value.type).toBe('cb_add')
    })

    it('converts if (x > 5) { console.log("big") } → cb_if', () => {
      const result = jsToWorkspace('let x = 10;\nif (x > 5) { console.log("big") }')
      const blocks = allBlocks(result)
      // Find the if block (may be chained)
      let ifBlock: Record<string, unknown> | undefined
      for (const b of blocks) {
        let cur: Record<string, unknown> | undefined = b
        while (cur) {
          if (cur.type === 'cb_if') { ifBlock = cur; break }
          cur = (cur as { next?: { block: Record<string, unknown> } }).next?.block
        }
      }
      expect(ifBlock).toBeDefined()
      expect(ifBlock!.type).toBe('cb_if')
      const cond = inputBlock(ifBlock!, 'CONDITION')
      expect(cond.type).toBe('cb_greater_than')
    })

    it('converts if/else → cb_if_else', () => {
      const result = jsToWorkspace('if (true) { console.log("yes") } else { console.log("no") }')
      const blk = firstBlock(result)
      expect(blk.type).toBe('cb_if_else')
      expect(inputBlock(blk, 'DO')).toBeDefined()
      expect(inputBlock(blk, 'ELSE')).toBeDefined()
    })

    it('converts for loop → cb_repeat with TIMES', () => {
      const result = jsToWorkspace('for (let i = 0; i < 10; i++) { console.log(i) }')
      const blk = firstBlock(result)
      expect(blk.type).toBe('cb_repeat')
      const times = inputBlock(blk, 'TIMES')
      expect(times.type).toBe('math_number')
      expect((times.fields as Record<string, number>).NUM).toBe(10)
    })
  })

  describe('expressions', () => {
    it('converts number literal', () => {
      const result = jsToWorkspace('console.log(42)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('math_number')
      expect((msg.fields as Record<string, number>).NUM).toBe(42)
    })

    it('converts string literal', () => {
      const result = jsToWorkspace('console.log("hello")')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('text')
      expect((msg.fields as Record<string, string>).TEXT).toBe('hello')
    })

    it('converts boolean literal true', () => {
      const result = jsToWorkspace('console.log(true)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('logic_boolean')
      expect((msg.fields as Record<string, string>).BOOL).toBe('TRUE')
    })

    it('converts a + b (numeric) → cb_add', () => {
      const result = jsToWorkspace('console.log(3 + 5)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_add')
    })

    it('converts "a" + b (string) → cb_join_text', () => {
      const result = jsToWorkspace('console.log("hello " + "world")')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_join_text')
    })

    it('converts subtraction → cb_subtract', () => {
      const result = jsToWorkspace('console.log(10 - 3)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_subtract')
    })

    it('converts multiplication → cb_multiply', () => {
      const result = jsToWorkspace('console.log(4 * 5)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_multiply')
    })

    it('converts division → cb_divide', () => {
      const result = jsToWorkspace('console.log(10 / 2)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_divide')
    })

    it('converts > → cb_greater_than', () => {
      const result = jsToWorkspace('console.log(5 > 3)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_greater_than')
    })

    it('converts < → cb_less_than', () => {
      const result = jsToWorkspace('console.log(3 < 5)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_less_than')
    })

    it('converts === → cb_equals', () => {
      const result = jsToWorkspace('console.log(1 === 1)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_equals')
    })

    it('converts && → cb_and', () => {
      const result = jsToWorkspace('console.log(true && false)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_and')
    })

    it('converts || → cb_or', () => {
      const result = jsToWorkspace('console.log(true || false)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_or')
    })

    it('converts !x → cb_not', () => {
      const result = jsToWorkspace('console.log(!true)')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_not')
    })

    it('converts Math.random() → cb_random_number', () => {
      const result = jsToWorkspace('console.log(Math.random())')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_random_number')
    })

    it('converts Math.floor(x) → cb_round', () => {
      const result = jsToWorkspace('console.log(Math.floor(3.7))')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_round')
    })

    it('converts Math.pow(a,b) → cb_power', () => {
      const result = jsToWorkspace('console.log(Math.pow(2, 3))')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_power')
    })

    it('converts .toUpperCase() → cb_uppercase', () => {
      const result = jsToWorkspace('console.log("hi".toUpperCase())')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_uppercase')
    })

    it('converts .includes(s) → cb_contains', () => {
      const result = jsToWorkspace('console.log("hello".includes("ell"))')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_contains')
    })

    it('converts template literal → cb_join_text chain', () => {
      const result = jsToWorkspace('let x = 5;\nconsole.log(`Value is ${x}`)')
      // Find the print block
      const blocks = allBlocks(result)
      let printBlock: Record<string, unknown> | undefined
      for (const b of blocks) {
        let cur: Record<string, unknown> | undefined = b
        while (cur) {
          if (cur.type === 'cb_print') { printBlock = cur; break }
          cur = (cur as { next?: { block: Record<string, unknown> } }).next?.block
        }
      }
      expect(printBlock).toBeDefined()
      const msg = inputBlock(printBlock!, 'message')
      expect(msg.type).toBe('cb_join_text')
    })

    it('converts ternary a ? b : c → cb_if_then', () => {
      const result = jsToWorkspace('console.log(true ? "yes" : "no")')
      const msg = inputBlock(firstBlock(result), 'message')
      expect(msg.type).toBe('cb_if_then')
    })

    it('converts variable reference → cb_get_global', () => {
      const result = jsToWorkspace('let x = 5;\nconsole.log(x)')
      const blocks = allBlocks(result)
      let printBlock: Record<string, unknown> | undefined
      for (const b of blocks) {
        let cur: Record<string, unknown> | undefined = b
        while (cur) {
          if (cur.type === 'cb_print') { printBlock = cur; break }
          cur = (cur as { next?: { block: Record<string, unknown> } }).next?.block
        }
      }
      expect(printBlock).toBeDefined()
      const msg = inputBlock(printBlock!, 'message')
      expect(msg.type).toBe('cb_get_global')
    })
  })

  describe('lists', () => {
    it('converts let arr = [1, 2, 3] → cb_create_list + cb_add_to_list', () => {
      const result = jsToWorkspace('let arr = [1, 2, 3]')
      const blocks = allBlocks(result)
      // First block should be a chain starting with cb_create_list
      const first = blocks[0]
      expect(first.type).toBe('cb_create_list')
      // Follow next chain to find add_to_list blocks
      let cur = first as Record<string, unknown> & { next?: { block: Record<string, unknown> } }
      let addCount = 0
      while (cur.next) {
        cur = cur.next.block as typeof cur
        if (cur.type === 'cb_add_to_list') addCount++
      }
      expect(addCount).toBe(3)
    })

    it('converts arr.forEach(i => console.log(i)) → repeat pattern', () => {
      const code = `let arr = [1, 2, 3]
arr.forEach(function(i) { console.log(i) })`
      const result = jsToWorkspace(code)
      const blocks = allBlocks(result)
      // Should have a cb_repeat block somewhere
      let hasRepeat = false
      for (const b of blocks) {
        let cur: Record<string, unknown> | undefined = b
        while (cur) {
          if (cur.type === 'cb_repeat') { hasRepeat = true; break }
          cur = (cur as { next?: { block: Record<string, unknown> } }).next?.block
        }
      }
      expect(hasRepeat).toBe(true)
    })

    it('converts arr.push(4) → cb_add_to_list', () => {
      const result = jsToWorkspace('let arr = []\narr.push(4)')
      const blocks = allBlocks(result)
      let hasAdd = false
      for (const b of blocks) {
        let cur: Record<string, unknown> | undefined = b
        while (cur) {
          if (cur.type === 'cb_add_to_list') { hasAdd = true; break }
          cur = (cur as { next?: { block: Record<string, unknown> } }).next?.block
        }
      }
      expect(hasAdd).toBe(true)
    })

    it('converts arr.length → cb_list_length', () => {
      const result = jsToWorkspace('let arr = [1, 2]\nconsole.log(arr.length)')
      const blocks = allBlocks(result)
      let printBlock: Record<string, unknown> | undefined
      for (const b of blocks) {
        let cur: Record<string, unknown> | undefined = b
        while (cur) {
          if (cur.type === 'cb_print') { printBlock = cur; break }
          cur = (cur as { next?: { block: Record<string, unknown> } }).next?.block
        }
      }
      expect(printBlock).toBeDefined()
      const msg = inputBlock(printBlock!, 'message')
      expect(msg.type).toBe('cb_list_length')
    })
  })

  describe('functions', () => {
    it('extracts function declaration → newBlocks populated', () => {
      const code = `function double(n) { return n * 2; }\nconsole.log(double(5))`
      const result = jsToWorkspace(code)
      expect(result.newBlocks).toHaveLength(1)
      expect(result.newBlocks[0].name).toBe('double')
    })

    it('function call maps to block with correct inputs', () => {
      const code = `function double(n) { return n * 2; }\nconsole.log(double(5))`
      const result = jsToWorkspace(code)
      const blocks = allBlocks(result)
      // The console.log should contain a call to cb_double
      const printBlock = blocks[0]
      expect(printBlock.type).toBe('cb_print')
      const msg = inputBlock(printBlock, 'message')
      expect(msg.type).toBe('cb_double')
    })
  })

  describe('warnings and errors', () => {
    it('class declaration → warning, skipped', () => {
      const code = `class Foo {}\nconsole.log("hi")`
      const result = jsToWorkspace(code)
      expect(result.warnings).toContain('Class declarations are not supported — skipped')
      // console.log still converted
      expect(firstBlock(result).type).toBe('cb_print')
    })

    it('arrow function variable → warning, skipped', () => {
      const code = `const fn = (x) => x * 2\nconsole.log("hi")`
      const result = jsToWorkspace(code)
      expect(result.warnings.some((w) => w.includes('Arrow/function expressions'))).toBe(true)
    })

    it('unsupported operator → warning', () => {
      // Modulo generates a warning
      const code = `console.log(10 % 3)`
      const result = jsToWorkspace(code)
      expect(result.warnings.some((w) => w.includes('Modulo'))).toBe(true)
    })

    it('parse error (invalid JS) → throws', () => {
      expect(() => jsToWorkspace('function {')).toThrow()
    })
  })

  describe('result shape', () => {
    it('.workspace has correct structure', () => {
      const result = jsToWorkspace('console.log("hello")')
      const ws = result.workspace as { blocks: { languageVersion: number; blocks: unknown[] } }
      expect(ws.blocks).toBeDefined()
      expect(ws.blocks.languageVersion).toBe(0)
      expect(Array.isArray(ws.blocks.blocks)).toBe(true)
    })

    it('.newBlocks is an array', () => {
      const result = jsToWorkspace('console.log("hello")')
      expect(Array.isArray(result.newBlocks)).toBe(true)
    })

    it('.warnings accumulates non-fatal issues', () => {
      const code = `class Foo {}\nconst fn = (x) => x\nconsole.log("ok")`
      const result = jsToWorkspace(code)
      expect(result.warnings.length).toBeGreaterThanOrEqual(2)
    })
  })
})
