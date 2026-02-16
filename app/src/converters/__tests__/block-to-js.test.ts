import { describe, it, expect } from 'vitest'
import { blockToJs } from '../block-to-js'
import type { BlockDefinition } from '../../types/block'

function makeBlock(overrides: Partial<BlockDefinition> = {}): BlockDefinition {
  return {
    name: 'add',
    author: 'Test',
    version: '1.0.0',
    description: 'Add two numbers',
    category: 'Math',
    inputs: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: 'function add(a, b) {\n  return a + b;\n}',
      python: 'def add(a, b):\n    return a + b',
    },
    tests: [],
    color: '#5B80A5',
    ...overrides,
  }
}

describe('blockToJs', () => {
  describe('JavaScript output', () => {
    it('includes function implementation', () => {
      const result = blockToJs(makeBlock())
      expect(result).toContain('function add(a, b)')
      expect(result).toContain('return a + b')
    })

    it('includes example call with console.log when block has outputs', () => {
      const result = blockToJs(makeBlock())
      expect(result).toContain('console.log(add(1, 1))')
    })

    it('includes bare call when block has no outputs', () => {
      const result = blockToJs(makeBlock({
        outputs: [],
        implementations: {
          javascript: 'function log(msg) {\n  console.log(msg);\n}',
          python: 'def log(msg):\n    print(msg)',
        },
        inputs: [{ name: 'msg', type: 'string', description: 'Message' }],
      }))
      expect(result).toContain('log("hello");')
      expect(result).not.toContain('console.log(log')
    })

    it('skips example section when no inputs', () => {
      const result = blockToJs(makeBlock({
        inputs: [],
        implementations: {
          javascript: 'function noop() {}',
          python: 'def noop():\n    pass',
        },
      }))
      expect(result).not.toContain('Example usage')
    })
  })

  describe('Python output', () => {
    it('outputs Python def with example', () => {
      const result = blockToJs(makeBlock(), { language: 'python' })
      expect(result).toContain('def add(a, b)')
      expect(result).toContain('return a + b')
      expect(result).toContain('print(add(1, 1))')
    })

    it('uses True/False for boolean defaults', () => {
      const result = blockToJs(makeBlock({
        inputs: [{ name: 'flag', type: 'boolean', description: 'Flag', default: true }],
        outputs: [{ name: 'result', type: 'boolean' }],
      }), { language: 'python' })
      expect(result).toContain('True')
    })

    it('uses None for any-type defaults', () => {
      const result = blockToJs(makeBlock({
        inputs: [{ name: 'x', type: 'any', description: 'Value' }],
        outputs: [],
      }), { language: 'python' })
      expect(result).toContain('None')
    })
  })

  describe('default value formatting', () => {
    it('formats number defaults', () => {
      const result = blockToJs(makeBlock({
        inputs: [
          { name: 'n', type: 'number', description: 'Number', default: 42 },
        ],
        outputs: [{ name: 'result', type: 'number' }],
      }))
      expect(result).toContain('add(42)')
    })

    it('formats string defaults', () => {
      const result = blockToJs(makeBlock({
        inputs: [
          { name: 's', type: 'string', description: 'String', default: 'world' },
        ],
        outputs: [{ name: 'result', type: 'string' }],
      }))
      expect(result).toContain('"world"')
    })

    it('formats JS boolean defaults', () => {
      const result = blockToJs(makeBlock({
        inputs: [{ name: 'flag', type: 'boolean', description: 'Flag', default: true }],
        outputs: [{ name: 'result', type: 'boolean' }],
      }), { language: 'javascript' })
      expect(result).toContain('true')
    })

    it('formats JS null fallback for any type', () => {
      const result = blockToJs(makeBlock({
        inputs: [{ name: 'x', type: 'any', description: 'Value' }],
        outputs: [],
      }), { language: 'javascript' })
      expect(result).toContain('null')
    })
  })

  describe('header option', () => {
    it('includes header comment by default', () => {
      const result = blockToJs(makeBlock())
      expect(result).toContain('// Add two numbers')
      expect(result).toContain('// Block: add')
    })

    it('excludes header when includeHeader is false', () => {
      const result = blockToJs(makeBlock(), { includeHeader: false })
      expect(result).not.toContain('// Add two numbers')
      expect(result).not.toContain('// Block: add')
    })
  })

  describe('test data in output', () => {
    it('shows expected output when tests array is non-empty', () => {
      const result = blockToJs(makeBlock({
        tests: [{ input: { a: 1, b: 2 }, expected: { result: 3 } }],
      }))
      expect(result).toContain('// Output: 3')
    })
  })

  describe('function name extraction', () => {
    it('extracts JS function name', () => {
      const result = blockToJs(makeBlock({
        implementations: {
          javascript: 'function fooBar(x) { return x; }',
          python: 'def foo_bar(x):\n    return x',
        },
        inputs: [{ name: 'x', type: 'any', description: 'Value' }],
        outputs: [{ name: 'result', type: 'any' }],
      }))
      expect(result).toContain('console.log(fooBar(')
    })

    it('extracts Python function name', () => {
      const result = blockToJs(makeBlock({
        implementations: {
          javascript: 'function fooBar(x) { return x; }',
          python: 'def foo_bar(x):\n    return x',
        },
        inputs: [{ name: 'x', type: 'any', description: 'Value' }],
        outputs: [{ name: 'result', type: 'any' }],
      }), { language: 'python' })
      expect(result).toContain('print(foo_bar(')
    })
  })

  describe('error handling', () => {
    it('throws when language implementation is missing', () => {
      const block = makeBlock()
      delete (block.implementations as Record<string, string>).python
      expect(() => blockToJs(block, { language: 'python' })).toThrow('No python implementation')
    })
  })
})
