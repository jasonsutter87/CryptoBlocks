import { describe, it, expect } from 'vitest'
import { databaseBlocks } from '../definitions/database'

describe('Database Blocks', () => {
  it('defines exactly 10 blocks', () => {
    expect(databaseBlocks).toHaveLength(10)
  })

  it('all blocks belong to the Database category', () => {
    for (const block of databaseBlocks) {
      expect(block.category).toBe('Database')
    }
  })

  it('all blocks use the correct color', () => {
    for (const block of databaseBlocks) {
      expect(block.color).toBe('#2563EB')
    }
  })

  const expectedNames = [
    'create_table',
    'insert_row',
    'update_rows',
    'delete_rows',
    'drop_table',
    'print_table',
    'select_all',
    'select_where',
    'count_rows',
    'get_column',
  ]

  it('contains all expected block names', () => {
    const names = databaseBlocks.map((b) => b.name)
    for (const name of expectedNames) {
      expect(names).toContain(name)
    }
  })

  const statementBlocks = ['create_table', 'insert_row', 'update_rows', 'delete_rows', 'drop_table', 'print_table']
  const valueBlocks = ['select_all', 'select_where', 'count_rows', 'get_column']

  it('statement blocks have no outputs', () => {
    for (const name of statementBlocks) {
      const block = databaseBlocks.find((b) => b.name === name)!
      expect(block.outputs).toHaveLength(0)
    }
  })

  it('value blocks have outputs and value shape', () => {
    for (const name of valueBlocks) {
      const block = databaseBlocks.find((b) => b.name === name)!
      expect(block.outputs.length).toBeGreaterThan(0)
      expect(block.shape).toBe('value')
    }
  })

  it('all JS implementations use window.__tables', () => {
    for (const block of databaseBlocks) {
      expect(block.implementations.javascript).toContain('window.__tables')
    }
  })

  it('all Python implementations use globals()', () => {
    for (const block of databaseBlocks) {
      expect(block.implementations.python).toContain('globals()')
    }
  })

  it('all blocks are synchronous', () => {
    for (const block of databaseBlocks) {
      expect(block.implementations.javascript).not.toMatch(/^async /)
      expect(block.implementations.python).not.toMatch(/^async /)
    }
  })

  it('insert_row JS has number auto-parsing via isNaN', () => {
    const block = databaseBlocks.find((b) => b.name === 'insert_row')!
    expect(block.implementations.javascript).toContain('isNaN')
  })

  it('print_table has ASCII border characters', () => {
    const block = databaseBlocks.find((b) => b.name === 'print_table')!
    expect(block.implementations.javascript).toContain('+')
    expect(block.implementations.javascript).toContain('|')
    expect(block.implementations.javascript).toContain('-')
    expect(block.implementations.python).toContain('+')
    expect(block.implementations.python).toContain('|')
    expect(block.implementations.python).toContain('-')
  })
})
