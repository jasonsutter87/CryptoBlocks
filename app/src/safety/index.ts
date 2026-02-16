import type { SafetyConfig } from './types'
import { DEFAULT_SAFETY_CONFIG } from './types'
import { BLOCKED_DOMAIN_PATTERNS } from './blocklist'
import { generateSafeFetchCode } from './safe-fetch'
import { generateSafeWebSocketCode } from './safe-websocket'
import { generateSafeApisCode } from './safe-apis'

export type { SafetyConfig, ValidationResult } from './types'
export { DEFAULT_SAFETY_CONFIG } from './types'
export { BLOCKED_DOMAIN_PATTERNS, SAFESEARCH_PARAMS } from './blocklist'
export { validateURL, enforceSafeSearch } from './url-validator'
export { generateSafeFetchCode } from './safe-fetch'
export { generateSafeWebSocketCode } from './safe-websocket'
export { generateSafeApisCode } from './safe-apis'

/**
 * Generates the complete safety preamble JS code to inject into the sandbox iframe.
 * Overrides fetch(), WebSocket, and other dangerous APIs with safety-wrapped versions.
 */
export function generateSafetyPreamble(overrides?: Partial<SafetyConfig>): string {
  const config: SafetyConfig = {
    ...DEFAULT_SAFETY_CONFIG,
    ...overrides,
    blockedPatterns: [
      ...BLOCKED_DOMAIN_PATTERNS,
      ...(overrides?.blockedPatterns ?? []),
    ],
  }

  return (
    generateSafeFetchCode(config) + '\n' +
    generateSafeWebSocketCode(config) + '\n' +
    generateSafeApisCode()
  )
}
