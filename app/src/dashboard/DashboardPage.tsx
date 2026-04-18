import { useMemo, useState, useEffect } from 'react'
import { useUser, useAuth, SignedIn, SignedOut, SignInButton } from '../auth'
import { loadStats } from '../stats'
import type { SharedProject } from '../types/shareplace'
import { fetchMyProjects, fetchProject, deleteProject } from '../shareplace/api'
import { lazy, Suspense } from 'react'
const UploadModal = lazy(() => import('../shareplace/UploadModal'))
import { showToast } from '../components/Toast'
import { loadDailyState, getEffectiveStreak } from '../daily/state'
import { getDayNumber } from '../daily/getTodaysPuzzle'

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose }: {
  title: string; message: string; confirmLabel?: string; danger?: boolean
  onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-text font-semibold text-base mb-2">{title}</h2>
        <p className="text-subtext text-sm mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${danger ? 'bg-red text-white hover:bg-red/80' : 'bg-accent text-base hover:bg-accent/80'}`}>{confirmLabel ?? 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}

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
  const { getToken } = useAuth()
  const stats = useMemo(() => loadStats(), [])
  const dailyState = useMemo(() => loadDailyState(), [])
  const currentDay = useMemo(() => getDayNumber(), [])
  const dailyStreak = getEffectiveStreak(dailyState, currentDay)
  const [myProjects, setMyProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      // /api/projects/my returns the user's own projects — public AND private
      // — keyed by Clerk user id, not by name. Save-to-Dashboard projects
      // are always private and would be filtered out of the public feed.
      const token = await getToken().catch(() => null)
      const mine = await fetchMyProjects(token ?? undefined)
      if (!cancelled) {
        setMyProjects(mine)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [user, getToken])

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
                <MyProjectCard
                  key={project.id}
                  project={project}
                  getToken={getToken}
                  onDeleted={(id) => setMyProjects((prev) => prev.filter((p) => p.id !== id))}
                  onUpdated={(id, updates) => setMyProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p))}
                />
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

/**
 * Dashboard-specific project card with an "Open in Editor" action.
 * Different from the generic ProjectCard (which links to the public
 * project detail) — this one fetches the workspace JSON, hands it off
 * via sessionStorage, and navigates to the editor with an explicit
 * project id so saves PATCH instead of POST.
 */
function MyProjectCard({
  project,
  getToken,
  onDeleted,
  onUpdated,
}: {
  project: SharedProject
  getToken: () => Promise<string | null>
  onDeleted: (id: string) => void
  onUpdated: (id: string, updates: Partial<SharedProject>) => void
}) {
  const [opening, setOpening] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; label: string; danger?: boolean; action: () => void } | null>(null)
  const [publishData, setPublishData] = useState<{ id: string; name: string; description?: string; category?: string; workspaceJson: string; blockCount: number } | null>(null)
  const isPublic = project.visibility === 'public'

  const handleOpen = async () => {
    if (opening) return
    setOpening(true)
    // Pass token so private projects (everything from "Save to Dashboard")
    // are visible to the owner.
    const token = await getToken().catch(() => null)
    const full = await fetchProject(project.id, token ?? undefined)
    if (!full || !full.workspaceJson) {
      showToast('Could not load project — try again', 'error')
      setOpening(false)
      return
    }
    sessionStorage.setItem('cryptoblocks_open_project', JSON.stringify({
      id: project.id,
      name: full.name,
      workspaceJson: full.workspaceJson,
    }))
    window.location.href = '/'
  }

  const handlePublish = async () => {
    if (isPublic) {
      // Unpublish — simple PATCH via import
      setConfirmAction({
        title: 'Remove from Shareplace?',
        message: 'This project will become private and disappear from the feed.',
        label: 'Make Private',
        action: async () => {
          setConfirmAction(null)
          await doUnpublish()
        },
      })
      return
    }
    // Publish — fetch workspace, open the modal
    const token = await getToken().catch(() => null)
    const full = await fetchProject(project.id, token ?? undefined)
    if (!full) { showToast('Could not load project', 'error'); return }
    setPublishData({
      id: project.id,
      name: project.name,
      description: project.description,
      category: project.category,
      workspaceJson: full.workspaceJson,
      blockCount: project.blockCount,
    })
    setShowPublish(true)
  }

  const doUnpublish = async () => {
      const token = await getToken().catch(() => null)
      const full = await fetchProject(project.id, token ?? undefined)
      if (!full) { showToast('Could not load project', 'error'); return }
      const { updateProject: patch } = await import('../shareplace/api')
      const result = await patch(project.id, {
        name: project.name,
        authorName: project.author || 'User',
        workspaceJson: full.workspaceJson,
        blockCount: project.blockCount,
        category: project.category,
        visibility: 'private',
      }, token ?? undefined)
      if (result && 'id' in result) {
        showToast('Made private', 'success')
        onUpdated(project.id, { visibility: 'private' })
      } else { showToast('Failed', 'error') }
  }

  const handleDelete = async () => {
    if (deleting) return
    setConfirmAction({
      title: `Delete "${project.name}"?`,
      message: 'This cannot be undone. The project will be permanently removed.',
      label: 'Delete',
      danger: true,
      action: async () => { setConfirmAction(null); await doDelete() },
    })
  }

  const doDelete = async () => {
    setDeleting(true)
    const token = await getToken().catch(() => null)
    const result = await deleteProject(project.id, token ?? undefined)
    if (result && 'ok' in result) {
      showToast('Deleted', 'success')
      onDeleted(project.id)
    } else if (result && 'error' in result) {
      showToast(result.error, 'error')
      setDeleting(false)
    } else {
      showToast('Delete failed — try again', 'error')
      setDeleting(false)
    }
  }

  return (
    <div className="bg-mantle border border-surface-0 rounded-xl p-4 flex flex-col gap-2 hover:border-surface-1 transition-colors">
      <div>
        <div className="text-base font-semibold text-text truncate">{project.name}</div>
        <div className="text-xs text-overlay mt-0.5">
          {project.category} · {project.blockCount} blocks
        </div>
      </div>
      {project.description && (
        <p className="text-xs text-subtext line-clamp-2">{project.description}</p>
      )}
      {isPublic && (
        <div className="text-[10px] text-success font-semibold">Live on Shareplace</div>
      )}
      {showPublish && publishData && (
        <Suspense fallback={null}>
          <UploadModal
            existingProject={publishData}
            onClose={() => setShowPublish(false)}
            onPublished={() => onUpdated(project.id, { visibility: 'public' })}
          />
        </Suspense>
      )}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.label}
          danger={confirmAction.danger}
          onConfirm={confirmAction.action}
          onClose={() => setConfirmAction(null)}
        />
      )}
      <div className="mt-auto flex gap-2">
        <button
          onClick={handleOpen}
          disabled={opening || deleting || showPublish}
          className="flex-1 px-3 py-2 text-sm font-bold text-base bg-accent hover:bg-sapphire rounded-lg disabled:opacity-50 transition-colors"
        >
          {opening ? 'Opening...' : 'Open in Editor'}
        </button>
        <button
          onClick={handlePublish}
          disabled={opening || deleting || showPublish}
          aria-label={isPublic ? 'Make private' : 'Publish to Shareplace'}
          title={isPublic ? 'Make private' : 'Publish to Shareplace'}
          className={`px-3 py-2 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors ${
            isPublic
              ? 'text-success bg-surface-0 hover:bg-surface-1'
              : 'text-text bg-surface-0 hover:bg-success hover:text-base'
          }`}
        >
          {isPublic ? '🌐' : '🚀'}
        </button>
        <button
          onClick={handleDelete}
          disabled={opening || deleting || showPublish}
          aria-label="Delete project"
          title="Delete project"
          className="px-3 py-2 text-sm font-bold text-text bg-surface-0 hover:bg-danger hover:text-base rounded-lg disabled:opacity-50 transition-colors"
        >
          {deleting ? '...' : '🗑'}
        </button>
      </div>
    </div>
  )
}
