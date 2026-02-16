import { describe, it, expect } from 'vitest'
import { generateSafeApisCode } from '../safe-apis'

describe('generateSafeApisCode', () => {
  it('returns a non-empty string', () => {
    const code = generateSafeApisCode()
    expect(code.length).toBeGreaterThan(0)
  })

  it('generates valid JavaScript (parseable)', () => {
    const code = generateSafeApisCode()
    // If this throws, the generated code has syntax errors
    expect(() => new Function(code)).not.toThrow()
  })

  it('contains XMLHttpRequest override locked with defineProperty', () => {
    const code = generateSafeApisCode()
    expect(code).toContain("'XMLHttpRequest'")
    expect(code).toContain('XMLHttpRequest is disabled')
    expect(code).toContain('configurable: false')
  })

  it('contains sendBeacon override on Navigator.prototype', () => {
    const code = generateSafeApisCode()
    expect(code).toContain('Navigator.prototype')
    expect(code).toContain('sendBeacon')
    expect(code).toContain('sendBeacon is disabled')
  })

  it('contains EventSource override locked with defineProperty', () => {
    const code = generateSafeApisCode()
    expect(code).toContain("'EventSource'")
    expect(code).toContain('EventSource is disabled')
  })

  it('contains Worker override locked with defineProperty', () => {
    const code = generateSafeApisCode()
    expect(code).toContain("'Worker'")
    expect(code).toContain('Web Workers are disabled')
  })

  it('contains SharedWorker override locked with defineProperty', () => {
    const code = generateSafeApisCode()
    expect(code).toContain("'SharedWorker'")
    expect(code).toContain('SharedWorkers are disabled')
  })

  it('contains ServiceWorker restriction', () => {
    const code = generateSafeApisCode()
    expect(code).toContain('navigator.serviceWorker')
    expect(code).toContain('Object.defineProperty(navigator')
  })

  it('contains modal rate limiting variables', () => {
    const code = generateSafeApisCode()
    expect(code).toContain('var __modalCount')
    expect(code).toContain('var __maxModals')
  })

  it('contains alert override with rate limiting (locked)', () => {
    const code = generateSafeApisCode()
    expect(code).toContain("'alert'")
    expect(code).toContain('__realAlert')
    expect(code).toContain('__modalCount++')
    expect(code).toContain('Too many dialog boxes')
  })

  it('contains confirm override with rate limiting (locked)', () => {
    const code = generateSafeApisCode()
    expect(code).toContain("'confirm'")
    expect(code).toContain('__realConfirm')
  })

  it('contains prompt override with rate limiting (locked)', () => {
    const code = generateSafeApisCode()
    expect(code).toContain("'prompt'")
    expect(code).toContain('__realPrompt')
  })

  it('sets modal limit to 3', () => {
    const code = generateSafeApisCode()
    expect(code).toContain('var __maxModals = 3')
  })

  it('wraps all overrides in IIFE', () => {
    const code = generateSafeApisCode()
    expect(code).toContain(';(function() {')
    expect(code).toContain('})();')
  })
})
