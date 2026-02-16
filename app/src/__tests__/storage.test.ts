import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveCustomBlocksToLocal,
  loadFromLocalStorage,
  importBlocksFile,
} from '../storage'
import type { BlockDefinition } from '../types/block'

function validBlock(overrides: Partial<BlockDefinition> = {}): BlockDefinition {
  return {
    name: 'test_block',
    author: 'Test',
    version: '1.0.0',
    description: 'A test block',
    category: 'Math',
    inputs: [{ name: 'a', type: 'number', description: 'Input A' }],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: 'function testBlock(a) {\n  return a;\n}',
      python: 'def test_block(a):\n    return a',
    },
    tests: [],
    color: '#5B80A5',
    ...overrides,
  }
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveCustomBlocksToLocal + loadFromLocalStorage', () => {
    it('round-trips saved blocks', () => {
      const blocks = [validBlock()]
      saveCustomBlocksToLocal(blocks)
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(1)
      expect(loaded.customBlocks[0].name).toBe('test_block')
    })

    it('saves to localStorage as JSON', () => {
      const blocks = [validBlock()]
      saveCustomBlocksToLocal(blocks)
      const raw = localStorage.getItem('cryptoblocks_custom_blocks')
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw!)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed[0].name).toBe('test_block')
    })

    it('returns empty on empty localStorage', () => {
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toEqual([])
      expect(loaded.workspaceState).toBeNull()
    })

    it('returns empty on corrupt localStorage', () => {
      localStorage.setItem('cryptoblocks_custom_blocks', 'not json!!!')
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toEqual([])
    })

    it('returns empty workspaceState on corrupt workspace data', () => {
      localStorage.setItem('cryptoblocks_workspace', '{invalid')
      const loaded = loadFromLocalStorage()
      expect(loaded.workspaceState).toBeNull()
    })
  })

  describe('block validation (sanitizeBlocks)', () => {
    it('valid block passes validation', () => {
      saveCustomBlocksToLocal([validBlock()])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(1)
    })

    it('rejects block with missing name', () => {
      const bad = { ...validBlock(), name: '' }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with missing category', () => {
      const bad = { ...validBlock(), category: '' }
      saveCustomBlocksToLocal([bad as unknown as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with invalid color format', () => {
      const bad = { ...validBlock(), color: '#GGG' }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with 3-digit hex color', () => {
      const bad = { ...validBlock(), color: '#FFF' }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with invalid name (spaces)', () => {
      const bad = { ...validBlock(), name: 'my block' }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with invalid name (special chars)', () => {
      const bad = { ...validBlock(), name: 'my-block!' }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with oversized implementation (>10KB)', () => {
      const bigJs = 'function testBlock(a) {\n' + '  // padding\n'.repeat(1000) + '  return a;\n}'
      const bad = {
        ...validBlock(),
        implementations: { javascript: bigJs, python: 'def test_block(a):\n    return a' },
      }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with non-function javascript', () => {
      const bad = {
        ...validBlock(),
        implementations: { javascript: 'let x = 5;', python: 'def test_block(a):\n    return a' },
      }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('rejects block with non-def python', () => {
      const bad = {
        ...validBlock(),
        implementations: { javascript: 'function testBlock(a) { return a; }', python: 'x = 5' },
      }
      saveCustomBlocksToLocal([bad as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })

    it('sanitizes array — keeps valid, drops invalid', () => {
      const good = validBlock()
      const bad = { ...validBlock(), name: '', color: 'red' }
      saveCustomBlocksToLocal([good, bad as unknown as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(1)
      expect(loaded.customBlocks[0].name).toBe('test_block')
    })

    it('accepts block with valid category', () => {
      const categories = [
        'Basics', 'Math', 'Text', 'Lists', 'Logic', 'Web',
        'Games', 'Sound', 'Art', 'Data', 'Crypto', 'AI', 'Hardware', 'My Blocks',
      ] as const
      for (const cat of categories) {
        const b = validBlock({ category: cat })
        saveCustomBlocksToLocal([b])
        const loaded = loadFromLocalStorage()
        expect(loaded.customBlocks).toHaveLength(1)
      }
    })

    it('rejects block with unknown category', () => {
      const bad = { ...validBlock(), category: 'Unknown' }
      saveCustomBlocksToLocal([bad as unknown as BlockDefinition])
      const loaded = loadFromLocalStorage()
      expect(loaded.customBlocks).toHaveLength(0)
    })
  })

  describe('importBlocksFile', () => {
    it('rejects files over 5MB', async () => {
      const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.blocks', { type: 'application/json' })
      await expect(importBlocksFile(bigFile)).rejects.toThrow('File too large')
    })

    it('rejects invalid JSON', async () => {
      const file = new File(['not json'], 'bad.blocks', { type: 'application/json' })
      await expect(importBlocksFile(file)).rejects.toThrow('Failed to parse')
    })

    it('rejects file without version', async () => {
      const data = JSON.stringify({ customBlocks: [], workspace: {} })
      const file = new File([data], 'no-version.blocks', { type: 'application/json' })
      await expect(importBlocksFile(file)).rejects.toThrow('Invalid .blocks file')
    })

    it('parses a valid .blocks file', async () => {
      const data = JSON.stringify({
        version: 1,
        customBlocks: [validBlock()],
        workspace: { blocks: { languageVersion: 0, blocks: [] } },
      })
      const file = new File([data], 'valid.blocks', { type: 'application/json' })
      const result = await importBlocksFile(file)
      expect(result.customBlocks).toHaveLength(1)
      expect(result.workspaceState).toBeDefined()
    })

    it('sanitizes blocks in imported file', async () => {
      const bad = { ...validBlock(), name: '' }
      const data = JSON.stringify({
        version: 1,
        customBlocks: [validBlock(), bad],
        workspace: { blocks: {} },
      })
      const file = new File([data], 'mixed.blocks', { type: 'application/json' })
      const result = await importBlocksFile(file)
      expect(result.customBlocks).toHaveLength(1)
    })
  })
})
