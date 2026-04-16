/**
 * Minimal Turso HTTP client (no SDK, fetch-based).
 *
 * One source of truth for DB access across all Netlify Functions.
 * Raw Hrana HTTP API — avoids @libsql/client bundler issues.
 */

export interface TursoRow {
  [key: string]: unknown
}

export interface TursoResult {
  rows: TursoRow[]
}

type Arg = string | number | boolean | null

function encodeArg(a: Arg): { type: string; value: string | null } {
  if (a === null) return { type: 'null', value: null }
  if (typeof a === 'boolean') return { type: 'integer', value: a ? '1' : '0' }
  if (typeof a === 'number') {
    return { type: Number.isInteger(a) ? 'integer' : 'float', value: String(a) }
  }
  return { type: 'text', value: String(a) }
}

export async function tursoExecute(sql: string, args: Arg[] = []): Promise<TursoResult> {
  const baseUrl = (process.env.TURSO_URL ?? '').replace('libsql://', 'https://')
  const token = process.env.TURSO_AUTH_TOKEN ?? ''

  if (!baseUrl || !token) {
    throw new Error('TURSO_URL and TURSO_AUTH_TOKEN must be set')
  }

  const res = await fetch(`${baseUrl}/v3/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(encodeArg) } },
        { type: 'close' },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Turso HTTP ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const result = data?.results?.[0]?.response?.result
  if (!result) return { rows: [] }

  const cols: string[] = result.cols.map((c: { name: string }) => c.name)
  const rows: TursoRow[] = result.rows.map((row: Array<{ value: unknown }>) => {
    const obj: TursoRow = {}
    for (let i = 0; i < cols.length; i++) {
      obj[cols[i]] = row[i]?.value ?? null
    }
    return obj
  })

  return { rows }
}

/**
 * Detect whether Turso is configured. Useful for endpoints that want
 * to return a 500 with a clear message rather than a cryptic fetch error.
 */
export function isTursoConfigured(): boolean {
  return Boolean(process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN)
}
