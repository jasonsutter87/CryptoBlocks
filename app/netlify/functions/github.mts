/**
 * Netlify Function — GitHub integration via Clerk OAuth.
 *
 * No PATs needed — uses the GitHub OAuth token Clerk stored when the
 * user signed in with GitHub.
 *
 * POST /api/github/repos      → list user's repos
 * POST /api/github/create-repo → create a new repo
 * POST /api/github/push        → push a .blocks file to a repo
 */

async function verifyClerkToken(token: string): Promise<{ sub: string } | null> {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub ? { sub: payload.sub } : null
  } catch { return null }
}

async function getGitHubToken(clerkUserId: string): Promise<string | null> {
  if (!process.env.CLERK_SECRET_KEY) return null
  try {
    const res = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}/oauth_access_tokens/oauth_github`,
      { headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` } },
    )
    if (!res.ok) return null
    const data = await res.json()
    // Clerk returns an array of tokens — use the first active one
    if (Array.isArray(data) && data.length > 0) {
      return data[0].token || null
    }
    return null
  } catch { return null }
}

async function githubApi(path: string, ghToken: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; data: unknown; status: number }> {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'CryptoBlocks',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data, status: res.status }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  })
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } })

  const url = new URL(req.url)
  const path = url.pathname.replace('/.netlify/functions/github', '').replace('/api/github', '')
  const segments = path.split('/').filter(Boolean)

  const authHeader = req.headers.get('Authorization') || ''
  const user = await verifyClerkToken(authHeader.replace('Bearer ', ''))
  if (!user) return json({ error: 'Sign in to use GitHub integration' }, 401)

  const ghToken = await getGitHubToken(user.sub)
  if (!ghToken) {
    return json({ error: 'No GitHub connection found. Sign in with GitHub to connect your account.', needsGithub: true }, 403)
  }

  try {
    // POST /api/github/repos — list user's repos
    if (segments[0] === 'repos') {
      const result = await githubApi('/user/repos?sort=updated&per_page=30', ghToken)
      if (!result.ok) return json({ error: 'Failed to fetch repos' }, 500)
      const repos = (result.data as Array<{ name: string; full_name: string; html_url: string; private: boolean; description: string | null }>)
        .map(r => ({ name: r.name, fullName: r.full_name, url: r.html_url, private: r.private, description: r.description }))
      return json({ repos })
    }

    // POST /api/github/create-repo — create a new repo
    if (segments[0] === 'create-repo') {
      const body = await req.json() as { name: string; description?: string }
      if (!body.name) return json({ error: 'Repo name required' }, 400)
      const result = await githubApi('/user/repos', ghToken, 'POST', {
        name: body.name,
        description: body.description || 'Created with CryptoBlocks',
        auto_init: true,
        private: false,
      })
      if (!result.ok) {
        const err = result.data as { message?: string }
        return json({ error: err.message || 'Failed to create repo' }, result.status)
      }
      const repo = result.data as { full_name: string; html_url: string }
      return json({ fullName: repo.full_name, url: repo.html_url })
    }

    // POST /api/github/push — push a file to a repo
    if (segments[0] === 'push') {
      const body = await req.json() as { repo: string; filename: string; content: string; message?: string }
      if (!body.repo || !body.filename || !body.content) {
        return json({ error: 'repo, filename, and content required' }, 400)
      }

      // Base64 encode the content
      const contentB64 = Buffer.from(body.content).toString('base64')

      // Check if file already exists (need SHA to update)
      const existing = await githubApi(`/repos/${body.repo}/contents/${body.filename}`, ghToken)
      const sha = existing.ok ? (existing.data as { sha?: string }).sha : undefined

      const result = await githubApi(`/repos/${body.repo}/contents/${body.filename}`, ghToken, 'PUT', {
        message: body.message || `Update ${body.filename} via CryptoBlocks`,
        content: contentB64,
        ...(sha ? { sha } : {}),
      })

      if (!result.ok) {
        const err = result.data as { message?: string }
        return json({ error: err.message || 'Failed to push file' }, result.status)
      }

      const file = result.data as { content?: { html_url?: string } }
      return json({ ok: true, url: file.content?.html_url || `https://github.com/${body.repo}` })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return json({ error: 'Internal error', detail: err instanceof Error ? err.message : String(err) }, 500)
  }
}
