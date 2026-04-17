import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { Language } from '../types/block'
import { Icon } from './Icon'
import DropdownMenu from './DropdownMenu'
import type { MenuItem } from './DropdownMenu'
import FileMenu from './toolbar-menus/FileMenu'
import MainMenu from './toolbar-menus/MainMenu'
import MobileMenu from './toolbar-menus/MobileMenu'
import { toggleHackerMode } from '../easter-eggs/hacker-mode'
import MicrobitStatus from './MicrobitStatus'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '../auth'
import NotificationBell from './NotificationBell'
import { showToast } from './Toast'
import { ProBadge } from '../billing/UpgradeGate'
import { useIsPro, openCheckout } from '../billing/useIsPro'
import { loadDailyState, getEffectiveStreak } from '../daily/state'
import { getDayNumber } from '../daily/getTodaysPuzzle'

import type { AppMode } from '../types/appMode'

interface ToolbarProps {
  language: Language
  isRunning: boolean
  onRun: () => void
  onStop: () => void
  showCode: boolean
  onToggleCode: () => void
  onCreateBlock: () => void
  onCodeToBlocks: () => void
  onExport: () => void
  onImport: (file: File) => void
  onImportAsBlock: (file: File) => void
  onExportHtml: () => void
  onCopyEmbed: () => void
  onPublish: () => void
  onClear: () => void
  mode: AppMode
  onOpenChallenges: () => void
  onOpenBlocksets: () => void
  onOpenGolf: () => void
  onOpenLab: () => void
  onOpenExamples: () => void
  onOpenStats: () => void
  blockCount?: number
  onSaveCheckpoint: () => void
  onOpenHistory: () => void
  currentBranchName?: string
  onUndo: () => void
  onRedo: () => void
  onFitView: () => void
  onOpenSettings: () => void
  onOpenTutorial?: () => void
  onExportPwa: () => void
  onSaveToDashboard: () => void
  onOpenSpriteEditor?: () => void
  onOpenSpriteBrowser?: () => void
  onOpenLevelEditor?: () => void
  onOpenCollab?: () => void
  onRunForEveryone?: () => void
  isCollabMode?: boolean
  onImportScratch?: () => void
}

const btn = 'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors'

export default function Toolbar({
  language: _language,
  isRunning,
  onRun,
  onStop,
  showCode,
  onToggleCode,
  onCreateBlock,
  onCodeToBlocks,
  onExport,
  onImport,
  onImportAsBlock,
  onExportHtml,
  onCopyEmbed,
  onPublish,
  onClear,
  mode,
  onOpenChallenges,
  onOpenBlocksets,
  onOpenGolf,
  onOpenLab,
  onOpenExamples,
  onOpenStats,
  blockCount = 0,
  onSaveCheckpoint,
  onOpenHistory,
  currentBranchName,
  onUndo,
  onRedo,
  onFitView,
  onOpenSettings,
  onOpenTutorial,
  onExportPwa,
  onSaveToDashboard,
  onOpenSpriteEditor,
  onOpenSpriteBrowser,
  onOpenLevelEditor,
  onOpenCollab,
  onRunForEveryone,
  isCollabMode = false,
  onImportScratch,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importAsBlockInputRef = useRef<HTMLInputElement>(null)
  const [openMenu, setOpenMenu] = useState<'file' | 'build' | 'menu' | 'mobile' | null>(null)
  const dailyStreak = useMemo(() => getEffectiveStreak(loadDailyState(), getDayNumber()), [])
  const { isPro } = useIsPro()
  const { getToken, isSignedIn } = useAuth()

  const requireAuth = (action: () => void) => {
    if (isSignedIn) { action(); return }
    showToast('Sign in to save and share your work!', 'signin')
  }

  const requirePro = (action: () => void) => {
    if (isPro) { action(); return }
    openCheckout(getToken)
  }
  const menuContainerRef = useRef<HTMLDivElement>(null)

  // Logo click counter — 7 rapid clicks toggles hacker mode
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleLogoClick = useCallback(() => {
    logoClickCount.current++
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current)
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0 }, 1500)
    if (logoClickCount.current >= 7) {
      logoClickCount.current = 0
      toggleHackerMode()
    }
  }, [])

  // Close menus on outside click
  useEffect(() => {
    if (!openMenu) return
    const handleClick = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenu])

  const toggleMenu = (menu: typeof openMenu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
      e.target.value = ''
    }
  }

  const handleImportAsBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImportAsBlock(file)
      e.target.value = ''
    }
  }

  const inChallenge = mode === 'active-challenge' || mode === 'active-blockset' || mode === 'active-golf' || mode === 'active-lab'

  // menuItem / menuDropdown / menuDivider class strings moved to the
  // per-menu files in toolbar-menus/ since the menus were extracted.
  const chevron = (
    <Icon name="chevron-down" className="w-3 h-3" />
  )

  return (
    <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-mantle border-b border-surface-0 select-none">
      {/* Logo — click 7 times rapidly to toggle hacker mode */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer select-none" onClick={handleLogoClick}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-accent" />
          <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-warn -ml-1.5" />
          <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-success -ml-1.5" />
        </div>
        <h1 className="text-base md:text-lg font-bold text-text tracking-tight">
          CryptoBlocks
        </h1>
        <span className="hidden md:inline text-[10px] text-overlay bg-surface-0 px-1.5 py-0.5 rounded font-mono">
          v0.3
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 md:gap-2" ref={menuContainerRef}>
        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept=".blocks" onChange={handleFileChange} className="hidden" />
        <input ref={importAsBlockInputRef} type="file" accept=".blocks" onChange={handleImportAsBlockChange} className="hidden" />

        {/* === Desktop dropdowns (hidden on mobile) === */}
        {!inChallenge && (
          <>
            {/* File dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => toggleMenu('file')}
                className={`${btn} text-text hover:bg-surface-0`}
              >
                <Icon name="folder" className="w-4 h-4" />
                File
                {chevron}
              </button>

              {openMenu === 'file' && (
                <FileMenu
                  isSignedIn={!!isSignedIn}
                  isPro={isPro}
                  currentBranchName={currentBranchName}
                  fileInputRef={fileInputRef}
                  importAsBlockInputRef={importAsBlockInputRef}
                  getToken={getToken}
                  requireAuth={requireAuth}
                  requirePro={requirePro}
                  close={() => setOpenMenu(null)}
                  onExport={onExport}
                  onSaveToDashboard={onSaveToDashboard}
                  onImportScratch={onImportScratch}
                  onSaveCheckpoint={onSaveCheckpoint}
                  onOpenHistory={onOpenHistory}
                  onOpenSettings={onOpenSettings}
                  onOpenTutorial={onOpenTutorial}
                  onExportHtml={onExportHtml}
                  onExportPwa={onExportPwa}
                  onCopyEmbed={onCopyEmbed}
                  onPublish={onPublish}
                  onClear={onClear}
                />
              )}
            </div>

            {/* Build dropdown */}
            <div className="relative hidden md:block">
              <button onClick={() => toggleMenu('build')} className={`${btn} text-warn hover:bg-surface-0`}>
                <Icon name="plus" className="w-4 h-4" /> Build {chevron}
              </button>
              {openMenu === 'build' && (
                <DropdownMenu items={[
                  { kind: 'button', icon: 'plus', iconCls: 'w-4 h-4 text-warn', label: 'Create Block', onClick: () => requirePro(() => { onCreateBlock(); setOpenMenu(null) }), badge: !isPro ? <ProBadge /> : undefined },
                  { kind: 'button', icon: 'pages', iconCls: 'w-4 h-4 text-purple', label: 'Code to Blocks', onClick: () => requirePro(() => { onCodeToBlocks(); setOpenMenu(null) }), badge: !isPro ? <ProBadge /> : undefined },
                  ...(onOpenSpriteEditor ? [{ kind: 'button' as const, emoji: '🎨', label: 'Sprite Editor', onClick: () => requirePro(() => { onOpenSpriteEditor(); setOpenMenu(null) }), badge: !isPro ? <ProBadge /> : undefined }] : []),
                  ...(onOpenSpriteBrowser ? [{ kind: 'button' as const, emoji: '🖼️', label: 'Browse Sprites', onClick: () => { onOpenSpriteBrowser(); setOpenMenu(null) } }] : []),
                  ...(onOpenLevelEditor ? [{ kind: 'button' as const, emoji: '🗺️', label: 'Level Editor', onClick: () => requirePro(() => { onOpenLevelEditor(); setOpenMenu(null) }), badge: !isPro ? <ProBadge /> : undefined }] : []),
                ] satisfies MenuItem[]} />
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-surface-0" />

            {/* Combined "Menu" dropdown — replaces Friends / Shareplace / Stats / Learn */}
            <div className="relative hidden md:block">
              <button
                onClick={() => toggleMenu('menu')}
                className={
                  ['challenges', 'blocksets', 'code-golf', 'code-lab'].includes(mode)
                    ? `${btn} bg-warn text-base`
                    : `${btn} text-text hover:bg-surface-0`
                }
                title="Friends, Shareplace, Stats, Learn"
              >
                <Icon name="bars" className="w-4 h-4" />
                Menu
                {chevron}
              </button>

              {openMenu === 'menu' && (
                <MainMenu
                  mode={mode}
                  isPro={isPro}
                  dailyStreak={dailyStreak}
                  requirePro={requirePro}
                  close={() => setOpenMenu(null)}
                  onOpenCollab={onOpenCollab}
                  onOpenStats={onOpenStats}
                  onOpenExamples={onOpenExamples}
                  onOpenChallenges={onOpenChallenges}
                  onOpenBlocksets={onOpenBlocksets}
                  onOpenGolf={onOpenGolf}
                  onOpenLab={onOpenLab}
                />
              )}
            </div>
          </>
        )}

        {/* Challenges button — always visible on mobile when not in challenge */}
        {!inChallenge && (
          <button
            onClick={onOpenChallenges}
            className={
              mode === 'challenges'
                ? `md:hidden ${btn} bg-warn text-base`
                : `md:hidden ${btn} text-text hover:bg-surface-0`
            }
          >
            <Icon name="sparkles" className="w-4 h-4" />
            <span className="hidden sm:inline">Challenges</span>
          </button>
        )}

        {/* Block counter */}
        {mode === 'sandbox' && (
          <div
            className="hidden md:flex items-center gap-1 text-xs text-overlay bg-surface-0 px-2 py-1 rounded font-mono"
            title="Blocks on workspace"
          >
            <Icon name="blocks-2x2" className="w-3 h-3" />
            {blockCount}
          </div>
        )}


        {/* Undo / Redo / Fit View — sandbox only, desktop */}
        {mode === 'sandbox' && (
          <div className="hidden md:flex items-center gap-0.5 bg-surface-0 rounded-lg p-0.5">
            <button
              onClick={onUndo}
              title="Undo"
              className="flex items-center justify-center w-7 h-7 rounded text-overlay hover:text-text hover:bg-surface-1 transition-colors"
            >
              <Icon name="arrow-undo" className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              title="Redo"
              className="flex items-center justify-center w-7 h-7 rounded text-overlay hover:text-text hover:bg-surface-1 transition-colors"
            >
              <Icon name="arrow-redo" className="w-4 h-4" />
            </button>
            <button
              onClick={onFitView}
              title="Fit View"
              className="flex items-center justify-center w-7 h-7 rounded text-overlay hover:text-text hover:bg-surface-1 transition-colors"
            >
              <Icon name="expand" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Peek / Hide Code — moved next to Run */}
        {mode !== 'challenges' && mode !== 'blocksets' && mode !== 'code-golf' && mode !== 'code-lab' && mode !== 'active-lab' && (
          <button
            onClick={onToggleCode}
            className={
              showCode
                ? `${btn} bg-purple text-base`
                : `${btn} text-text hover:bg-surface-0`
            }
          >
            <Icon name="code-brackets" className="w-4 h-4" />
            <span className="hidden sm:inline">{showCode ? 'Hide Code' : 'Peek Code'}</span>
          </button>
        )}

        {/* micro:bit Bluetooth connection — moved next to Run */}
        {mode === 'sandbox' && (
          <div className="hidden md:block">
            <MicrobitStatus />
          </div>
        )}

        {/* Run / Stop */}
        {mode === 'sandbox' && (
          <>
            {isRunning ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 text-sm font-semibold rounded-lg bg-danger text-base hover:bg-danger/80 transition-colors"
              >
                <Icon name="stop" className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={onRun}
                className={`${btn} bg-success text-base hover:bg-success/80 font-semibold px-3 md:px-4`}
              >
                <Icon name="play" className="w-4 h-4" />
                Run
              </button>
            )}

            {/* Run for Everyone — collab only */}
            {isCollabMode && !isRunning && onRunForEveryone && (
              <button
                onClick={onRunForEveryone}
                className={`${btn} bg-accent text-base hover:bg-accent/80 font-semibold px-2 md:px-3`}
                title="Run on everyone's screen"
              >
                <Icon name="users" className="w-4 h-4" />
                <Icon name="play" className="w-3 h-3 -ml-1" />
              </button>
            )}
          </>
        )}

        {/* Auth — Sign In / User Avatar */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className={`${btn} bg-purple text-base hover:bg-purple/80 font-semibold px-3`}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <NotificationBell />
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </SignedIn>

        {/* === Mobile overflow menu === */}
        {!inChallenge && (
          <div className="relative md:hidden">
            <button
              onClick={() => toggleMenu('mobile')}
              className={`${btn} text-text hover:bg-surface-0`}
              aria-label="More options"
            >
              <Icon name="dots-vertical" className="w-5 h-5" />
            </button>

            {openMenu === 'mobile' && (
              <MobileMenu
                fileInputRef={fileInputRef}
                importAsBlockInputRef={importAsBlockInputRef}
                close={() => setOpenMenu(null)}
                onOpenCollab={onOpenCollab}
                onExport={onExport}
                onCreateBlock={onCreateBlock}
                onCodeToBlocks={onCodeToBlocks}
                onOpenExamples={onOpenExamples}
                onOpenBlocksets={onOpenBlocksets}
                onOpenGolf={onOpenGolf}
                onOpenLab={onOpenLab}
                onOpenStats={onOpenStats}
                onExportHtml={onExportHtml}
                onPublish={onPublish}
                onUndo={onUndo}
                onRedo={onRedo}
                onFitView={onFitView}
                onSaveCheckpoint={onSaveCheckpoint}
                onOpenHistory={onOpenHistory}
                onClear={onClear}
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}
