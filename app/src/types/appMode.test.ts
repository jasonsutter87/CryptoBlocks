import { describe, it, expect } from 'vitest'
import { APP_MODES, isBrowserMode, isActiveMode } from './appMode'
import type { AppMode } from './appMode'

describe('AppMode', () => {
  it('has exactly 9 modes', () => {
    expect(APP_MODES).toHaveLength(9)
  })

  it('includes sandbox as the first entry', () => {
    expect(APP_MODES[0]).toBe('sandbox')
  })

  describe('isBrowserMode', () => {
    const browsers: AppMode[] = ['challenges', 'blocksets', 'code-golf', 'code-lab']
    for (const m of browsers) {
      it(`returns true for ${m}`, () => {
        expect(isBrowserMode(m)).toBe(true)
      })
    }

    it('returns false for sandbox', () => {
      expect(isBrowserMode('sandbox')).toBe(false)
    })

    it('returns false for active modes', () => {
      expect(isBrowserMode('active-challenge')).toBe(false)
    })
  })

  describe('isActiveMode', () => {
    const actives: AppMode[] = ['active-challenge', 'active-blockset', 'active-golf', 'active-lab']
    for (const m of actives) {
      it(`returns true for ${m}`, () => {
        expect(isActiveMode(m)).toBe(true)
      })
    }

    it('returns false for sandbox', () => {
      expect(isActiveMode('sandbox')).toBe(false)
    })

    it('returns false for browser modes', () => {
      expect(isActiveMode('challenges')).toBe(false)
    })
  })
})
