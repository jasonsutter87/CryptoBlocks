export interface SafetyConfig {
  httpsOnly: boolean
  blockedPatterns: RegExp[]
  allowlist: string[] | null
  maxResponseSize: number
  maxRequestsPerExecution: number
  allowedContentTypes: string[]
  wssOnly: boolean
  enforceSafeSearch: boolean
}

export interface ValidationResult {
  allowed: boolean
  reason: string
}

export const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  httpsOnly: true,
  blockedPatterns: [],
  allowlist: null,
  maxResponseSize: 1_048_576, // 1 MB
  maxRequestsPerExecution: 10,
  allowedContentTypes: [
    'application/json',
    'text/plain',
    'text/html',
    'text/csv',
    'text/xml',
    'application/xml',
  ],
  wssOnly: true,
  enforceSafeSearch: true,
}
