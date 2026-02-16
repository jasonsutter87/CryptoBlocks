import { describe, it, expect } from 'vitest'
import { jsToBlock } from '../js-to-block'

describe('jsToBlock', () => {
  describe('basic parsing', () => {
    it('parses a simple function with two params', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code)
      expect(block.name).toBe('add')
      expect(block.inputs).toHaveLength(2)
      expect(block.inputs[0].name).toBe('a')
      expect(block.inputs[1].name).toBe('b')
      expect(block.outputs).toHaveLength(1)
    })

    it('detects async functions', () => {
      const code = `async function wait(sec) { await new Promise(r => setTimeout(r, sec * 1000)); }`
      const block = jsToBlock(code)
      expect(block.name).toBe('wait')
      expect(block.inputs).toHaveLength(1)
    })

    it('parses a function with no params', () => {
      const code = `function greet() { console.log("Hello"); }`
      const block = jsToBlock(code)
      expect(block.name).toBe('greet')
      expect(block.inputs).toHaveLength(0)
    })
  })

  describe('name conversion', () => {
    it('converts camelCase to snake_case', () => {
      const code = `function myFunction() { return 1; }`
      const block = jsToBlock(code)
      expect(block.name).toBe('my_function')
    })

    it('keeps already snake_case names', () => {
      const code = `function add_numbers(a, b) { return a + b; }`
      const block = jsToBlock(code)
      expect(block.name).toBe('add_numbers')
    })
  })

  describe('param type inference', () => {
    it('infers number from comparison with literal', () => {
      const code = `function check(a) { if (a < 5) return true; return false; }`
      const block = jsToBlock(code)
      expect(block.inputs[0].type).toBe('number')
    })

    it('infers string from .length usage', () => {
      const code = `function measure(text) { return text.length; }`
      const block = jsToBlock(code)
      expect(block.inputs[0].type).toBe('string')
    })

    it('infers boolean from default true', () => {
      const code = `function toggle(flag) { flag = flag || true; return flag; }`
      const block = jsToBlock(code)
      expect(block.inputs[0].type).toBe('boolean')
    })

    it('returns any for ambiguous params', () => {
      const code = `function identity(x) { return x; }`
      const block = jsToBlock(code)
      expect(block.inputs[0].type).toBe('any')
    })
  })

  describe('default value parsing', () => {
    it('parses number default', () => {
      const code = `function delay(ms) { ms = ms || 42; return ms; }`
      const block = jsToBlock(code)
      expect(block.inputs[0].default).toBe(42)
    })

    it('parses string default', () => {
      const code = `function greet(name) { name = name || 'hello'; return name; }`
      const block = jsToBlock(code)
      expect(block.inputs[0].default).toBe('hello')
    })
  })

  describe('return detection', () => {
    it('detects return → outputs populated', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code)
      expect(block.outputs).toHaveLength(1)
      expect(block.outputs[0].type).toBe('any')
    })

    it('no return → empty outputs', () => {
      const code = `function log(msg) { console.log(msg); }`
      const block = jsToBlock(code)
      expect(block.outputs).toHaveLength(0)
    })
  })

  describe('function extraction', () => {
    it('strips trailing console.log example code', () => {
      const code = `function add(a, b) { return a + b; }\nconsole.log(add(1, 2));`
      const block = jsToBlock(code)
      expect(block.implementations.javascript).not.toContain('console.log')
      expect(block.implementations.javascript).toContain('function add')
    })
  })

  describe('Python stub generation', () => {
    it('generates Python with def and correct syntax', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code)
      expect(block.implementations.python).toMatch(/^def add\(a, b\):/)
      expect(block.implementations.python).toContain('return a + b')
    })

    it('converts console.log to print in Python', () => {
      const code = `function say(msg) { console.log(msg); }`
      const block = jsToBlock(code)
      expect(block.implementations.python).toContain('print(msg)')
    })
  })

  describe('error handling', () => {
    it('throws on no function declaration', () => {
      expect(() => jsToBlock('let x = 5;')).toThrow('Could not find a function declaration')
    })

    it('throws on no function body', () => {
      expect(() => jsToBlock('function broken()')).toThrow('Could not find function body')
    })
  })

  describe('options', () => {
    it('applies category option', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code, { category: 'Text' })
      expect(block.category).toBe('Text')
    })

    it('applies color option', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code, { color: '#FF0000' })
      expect(block.color).toBe('#FF0000')
    })

    it('applies shape: statement override', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code, { shape: 'statement' })
      expect(block.shape).toBe('statement')
    })

    it('auto-detects shape as value when return present', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code)
      // value shape doesn't add the field
      expect(block.shape).toBeUndefined()
    })

    it('applies description option', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code, { description: 'My custom desc' })
      expect(block.description).toBe('My custom desc')
    })
  })

  describe('defaults and metadata', () => {
    it('sets default author to CryptoBlocks', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code)
      expect(block.author).toBe('CryptoBlocks')
    })

    it('sets version to 1.0.0', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code)
      expect(block.version).toBe('1.0.0')
    })

    it('has empty tests array', () => {
      const code = `function add(a, b) { return a + b; }`
      const block = jsToBlock(code)
      expect(block.tests).toEqual([])
    })
  })
})
