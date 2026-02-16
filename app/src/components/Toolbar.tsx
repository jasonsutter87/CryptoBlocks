import { useRef, useState, useEffect } from 'react'
import type { Language } from '../types/block'

type AppMode = 'sandbox' | 'challenges' | 'active-challenge'

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
  onExportHtml: () => void
  onCopyEmbed: () => void
  onPublish: () => void
  onClear: () => void
  mode: AppMode
  onOpenChallenges: () => void
  onOpenExamples: () => void
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
  onExportHtml,
  onCopyEmbed,
  onPublish,
  onClear,
  mode,
  onOpenChallenges,
  onOpenExamples,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  // Close share menu on outside click
  useEffect(() => {
    if (!showShareMenu) return
    const handleClick = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showShareMenu])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
      e.target.value = ''
    }
  }

  const inChallenge = mode === 'active-challenge'

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244] select-none">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-[#89b4fa]" />
          <div className="w-5 h-5 rounded bg-[#f9e2af] -ml-1.5" />
          <div className="w-5 h-5 rounded bg-[#a6e3a1] -ml-1.5" />
        </div>
        <h1 className="text-lg font-bold text-[#cdd6f4] tracking-tight">
          CryptoBlocks
        </h1>
        <span className="text-[10px] text-[#6c7086] bg-[#313244] px-1.5 py-0.5 rounded font-mono">
          v0.1
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!inChallenge && (
          <>
            {/* Save */}
            <button
              onClick={onExport}
              className={`${btn} text-[#cdd6f4] hover:bg-[#313244]`}
              title="Save project as .blocks file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Save
            </button>

            {/* Load */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${btn} text-[#cdd6f4] hover:bg-[#313244]`}
              title="Load a .blocks file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Load
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".blocks"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Share */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => setShowShareMenu((prev) => !prev)}
                className={`${btn} bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#89b4fa]/80`}
                title="Export as HTML or copy embed code"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Share
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showShareMenu && (
                <div className="absolute right-0 mt-1 w-56 bg-[#313244] border border-[#45475a] rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={() => {
                      onExportHtml()
                      setShowShareMenu(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#cdd6f4] hover:bg-[#45475a] transition-colors text-left"
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
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#cdd6f4] hover:bg-[#45475a] transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    {embedCopied ? 'Copied!' : 'Copy Embed Snippet'}
                    <span className="ml-auto text-xs text-[#6c7086]">&lt;/&gt;</span>
                  </button>
                  <div className="h-px bg-[#45475a] my-1" />
                  <button
                    onClick={() => {
                      onPublish()
                      setShowShareMenu(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#cdd6f4] hover:bg-[#45475a] transition-colors text-left"
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
            <div className="w-px h-6 bg-[#313244]" />

            {/* Create Block */}
            <button
              onClick={onCreateBlock}
              className={`${btn} bg-[#f9e2af] text-[#1e1e2e] hover:bg-[#f9e2af]/80`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Block
            </button>

            {/* Code to Blocks */}
            <button
              onClick={onCodeToBlocks}
              className={`${btn} text-[#cdd6f4] hover:bg-[#313244]`}
              title="Convert JavaScript code to blocks"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Code to Blocks
            </button>

            {/* Clear Workspace */}
            <button
              onClick={onClear}
              className={`${btn} bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/80`}
              title="Clear workspace"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          </>
        )}

        {/* Examples */}
        {!inChallenge && (
          <button
            onClick={onOpenExamples}
            className={`${btn} text-[#cdd6f4] hover:bg-[#313244]`}
            title="Browse example projects"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Examples
          </button>
        )}

        {/* Challenges */}
        <button
          onClick={onOpenChallenges}
          className={
            mode === 'challenges'
              ? `${btn} bg-[#f9e2af] text-[#1e1e2e]`
              : `${btn} text-[#cdd6f4] hover:bg-[#313244]`
          }
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Challenges
        </button>

        {/* Peek / Hide Code */}
        {mode !== 'challenges' && (
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
            {showCode ? 'Hide Code' : 'Peek Code'}
          </button>
        )}

        {/* Language indicator */}
        {mode !== 'challenges' && (
          <div className="text-xs text-[#6c7086] bg-[#313244] px-2 py-1 rounded font-mono">
            {language === 'javascript' ? 'JS' : language === 'python' ? 'PY' : 'HTML'}
          </div>
        )}

        {/* Run / Stop */}
        {mode === 'sandbox' && (
          <>
            {isRunning ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
                Stop
              </button>
            ) : (
              <button
                onClick={onRun}
                className={`${btn} bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 font-semibold px-4`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Run
              </button>
            )}
          </>
        )}
      </div>
    </header>
  )
}
