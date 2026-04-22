/**
 * Main menu dropdown — navigation to Shareplace, Leaderboard, Daily,
 * Stats, Dashboard, Profile, Teacher, Learn, Examples, and the 4
 * gameplay modes.
 */

import { Icon } from '../Icon'
import { ProBadge } from '../../billing/UpgradeGate'
import type { AppMode } from '../../types/appMode'

const menuItem = 'flex items-center gap-2 w-full px-3 py-2.5 text-sm text-text hover:bg-surface-1 transition-colors text-left'
const menuDropdown = 'absolute left-0 mt-1 w-56 bg-surface-0 border border-surface-1 rounded-lg shadow-xl z-50 py-1'
const menuDivider = 'h-px bg-surface-1 my-1'

export interface MainMenuProps {
  mode: AppMode
  isPro: boolean
  dailyStreak: number
  requirePro: (action: () => void) => void
  close: () => void

  onOpenCollab?: () => void
  onOpenStats: () => void
  onOpenExamples: () => void
  onOpenChallenges: () => void
  onOpenBlocksets: () => void
  onOpenGolf: () => void
  onOpenLab: () => void
}

export default function MainMenu(p: MainMenuProps) {
  const activeBadge = (label: string, cls: string) =>
    <span className={`ml-auto text-xs ${cls} font-bold`}>{label}</span>

  return (
    <div className={menuDropdown}>
      {p.onOpenCollab && (
        <button onClick={() => { p.onOpenCollab!(); p.close() }} className={menuItem}>
          <Icon name="users" className="w-4 h-4 text-accent" />
          Code with Friends
        </button>
      )}
      <a href="/shareplace" onClick={p.close} className={menuItem}>
        <Icon name="bolt" className="w-4 h-4 text-success" />
        Shareplace
      </a>
      <a href="/leaderboard" onClick={p.close} className={menuItem}>
        <span className="w-4 h-4 flex items-center justify-center text-warn text-base">🏆</span>
        Leaderboard
      </a>
      <a href="/daily" onClick={p.close} className={menuItem}>
        <span className="w-4 h-4 flex items-center justify-center text-peach text-base">🎯</span>
        Daily Challenge
        {p.dailyStreak > 0 && (
          <span className="ml-auto text-xs text-peach font-bold">{p.dailyStreak}🔥</span>
        )}
      </a>
      <button onClick={() => { p.onOpenStats(); p.close() }} className={menuItem}>
        <Icon name="bars-chart" className="w-4 h-4 text-text" />
        Stats
      </button>
      <a href="/dashboard" onClick={p.close} className={menuItem}>
        <Icon name="dashboard-grid" className="w-4 h-4 text-peach" />
        Dashboard
      </a>
      <a href="/profile" onClick={p.close} className={menuItem}>
        <Icon name="user-circle" className="w-4 h-4 text-purple" />
        Profile & Settings
      </a>
      <a
        href={p.isPro ? '/teacher' : '#'}
        onClick={(e) => { if (!p.isPro) { e.preventDefault(); p.requirePro(() => {}) } else { p.close() } }}
        className={menuItem}
      >
        <span className="w-4 h-4 flex items-center justify-center text-base">🏫</span>
        Classrooms
        {!p.isPro && <span className="ml-auto"><ProBadge /></span>}
      </a>

      <div className={menuDivider} />

      <a href="/learn" onClick={p.close} className={menuItem}>
        <Icon name="book-open" className="w-4 h-4 text-accent" />
        Learn JavaScript
      </a>
      <button onClick={() => { p.onOpenExamples(); p.close() }} className={menuItem}>
        <Icon name="book" className="w-4 h-4 text-success" />
        Examples
      </button>

      <div className={menuDivider} />

      <button onClick={() => { p.onOpenChallenges(); p.close() }} className={menuItem}>
        <Icon name="sparkles" className="w-4 h-4 text-warn" />
        Challenges
        {p.mode === 'challenges' && activeBadge('Active', 'text-warn')}
      </button>
      <button onClick={() => { p.onOpenBlocksets(); p.close() }} className={menuItem}>
        <Icon name="book" className="w-4 h-4 text-accent" />
        Blocksets
        {p.mode === 'blocksets' && activeBadge('Active', 'text-accent')}
      </button>
      <button onClick={() => { p.onOpenGolf(); p.close() }} className={menuItem}>
        <Icon name="flag" className="w-4 h-4 text-success" />
        Code Golf
        {p.mode === 'code-golf' ? activeBadge('Active', 'text-success') : <span className="ml-auto"><ProBadge /></span>}
      </button>
      <button onClick={() => { p.onOpenLab(); p.close() }} className={menuItem}>
        <Icon name="book-classroom" className="w-4 h-4 text-purple" />
        Code Lab
        {p.mode === 'code-lab' ? activeBadge('Active', 'text-purple') : <span className="ml-auto"><ProBadge /></span>}
      </button>
    </div>
  )
}
