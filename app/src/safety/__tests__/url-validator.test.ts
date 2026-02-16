import { describe, it, expect } from 'vitest'
import { validateURL, enforceSafeSearch } from '../url-validator'
import { BLOCKED_DOMAIN_PATTERNS } from '../blocklist'
import type { SafetyConfig } from '../types'
import { DEFAULT_SAFETY_CONFIG } from '../types'

function configWith(overrides: Partial<SafetyConfig> = {}): SafetyConfig {
  return {
    ...DEFAULT_SAFETY_CONFIG,
    blockedPatterns: BLOCKED_DOMAIN_PATTERNS,
    ...overrides,
  }
}

describe('validateURL', () => {
  it('blocks non-HTTPS URLs', () => {
    const result = validateURL('http://example.com', configWith())
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('HTTPS')
  })

  it('allows HTTPS URLs', () => {
    const result = validateURL('https://example.com', configWith())
    expect(result.allowed).toBe(true)
  })

  it('allows localhost HTTP for dev', () => {
    const result = validateURL('http://localhost:3000/api', configWith())
    expect(result.allowed).toBe(true)
  })

  it('allows 127.0.0.1 HTTP for dev', () => {
    const result = validateURL('http://127.0.0.1:8080/data', configWith())
    expect(result.allowed).toBe(true)
  })

  it('blocks file: protocol', () => {
    const result = validateURL('file:///etc/passwd', configWith())
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('file:')
  })

  it('blocks data: protocol', () => {
    const result = validateURL('data:text/html,<h1>Hi</h1>', configWith())
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('data:')
  })

  it('blocks javascript: protocol', () => {
    // javascript: URLs can't be parsed by new URL() so they'll fail as invalid
    const result = validateURL('javascript:alert(1)', configWith())
    expect(result.allowed).toBe(false)
  })

  it('blocks blob: protocol', () => {
    const result = validateURL('blob:https://example.com/abc', configWith())
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('blob:')
  })

  it('blocks domains matching blocklist patterns', () => {
    const result = validateURL('https://pornhub.com/video', configWith())
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('Domain blocked by safety policy')
  })

  it('blocks adult TLDs', () => {
    const result = validateURL('https://anything.xxx/page', configWith())
    expect(result.allowed).toBe(false)
  })

  it('allows domains NOT in blocklist', () => {
    const result = validateURL('https://github.com/repo', configWith())
    expect(result.allowed).toBe(true)
  })

  it('allows jsonplaceholder API', () => {
    const result = validateURL('https://jsonplaceholder.typicode.com/todos/1', configWith())
    expect(result.allowed).toBe(true)
  })

  it('blocks URLs with suspicious path keywords', () => {
    const result = validateURL('https://example.com/porn/video', configWith())
    expect(result.allowed).toBe(false)
  })

  it('blocks URLs with /nsfw/ path', () => {
    const result = validateURL('https://example.com/nsfw/content', configWith())
    expect(result.allowed).toBe(false)
  })

  it('does not false-positive on clean paths', () => {
    const result = validateURL('https://example.com/report/data', configWith())
    expect(result.allowed).toBe(true)
  })

  it('blocks URLs with suspicious query params', () => {
    const result = validateURL('https://example.com/search?nsfw=true', configWith())
    expect(result.allowed).toBe(false)
  })

  it('returns invalid URL for garbage input', () => {
    const result = validateURL('not a url at all', configWith())
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('Invalid URL')
  })

  describe('allowlist mode', () => {
    it('allows listed domains', () => {
      const config = configWith({ allowlist: ['api.example.com'] })
      const result = validateURL('https://api.example.com/data', config)
      expect(result.allowed).toBe(true)
    })

    it('allows subdomains of listed domains', () => {
      const config = configWith({ allowlist: ['example.com'] })
      const result = validateURL('https://api.example.com/data', config)
      expect(result.allowed).toBe(true)
    })

    it('blocks everything else in allowlist mode', () => {
      const config = configWith({ allowlist: ['api.example.com'] })
      const result = validateURL('https://other-site.com/data', config)
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('allowlist')
    })
  })
})

describe('enforceSafeSearch', () => {
  it('appends safe=active for Google URLs', () => {
    const result = enforceSafeSearch('https://www.google.com/search?q=kittens')
    expect(result).toContain('safe=active')
  })

  it('appends safesearch=strict for Bing URLs', () => {
    const result = enforceSafeSearch('https://www.bing.com/search?q=kittens')
    expect(result).toContain('safesearch=strict')
  })

  it('appends kp=1 for DuckDuckGo URLs', () => {
    const result = enforceSafeSearch('https://duckduckgo.com/?q=kittens')
    expect(result).toContain('kp=1')
  })

  it('does not modify non-search-engine URLs', () => {
    const url = 'https://example.com/api/data'
    expect(enforceSafeSearch(url)).toBe(url)
  })

  it('overwrites existing safe search param', () => {
    const result = enforceSafeSearch('https://www.google.com/search?q=kittens&safe=off')
    expect(result).toContain('safe=active')
    expect(result).not.toContain('safe=off')
  })
})
