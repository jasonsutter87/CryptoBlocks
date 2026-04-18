/**
 * Share menu dropdown — export, publish, share link.
 * Split from FileMenu to keep dropdowns short.
 */

import { useState } from 'react'
import { Icon } from '../Icon'
import { ProBadge } from '../../billing/UpgradeGate'
import { showToast } from '../Toast'
import { menuItem, menuDropdown, SignInBadge } from './FileMenu'

export interface ShareMenuProps {
  isSignedIn: boolean
  isPro: boolean
  userName?: string | null
  getToken: () => Promise<string | null>
  requireAuth: (action: () => void) => void
  requirePro: (action: () => void) => void
  close: () => void

  onExportHtml: () => void
  onExportPwa: () => void
  onCopyEmbed: () => void
  onPublish: () => void
}

export default function ShareMenu(p: ShareMenuProps) {
  const [embedCopied, setEmbedCopied] = useState(false)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleCopyEmbed = () => {
    p.requirePro(() => {
      p.onCopyEmbed()
      setEmbedCopied(true)
      setTimeout(() => setEmbedCopied(false), 2000)
    })
  }

  const handleShareLink = async () => {
    if (sharing) return
    const token = await p.getToken()
    if (!token) { showToast('Sign in to share your work!', 'signin'); return }
    setSharing(true)
    try {
      const ws = localStorage.getItem('cryptoblocks_workspace') || '{}'
      if (ws === '{}') { showToast('Build something first!', 'info'); setSharing(false); return }
      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      const res = await fetch('/api/projects', {
        method: 'POST', headers,
        body: JSON.stringify({
          name: 'Shared Project — ' + new Date().toLocaleDateString(),
          authorName: p.userName || 'Anonymous',
          description: 'Shared via link',
          category: 'General',
          workspaceJson: ws,
          tags: ['shared'],
          blockCount: (() => { try { return JSON.parse(ws)?.blocks?.blocks?.length ?? 0 } catch { return 0 } })(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        await navigator.clipboard.writeText(`${window.location.origin}/project/${data.id}`)
        setShareLinkCopied(true)
        setTimeout(() => setShareLinkCopied(false), 3000)
      }
    } catch { /* clipboard or fetch failure — UI stays in idle state */ }
    setSharing(false)
    p.close()
  }

  return (
    <div className={menuDropdown}>
      <button onClick={() => p.requirePro(() => { p.onExportHtml(); p.close() })} className={menuItem}>
        <Icon name="download" className="w-4 h-4 text-success" />
        Export as HTML
        {p.isPro ? <span className="ml-auto text-xs text-overlay">.html</span> : <span className="ml-auto"><ProBadge /></span>}
      </button>
      <button onClick={() => p.requirePro(() => { p.onExportPwa(); p.close() })} className={menuItem}>
        <Icon name="mobile-app" className="w-4 h-4 text-accent" />
        Export as App (PWA)
        {p.isPro ? <span className="ml-auto text-xs text-overlay">.zip</span> : <span className="ml-auto"><ProBadge /></span>}
      </button>
      <button onClick={handleCopyEmbed} className={menuItem}>
        <Icon name="code-brackets" className="w-4 h-4 text-accent" />
        {embedCopied ? 'Copied!' : 'Copy Embed Snippet'}
        {p.isPro ? <span className="ml-auto text-xs text-overlay">&lt;/&gt;</span> : <span className="ml-auto"><ProBadge /></span>}
      </button>
      <button onClick={() => p.requireAuth(() => { p.onPublish(); p.close() })} className={menuItem}>
        <Icon name="cloud-up-arrow" className="w-4 h-4 text-purple" />
        Publish to GitHub
        {p.isSignedIn
          ? <span className="ml-auto text-xs text-overlay">Live URL</span>
          : <SignInBadge />}
      </button>
      <button onClick={handleShareLink} className={menuItem}>
        <Icon name="link" className="w-4 h-4 text-success" />
        {shareLinkCopied ? '✓ Link Copied!' : sharing ? 'Sharing...' : 'Share Link'}
        <span className="ml-auto text-xs text-overlay">🔗</span>
      </button>
    </div>
  )
}
