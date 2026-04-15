/**
 * Shared HTTP helpers for all Netlify Functions.
 *
 * One source of truth for JSON responses, CORS, and error shapes.
 */

import { PageParams } from '../../../src/schema/index.js'

/**
 * Origins allowed to send credentialed requests to our API. `*` was the old
 * setting — fine for truly public data but dangerous the moment Authorization
 * is allowed, since any page the user visits can then script an authed
 * request on their behalf. Limit to production + explicit dev origins.
 */
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS
    ?? 'https://cryptoblocks.app,https://www.cryptoblocks.app,http://localhost:8888,http://localhost:5173'
  ).split(',').map((s) => s.trim()).filter(Boolean),
)

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : ''
  return {
    ...(allow ? { 'Access-Control-Allow-Origin': allow } : {}),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  }
}

/** JSON response with CORS headers (echoes approved origin only). */
export function json(data: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(req ? corsHeaders(req) : { 'Vary': 'Origin' }),
    },
  })
}

/** CORS preflight response. Pass the request so we can echo its origin. */
export function cors(req?: Request): Response {
  return new Response(null, {
    status: 204,
    headers: req ? corsHeaders(req) : { 'Vary': 'Origin' },
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

/** Consistent error logging across all functions. Use scope = function name. */
export function logError(scope: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[${scope}] ${msg}`)
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

/** Get a query-string parameter or null */
export function getQueryParam(req: Request, name: string): string | null {
  return new URL(req.url).searchParams.get(name)
}

/**
 * Extract + validate pagination from query string.
 * Returns { limit, offset } with defaults, or null + 400 Response on invalid input.
 */
export function parsePagination(
  req: Request,
): { limit: number; offset: number } | Response {
  const qs = new URL(req.url).searchParams
  const parsed = PageParams.safeParse({
    limit: qs.get('limit') ?? undefined,
    offset: qs.get('offset') ?? undefined,
  })
  if (!parsed.success) return json({ error: 'Invalid pagination' }, 400)
  return parsed.data
}
