import { useState, useCallback } from 'react'
import {
  saveGitHubToken,
  loadGitHubToken,
  clearGitHubToken,
  saveGitHubUsername,
  loadGitHubUsername,
} from '../storage'
import { validateToken, publishToGist, publishToPages, sanitizeRepoName } from '../github/publish'
import type { GistResult, PagesResult } from '../github/publish'

interface PublishModalProps {
  onClose: () => void
  getHtml: () => string
}

type Step = 'token' | 'choose' | 'publishing' | 'result' | 'error'
type PublishTarget = 'gist' | 'pages'

export default function PublishModal({ onClose, getHtml }: PublishModalProps) {
  const [step, setStep] = useState<Step>(loadGitHubToken() ? 'choose' : 'token')
  const [token, setToken] = useState(loadGitHubToken() || '')
  const [username, setUsername] = useState(loadGitHubUsername() || '')
  const [target, setTarget] = useState<PublishTarget>('gist')
  const [projectName, setProjectName] = useState('cryptoblocks-project')
  const [connecting, setConnecting] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [secondaryUrl, setSecondaryUrl] = useState('')
  const [isPages, setIsPages] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleConnect = useCallback(async () => {
    if (!token.trim()) return
    setConnecting(true)
    try {
      const user = await validateToken(token.trim())
      saveGitHubToken(token.trim())
      saveGitHubUsername(user)
      setUsername(user)
      setStep('choose')
    } catch (err) {
      setErrorMsg((err as Error).message)
      setStep('error')
    } finally {
      setConnecting(false)
    }
  }, [token])

  const handleDisconnect = useCallback(() => {
    clearGitHubToken()
    setToken('')
    setUsername('')
    setStep('token')
  }, [])

  const handlePublish = useCallback(async () => {
    setStep('publishing')
    try {
      const html = getHtml()
      if (target === 'gist') {
        setStatusText('Creating gist...')
        const result: GistResult = await publishToGist(token, html)
        setLiveUrl(result.previewUrl)
        setSecondaryUrl(result.url)
        setIsPages(false)
      } else {
        setStatusText('Setting up repository...')
        const result: PagesResult = await publishToPages(token, username, html, {
          repoName: projectName,
        })
        setLiveUrl(result.url)
        setSecondaryUrl(result.repoUrl)
        setIsPages(true)
      }
      setStep('result')
    } catch (err) {
      setErrorMsg((err as Error).message)
      setStep('error')
    }
  }, [token, username, target, projectName, getHtml])

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(liveUrl)
    } catch { /* noop */ }
  }, [liveUrl])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-base border border-surface-0 rounded-2xl shadow-2xl w-full max-w-md flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-0">
          <div>
            <h2 className="text-xl font-bold text-text">Publish to GitHub</h2>
            <p className="text-sm text-overlay mt-0.5">Get a live URL for your project</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-0 transition-colors text-overlay hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Token Step */}
          {step === 'token' && (
            <div className="space-y-4">
              <p className="text-sm text-subtext">
                Enter a GitHub Personal Access Token with <code className="text-accent bg-surface-0 px-1 rounded text-xs">gist</code> and <code className="text-accent bg-surface-0 px-1 rounded text-xs">repo</code> scopes.
              </p>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-surface-0 border border-surface-1 rounded-lg text-sm text-text placeholder-overlay focus:outline-none focus:border-accent"
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              />
              <div className="flex items-center justify-between">
                <a
                  href="https://github.com/settings/tokens/new?scopes=gist,repo&description=CryptoBlocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Create a token
                </a>
                <button
                  onClick={handleConnect}
                  disabled={!token.trim() || connecting}
                  className="px-4 py-2 text-sm font-semibold bg-success text-base hover:bg-success/80 rounded-lg transition-colors disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          )}

          {/* Choose Step */}
          {step === 'choose' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-subtext">
                  Connected as <span className="font-semibold text-text">{username}</span>
                </span>
                <button onClick={handleDisconnect} className="text-xs text-danger hover:underline">
                  Disconnect
                </button>
              </div>

              {/* Target cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTarget('gist')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    target === 'gist'
                      ? 'border-accent bg-accent/10'
                      : 'border-surface-1 hover:border-overlay'
                  }`}
                >
                  <div className="text-sm font-semibold text-text">Gist</div>
                  <div className="text-xs text-overlay mt-1">Instant shareable link</div>
                </button>
                <button
                  onClick={() => setTarget('pages')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    target === 'pages'
                      ? 'border-accent bg-accent/10'
                      : 'border-surface-1 hover:border-overlay'
                  }`}
                >
                  <div className="text-sm font-semibold text-text">Pages</div>
                  <div className="text-xs text-overlay mt-1">Live site on github.io</div>
                </button>
              </div>

              {/* Project name for Pages */}
              {target === 'pages' && (
                <div>
                  <label className="block text-xs text-overlay mb-1">Repository name</label>
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-0 border border-surface-1 rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                  />
                  <p className="text-xs text-overlay mt-1">
                    {username}.github.io/{sanitizeRepoName(projectName) || '...'}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 text-sm font-semibold bg-success text-base hover:bg-success/80 rounded-lg transition-colors"
                >
                  Publish
                </button>
              </div>
            </div>
          )}

          {/* Publishing Step */}
          {step === 'publishing' && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-subtext">{statusText}</p>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-success">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-semibold">Published!</span>
              </div>

              <div className="bg-surface-0 rounded-lg p-3 flex items-center gap-2">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline truncate flex-1"
                >
                  {liveUrl}
                </a>
                <button
                  onClick={handleCopyUrl}
                  className="px-2 py-1 text-xs font-medium bg-surface-1 hover:bg-[#585b70] text-text rounded transition-colors shrink-0"
                >
                  Copy
                </button>
              </div>

              {secondaryUrl && (
                <a
                  href={secondaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-overlay hover:text-accent hover:underline block"
                >
                  {target === 'gist' ? 'View on GitHub Gist' : 'View repository'}
                </a>
              )}

              {isPages && (
                <p className="text-xs text-warn">
                  GitHub Pages may take 1-2 minutes to go live.
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text hover:bg-surface-0 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
                <p className="text-sm text-danger">{errorMsg}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(username ? 'choose' : 'token')}
                  className="px-4 py-2 text-sm font-semibold bg-accent text-base hover:bg-accent/80 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
