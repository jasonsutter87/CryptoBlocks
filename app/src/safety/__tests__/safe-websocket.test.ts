import { describe, it, expect } from 'vitest'
import { generateSafeWebSocketCode } from '../safe-websocket'
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

describe('generateSafeWebSocketCode', () => {
  it('returns a non-empty string', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code.length).toBeGreaterThan(0)
  })

  it('generates valid JavaScript (parseable)', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    // If this throws, the generated code has syntax errors
    expect(() => new Function(code)).not.toThrow()
  })

  it('contains WebSocket override', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('SafeWebSocket')
    expect(code).toContain('var __RealWebSocket')
  })

  it('contains connection count limit variables', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('var __wsCount')
    expect(code).toContain('var __maxWsConnections')
  })

  it('initializes __wsCount to 0', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('var __wsCount = 0')
  })

  it('sets __maxWsConnections from config', () => {
    const code = generateSafeWebSocketCode(fullConfig({ maxRequestsPerExecution: 5 }))
    expect(code).toContain('var __maxWsConnections = 5')
  })

  it('contains connection limit checking logic', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('__wsCount++')
    expect(code).toContain('if (__wsCount > __maxWsConnections)')
    expect(code).toContain('WebSocket connection limit exceeded')
  })

  it('locks WebSocket with Object.defineProperty', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain("Object.defineProperty(window, 'WebSocket'")
    expect(code).toContain('configurable: false')
    expect(code).toContain('writable: false')
  })

  it('serializes wssOnly config correctly when true', () => {
    const code = generateSafeWebSocketCode(fullConfig({ wssOnly: true }))
    expect(code).toContain('var __wssOnly = true')
  })

  it('serializes wssOnly config correctly when false', () => {
    const code = generateSafeWebSocketCode(fullConfig({ wssOnly: false }))
    expect(code).toContain('var __wssOnly = false')
  })

  it('contains wss:// enforcement logic', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('if (__wssOnly && parsed.protocol !== \'wss:\')')
    expect(code).toContain('Only WSS (secure) WebSocket connections are allowed')
  })

  it('allows localhost ws:// when wssOnly is true', () => {
    const code = generateSafeWebSocketCode(fullConfig({ wssOnly: true }))
    expect(code).toContain('isLocal')
    expect(code).toContain('localhost')
    expect(code).toContain('127.0.0.1')
  })

  it('contains blocklist pattern checking', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('var __blockedPatterns')
    expect(code).toContain('__blockedPatterns[i].test(fullUrl)')
    expect(code).toContain('Domain blocked by safety policy')
  })

  it('serializes blockedPatterns as RegExp array', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('.map(function(p)')
    expect(code).toContain('return new RegExp(p.source, p.flags)')
  })

  it('contains allowlist checking', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('var __allowlist')
    expect(code).toContain('if (__allowlist && __allowlist.length > 0)')
  })

  it('serializes allowlist correctly', () => {
    const code = generateSafeWebSocketCode(fullConfig({ allowlist: ['api.example.com', 'safe.org'] }))
    expect(code).toContain('api.example.com')
    expect(code).toContain('safe.org')
  })

  it('preserves WebSocket constants', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('SafeWebSocket.CONNECTING')
    expect(code).toContain('SafeWebSocket.OPEN')
    expect(code).toContain('SafeWebSocket.CLOSING')
    expect(code).toContain('SafeWebSocket.CLOSED')
  })

  it('preserves WebSocket prototype', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('SafeWebSocket.prototype = __RealWebSocket.prototype')
  })

  it('wraps all logic in IIFE', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain(';(function() {')
    expect(code).toContain('})();')
  })

  it('handles protocols parameter', () => {
    const code = generateSafeWebSocketCode(fullConfig())
    expect(code).toContain('function SafeWebSocket(url, protocols)')
    expect(code).toContain('if (protocols !== undefined)')
    expect(code).toContain('new __RealWebSocket(url, protocols)')
  })
})
