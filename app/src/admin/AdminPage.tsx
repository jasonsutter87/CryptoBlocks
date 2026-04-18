/**
 * Admin Portal — dashboard, analytics, user management, free overrides.
 * Gated behind admin email check.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth'
import { useIsPro } from '../billing/useIsPro'
import { showToast } from '../components/Toast'

interface Stats {
  totals: Record<string, number>
  projectsByDay: Array<{ day: string; count: number }>
  topAuthors: Array<{ name: string; projects: number; likes: number }>
  recentProjects: Array<{ id: string; name: string; author: string; category: string; createdAt: number }>
}

interface Override {
  email: string
  plan: string
  note: string
  createdAt: number
}

interface Analytics {
  topBlocks: Array<{ name: string; count: number }>
  totalUniqueBlocks: number
  totalBlockUsages: number
  byCategory: Array<{ category: string; count: number }>
  byHour: Array<{ hour: number; count: number }>
  classroomSizes: Array<{ name: string; members: number }>
  likesDistribution: { zero: number; low: number; high: number }
}

interface UserResult {
  userId: string
  name: string
  projects: number
  likes: number
  ban: { expiresAt: number; reason: string } | null
}

type Tab = 'dashboard' | 'analytics' | 'overrides' | 'tables' | 'projects' | 'users'

export default function AdminPage() {
  const { getToken } = useAuth()
  const { isAdmin } = useIsPro()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [overrides, setOverrides] = useState<Override[]>([])
  const [tables, setTables] = useState<Record<string, number>>({})
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newPlan, setNewPlan] = useState('pro')
  const [newNote, setNewNote] = useState('')

  const headers = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken()
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
  }, [getToken])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const h = await headers()
      const [statsRes, overridesRes, tablesRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: h }),
        fetch('/api/admin/overrides', { headers: h }),
        fetch('/api/admin/tables', { headers: h }),
        fetch('/api/admin/analytics', { headers: h }),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (overridesRes.ok) { const d = await overridesRes.json(); setOverrides(d.overrides || []) }
      if (tablesRes.ok) { const d = await tablesRes.json(); setTables(d.tables || {}) }
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
    } catch (_e) {
      showToast('Failed to load admin data', 'error')
    }
    setLoading(false)
  }, [headers])

  useEffect(() => { loadAll() }, [loadAll])

  const addOverride = async () => {
    if (!newEmail.trim()) return
    const h = await headers()
    await fetch('/api/admin/overrides', {
      method: 'POST', headers: h,
      body: JSON.stringify({ email: newEmail.trim(), plan: newPlan, note: newNote.trim() }),
    })
    setNewEmail(''); setNewNote('')
    showToast(`Added ${newEmail.trim()} as ${newPlan}`, 'success')
    loadAll()
  }

  const removeOverride = async (email: string) => {
    const h = await headers()
    await fetch('/api/admin/overrides', {
      method: 'DELETE', headers: h,
      body: JSON.stringify({ email }),
    })
    showToast(`Removed ${email}`, 'success')
    loadAll()
  }

  if (!isAdmin) {
    return (
      <div className="min-h-full bg-base flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔒</span>
          <h1 className="text-xl font-bold text-text">Admin Access Required</h1>
          <p className="text-sm text-overlay mt-2">This page is restricted to administrators.</p>
        </div>
      </div>
    )
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
        tab === t ? 'bg-accent text-base' : 'text-overlay hover:text-text hover:bg-surface-0'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-full bg-base">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Admin Portal</h1>
            <p className="text-overlay text-sm mt-1">System analytics, user management, and overrides.</p>
          </div>
          <button onClick={loadAll} disabled={loading} className="px-3 py-1.5 bg-surface-0 text-overlay rounded-lg text-xs hover:bg-surface-1">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabBtn('dashboard', '📊 Dashboard')}
          {tabBtn('analytics', '🧮 Analytics')}
          {tabBtn('overrides', '🔐 Free Overrides')}
          {tabBtn('tables', '🗄️ Tables')}
          {tabBtn('projects', '📦 Recent Projects')}
          {tabBtn('users', '👤 Users')}
        </div>

        {loading && !stats ? (
          <div className="text-overlay animate-pulse text-center py-12">Loading admin data...</div>
        ) : (
          <>
            {/* === Dashboard === */}
            {tab === 'dashboard' && stats && (
              <div className="flex flex-col gap-6">
                {/* Totals grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(stats.totals).map(([key, val]) => (
                    <div key={key} className="bg-surface-0 rounded-xl p-4">
                      <div className="text-2xl font-bold text-text">{val.toLocaleString()}</div>
                      <div className="text-[10px] text-overlay uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projects by day (simple bar chart) */}
                <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                  <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Projects (Last 14 Days)</h3>
                  <div className="flex items-end gap-1 h-32">
                    {stats.projectsByDay.length === 0 ? (
                      <p className="text-xs text-overlay italic">No data yet</p>
                    ) : (
                      stats.projectsByDay.map((d) => {
                        const max = Math.max(...stats.projectsByDay.map(x => x.count), 1)
                        const h = Math.max(4, (d.count / max) * 100)
                        return (
                          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-accent rounded-t"
                              style={{ height: `${h}%` }}
                              title={`${d.day}: ${d.count} projects`}
                            />
                            <span className="text-[8px] text-overlay rotate-[-45deg] origin-center">
                              {d.day.slice(5)}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Top authors */}
                <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                  <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Top Authors</h3>
                  {stats.topAuthors.length === 0 ? (
                    <p className="text-xs text-overlay italic">No authors yet</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {stats.topAuthors.map((a, i) => (
                        <div key={a.name} className="flex items-center gap-3 bg-base rounded-lg px-3 py-2">
                          <span className="text-sm font-bold text-overlay w-6">{i + 1}</span>
                          <span className="text-sm text-text flex-1">{a.name}</span>
                          <span className="text-xs text-accent">{a.projects} projects</span>
                          <span className="text-xs text-danger">{a.likes} likes</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === Analytics === */}
            {tab === 'analytics' && analytics && (
              <div className="flex flex-col gap-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-0 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-accent">{analytics.totalUniqueBlocks}</div>
                    <div className="text-[10px] text-overlay">Unique Block Types Used</div>
                  </div>
                  <div className="bg-surface-0 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-success">{analytics.totalBlockUsages.toLocaleString()}</div>
                    <div className="text-[10px] text-overlay">Total Block Placements</div>
                  </div>
                  <div className="bg-surface-0 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-warn">
                      {analytics.likesDistribution.zero + analytics.likesDistribution.low + analytics.likesDistribution.high}
                    </div>
                    <div className="text-[10px] text-overlay">Total Projects</div>
                  </div>
                </div>

                {/* Most Used Blocks */}
                <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                  <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Most Used Blocks (Top 30)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {analytics.topBlocks.map((b, i) => {
                      const max = analytics.topBlocks[0]?.count || 1
                      const pct = Math.round((b.count / max) * 100)
                      return (
                        <div key={b.name} className="flex items-center gap-2 bg-base rounded px-2 py-1.5">
                          <span className="text-[10px] text-overlay w-4 text-right">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-text font-mono truncate">{b.name}</div>
                            <div className="h-1 bg-surface-0 rounded-full mt-0.5">
                              <div className="h-1 bg-accent rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-[10px] text-overlay font-mono shrink-0">{b.count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Projects by Category */}
                <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                  <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Projects by Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.byCategory.map((c) => (
                      <div key={c.category} className="bg-base rounded-lg px-3 py-2 text-center">
                        <div className="text-lg font-bold text-text">{c.count}</div>
                        <div className="text-[10px] text-overlay">{c.category}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity by Hour */}
                <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                  <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Activity by Hour (UTC)</h3>
                  <div className="flex items-end gap-0.5 h-24">
                    {Array.from({ length: 24 }, (_, h) => {
                      const entry = analytics.byHour.find(x => x.hour === h)
                      const count = entry?.count || 0
                      const max = Math.max(...analytics.byHour.map(x => x.count), 1)
                      const pct = Math.max(2, (count / max) * 100)
                      return (
                        <div key={h} className="flex-1 flex flex-col items-center gap-0.5" title={`${h}:00 — ${count} projects`}>
                          <div className="w-full bg-purple rounded-t" style={{ height: `${pct}%` }} />
                          {h % 6 === 0 && <span className="text-[8px] text-overlay">{h}h</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Likes Distribution */}
                <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                  <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Likes Distribution</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-base rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-overlay">{analytics.likesDistribution.zero}</div>
                      <div className="text-[10px] text-overlay">0 likes</div>
                    </div>
                    <div className="bg-base rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-warn">{analytics.likesDistribution.low}</div>
                      <div className="text-[10px] text-overlay">1-5 likes</div>
                    </div>
                    <div className="bg-base rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-danger">{analytics.likesDistribution.high}</div>
                      <div className="text-[10px] text-overlay">6+ likes</div>
                    </div>
                  </div>
                </div>

                {/* Classroom Sizes */}
                {analytics.classroomSizes.length > 0 && (
                  <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                    <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Classroom Sizes</h3>
                    {analytics.classroomSizes.map((c) => (
                      <div key={c.name} className="flex items-center justify-between bg-base rounded-lg px-3 py-2 mb-1">
                        <span className="text-sm text-text">{c.name}</span>
                        <span className="text-sm font-bold text-accent">{c.members} members</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === Free Overrides === */}
            {tab === 'overrides' && (
              <div className="flex flex-col gap-4">
                {/* Add override form */}
                <div className="bg-mantle rounded-xl p-5 border border-surface-0">
                  <h3 className="text-xs font-semibold text-overlay uppercase tracking-wider mb-3">Add Free Override</h3>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1 min-w-[200px] bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    />
                    <select
                      value={newPlan} onChange={(e) => setNewPlan(e.target.value)}
                      className="bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2"
                    >
                      <option value="pro">Pro</option>
                      <option value="teacher">Teacher</option>
                    </select>
                    <input
                      type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Note (optional)"
                      className="flex-1 min-w-[150px] bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={addOverride}
                      disabled={!newEmail.trim()}
                      className="px-4 py-2 bg-success text-base rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-success/80"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Override list */}
                <div className="bg-mantle rounded-xl border border-surface-0 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-0">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-overlay uppercase">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-overlay uppercase">Plan</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-overlay uppercase">Note</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-overlay uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overrides.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-overlay italic">No overrides</td></tr>
                      ) : (
                        overrides.map((o) => (
                          <tr key={o.email} className="border-b border-surface-0/50 hover:bg-base">
                            <td className="px-4 py-3 text-sm text-text font-mono">{o.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                o.plan === 'teacher' ? 'bg-accent/20 text-accent' : 'bg-warn/20 text-warn'
                              }`}>
                                {o.plan}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-overlay">{o.note || '—'}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => removeOverride(o.email)}
                                className="text-xs text-danger hover:text-danger/80"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* === Tables === */}
            {tab === 'tables' && (
              <div className="bg-mantle rounded-xl border border-surface-0 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-0">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-overlay uppercase">Table</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-overlay uppercase">Rows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(tables).sort((a, b) => Number(b[1]) - Number(a[1])).map(([name, count]) => (
                      <tr key={name} className="border-b border-surface-0/50 hover:bg-base">
                        <td className="px-4 py-3 text-sm text-text font-mono">{name}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-accent">{Number(count).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-surface-0/30">
                      <td className="px-4 py-3 text-sm font-bold text-text">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-success">
                        {Object.values(tables).reduce((a, b) => a + Number(b), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* === Recent Projects === */}
            {tab === 'projects' && stats && (
              <div className="bg-mantle rounded-xl border border-surface-0 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-0">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-overlay uppercase">Project</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-overlay uppercase">Author</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-overlay uppercase">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-overlay uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentProjects.map((p) => (
                      <tr key={p.id} className="border-b border-surface-0/50 hover:bg-base">
                        <td className="px-4 py-3 text-sm text-text font-semibold">{p.name}</td>
                        <td className="px-4 py-3 text-sm text-accent">{p.author}</td>
                        <td className="px-4 py-3 text-sm text-overlay">{p.category}</td>
                        <td className="px-4 py-3 text-right text-xs text-overlay">
                          {new Date(Number(p.createdAt)).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* === Users === */}
            {tab === 'users' && <UserManagement headers={headers} />}
          </>
        )}
      </div>
    </div>
  )
}

function UserManagement({ headers }: { headers: () => Promise<Record<string, string>> }) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<UserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [banDays, setBanDays] = useState(7)
  const [banReason, setBanReason] = useState('')
  const [actionTarget, setActionTarget] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'ban' | 'delete' | null>(null)

  const doSearch = async () => {
    if (!search.trim()) return
    setSearching(true)
    const h = await headers()
    const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(search.trim())}`, { headers: h })
    if (res.ok) { const d = await res.json(); setUsers(d.users ?? []) }
    setSearching(false)
  }

  const doBan = async (userId: string) => {
    const h = await headers()
    const res = await fetch('/api/admin/users/ban', {
      method: 'POST', headers: h,
      body: JSON.stringify({ userId, days: banDays, reason: banReason || 'Violation of terms' }),
    })
    if (res.ok) {
      showToast(`Banned for ${banDays} days`, 'success')
      setActionTarget(null); setActionType(null)
      doSearch() // refresh
    } else { showToast('Ban failed', 'error') }
  }

  const doUnban = async (userId: string) => {
    const h = await headers()
    const res = await fetch('/api/admin/users/unban', {
      method: 'POST', headers: h,
      body: JSON.stringify({ userId }),
    })
    if (res.ok) { showToast('Unbanned', 'success'); doSearch() }
    else { showToast('Unban failed', 'error') }
  }

  const doDelete = async (userId: string) => {
    const h = await headers()
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE', headers: h,
    })
    if (res.ok) {
      showToast('User data deleted', 'success')
      setActionTarget(null); setActionType(null)
      doSearch()
    } else { showToast('Delete failed', 'error') }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="Search by username..."
          className="flex-1 bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 placeholder-overlay focus:outline-none focus:border-accent"
        />
        <button onClick={doSearch} disabled={searching} className="px-4 py-2 bg-accent text-base text-sm font-semibold rounded-lg">
          {searching ? '...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {users.length > 0 && (
        <div className="bg-mantle border border-surface-0 rounded-xl overflow-hidden">
          {users.map((u, i) => (
            <div key={u.userId} className={`px-5 py-4 flex items-center gap-4 ${i > 0 ? 'border-t border-surface-0' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-surface-0 flex items-center justify-center text-sm font-bold text-accent">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text truncate">{u.name}</div>
                <div className="text-xs text-overlay">
                  {u.projects} projects · {u.likes} likes
                  {u.ban && (
                    <span className="ml-2 text-danger font-semibold">
                      BANNED — {Math.ceil((u.ban.expiresAt - Date.now()) / 86400000)}d left
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-overlay/50 font-mono truncate">{u.userId}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                {u.ban ? (
                  <button onClick={() => doUnban(u.userId)} className="px-3 py-1.5 text-xs font-semibold bg-success/20 text-success rounded-lg">
                    Unban
                  </button>
                ) : (
                  <button
                    onClick={() => { setActionTarget(u.userId); setActionType('ban') }}
                    className="px-3 py-1.5 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded-lg"
                  >
                    Ban
                  </button>
                )}
                <button
                  onClick={() => { setActionTarget(u.userId); setActionType('delete') }}
                  className="px-3 py-1.5 text-xs font-semibold bg-red/20 text-red rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ban modal */}
      {actionType === 'ban' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) { setActionTarget(null); setActionType(null) } }}>
          <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-text font-semibold mb-4">Ban User</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-subtext">Duration</label>
                <div className="flex gap-2 mt-1">
                  {[7, 30, 90, 365].map((d) => (
                    <button
                      key={d}
                      onClick={() => setBanDays(d)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${banDays === d ? 'bg-yellow-500 text-black' : 'bg-surface-0 text-subtext'}`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-subtext">Reason</label>
                <input
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Violation of terms"
                  className="w-full mt-1 bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2 placeholder-overlay focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setActionTarget(null); setActionType(null) }} className="px-4 py-2 text-sm text-text bg-surface-0 rounded-lg">Cancel</button>
              <button onClick={() => doBan(actionTarget)} className="px-4 py-2 text-sm font-semibold bg-yellow-500 text-black rounded-lg">Ban for {banDays} days</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {actionType === 'delete' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) { setActionTarget(null); setActionType(null) } }}>
          <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-text font-semibold mb-2">Delete User Data</h2>
            <p className="text-subtext text-sm mb-1">This will:</p>
            <ul className="text-sm text-overlay list-disc list-inside mb-4 space-y-1">
              <li>Anonymize all their projects to "[deleted]"</li>
              <li>Remixes of their projects will survive (orphaned)</li>
              <li>Delete achievements, likes, notifications, memberships</li>
              <li>This cannot be undone</li>
            </ul>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setActionTarget(null); setActionType(null) }} className="px-4 py-2 text-sm text-text bg-surface-0 rounded-lg">Cancel</button>
              <button onClick={() => doDelete(actionTarget)} className="px-4 py-2 text-sm font-semibold bg-red text-white rounded-lg">Delete All Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
