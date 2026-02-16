import type { SafetyConfig, ValidationResult } from './types'
import { SAFESEARCH_PARAMS } from './blocklist'

const DANGEROUS_PROTOCOLS = ['file:', 'data:', 'javascript:', 'blob:', 'about:']

export function validateURL(url: string, config: SafetyConfig): ValidationResult {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { allowed: false, reason: 'Invalid URL' }
  }

  // Block dangerous protocols
  if (DANGEROUS_PROTOCOLS.includes(parsed.protocol)) {
    return { allowed: false, reason: `Protocol "${parsed.protocol}" is not allowed` }
  }

  // HTTPS enforcement (allow localhost for dev)
  if (config.httpsOnly && parsed.protocol !== 'https:') {
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
    if (!isLocalhost) {
      return { allowed: false, reason: 'Only HTTPS URLs are allowed' }
    }
  }

  // Allowlist mode: only explicitly allowed domains pass
  if (config.allowlist && config.allowlist.length > 0) {
    const hostname = parsed.hostname.toLowerCase()
    const allowed = config.allowlist.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    )
    if (!allowed) {
      return { allowed: false, reason: 'Domain not in allowlist' }
    }
    return { allowed: true, reason: '' }
  }

  // Blocklist mode: check full URL against all patterns
  const fullUrl = url.toLowerCase()
  const hostname = parsed.hostname.toLowerCase()

  for (const pattern of config.blockedPatterns) {
    if (pattern.test(fullUrl) || pattern.test(hostname)) {
      return { allowed: false, reason: 'Domain blocked by safety policy' }
    }
  }

  return { allowed: true, reason: '' }
}

export function enforceSafeSearch(url: string): string {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }

  for (const { pattern, param, value } of SAFESEARCH_PARAMS) {
    if (pattern.test(parsed.hostname)) {
      parsed.searchParams.set(param, value)
      return parsed.toString()
    }
  }

  return url
}
