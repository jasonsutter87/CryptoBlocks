import { type ReactNode, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { useIsPro, openCheckout } from '../billing/useIsPro'
import { ProBadge } from '../billing/UpgradeGate'

interface SharedLayoutProps {
  children: ReactNode
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const { pathname } = useLocation()
  const { isPro } = useIsPro()
  const { getToken } = useAuth()

  // Apply theme
  useEffect(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('cryptoblocks-settings') || '{}')
      if (settings.theme) document.documentElement.setAttribute('data-theme', settings.theme)
    } catch {}
  }, [])

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
            ? 'text-accent bg-accent/10'
            : 'text-subtext hover:text-text hover:bg-surface-0'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      {/* Top nav */}
      <nav className="shrink-0 h-14 bg-mantle border-b border-surface-0 flex items-center px-4 sm:px-6">
        <div className="flex items-center gap-3 mr-8">
          {/* Logo blocks */}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-accent" />
            <div className="w-4 h-4 rounded bg-warn -ml-1.5" />
            <div className="w-4 h-4 rounded bg-success -ml-1.5" />
          </div>
          <span className="font-bold text-text tracking-tight">CryptoBlocks</span>
          <span className="text-[10px] text-overlay bg-surface-0 px-1.5 py-0.5 rounded font-mono hidden sm:inline">
            v0.3
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLink('/', 'Editor')}
          {navLink('/daily', 'Daily 🎯')}
          {navLink('/learn', 'Learn')}
          {navLink('/shareplace', 'Shareplace')}
          {navLink('/leaderboard', '🏆')}
          <a
            href={isPro ? '/teacher' : '#'}
            onClick={(e) => { if (!isPro) { e.preventDefault(); openCheckout(getToken) } }}
            className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              pathname === '/teacher' ? 'bg-surface-0 text-text' : 'text-overlay hover:text-subtext'
            }`}
          >
            Classrooms
            {!isPro && <ProBadge />}
          </a>
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/profile', 'Profile')}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple text-base hover:bg-purple/80 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: { avatarBox: 'w-8 h-8' },
              }}
            />
          </SignedIn>
        </div>
      </nav>

      {/* Page content — scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="pb-16">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 bg-mantle border-t border-surface-0 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-accent" />
              <div className="w-3 h-3 rounded bg-warn -ml-1" />
              <div className="w-3 h-3 rounded bg-success -ml-1" />
            </div>
            <span className="text-sm text-subtext">CryptoBlocks</span>
          </div>
          <p className="text-xs text-overlay">
            Built with blocks. Powered by curiosity.
          </p>
          <div className="flex items-center gap-4 text-xs text-overlay">
            <a href="https://github.com/jasonsutter87/CryptoBlocks" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">GitHub</a>
            <Link to="/shareplace" className="hover:text-text transition-colors">Shareplace</Link>
            <Link to="/dashboard" className="hover:text-text transition-colors">Dashboard</Link>
            <Link to="/profile" className="hover:text-text transition-colors">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
