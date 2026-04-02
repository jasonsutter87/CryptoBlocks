import { useMemo } from 'react'
import { loadStats } from '../stats'
import ProjectCard from '../shareplace/ProjectCard'
import type { SharedProject } from '../types/shareplace'

const MY_PROJECTS: SharedProject[] = [
  {
    id: 'mine-1',
    name: 'My Calculator',
    author: 'you',
    description: 'A four-function calculator with keyboard shortcuts and a history log.',
    category: 'Web',
    blockCount: 84,
    downloads: 12,
    likes: 3,
    createdAt: '2026-03-29',
    tags: ['math', 'utility'],
  },
  {
    id: 'mine-2',
    name: 'Bounce Ball',
    author: 'you',
    description: 'A canvas animation with a bouncing ball that changes color on wall hits.',
    category: 'Art',
    blockCount: 47,
    downloads: 5,
    likes: 1,
    createdAt: '2026-03-25',
    tags: ['animation', 'canvas'],
  },
  {
    id: 'mine-3',
    name: 'Countdown Timer',
    author: 'you',
    description: 'Set a duration in seconds and watch it tick down. Plays a beep when done.',
    category: 'Web',
    blockCount: 61,
    downloads: 8,
    likes: 2,
    createdAt: '2026-03-20',
    tags: ['time', 'utility', 'audio'],
  },
]

interface StatCardProps {
  label: string
  value: string | number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-[#313244] rounded-xl p-5 flex flex-col gap-1">
      <span className="text-3xl font-bold" style={{ color }}>{value}</span>
      <span className="text-sm text-[#6c7086]">{label}</span>
    </div>
  )
}

function daysActive(runsByDate: Record<string, number>): number {
  return Object.keys(runsByDate).length
}

export default function DashboardPage() {
  const stats = useMemo(() => loadStats(), [])

  const statCards = [
    {
      label: 'Total Blocks Created',
      value: stats.totalBlocks.toLocaleString(),
      color: '#89b4fa',
    },
    {
      label: 'Projects Shared',
      value: MY_PROJECTS.length,
      color: '#a6e3a1',
    },
    {
      label: 'Total Downloads',
      value: MY_PROJECTS.reduce((acc, p) => acc + p.downloads, 0),
      color: '#fab387',
    },
    {
      label: 'Days Active',
      value: daysActive(stats.runsByDate) || 1,
      color: '#cba6f7',
    },
  ]

  return (
    <div className="min-h-full bg-[#1e1e2e]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#cdd6f4] tracking-tight mb-1">
            Your Dashboard
          </h1>
          <p className="text-[#a6adc8]">Track your progress and manage your shared projects.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Additional stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#181825] rounded-xl p-4 border border-[#313244]">
            <div className="text-xs text-[#6c7086] mb-1">Total Runs</div>
            <div className="text-2xl font-bold text-[#cdd6f4]">{stats.totalRuns.toLocaleString()}</div>
          </div>
          <div className="bg-[#181825] rounded-xl p-4 border border-[#313244]">
            <div className="text-xs text-[#6c7086] mb-1">Challenges Completed</div>
            <div className="text-2xl font-bold text-[#f9e2af]">{stats.challengesCompleted}</div>
          </div>
          <div className="bg-[#181825] rounded-xl p-4 border border-[#313244]">
            <div className="text-xs text-[#6c7086] mb-1">Best Streak</div>
            <div className="text-2xl font-bold text-[#f38ba8]">{stats.bestStreak} day{stats.bestStreak !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* My Projects */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#cdd6f4]">My Projects</h2>
          <button
            disabled
            title="Coming Soon"
            className="flex items-center gap-2 px-4 py-2 bg-[#313244] text-[#6c7086] rounded-lg text-sm font-medium cursor-not-allowed border border-[#45475a]/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Upload to Shareplace
            <span className="text-xs bg-[#45475a]/60 px-1.5 py-0.5 rounded text-[#6c7086]">Soon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MY_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}
