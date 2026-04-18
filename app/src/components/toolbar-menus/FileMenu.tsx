/**
 * File menu dropdown — save, load, import, checkpoint, history, settings.
 * Export/publish/share actions live in ShareMenu.
 */

import { type MutableRefObject } from 'react'
import { Icon } from '../Icon'
import { ProBadge } from '../../billing/UpgradeGate'

const menuItem = 'flex items-center gap-2 w-full px-3 py-2.5 text-sm text-text hover:bg-surface-1 transition-colors text-left'
const menuDropdown = 'absolute right-0 mt-1 w-56 bg-surface-0 border border-surface-1 rounded-lg shadow-xl z-50 py-1'
const menuDivider = 'h-px bg-surface-1 my-1'
const SignInBadge = () => <span className="ml-auto text-[10px] text-overlay">Sign in</span>

export { menuItem, menuDropdown, menuDivider, SignInBadge }

export interface FileMenuProps {
  isSignedIn: boolean
  isPro: boolean
  currentBranchName?: string
  fileInputRef: MutableRefObject<HTMLInputElement | null>
  importAsBlockInputRef: MutableRefObject<HTMLInputElement | null>
  requireAuth: (action: () => void) => void
  requirePro: (action: () => void) => void
  close: () => void

  onExport: () => void
  onSaveToDashboard: () => void
  onImportScratch?: () => void
  onSaveCheckpoint: () => void
  onOpenHistory: () => void
  onOpenSettings: () => void
  onOpenTutorial?: () => void
  onClear: () => void
}

export default function FileMenu(p: FileMenuProps) {
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

      <button onClick={() => { p.onClear(); p.close() }} className={menuItem}>
        <Icon name="trash" className="w-4 h-4 text-danger" />
        Clear Workspace
      </button>
    </div>
  )
}
