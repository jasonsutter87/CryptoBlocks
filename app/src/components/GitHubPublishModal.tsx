/**
 * GitHubPublishModal — publish .blocks files to GitHub using Clerk OAuth.
 *
 * No PAT needed. If the user signed in with GitHub via Clerk, we use
 * their OAuth token to list repos, create new ones, and push files.
 *
 * Flow:
 *   1. Fetch user's repos from /api/github/repos
 *   2. Pick existing repo or create new one
 *   3. Push workspace as .blocks file
 *   4. Show success with link
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

interface GitHubPublishModalProps {
  onClose: () => void
}

interface Repo {
  name: string
  fullName: string
  url: string
  private: boolean
  description: string | null
}

type Step = 'loading' | 'pick-repo' | 'new-repo' | 'pushing' | 'done' | 'error' | 'no-github'

export default function GitHubPublishModal({ onClose }: GitHubPublishModalProps) {
  const { getToken } = useAuth()
  const [step, setStep] = useState<Step>('loading')
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [newRepoName, setNewRepoName] = useState('my-cryptoblocks-project')
  const [filename, setFilename] = useState('project.blocks')
  const [error, setError] = useState('')
  const [resultUrl, setResultUrl] = useState('')

  const headers = async (): Promise<Record<string, string>> => {
    const token = await getToken()
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
  }

  // Load repos on mount
  useEffect(() => {
    ;(async () => {
      try {
        const h = await headers()
        const res = await fetch('/api/github/repos', { method: 'POST', headers: h })
        const data = await res.json()
        if (data.needsGithub) {
          setStep('no-github')
          return
        }
        if (data.error) {
          setError(data.error)
          setStep('error')
          return
        }
        setRepos(data.repos || [])
        setStep('pick-repo')
      } catch {
        setError('Failed to connect to GitHub')
        setStep('error')
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) return
    setStep('pushing')
    try {
      const h = await headers()
      const res = await fetch('/api/github/create-repo', {
        method: 'POST', headers: h,
        body: JSON.stringify({ name: newRepoName.trim(), description: 'Built with CryptoBlocks' }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setStep('error'); return }
      // Now push the file
      await pushFile(data.fullName)
    } catch { setError('Failed to create repo'); setStep('error') }
  }

  const handlePushToExisting = async () => {
    if (!selectedRepo) return
    setStep('pushing')
    await pushFile(selectedRepo)
  }

  const pushFile = async (repo: string) => {
    try {
      const ws = localStorage.getItem('cryptoblocks_workspace') || '{}'
      const h = await headers()
      const res = await fetch('/api/github/push', {
        method: 'POST', headers: h,
        body: JSON.stringify({
          repo,
          filename: filename.endsWith('.blocks') ? filename : `${filename}.blocks`,
          content: ws,
          message: 'Update project via CryptoBlocks',
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setStep('error'); return }
      setResultUrl(data.url || `https://github.com/${repo}`)
      setStep('done')
    } catch { setError('Failed to push file'); setStep('error') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#313244]">
          <div>
            <h2 className="text-[#cdd6f4] font-semibold text-base">Publish to GitHub</h2>
            <p className="text-[#6c7086] text-xs mt-0.5">Push your .blocks file to a GitHub repo</p>
          </div>
          <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4] p-1 rounded-lg hover:bg-[#313244]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Loading */}
          {step === 'loading' && (
            <div className="text-center py-8">
              <span className="text-3xl animate-pulse block mb-2">🐙</span>
              <p className="text-sm text-[#6c7086]">Connecting to GitHub...</p>
            </div>
          )}

          {/* No GitHub connection */}
          {step === 'no-github' && (
            <div className="text-center py-6">
              <span className="text-3xl block mb-3">🔗</span>
              <p className="text-sm text-[#cdd6f4] font-semibold mb-1">No GitHub connection</p>
              <p className="text-xs text-[#6c7086] mb-4">Sign in with GitHub (not Google) to push to your repos.</p>
              <button onClick={onClose} className="px-4 py-2 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm">Close</button>
            </div>
          )}

          {/* Pick repo */}
          {step === 'pick-repo' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-[#a6adc8] mb-1.5 block">Filename</label>
                <input
                  type="text" value={filename} onChange={(e) => setFilename(e.target.value)}
                  className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#89b4fa]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#a6adc8] mb-1.5 block">Push to existing repo</label>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#89b4fa]"
                >
                  <option value="">Select a repo...</option>
                  {repos.map(r => (
                    <option key={r.fullName} value={r.fullName}>{r.name}{r.private ? ' 🔒' : ''}</option>
                  ))}
                </select>
                <button
                  onClick={handlePushToExisting}
                  disabled={!selectedRepo}
                  className="w-full mt-2 px-4 py-2 bg-[#89b4fa] text-[#1e1e2e] rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-[#74c7ec] transition-colors"
                >
                  Push to {selectedRepo || '...'}
                </button>
              </div>

              <div className="border-t border-[#313244] pt-4">
                <button
                  onClick={() => setStep('new-repo')}
                  className="w-full px-4 py-2 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm font-semibold hover:bg-[#45475a] transition-colors"
                >
                  + Create new repo
                </button>
              </div>
            </div>
          )}

          {/* New repo */}
          {step === 'new-repo' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-[#a6adc8] mb-1.5 block">Repository name</label>
                <input
                  type="text" value={newRepoName} onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="my-cryptoblocks-project"
                  className="w-full bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#89b4fa]"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('pick-repo')} className="px-4 py-2 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm">Back</button>
                <button
                  onClick={handleCreateRepo}
                  disabled={!newRepoName.trim()}
                  className="flex-1 px-4 py-2 bg-[#a6e3a1] text-[#1e1e2e] rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-[#a6e3a1]/80 transition-colors"
                >
                  Create & Push
                </button>
              </div>
            </div>
          )}

          {/* Pushing */}
          {step === 'pushing' && (
            <div className="text-center py-8">
              <span className="text-3xl animate-spin block mb-2">⚙️</span>
              <p className="text-sm text-[#6c7086]">Pushing to GitHub...</p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center py-6">
              <span className="text-3xl block mb-3">✅</span>
              <p className="text-sm font-semibold text-[#a6e3a1] mb-2">Published to GitHub!</p>
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#89b4fa] hover:text-[#74c7ec] underline"
              >
                View on GitHub →
              </a>
              <div className="mt-4">
                <button onClick={onClose} className="px-4 py-2 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm">Done</button>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center py-6">
              <span className="text-3xl block mb-3">😕</span>
              <p className="text-sm text-[#f38ba8] mb-2">{error}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setStep('pick-repo')} className="px-4 py-2 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm">Try Again</button>
                <button onClick={onClose} className="px-4 py-2 bg-[#313244] text-[#6c7086] rounded-lg text-sm">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
