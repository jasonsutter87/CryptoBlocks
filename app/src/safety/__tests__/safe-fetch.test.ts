import { describe, it, expect } from 'vitest'
import { generateSafeFetchCode } from '../safe-fetch'
import { DEFAULT_SAFETY_CONFIG } from '../types'
import { BLOCKED_DOMAIN_PATTERNS } from '../blocklist'
import type { SafetyConfig } from '../types'

function fullConfig(overrides: Partial<SafetyConfig> = {}): SafetyConfig {
  return {
    ...DEFAULT_SAFETY_CONFIG,
    blockedPatterns: BLOCKED_DOMAIN_PATTERNS,
    ...overrides,
  }
}

describe('generateSafeFetchCode', () => {
  it('returns a non-empty string', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code.length).toBeGreaterThan(0)
  })

  it('generates valid JavaScript (parseable)', () => {
    const code = generateSafeFetchCode(fullConfig())
    // If this throws, the generated code has syntax errors
    expect(() => new Function(code)).not.toThrow()
  })

  it('contains window.fetch override', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain('window.fetch')
  })

  it('contains __realFetch reference', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain('__realFetch')
  })

  it('serializes maxRequestsPerExecution correctly', () => {
    const code = generateSafeFetchCode(fullConfig({ maxRequestsPerExecution: 5 }))
    expect(code).toContain('var __maxRequests = 5')
  })

  it('serializes maxResponseSize correctly', () => {
    const code = generateSafeFetchCode(fullConfig({ maxResponseSize: 500000 }))
    expect(code).toContain('var __maxResponseSize = 500000')
  })

  it('includes rate limit logic', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain('__requestCount')
    expect(code).toContain('Rate limit')
  })

  it('includes URL validation logic', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain('__validateUrl')
    expect(code).toContain('__dangerousProtocols')
  })

  it('includes safe search logic', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain('__applySafeSearch')
    expect(code).toContain('__safeSearchRules')
  })

  it('includes content-type checking', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain('content-type')
    expect(code).toContain('__allowedContentTypes')
  })

  it('locks fetch with Object.defineProperty', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain("Object.defineProperty(window, 'fetch'")
    expect(code).toContain('configurable: false')
    expect(code).toContain('writable: false')
  })

  it('blocks redirects with redirect: error', () => {
    const code = generateSafeFetchCode(fullConfig())
    expect(code).toContain("redirect: 'error'")
  })

  it('blocks responses with missing content-type', () => {
    const code = generateSafeFetchCode(fullConfig())
    // Should NOT have the old "contentType &&" guard
    expect(code).toContain("if (!typeAllowed)")
  })
})
