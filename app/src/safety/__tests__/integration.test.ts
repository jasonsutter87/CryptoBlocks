import { describe, it, expect } from 'vitest'
import { generateSafetyPreamble, DEFAULT_SAFETY_CONFIG, BLOCKED_DOMAIN_PATTERNS } from '../index'

describe('generateSafetyPreamble', () => {
  it('returns a non-empty string', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble.length).toBeGreaterThan(0)
  })

  it('contains fetch wrapper', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain('window.fetch')
    expect(preamble).toContain('__realFetch')
  })

  it('contains WebSocket wrapper', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain('WebSocket')
    expect(preamble).toContain('__RealWebSocket')
  })

  it('contains both fetch and WebSocket wrappers', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain('window.fetch')
    expect(preamble).toContain('window.WebSocket')
  })

  it('generates valid JavaScript', () => {
    const preamble = generateSafetyPreamble()
    expect(() => new Function(preamble)).not.toThrow()
  })

  it('accepts config overrides', () => {
    const preamble = generateSafetyPreamble({ maxRequestsPerExecution: 3 })
    expect(preamble).toContain('var __maxRequests = 3')
  })

  it('accepts httpsOnly override', () => {
    const preamble = generateSafetyPreamble({ httpsOnly: false })
    expect(preamble).toContain('var __httpsOnly = false')
  })

  it('default config has non-empty blocklist', () => {
    expect(BLOCKED_DOMAIN_PATTERNS.length).toBeGreaterThan(0)
  })

  it('default config has sensible defaults', () => {
    expect(DEFAULT_SAFETY_CONFIG.httpsOnly).toBe(true)
    expect(DEFAULT_SAFETY_CONFIG.wssOnly).toBe(true)
    expect(DEFAULT_SAFETY_CONFIG.enforceSafeSearch).toBe(true)
    expect(DEFAULT_SAFETY_CONFIG.maxResponseSize).toBe(1_048_576)
    expect(DEFAULT_SAFETY_CONFIG.maxRequestsPerExecution).toBe(10)
  })

  it('merges additional blocked patterns with defaults', () => {
    const customPattern = /custom-blocked\.com/i
    const preamble = generateSafetyPreamble({
      blockedPatterns: [customPattern],
    })
    // The generated code should contain patterns from both default and custom
    expect(preamble).toContain('custom-blocked')
  })

  it('preserves allowlist in overrides', () => {
    const preamble = generateSafetyPreamble({
      allowlist: ['api.example.com', 'safe.org'],
    })
    expect(preamble).toContain('api.example.com')
    expect(preamble).toContain('safe.org')
  })

  it('contains API restriction code', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain('XMLHttpRequest')
    expect(preamble).toContain('sendBeacon')
    expect(preamble).toContain('EventSource')
    expect(preamble).toContain('Worker')
  })

  it('contains modal rate limiting', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain('__modalCount')
    expect(preamble).toContain('__maxModals')
  })

  it('locks fetch with Object.defineProperty', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain("Object.defineProperty(window, 'fetch'")
    expect(preamble).toContain('configurable: false')
  })

  it('locks WebSocket with Object.defineProperty', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain("Object.defineProperty(window, 'WebSocket'")
  })

  it('blocks redirects on fetch', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain("redirect: 'error'")
  })

  it('includes WebSocket connection limits', () => {
    const preamble = generateSafetyPreamble()
    expect(preamble).toContain('__wsCount')
    expect(preamble).toContain('__maxWsConnections')
  })
})
