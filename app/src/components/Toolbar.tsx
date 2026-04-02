import { useRef, useState, useEffect, useCallback } from 'react'
import type { Language } from '../types/block'
import { toggleHackerMode } from '../easter-eggs/hacker-mode'

type AppMode = 'sandbox' | 'challenges' | 'active-challenge'
  | 'blocksets' | 'active-blockset'
  | 'code-golf' | 'active-golf'
  | 'code-lab' | 'active-lab'

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
  slowMo: boolean
  onToggleSlowMo: () => void
  blockCount?: number
}

const btn = 'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors'

export default function Toolbar({
  language,
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
  slowMo,
  onToggleSlowMo,
  blockCount = 0,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importAsBlockInputRef = useRef<HTMLInputElement>(null)
  const [openMenu, setOpenMenu] = useState<'file' | 'build' | 'share' | 'learn' | 'mobile' | null>(null)
  const [embedCopied, setEmbedCopied] = useState(false)
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

  const menuItem = 'flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[#cdd6f4] hover:bg-[#45475a] transition-colors text-left'
  const menuDropdown = 'absolute right-0 mt-1 w-56 bg-[#313244] border border-[#45475a] rounded-lg shadow-xl z-50 py-1'
  const menuDivider = 'h-px bg-[#45475a] my-1'
  const chevron = (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )

  return (
    <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-[#181825] border-b border-[#313244] select-none">
      {/* Logo — click 7 times rapidly to toggle hacker mode */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer select-none" onClick={handleLogoClick}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-[#89b4fa]" />
          <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-[#f9e2af] -ml-1.5" />
          <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-[#a6e3a1] -ml-1.5" />
        </div>
        <h1 className="text-base md:text-lg font-bold text-[#cdd6f4] tracking-tight">
          CryptoBlocks
        </h1>
        <span className="hidden md:inline text-[10px] text-[#6c7086] bg-[#313244] px-1.5 py-0.5 rounded font-mono">
          v0.1
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
                className={`${btn} text-[#cdd6f4] hover:bg-[#313244]`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                File
                {chevron}
              </button>

              {openMenu === 'file' && (
                <div className={menuDropdown}>
                  <button onClick={() => { onExport(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Save .blocks
                  </button>
                  <button onClick={() => { fileInputRef.current?.click(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    Load .blocks
                  </button>
                  <button onClick={() => { importAsBlockInputRef.current?.click(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Import as Block
                  </button>
                  <div className={menuDivider} />
                  <button onClick={() => { onClear(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#f38ba8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Workspace
                  </button>
                </div>
              )}
            </div>

            {/* Build dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => toggleMenu('build')}
                className={`${btn} text-[#f9e2af] hover:bg-[#313244]`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Build
                {chevron}
              </button>

              {openMenu === 'build' && (
                <div className={menuDropdown}>
                  <button onClick={() => { onCreateBlock(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#f9e2af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Block
                  </button>
                  <button onClick={() => { onCodeToBlocks(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#cba6f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Code to Blocks
                  </button>
                </div>
              )}
            </div>

            {/* Share dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => toggleMenu('share')}
                className={`${btn} bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#89b4fa]/80`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Share
                {chevron}
              </button>

              {openMenu === 'share' && (
                <div className={menuDropdown}>
                  <button
                    onClick={() => { onExportHtml(); setOpenMenu(null) }}
                    className={menuItem}
                  >
                    <svg className="w-4 h-4 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Export as HTML
                    <span className="ml-auto text-xs text-[#6c7086]">.html</span>
                  </button>
                  <button
                    onClick={async () => {
                      onCopyEmbed()
                      setEmbedCopied(true)
                      setTimeout(() => setEmbedCopied(false), 2000)
                    }}
                    className={menuItem}
                  >
                    <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    {embedCopied ? 'Copied!' : 'Copy Embed Snippet'}
                    <span className="ml-auto text-xs text-[#6c7086]">&lt;/&gt;</span>
                  </button>
                  <div className={menuDivider} />
                  <button
                    onClick={() => { onPublish(); setOpenMenu(null) }}
                    className={menuItem}
                  >
                    <svg className="w-4 h-4 text-[#cba6f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Publish to GitHub
                    <span className="ml-auto text-xs text-[#6c7086]">Live URL</span>
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-[#313244]" />

            {/* Stats button */}
            <button
              onClick={onOpenStats}
              className={`hidden md:flex ${btn} text-[#cdd6f4] hover:bg-[#313244]`}
              title="Developer Stats"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Stats
            </button>

            {/* Learn dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => toggleMenu('learn')}
                className={
                  ['challenges', 'blocksets', 'code-golf', 'code-lab'].includes(mode)
                    ? `${btn} bg-[#f9e2af] text-[#1e1e2e]`
                    : `${btn} text-[#cdd6f4] hover:bg-[#313244]`
                }
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Learn
                {chevron}
              </button>

              {openMenu === 'learn' && (
                <div className={menuDropdown}>
                  <button onClick={() => { onOpenExamples(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Examples
                  </button>
                  <div className={menuDivider} />
                  <button onClick={() => { onOpenChallenges(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#f9e2af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Challenges
                    {mode === 'challenges' && <span className="ml-auto text-xs text-[#f9e2af] font-bold">Active</span>}
                  </button>
                  <button onClick={() => { onOpenBlocksets(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Blocksets
                    {mode === 'blocksets' && <span className="ml-auto text-xs text-[#89b4fa] font-bold">Active</span>}
                  </button>
                  <button onClick={() => { onOpenGolf(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11" />
                    </svg>
                    Code Golf
                    {mode === 'code-golf' && <span className="ml-auto text-xs text-[#a6e3a1] font-bold">Active</span>}
                  </button>
                  <button onClick={() => { onOpenLab(); setOpenMenu(null) }} className={menuItem}>
                    <svg className="w-4 h-4 text-[#cba6f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Code Lab
                    {mode === 'code-lab' && <span className="ml-auto text-xs text-[#cba6f7] font-bold">Active</span>}
                  </button>
                </div>
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
                ? `md:hidden ${btn} bg-[#f9e2af] text-[#1e1e2e]`
                : `md:hidden ${btn} text-[#cdd6f4] hover:bg-[#313244]`
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="hidden sm:inline">Challenges</span>
          </button>
        )}

        {/* Peek / Hide Code */}
        {mode !== 'challenges' && mode !== 'blocksets' && mode !== 'code-golf' && mode !== 'code-lab' && mode !== 'active-lab' && (
          <button
            onClick={onToggleCode}
            className={
              showCode
                ? `${btn} bg-[#cba6f7] text-[#1e1e2e]`
                : `${btn} text-[#cdd6f4] hover:bg-[#313244]`
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="hidden sm:inline">{showCode ? 'Hide Code' : 'Peek Code'}</span>
          </button>
        )}

        {/* Language indicator (desktop) */}
        {mode !== 'challenges' && mode !== 'blocksets' && mode !== 'code-golf' && mode !== 'code-lab' && mode !== 'active-lab' && (
          <div className="hidden md:block text-xs text-[#6c7086] bg-[#313244] px-2 py-1 rounded font-mono">
            {language === 'javascript' ? 'JS' : language === 'python' ? 'PY' : 'HTML'}
          </div>
        )}

        {/* Block counter */}
        {mode === 'sandbox' && (
          <div
            className="hidden md:flex items-center gap-1 text-xs text-[#6c7086] bg-[#313244] px-2 py-1 rounded font-mono"
            title="Blocks on workspace"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {blockCount}
          </div>
        )}

        {/* Slow-Mo toggle */}
        {mode === 'sandbox' && (
          <button
            onClick={onToggleSlowMo}
            disabled={isRunning}
            className={`${btn} ${slowMo ? 'bg-[#f9e2af] text-[#1e1e2e]' : 'text-[#6c7086] hover:bg-[#313244]'} transition-colors ${isRunning && slowMo ? 'animate-pulse' : ''} ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Slow-Mo: highlight blocks as they run"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden md:inline">Slow-Mo</span>
          </button>
        )}

        {/* Run / Stop */}
        {mode === 'sandbox' && (
          <>
            {isRunning ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
                Stop
              </button>
            ) : (
              <button
                onClick={onRun}
                className={`${btn} bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 font-semibold px-3 md:px-4`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Run
              </button>
            )}
          </>
        )}

        {/* === Mobile overflow menu === */}
        {!inChallenge && (
          <div className="relative md:hidden">
            <button
              onClick={() => toggleMenu('mobile')}
              className={`${btn} text-[#cdd6f4] hover:bg-[#313244]`}
              aria-label="More options"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>

            {openMenu === 'mobile' && (
              <div className="absolute right-0 mt-1 w-56 bg-[#313244] border border-[#45475a] rounded-lg shadow-xl z-50 py-1 max-h-[70vh] overflow-auto">
                <button onClick={() => { onExport(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Save .blocks
                </button>
                <button onClick={() => { fileInputRef.current?.click(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Load .blocks
                </button>
                <button onClick={() => { importAsBlockInputRef.current?.click(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Import as Block
                </button>
                <div className={menuDivider} />
                <button onClick={() => { onCreateBlock(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#f9e2af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Block
                </button>
                <button onClick={() => { onCodeToBlocks(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#cba6f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Code to Blocks
                </button>
                <button onClick={() => { onOpenExamples(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Examples
                </button>
                <button onClick={() => { onOpenBlocksets(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Blocksets
                </button>
                <button onClick={() => { onOpenGolf(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11" />
                  </svg>
                  Code Golf
                </button>
                <button onClick={() => { onOpenLab(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#cba6f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Code Lab
                </button>
                <button onClick={() => { onOpenStats(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Developer Stats
                </button>
                <div className={menuDivider} />
                <button onClick={() => { onExportHtml(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#a6e3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Export HTML
                </button>
                <button onClick={() => { onPublish(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#cba6f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Publish to GitHub
                </button>
                <div className={menuDivider} />
                <button onClick={() => { onClear(); setOpenMenu(null) }} className={menuItem}>
                  <svg className="w-4 h-4 text-[#f38ba8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Workspace
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
