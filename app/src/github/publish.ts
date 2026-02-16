/**
 * GitHub API module for publishing CryptoBlocks projects as Gists or GitHub Pages.
 */

const API = 'https://api.github.com'

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }
}

/** Validate a PAT by fetching the authenticated user. Returns username or throws. */
export async function validateToken(token: string): Promise<string> {
  if (!/^(ghp_|github_pat_)[a-zA-Z0-9_]{20,}$/.test(token)) {
    throw new Error('Invalid token format. GitHub tokens start with ghp_ or github_pat_')
  }
  const res = await fetch(`${API}/user`, { headers: headers(token) })
  if (!res.ok) {
    throw new Error(res.status === 401 ? 'Invalid token' : `GitHub API error: ${res.status}`)
  }
  const data = await res.json()
  return data.login
}

export interface GistResult {
  url: string
  rawUrl: string
  previewUrl: string
  id: string
}

/** Create or update a GitHub Gist containing the HTML. */
export async function publishToGist(
  token: string,
  html: string,
  options: { description?: string; filename?: string; existingGistId?: string } = {}
): Promise<GistResult> {
  const filename = options.filename || 'index.html'
  const description = options.description || 'CryptoBlocks Project'

  const body = {
    description,
    public: true,
    files: { [filename]: { content: html } },
  }

  let res: Response
  if (options.existingGistId) {
    res = await fetch(`${API}/gists/${options.existingGistId}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(body),
    })
  } else {
    res = await fetch(`${API}/gists`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(body),
    })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to publish gist: ${res.status}`)
  }

  const data = await res.json()
  const id: string = data.id
  const rawUrl: string = data.files[filename].raw_url

  // githack.com renders raw gist HTML
  const previewUrl = rawUrl
    .replace('gist.githubusercontent.com', 'gistcdn.githack.com')

  return {
    url: data.html_url,
    rawUrl,
    previewUrl,
    id,
  }
}

export interface PagesResult {
  url: string
  repoUrl: string
  isUpdate: boolean
}

/** Publish HTML to a GitHub Pages repo. Creates the repo if needed. */
export async function publishToPages(
  token: string,
  owner: string,
  html: string,
  options: { repoName: string; description?: string }
): Promise<PagesResult> {
  const repo = sanitizeRepoName(options.repoName)
  if (!repo) throw new Error('Invalid repository name')
  const description = options.description || 'CryptoBlocks Project'
  const hdrs = headers(token)

  let isUpdate = false

  // Check if repo exists
  const repoRes = await fetch(`${API}/repos/${owner}/${repo}`, { headers: hdrs })

  if (repoRes.status === 404) {
    // Create repo
    const createRes = await fetch(`${API}/user/repos`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({
        name: repo,
        description,
        auto_init: true,
        homepage: `https://${owner}.github.io/${repo}`,
      }),
    })
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}))
      throw new Error(err.message || `Failed to create repo: ${createRes.status}`)
    }
    // Brief delay to let GitHub initialize the repo
    await new Promise((r) => setTimeout(r, 1500))
  } else if (repoRes.ok) {
    isUpdate = true
  } else {
    throw new Error(`Failed to check repo: ${repoRes.status}`)
  }

  // Get existing file SHA (needed for updates)
  let sha: string | undefined
  const fileRes = await fetch(`${API}/repos/${owner}/${repo}/contents/index.html`, { headers: hdrs })
  if (fileRes.ok) {
    const fileData = await fileRes.json()
    sha = fileData.sha
  }

  // Push index.html
  const putBody: Record<string, unknown> = {
    message: sha ? 'Update CryptoBlocks project' : 'Add CryptoBlocks project',
    content: btoa(unescape(encodeURIComponent(html))),
  }
  if (sha) putBody.sha = sha

  const putRes = await fetch(`${API}/repos/${owner}/${repo}/contents/index.html`, {
    method: 'PUT',
    headers: hdrs,
    body: JSON.stringify(putBody),
  })
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}))
    throw new Error(err.message || `Failed to push file: ${putRes.status}`)
  }

  // Enable GitHub Pages (ignore if already enabled)
  if (!isUpdate) {
    const pagesRes = await fetch(`${API}/repos/${owner}/${repo}/pages`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({ source: { branch: 'main', path: '/' } }),
    })
    // 409 means pages already enabled — that's fine
    if (!pagesRes.ok && pagesRes.status !== 409) {
      // Non-fatal: file was pushed, pages just needs manual enable
      console.warn('Could not auto-enable Pages:', pagesRes.status)
    }
  }

  return {
    url: `https://${owner}.github.io/${repo}`,
    repoUrl: `https://github.com/${owner}/${repo}`,
    isUpdate,
  }
}

/** Sanitize a string into a valid GitHub repo name. */
export function sanitizeRepoName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
