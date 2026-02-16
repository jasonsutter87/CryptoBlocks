import { describe, it, expect } from 'vitest'
import { hardwareBlocks } from '../definitions/hardware'

describe('Hardware Blocks', () => {
  it('defines exactly 10 blocks', () => {
    expect(hardwareBlocks).toHaveLength(10)
  })

  it('all blocks belong to the Hardware category', () => {
    for (const block of hardwareBlocks) {
      expect(block.category).toBe('Hardware')
    }
  })

  it('all blocks use the correct color', () => {
    for (const block of hardwareBlocks) {
      expect(block.color).toBe('#65A30D')
    }
  })

  const expectedNames = [
    'get_screen_width',
    'get_screen_height',
    'get_device_cores',
    'get_platform',
    'get_language',
    'get_timezone',
    'get_color_depth',
    'is_touch_device',
    'get_pixel_ratio',
    'get_memory',
  ]

  it('contains all expected block names', () => {
    const names = hardwareBlocks.map((b) => b.name)
    for (const name of expectedNames) {
      expect(names).toContain(name)
    }
  })

  it('all blocks are value blocks with outputs', () => {
    for (const block of hardwareBlocks) {
      expect(block.outputs.length).toBeGreaterThan(0)
      expect(block.shape).toBe('value')
    }
  })

  it('all blocks have no inputs (device queries)', () => {
    for (const block of hardwareBlocks) {
      expect(block.inputs).toHaveLength(0)
    }
  })

  it('all Python implementations show JS-only message', () => {
    for (const block of hardwareBlocks) {
      expect(block.implementations.python).toContain('[Hardware is only available in JavaScript mode]')
    }
  })

  it('all blocks are synchronous', () => {
    for (const block of hardwareBlocks) {
      expect(block.implementations.javascript).not.toMatch(/^async /)
      expect(block.implementations.python).not.toMatch(/^async /)
    }
  })

  it('get_screen_width uses screen.width', () => {
    const block = hardwareBlocks.find((b) => b.name === 'get_screen_width')!
    expect(block.implementations.javascript).toContain('screen.width')
  })

  it('get_device_cores uses hardwareConcurrency', () => {
    const block = hardwareBlocks.find((b) => b.name === 'get_device_cores')!
    expect(block.implementations.javascript).toContain('hardwareConcurrency')
  })

  it('get_timezone uses Intl.DateTimeFormat', () => {
    const block = hardwareBlocks.find((b) => b.name === 'get_timezone')!
    expect(block.implementations.javascript).toContain('Intl.DateTimeFormat')
  })

  it('is_touch_device checks ontouchstart', () => {
    const block = hardwareBlocks.find((b) => b.name === 'is_touch_device')!
    expect(block.implementations.javascript).toContain('ontouchstart')
  })
})
