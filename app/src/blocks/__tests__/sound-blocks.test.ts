import { describe, it, expect } from 'vitest'
import { soundBlocks } from '../definitions/sound'

describe('Sound Blocks', () => {
  it('defines exactly 15 blocks', () => {
    expect(soundBlocks).toHaveLength(15)
  })

  it('all blocks belong to the Sound category', () => {
    for (const block of soundBlocks) {
      expect(block.category).toBe('Sound')
    }
  })

  it('all blocks use the correct color', () => {
    for (const block of soundBlocks) {
      expect(block.color).toBe('#DB2777')
    }
  })

  const expectedNames = [
    'play_drum',
    'play_note',
    'play_tone',
    'set_tempo',
    'set_instrument',
    'play_chord',
    'create_pattern',
    'add_beat',
    'play_pattern',
    'rest',
    'create_track',
    'add_note_to_track',
    'set_track_volume',
    'play_all_tracks',
    'clear_tracks',
  ]

  it('contains all expected block names', () => {
    const names = soundBlocks.map((b) => b.name)
    for (const name of expectedNames) {
      expect(names).toContain(name)
    }
  })

  it('all blocks are statement blocks (no value outputs)', () => {
    for (const block of soundBlocks) {
      expect(block.outputs).toHaveLength(0)
    }
  })

  it('all Python implementations show JS-only message', () => {
    for (const block of soundBlocks) {
      expect(block.implementations.python).toContain('[Sound is only available in JavaScript mode]')
    }
  })

  it('play_drum supports all 6 drum types in JS', () => {
    const block = soundBlocks.find((b) => b.name === 'play_drum')!
    const js = block.implementations.javascript
    expect(js).toContain('"kick"')
    expect(js).toContain('"snare"')
    expect(js).toContain('"hi-hat"')
    expect(js).toContain('"clap"')
    expect(js).toContain('"tom"')
    expect(js).toContain('"cymbal"')
  })

  it('play_drum uses AudioContext', () => {
    const block = soundBlocks.find((b) => b.name === 'play_drum')!
    expect(block.implementations.javascript).toContain('AudioContext')
  })

  it('play_note has note-to-frequency mapping', () => {
    const block = soundBlocks.find((b) => b.name === 'play_note')!
    expect(block.implementations.javascript).toContain('261.63')
    expect(block.implementations.javascript).toContain('440')
  })

  it('play_pattern and rest are async', () => {
    const playPattern = soundBlocks.find((b) => b.name === 'play_pattern')!
    const restBlock = soundBlocks.find((b) => b.name === 'rest')!
    expect(playPattern.implementations.javascript).toMatch(/^async /)
    expect(restBlock.implementations.javascript).toMatch(/^async /)
  })

  it('synchronous blocks do not start with async', () => {
    const syncNames = ['play_drum', 'play_note', 'play_tone', 'set_tempo', 'set_instrument', 'play_chord', 'create_pattern', 'add_beat']
    for (const name of syncNames) {
      const block = soundBlocks.find((b) => b.name === name)!
      expect(block.implementations.javascript).not.toMatch(/^async /)
    }
  })
})
