import { describe, it, expect } from 'vitest'
import { registry } from '../registry'

describe('BlockRegistry', () => {
  it('loads all built-in blocks', () => {
    const all = registry.getAll()
    expect(all.length).toBeGreaterThanOrEqual(143)
  })

  it('retrieves a block by name', () => {
    const block = registry.get('print')
    expect(block).toBeDefined()
    expect(block!.name).toBe('print')
    expect(block!.category).toBe('Basics')
  })

  it('returns undefined for unknown blocks', () => {
    expect(registry.get('nonexistent_block')).toBeUndefined()
  })

  it('filters blocks by category', () => {
    const mathBlocks = registry.getByCategory('Math')
    expect(mathBlocks.length).toBeGreaterThan(0)
    for (const block of mathBlocks) {
      expect(block.category).toBe('Math')
    }
  })

  it('returns all categories', () => {
    const categories = registry.getCategories()
    expect(categories).toContain('Basics')
    expect(categories).toContain('Math')
    expect(categories).toContain('Text')
    expect(categories).toContain('Logic')
    expect(categories).toContain('Lists')
    expect(categories).toContain('Data')
    expect(categories).toContain('Web')
    expect(categories).toContain('Database')
    expect(categories).toContain('Crypto')
    expect(categories).toContain('AI')
    expect(categories).toContain('Sound')
    expect(categories).toContain('Games')
    expect(categories).toContain('Hardware')
    expect(categories).toContain('Pen')
    expect(categories).toContain('Testing')
    expect(categories).toContain('???')
  })

  it('registers a new block', () => {
    registry.register({
      name: 'test_custom_block',
      author: 'Test',
      version: '1.0.0',
      description: 'A test block',
      category: 'Basics',
      inputs: [],
      outputs: [],
      implementations: {
        javascript: 'function testCustomBlock() { return 1; }',
        python: 'def test_custom_block():\n    return 1',
      },
      tests: [],
      color: '#000000',
    })

    const block = registry.get('test_custom_block')
    expect(block).toBeDefined()
    expect(block!.name).toBe('test_custom_block')
  })

  it('overwrites on duplicate register', () => {
    registry.register({
      name: 'test_custom_block',
      author: 'Test',
      version: '2.0.0',
      description: 'Updated test block',
      category: 'Basics',
      inputs: [],
      outputs: [],
      implementations: {
        javascript: 'function testCustomBlock() { return 2; }',
        python: 'def test_custom_block():\n    return 2',
      },
      tests: [],
      color: '#000000',
    })

    const block = registry.get('test_custom_block')
    expect(block!.version).toBe('2.0.0')
    expect(block!.description).toBe('Updated test block')
  })

  it('includes Web category blocks', () => {
    const webBlocks = registry.getByCategory('Web')
    expect(webBlocks.length).toBe(7)

    const names = webBlocks.map((b) => b.name)
    expect(names).toContain('http_get')
    expect(names).toContain('http_post')
    expect(names).toContain('parse_json')
    expect(names).toContain('get_json_field')
    expect(names).toContain('ws_connect')
    expect(names).toContain('ws_send')
    expect(names).toContain('ws_on_message')
  })

  it('includes Crypto category blocks', () => {
    const cryptoBlocks = registry.getByCategory('Crypto')
    expect(cryptoBlocks.length).toBe(21)

    const names = cryptoBlocks.map((b) => b.name)
    expect(names).toContain('hash_text')
    expect(names).toContain('encrypt_aes')
    expect(names).toContain('hmac_sign')
  })

  it('returns correct category color', () => {
    expect(registry.getCategoryColor('Web')).toBe('#DC2626')
    expect(registry.getCategoryColor('Basics')).toBe('#4C97AF')
  })
})
