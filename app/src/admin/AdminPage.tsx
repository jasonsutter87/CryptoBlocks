/**
 * Admin Portal — dashboard, analytics, user management, free overrides.
 * Gated behind admin email check.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
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

type Tab = 'dashboard' | 'overrides' | 'tables' | 'projects'

export default function AdminPage() {
  const { getToken } = useAuth()
  const { isAdmin } = useIsPro()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [overrides, setOverrides] = useState<Override[]>([])
  const [tables, setTables] = useState<Record<string, number>>({})
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
      const [statsRes, overridesRes, tablesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: h }),
        fetch('/api/admin/overrides', { headers: h }),
        fetch('/api/admin/tables', { headers: h }),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (overridesRes.ok) { const d = await overridesRes.json(); setOverrides(d.overrides || []) }
      if (tablesRes.ok) { const d = await tablesRes.json(); setTables(d.tables || {}) }
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
      <div className="min-h-full bg-[#1e1e2e] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔒</span>
          <h1 className="text-xl font-bold text-[#cdd6f4]">Admin Access Required</h1>
          <p className="text-sm text-[#6c7086] mt-2">This page is restricted to administrators.</p>
        </div>
      </div>
    )
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
        tab === t ? 'bg-[#89b4fa] text-[#1e1e2e]' : 'text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-full bg-[#1e1e2e]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#cdd6f4] tracking-tight">Admin Portal</h1>
            <p className="text-[#6c7086] text-sm mt-1">System analytics, user management, and overrides.</p>
          </div>
          <button onClick={loadAll} disabled={loading} className="px-3 py-1.5 bg-[#313244] text-[#6c7086] rounded-lg text-xs hover:bg-[#45475a]">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabBtn('dashboard', '📊 Dashboard')}
          {tabBtn('overrides', '🔐 Free Overrides')}
          {tabBtn('tables', '🗄️ Tables')}
          {tabBtn('projects', '📦 Recent Projects')}
        </div>

        {loading && !stats ? (
          <div className="text-[#6c7086] animate-pulse text-center py-12">Loading admin data...</div>
        ) : (
          <>
            {/* === Dashboard === */}
            {tab === 'dashboard' && stats && (
              <div className="flex flex-col gap-6">
                {/* Totals grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(stats.totals).map(([key, val]) => (
                    <div key={key} className="bg-[#313244] rounded-xl p-4">
                      <div className="text-2xl font-bold text-[#cdd6f4]">{val.toLocaleString()}</div>
                      <div className="text-[10px] text-[#6c7086] uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projects by day (simple bar chart) */}
                <div className="bg-[#181825] rounded-xl p-5 border border-[#313244]">
                  <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Projects (Last 14 Days)</h3>
                  <div className="flex items-end gap-1 h-32">
                    {stats.projectsByDay.length === 0 ? (
                      <p className="text-xs text-[#6c7086] italic">No data yet</p>
                    ) : (
                      stats.projectsByDay.map((d) => {
                        const max = Math.max(...stats.projectsByDay.map(x => x.count), 1)
                        const h = Math.max(4, (d.count / max) * 100)
                        return (
                          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-[#89b4fa] rounded-t"
                              style={{ height: `${h}%` }}
                              title={`${d.day}: ${d.count} projects`}
                            />
                            <span className="text-[8px] text-[#6c7086] rotate-[-45deg] origin-center">
                              {d.day.slice(5)}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Top authors */}
                <div className="bg-[#181825] rounded-xl p-5 border border-[#313244]">
                  <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Top Authors</h3>
                  {stats.topAuthors.length === 0 ? (
                    <p className="text-xs text-[#6c7086] italic">No authors yet</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {stats.topAuthors.map((a, i) => (
                        <div key={a.name} className="flex items-center gap-3 bg-[#1e1e2e] rounded-lg px-3 py-2">
                          <span className="text-sm font-bold text-[#6c7086] w-6">{i + 1}</span>
                          <span className="text-sm text-[#cdd6f4] flex-1">{a.name}</span>
                          <span className="text-xs text-[#89b4fa]">{a.projects} projects</span>
                          <span className="text-xs text-[#f38ba8]">{a.likes} likes</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === Free Overrides === */}
            {tab === 'overrides' && (
              <div className="flex flex-col gap-4">
                {/* Add override form */}
                <div className="bg-[#181825] rounded-xl p-5 border border-[#313244]">
                  <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Add Free Override</h3>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1 min-w-[200px] bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#89b4fa]"
                    />
                    <select
                      value={newPlan} onChange={(e) => setNewPlan(e.target.value)}
                      className="bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2"
                    >
                      <option value="pro">Pro</option>
                      <option value="teacher">Teacher</option>
                    </select>
                    <input
                      type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Note (optional)"
                      className="flex-1 min-w-[150px] bg-[#313244] border border-[#45475a] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#89b4fa]"
                    />
                    <button
                      onClick={addOverride}
                      disabled={!newEmail.trim()}
                      className="px-4 py-2 bg-[#a6e3a1] text-[#1e1e2e] rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-[#a6e3a1]/80"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Override list */}
                <div className="bg-[#181825] rounded-xl border border-[#313244] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#313244]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Plan</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Note</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overrides.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-[#6c7086] italic">No overrides</td></tr>
                      ) : (
                        overrides.map((o) => (
                          <tr key={o.email} className="border-b border-[#313244]/50 hover:bg-[#1e1e2e]">
                            <td className="px-4 py-3 text-sm text-[#cdd6f4] font-mono">{o.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                o.plan === 'teacher' ? 'bg-[#89b4fa]/20 text-[#89b4fa]' : 'bg-[#f9e2af]/20 text-[#f9e2af]'
                              }`}>
                                {o.plan}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#6c7086]">{o.note || '—'}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => removeOverride(o.email)}
                                className="text-xs text-[#f38ba8] hover:text-[#f38ba8]/80"
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
              <div className="bg-[#181825] rounded-xl border border-[#313244] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#313244]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Table</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Rows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(tables).sort((a, b) => Number(b[1]) - Number(a[1])).map(([name, count]) => (
                      <tr key={name} className="border-b border-[#313244]/50 hover:bg-[#1e1e2e]">
                        <td className="px-4 py-3 text-sm text-[#cdd6f4] font-mono">{name}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-[#89b4fa]">{Number(count).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#313244]/30">
                      <td className="px-4 py-3 text-sm font-bold text-[#cdd6f4]">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-[#a6e3a1]">
                        {Object.values(tables).reduce((a, b) => a + Number(b), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* === Recent Projects === */}
            {tab === 'projects' && stats && (
              <div className="bg-[#181825] rounded-xl border border-[#313244] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#313244]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Project</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Author</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6c7086] uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentProjects.map((p) => (
                      <tr key={p.id} className="border-b border-[#313244]/50 hover:bg-[#1e1e2e]">
                        <td className="px-4 py-3 text-sm text-[#cdd6f4] font-semibold">{p.name}</td>
                        <td className="px-4 py-3 text-sm text-[#89b4fa]">{p.author}</td>
                        <td className="px-4 py-3 text-sm text-[#6c7086]">{p.category}</td>
                        <td className="px-4 py-3 text-right text-xs text-[#6c7086]">
                          {new Date(Number(p.createdAt)).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
