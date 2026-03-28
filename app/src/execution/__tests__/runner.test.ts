import { describe, it, expect } from 'vitest'
import { executeCode } from '../runner'
import type { ExecutionResult, ExecutionHandle } from '../runner'

describe('executeCode', () => {
  describe('empty code fast path', () => {
    it('returns instant empty result for empty string', async () => {
      const handle = executeCode('', 'javascript')
      const result = await handle.promise
      expect(result.output).toEqual([])
      expect(result.error).toBeNull()
      expect(result.returnValue).toBeUndefined()
      expect(result.duration).toBe(0)
    })

    it('returns instant empty result for whitespace-only code', async () => {
      const result = await executeCode('   \n\t  ', 'javascript').promise
      expect(result.output).toEqual([])
      expect(result.error).toBeNull()
      expect(result.duration).toBe(0)
    })

    it('returns instant empty result for empty Python code', async () => {
      const result = await executeCode('', 'python').promise
      expect(result.output).toEqual([])
      expect(result.error).toBeNull()
      expect(result.duration).toBe(0)
    })

    it('abort is a no-op for empty code', () => {
      const handle = executeCode('', 'javascript')
      expect(() => handle.abort()).not.toThrow()
    })
  })

  describe('ExecutionHandle shape', () => {
    it('returns an object with promise and abort', () => {
      const handle = executeCode('', 'javascript')
      expect(handle).toHaveProperty('promise')
      expect(handle).toHaveProperty('abort')
      expect(handle.promise).toBeInstanceOf(Promise)
      expect(typeof handle.abort).toBe('function')
    })
  })

  describe('ExecutionResult shape', () => {
    it('has all required fields', async () => {
      const result = await executeCode('', 'javascript').promise
      expect(result).toHaveProperty('output')
      expect(result).toHaveProperty('error')
      expect(result).toHaveProperty('returnValue')
      expect(result).toHaveProperty('duration')
      expect(Array.isArray(result.output)).toBe(true)
    })
  })
})
