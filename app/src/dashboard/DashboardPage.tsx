import { useMemo, useState, useEffect } from 'react'
import { useUser, SignedIn, SignedOut, SignInButton } from '../auth'
import { loadStats } from '../stats'
import ProjectCard from '../shareplace/ProjectCard'
import type { SharedProject } from '../types/shareplace'
import { fetchProjects } from '../shareplace/api'
import { loadDailyState, getEffectiveStreak } from '../daily/state'
import { getDayNumber } from '../daily/getTodaysPuzzle'

interface StatCardProps {
  label: string
  value: string | number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-surface-0 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-3xl font-bold" style={{ color }}>{value}</span>
      <span className="text-sm text-overlay">{label}</span>
    </div>
  )
}

function daysActive(runsByDate: Record<string, number>): number {
  return Object.keys(runsByDate).length
}

export default function DashboardPage() {
  const { user } = useUser()
  const stats = useMemo(() => loadStats(), [])
  const dailyState = useMemo(() => loadDailyState(), [])
  const currentDay = useMemo(() => getDayNumber(), [])
  const dailyStreak = getEffectiveStreak(dailyState, currentDay)
  const [myProjects, setMyProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects().then((all) => {
      const authorName = user?.fullName || user?.username
      if (authorName) {
        setMyProjects(all.filter((p) => p.author === authorName))
      }
      setLoading(false)
    })
  }, [user])

  const statCards = [
    {
      label: 'Total Blocks Created',
      value: stats.totalBlocks.toLocaleString(),
      color: '#89b4fa',
    },
    {
      label: 'Projects Shared',
      value: myProjects.length,
      color: '#a6e3a1',
    },
    {
      label: 'Total Likes',
      value: myProjects.reduce((acc, p) => acc + p.likes, 0),
      color: '#f38ba8',
    },
    {
      label: 'Days Active',
      value: daysActive(stats.runsByDate) || 1,
      color: '#cba6f7',
    },
  ]

  return (
    <div className="min-h-full bg-base">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text tracking-tight mb-1">
            Your Dashboard
          </h1>
          <p className="text-subtext">Track your progress and manage your shared projects.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Additional stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-mantle rounded-xl p-4 border border-surface-0">
            <div className="text-xs text-overlay mb-1">Total Runs</div>
            <div className="text-2xl font-bold text-text">{stats.totalRuns.toLocaleString()}</div>
          </div>
          <div className="bg-mantle rounded-xl p-4 border border-surface-0">
            <div className="text-xs text-overlay mb-1">Challenges Completed</div>
            <div className="text-2xl font-bold text-warn">{stats.challengesCompleted}</div>
          </div>
          <div className="bg-mantle rounded-xl p-4 border border-surface-0">
            <div className="text-xs text-overlay mb-1">Daily Challenge Streak</div>
            <div className="text-2xl font-bold text-peach">
              {dailyStreak} day{dailyStreak !== 1 ? 's' : ''} 🔥
            </div>
            <div className="text-[10px] text-overlay mt-0.5">
              {dailyState.totalSolved} solved · longest: {dailyState.longestStreak}
            </div>
          </div>
        </div>

        {/* My Projects */}
        <SignedIn>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text">My Shared Projects</h2>
            <a
              href="/shareplace"
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-sapphire text-base rounded-lg text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Go to Shareplace
            </a>
          </div>

          {loading ? (
            <div className="text-overlay animate-pulse py-8 text-center">Loading projects...</div>
          ) : myProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-mantle border border-surface-0 rounded-xl p-12 text-center">
              <span className="text-4xl block mb-3">🧱</span>
              <p className="text-text font-semibold mb-1">No shared projects yet</p>
              <p className="text-sm text-overlay">Build something in the editor, then upload it to Shareplace!</p>
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="bg-surface-0 rounded-xl p-8 text-center">
            <span className="text-4xl block mb-3">🔐</span>
            <p className="text-text font-semibold mb-2">Sign in to see your projects</p>
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 bg-purple text-base rounded-lg font-bold hover:bg-purple/80 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  )
}
