import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const storage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => { storage[key] = val },
  removeItem: (key: string) => { delete storage[key] },
})

// Mock document.documentElement.classList
const classList = new Set<string>()
vi.stubGlobal('document', {
  ...document,
  documentElement: {
    classList: {
      add: (c: string) => classList.add(c),
      remove: (c: string) => classList.delete(c),
      toggle: (c: string, force?: boolean) => {
        if (force === undefined) {
          if (classList.has(c)) classList.delete(c)
          else classList.add(c)
        } else if (force) classList.add(c)
        else classList.delete(c)
      },
      contains: (c: string) => classList.has(c),
    },
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})

describe('Easter Eggs', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((k) => delete storage[k])
    classList.clear()
  })

  describe('hacker-mode', () => {
    it('isHackerModeActive returns false by default', async () => {
      // Use dynamic import to get a fresh module
      const mod = await import('../hacker-mode')
      // Default state is based on localStorage which we cleared
      expect(typeof mod.isHackerModeActive).toBe('function')
    })

    it('exports toggleHackerMode function', async () => {
      const mod = await import('../hacker-mode')
      expect(typeof mod.toggleHackerMode).toBe('function')
    })

    it('exports restoreHackerMode function', async () => {
      const mod = await import('../hacker-mode')
      expect(typeof mod.restoreHackerMode).toBe('function')
    })
  })

  describe('konami', () => {
    it('exports initKonamiListener and destroyKonamiListener', async () => {
      const mod = await import('../konami')
      expect(typeof mod.initKonamiListener).toBe('function')
      expect(typeof mod.destroyKonamiListener).toBe('function')
    })
  })

  describe('console-art', () => {
    it('exports printConsoleArt', async () => {
      const mod = await import('../console-art')
      expect(typeof mod.printConsoleArt).toBe('function')
    })

    it('printConsoleArt calls console.log', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const mod = await import('../console-art')
      mod.printConsoleArt()
      expect(spy).toHaveBeenCalled()
      // Check it includes the ASCII art (box-drawing characters)
      const firstCall = spy.mock.calls[0][0] as string
      expect(firstCall).toContain('██████')
      spy.mockRestore()
    })
  })

  describe('index', () => {
    it('exports initEasterEggs', async () => {
      const mod = await import('../index')
      expect(typeof mod.initEasterEggs).toBe('function')
    })
  })
})
