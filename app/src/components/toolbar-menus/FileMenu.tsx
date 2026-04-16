/**
 * File menu dropdown — save, load, import, export, publish, share.
 *
 * Extracted from Toolbar.tsx so the main toolbar file doesn't carry
 * 140+ lines of menu button markup.
 */

import { useState, type MutableRefObject } from 'react'
import { Icon } from '../Icon'
import { ProBadge } from '../../billing/UpgradeGate'
import { showToast } from '../Toast'

const menuItem = 'flex items-center gap-2 w-full px-3 py-2.5 text-sm text-text hover:bg-surface-1 transition-colors text-left'
const menuDropdown = 'absolute right-0 mt-1 w-56 bg-surface-0 border border-surface-1 rounded-lg shadow-xl z-50 py-1'
const menuDivider = 'h-px bg-surface-1 my-1'
const SignInBadge = () => <span className="ml-auto text-[10px] text-overlay">Sign in</span>

export interface FileMenuProps {
  isSignedIn: boolean
  isPro: boolean
  currentBranchName?: string
  fileInputRef: MutableRefObject<HTMLInputElement | null>
  importAsBlockInputRef: MutableRefObject<HTMLInputElement | null>
  getToken: () => Promise<string | null>
  requireAuth: (action: () => void) => void
  requirePro: (action: () => void) => void
  close: () => void

  // Actions
  onExport: () => void
  onSaveToDashboard: () => void
  onImportScratch?: () => void
  onSaveCheckpoint: () => void
  onOpenHistory: () => void
  onOpenSettings: () => void
  onOpenTutorial?: () => void
  onExportHtml: () => void
  onExportPwa: () => void
  onCopyEmbed: () => void
  onPublish: () => void
  onClear: () => void
}

export default function FileMenu(p: FileMenuProps) {
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
          authorName: 'Anonymous',
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
      <button onClick={() => p.requireAuth(() => { p.onExport(); p.close() })} className={menuItem}>
        <Icon name="download" className="w-4 h-4 text-accent" />
        Save .blocks
        {!p.isSignedIn && <SignInBadge />}
      </button>
      <button onClick={() => p.requireAuth(() => { p.onSaveToDashboard(); p.close() })} className={menuItem}>
        <Icon name="cloud-up" className="w-4 h-4 text-success" />
        Save to Dashboard
        {!p.isSignedIn && <SignInBadge />}
      </button>
      <button onClick={() => p.requireAuth(() => { p.fileInputRef.current?.click(); p.close() })} className={menuItem}>
        <Icon name="upload" className="w-4 h-4 text-accent" />
        Load .blocks
        {!p.isSignedIn && <SignInBadge />}
      </button>
      <button onClick={() => p.requireAuth(() => { p.importAsBlockInputRef.current?.click(); p.close() })} className={menuItem}>
        <Icon name="cube" className="w-4 h-4 text-accent" />
        Import as Block
        {!p.isSignedIn && <SignInBadge />}
      </button>
      {p.onImportScratch && (
        <button onClick={() => p.requirePro(() => { p.onImportScratch!(); p.close() })} className={menuItem}>
          <span className="text-base leading-none">🐱</span>
          Import from Scratch
          {p.isPro ? <span className="ml-auto text-xs text-overlay">.sb3</span> : <span className="ml-auto"><ProBadge /></span>}
        </button>
      )}

      <div className={menuDivider} />

      <button onClick={() => p.requireAuth(() => { p.onSaveCheckpoint(); p.close() })} className={menuItem}>
        <Icon name="check" className="w-4 h-4 text-success" />
        Save Checkpoint
        {!p.isSignedIn && <SignInBadge />}
      </button>
      <button onClick={() => p.requireAuth(() => { p.onOpenHistory(); p.close() })} className={menuItem}>
        <Icon name="clock" className="w-4 h-4 text-accent" />
        History
        {p.currentBranchName && p.currentBranchName !== 'Main' && (
          <span className="ml-auto text-xs text-purple bg-base px-1.5 py-0.5 rounded font-mono">
            {p.currentBranchName}
          </span>
        )}
      </button>
      <button onClick={() => { p.onOpenSettings(); p.close() }} className={menuItem}>
        <Icon name="cog" className="w-4 h-4 text-overlay" />
        Settings
      </button>
      {p.onOpenTutorial && (
        <button onClick={() => { p.onOpenTutorial!(); p.close() }} className={menuItem}>
          <span className="text-base leading-none">🎓</span>
          Tutorial
        </button>
      )}

      <div className={menuDivider} />

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

      <div className={menuDivider} />

      <button onClick={() => { p.onClear(); p.close() }} className={menuItem}>
        <Icon name="trash" className="w-4 h-4 text-danger" />
        Clear Workspace
      </button>
    </div>
  )
}
