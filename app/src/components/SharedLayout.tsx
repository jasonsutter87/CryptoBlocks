import { type ReactNode, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SharedLayoutProps {
  children: ReactNode
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const { pathname } = useLocation()

  // Unlock scrolling for non-editor pages; restore overflow lock on unmount
  useEffect(() => {
    document.body.classList.add('scrollable-page')
    document.documentElement.classList.add('scrollable-page')
    return () => {
      document.body.classList.remove('scrollable-page')
      document.documentElement.classList.remove('scrollable-page')
    }
  }, [])

  const navLink = (to: string, label: string) => {
    const isActive = pathname === to
    return (
      <Link
        to={to}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'text-[#89b4fa] bg-[#89b4fa]/10'
            : 'text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      {/* Top nav */}
      <nav className="shrink-0 h-14 bg-[#181825] border-b border-[#313244] flex items-center px-4 sm:px-6">
        <div className="flex items-center gap-3 mr-8">
          {/* Logo blocks */}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#89b4fa]" />
            <div className="w-4 h-4 rounded bg-[#f9e2af] -ml-1.5" />
            <div className="w-4 h-4 rounded bg-[#a6e3a1] -ml-1.5" />
          </div>
          <span className="font-bold text-[#cdd6f4] tracking-tight">CryptoBlocks</span>
          <span className="text-[10px] text-[#6c7086] bg-[#313244] px-1.5 py-0.5 rounded font-mono hidden sm:inline">
            v0.1
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLink('/', 'Editor')}
          {navLink('/shareplace', 'Shareplace')}
          {navLink('/dashboard', 'Dashboard')}
        </div>
      </nav>

      {/* Page content — scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="pb-16">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 bg-[#181825] border-t border-[#313244] py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#89b4fa]" />
              <div className="w-3 h-3 rounded bg-[#f9e2af] -ml-1" />
              <div className="w-3 h-3 rounded bg-[#a6e3a1] -ml-1" />
            </div>
            <span className="text-sm text-[#a6adc8]">CryptoBlocks</span>
          </div>
          <p className="text-xs text-[#6c7086]">
            Built with blocks. Powered by curiosity.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#6c7086]">
            <a href="https://github.com/jasonsutter87/CryptoBlocks" target="_blank" rel="noopener noreferrer" className="hover:text-[#cdd6f4] transition-colors">GitHub</a>
            <Link to="/shareplace" className="hover:text-[#cdd6f4] transition-colors">Shareplace</Link>
            <Link to="/dashboard" className="hover:text-[#cdd6f4] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
