import { describe, it, expect } from 'vitest'
import { aiBlocks } from '../definitions/ai'

describe('AI Blocks', () => {
  it('defines exactly 10 blocks', () => {
    expect(aiBlocks).toHaveLength(10)
  })

  it('all blocks belong to the AI category', () => {
    for (const block of aiBlocks) {
      expect(block.category).toBe('AI')
    }
  })

  it('all blocks use the correct color', () => {
    for (const block of aiBlocks) {
      expect(block.color).toBe('#7C3AED')
    }
  })

  const expectedNames = [
    'create_classifier',
    'add_example',
    'classify',
    'analyze_sentiment',
    'train_text_generator',
    'generate_text',
    'find_similar',
    'add_data_point',
    'predict_number',
    'ai_summary',
  ]

  it('contains all expected block names', () => {
    const names = aiBlocks.map((b) => b.name)
    for (const name of expectedNames) {
      expect(names).toContain(name)
    }
  })

  const statementBlocks = ['create_classifier', 'add_example', 'train_text_generator', 'add_data_point']
  const valueBlocks = ['classify', 'analyze_sentiment', 'generate_text', 'find_similar', 'predict_number', 'ai_summary']

  it('statement blocks have no outputs', () => {
    for (const name of statementBlocks) {
      const block = aiBlocks.find((b) => b.name === name)!
      expect(block.outputs).toHaveLength(0)
    }
  })

  it('value blocks have outputs and value shape', () => {
    for (const name of valueBlocks) {
      const block = aiBlocks.find((b) => b.name === name)!
      expect(block.outputs.length).toBeGreaterThan(0)
      expect(block.shape).toBe('value')
    }
  })

  const storageBlocks = aiBlocks.filter((b) => !['analyze_sentiment', 'find_similar'].includes(b.name))

  it('storage blocks use window.__ai in JS', () => {
    for (const block of storageBlocks) {
      expect(block.implementations.javascript).toContain('window.__ai')
    }
  })

  it('storage blocks use globals() in Python', () => {
    for (const block of storageBlocks) {
      expect(block.implementations.python).toContain('globals()')
    }
  })

  it('pure function blocks (analyze_sentiment, find_similar) are stateless', () => {
    const sentiment = aiBlocks.find((b) => b.name === 'analyze_sentiment')!
    const similar = aiBlocks.find((b) => b.name === 'find_similar')!
    expect(sentiment.implementations.javascript).not.toContain('window.__ai')
    expect(similar.implementations.javascript).not.toContain('window.__ai')
  })

  it('all blocks are synchronous', () => {
    for (const block of aiBlocks) {
      expect(block.implementations.javascript).not.toMatch(/^async /)
      expect(block.implementations.python).not.toMatch(/^async /)
    }
  })

  it('analyze_sentiment has positive and negative word lists', () => {
    const block = aiBlocks.find((b) => b.name === 'analyze_sentiment')!
    expect(block.implementations.javascript).toContain('good')
    expect(block.implementations.javascript).toContain('bad')
    expect(block.implementations.python).toContain('good')
    expect(block.implementations.python).toContain('bad')
  })

  it('classify uses cosine similarity', () => {
    const block = aiBlocks.find((b) => b.name === 'classify')!
    expect(block.implementations.javascript).toContain('Math.sqrt')
  })

  it('predict_number implements linear regression', () => {
    const block = aiBlocks.find((b) => b.name === 'predict_number')!
    expect(block.implementations.javascript).toContain('slope')
    expect(block.implementations.javascript).toContain('intercept')
    expect(block.implementations.python).toContain('slope')
    expect(block.implementations.python).toContain('intercept')
  })
})
