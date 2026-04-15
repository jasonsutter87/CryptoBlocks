/**
 * Netlify Function — GitHub integration via Clerk OAuth.
 *
 * No PATs needed — uses the GitHub OAuth token Clerk stored when the
 * user signed in with GitHub.
 *
 * POST /api/github/repos      → list user's repos
 * POST /api/github/create-repo → create a new repo (CreateRepoInput)
 * POST /api/github/push        → push a .blocks file to a repo (PushFileInput)
 */

import {
  json, cors, logError, parsePath, verifyFromRequest, requireAuth,
} from './_lib/index.js'
import { CreateRepoInput, PushFileInput } from '../../src/schema/index.js'

async function getGitHubToken(clerkUserId: string): Promise<string | null> {
  if (!process.env.CLERK_SECRET_KEY) return null
  // Clerk provider IDs vary by configuration — try known variants in order
  const providers = ['oauth_github', 'github', 'oauth_custom_github']
  for (const provider of providers) {
    try {
      const url = `https://api.clerk.com/v1/users/${encodeURIComponent(clerkUserId)}/oauth_access_tokens/${provider}`
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` },
      })
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0 && data[0].token) {
        return String(data[0].token)
      }
    } catch (err) {
      logError(`github:${provider}`, err)
    }
  }
  return null
}

async function githubApi(
  path: string, ghToken: string, method = 'GET', body?: unknown,
): Promise<{ ok: boolean; data: unknown; status: number }> {
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

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors(req)

  const segments = parsePath(req, 'github')
  const user = await verifyFromRequest(req)

  const authErr = requireAuth(user, 'Sign in to use GitHub integration')
  if (authErr) return authErr

  const ghToken = await getGitHubToken(user!.sub)
  if (!ghToken) {
    return json({
      error: 'No GitHub OAuth token found — sign in with GitHub to enable this feature.',
      needsGithub: true,
    }, 403)
  }

  try {
    // List user's repos
    if (segments[0] === 'repos') {
      const result = await githubApi('/user/repos?sort=updated&per_page=30', ghToken)
      if (!result.ok) return json({ error: 'Failed to fetch repos' }, 500)
      const repos = (result.data as Array<{ name: string; full_name: string; html_url: string; private: boolean; description: string | null }>)
        .map((r) => ({
          name: r.name, fullName: r.full_name, url: r.html_url,
          private: r.private, description: r.description,
        }))
      return json({ repos })
    }

    // Create a new repo
    if (segments[0] === 'create-repo') {
      const raw = await req.json().catch(() => null)
      const parsed = CreateRepoInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)

      const result = await githubApi('/user/repos', ghToken, 'POST', {
        name: parsed.data.name,
        description: parsed.data.description || 'Created with CryptoBlocks',
        auto_init: true,
        private: false,
      })
      if (!result.ok) return json({ error: 'Failed to create repo' }, result.status)
      const repo = result.data as { full_name: string; html_url: string }
      return json({ fullName: repo.full_name, url: repo.html_url })
    }

    // Push a file to a repo (path-traversal protected via SafeFilename)
    if (segments[0] === 'push') {
      const raw = await req.json().catch(() => null)
      const parsed = PushFileInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { repo, filename, content, message } = parsed.data

      // Defense-in-depth: belt-and-suspenders check against schema-validated values
      // (RepoFullName + SafeFilename already block this, but interpolating into
      // URL paths warrants a second check)
      if (repo.includes('..') || filename.includes('..') || filename.startsWith('/')) {
        return json({ error: 'Invalid path' }, 400)
      }
      const contentB64 = Buffer.from(content).toString('base64')
      const safePath = `/repos/${repo}/contents/${filename}`

      // GitHub requires the file's SHA to update an existing file
      const existing = await githubApi(safePath, ghToken)
      const sha = existing.ok ? (existing.data as { sha?: string }).sha : undefined

      const result = await githubApi(safePath, ghToken, 'PUT', {
        message: message || `Update ${filename} via CryptoBlocks`,
        content: contentB64,
        ...(sha ? { sha } : {}),
      })

      if (!result.ok) return json({ error: 'Failed to push file' }, result.status)
      const file = result.data as { content?: { html_url?: string } }
      return json({ ok: true, url: file.content?.html_url || `https://github.com/${repo}` })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('github', err)
    return json({ error: 'Internal error' }, 500)
  }
}
