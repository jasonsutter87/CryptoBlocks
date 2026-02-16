import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateToken, publishToGist, publishToPages, sanitizeRepoName } from '../github/publish'

function mockFetch(responses: Array<{ status: number; body?: unknown }>) {
  const queue = [...responses]
  return vi.fn(async () => {
    const next = queue.shift()!
    return {
      ok: next.status >= 200 && next.status < 300,
      status: next.status,
      json: async () => next.body ?? {},
    }
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

const VALID_TOKEN = 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890'

describe('validateToken', () => {
  it('returns username on 200', async () => {
    globalThis.fetch = mockFetch([{ status: 200, body: { login: 'octocat' } }])
    const username = await validateToken(VALID_TOKEN)
    expect(username).toBe('octocat')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/user',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${VALID_TOKEN}` }),
      })
    )
  })

  it('throws on invalid token format', async () => {
    await expect(validateToken('bad')).rejects.toThrow('Invalid token format')
  })

  it('throws on 401', async () => {
    globalThis.fetch = mockFetch([{ status: 401 }])
    await expect(validateToken(VALID_TOKEN)).rejects.toThrow('Invalid token')
  })

  it('throws on other errors with status code', async () => {
    globalThis.fetch = mockFetch([{ status: 500 }])
    await expect(validateToken(VALID_TOKEN)).rejects.toThrow('GitHub API error: 500')
  })
})

describe('publishToGist', () => {
  it('creates a new gist and returns preview URL', async () => {
    globalThis.fetch = mockFetch([{
      status: 201,
      body: {
        id: 'abc123',
        html_url: 'https://gist.github.com/abc123',
        files: {
          'index.html': {
            raw_url: 'https://gist.githubusercontent.com/user/abc123/raw/index.html',
          },
        },
      },
    }])

    const result = await publishToGist('tok', '<html></html>')
    expect(result.id).toBe('abc123')
    expect(result.url).toBe('https://gist.github.com/abc123')
    expect(result.previewUrl).toContain('gistcdn.githack.com')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/gists',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('updates existing gist via PATCH', async () => {
    globalThis.fetch = mockFetch([{
      status: 200,
      body: {
        id: 'existing',
        html_url: 'https://gist.github.com/existing',
        files: {
          'index.html': {
            raw_url: 'https://gist.githubusercontent.com/user/existing/raw/index.html',
          },
        },
      },
    }])

    const result = await publishToGist('tok', '<html></html>', { existingGistId: 'existing' })
    expect(result.id).toBe('existing')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/gists/existing',
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('uses custom filename and description', async () => {
    globalThis.fetch = mockFetch([{
      status: 201,
      body: {
        id: 'x',
        html_url: 'https://gist.github.com/x',
        files: {
          'app.html': {
            raw_url: 'https://gist.githubusercontent.com/user/x/raw/app.html',
          },
        },
      },
    }])

    await publishToGist('tok', '<html></html>', { filename: 'app.html', description: 'My app' })
    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body.files['app.html']).toBeDefined()
    expect(body.description).toBe('My app')
  })

  it('throws on API error', async () => {
    globalThis.fetch = mockFetch([{ status: 422, body: { message: 'Validation Failed' } }])
    await expect(publishToGist('tok', '<html></html>')).rejects.toThrow('Validation Failed')
  })
})

describe('publishToPages', () => {
  it('creates repo, pushes file, enables pages', async () => {
    globalThis.fetch = mockFetch([
      { status: 404 },                          // repo doesn't exist
      { status: 201, body: {} },                 // create repo
      { status: 404 },                          // no existing index.html
      { status: 201, body: {} },                 // push file
      { status: 201, body: {} },                 // enable pages
    ])

    const result = await publishToPages('tok', 'octocat', '<html></html>', { repoName: 'my-project' })
    expect(result.url).toBe('https://octocat.github.io/my-project')
    expect(result.repoUrl).toBe('https://github.com/octocat/my-project')
    expect(result.isUpdate).toBe(false)
  })

  it('updates existing repo — skips create, includes SHA', async () => {
    globalThis.fetch = mockFetch([
      { status: 200, body: {} },                  // repo exists
      { status: 200, body: { sha: 'oldsha123' } }, // existing file
      { status: 200, body: {} },                  // push file (update)
    ])

    const result = await publishToPages('tok', 'octocat', '<html></html>', { repoName: 'existing' })
    expect(result.isUpdate).toBe(true)

    // Check that SHA was included in the PUT body
    const putCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[2]
    const body = JSON.parse(putCall[1].body)
    expect(body.sha).toBe('oldsha123')
  })

  it('throws on invalid repo name', async () => {
    await expect(
      publishToPages('tok', 'user', '<html></html>', { repoName: '!!!' })
    ).rejects.toThrow('Invalid repository name')
  })

  it('throws when repo create fails', async () => {
    globalThis.fetch = mockFetch([
      { status: 404 },
      { status: 422, body: { message: 'name already exists' } },
    ])

    await expect(
      publishToPages('tok', 'user', '<html></html>', { repoName: 'taken' })
    ).rejects.toThrow('name already exists')
  })
})

describe('sanitizeRepoName', () => {
  it('lowercases and strips special chars', () => {
    expect(sanitizeRepoName('My Cool Project!')).toBe('my-cool-project')
  })

  it('collapses multiple dashes', () => {
    expect(sanitizeRepoName('a---b')).toBe('a-b')
  })

  it('trims leading/trailing dashes', () => {
    expect(sanitizeRepoName('-hello-')).toBe('hello')
  })

  it('returns empty string for only special chars', () => {
    expect(sanitizeRepoName('!!!')).toBe('')
  })

  it('handles spaces', () => {
    expect(sanitizeRepoName('crypto blocks app')).toBe('crypto-blocks-app')
  })
})
