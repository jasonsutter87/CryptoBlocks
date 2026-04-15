/**
 * Shared HTTP helpers for all Netlify Functions.
 *
 * One source of truth for JSON responses, CORS, and error shapes.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const

/** JSON response with CORS headers */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

/** CORS preflight response */
export function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

/**
 * Standard error response. Never leaks schema internals or stack traces.
 * Pass `detail` only in development mode or for client-fixable errors.
 */
export function errorResponse(message: string, status = 400, detail?: string): Response {
  const body: Record<string, string> = { error: message }
  if (detail && process.env.NODE_ENV !== 'production') body.detail = detail
  return json(body, status)
}

/** Extract bearer token from an Authorization header */
export function extractBearer(req: Request): string {
  const header = req.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice(7).trim()
}

/** Parse URL path segments after the function name */
export function parsePath(req: Request, functionName: string): string[] {
  const url = new URL(req.url)
  const clean = url.pathname
    .replace(`/.netlify/functions/${functionName}`, '')
    .replace(`/api/${functionName}`, '')
  return clean.split('/').filter(Boolean)
}
