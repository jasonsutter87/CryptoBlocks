import { useMemo, useState } from 'react'
import { loadStats } from '../stats'
import BadgeShowcase from './BadgeShowcase'

interface StatsPanelProps {
  onClose: () => void
}

type Tab = 'stats' | 'badges'

export default function StatsPanel({ onClose }: StatsPanelProps) {
  const [tab, setTab] = useState<Tab>('stats')
  const stats = loadStats()

  // Generate heatmap data for last 52 weeks (364 days)
  const heatmapData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate start date (364 days ago)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 363)

    const weeks: Array<Array<{ date: Date; count: number; dateKey: string }>> = []
    let currentWeek: Array<{ date: Date; count: number; dateKey: string }> = []

    // Pad the start with empty cells to align first date to correct day of week
    const startDayOfWeek = startDate.getDay()
    const sundayAligned = startDayOfWeek === 0 ? 0 : startDayOfWeek
    for (let i = 0; i < sundayAligned; i++) {
      const emptyDate = new Date(startDate)
      emptyDate.setDate(emptyDate.getDate() - (sundayAligned - i))
      currentWeek.push({ date: emptyDate, count: -1, dateKey: '' }) // -1 means empty cell
    }

    // Fill in the 364 days
    for (let i = 0; i < 364; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      const count = stats.runsByDate[dateKey] || 0

      currentWeek.push({ date, count, dateKey })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    // Add any remaining days
    if (currentWeek.length > 0) {
      // Pad end to complete the week
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1].date
        const nextDate = new Date(lastDate)
        nextDate.setDate(nextDate.getDate() + 1)
        currentWeek.push({ date: nextDate, count: -1, dateKey: '' })
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [stats.runsByDate])

  // Calculate month labels
  const monthLabels = useMemo(() => {
    const labels: Array<{ text: string; offset: number }> = []
    let lastMonth = -1

    heatmapData.forEach((week, weekIndex) => {
      const firstValidDay = week.find((d) => d.count !== -1)
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth()
        if (month !== lastMonth) {
          labels.push({
            text: firstValidDay.date.toLocaleDateString('en-US', { month: 'short' }),
            offset: weekIndex,
          })
          lastMonth = month
        }
      }
    })

    // Filter out labels that would overlap (need at least 3 columns apart)
    const MIN_GAP = 3
    const filtered: typeof labels = []
    for (const label of labels) {
      if (filtered.length === 0 || label.offset - filtered[filtered.length - 1].offset >= MIN_GAP) {
        filtered.push(label)
      }
    }
    return filtered
  }, [heatmapData])

  const getColorForCount = (count: number): string => {
    if (count === -1) return 'bg-transparent' // empty cell
    if (count === 0) return 'bg-base'
    if (count <= 2) return 'bg-[#0e4429]'
    if (count <= 5) return 'bg-[#006d32]'
    if (count <= 9) return 'bg-[#26a641]'
    return 'bg-[#39d353]'
  }

  const totalLanguageRuns =
    stats.runsPerLanguage.javascript +
    stats.runsPerLanguage.python +
    stats.runsPerLanguage.html

  const jsPercent = totalLanguageRuns > 0
    ? (stats.runsPerLanguage.javascript / totalLanguageRuns) * 100
    : 0
  const pyPercent = totalLanguageRuns > 0
    ? (stats.runsPerLanguage.python / totalLanguageRuns) * 100
    : 0
  const htmlPercent = totalLanguageRuns > 0
    ? (stats.runsPerLanguage.html / totalLanguageRuns) * 100
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-base rounded-xl border border-surface-1 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-base border-b border-surface-1 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTab('stats')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'stats' ? 'bg-accent text-base' : 'text-overlay hover:text-text'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Stats
            </button>
            <button
              onClick={() => setTab('badges')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'badges' ? 'bg-accent text-base' : 'text-overlay hover:text-text'
              }`}
            >
              <span className="text-base leading-none">🏅</span>
              Badges
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-overlay hover:text-text transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {tab === 'badges' ? (
          <div className="p-6">
            <BadgeShowcase />
          </div>
        ) : (
        <div className="p-6 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-surface-0 rounded-lg p-4 border border-surface-1">
              <div className="flex items-center gap-2 text-overlay text-sm mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Total Runs</span>
              </div>
              <div className="text-3xl font-bold text-accent">{stats.totalRuns.toLocaleString()}</div>
            </div>

            <div className="bg-surface-0 rounded-lg p-4 border border-surface-1">
              <div className="flex items-center gap-2 text-overlay text-sm mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Blocks Placed</span>
              </div>
              <div className="text-3xl font-bold text-success">{stats.totalBlocks.toLocaleString()}</div>
            </div>

            <div className="bg-surface-0 rounded-lg p-4 border border-surface-1">
              <div className="flex items-center gap-2 text-overlay text-sm mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Lines Generated</span>
              </div>
              <div className="text-3xl font-bold text-warn">{stats.totalLinesGenerated.toLocaleString()}</div>
            </div>

            <div className="bg-surface-0 rounded-lg p-4 border border-surface-1">
              <div className="flex items-center gap-2 text-overlay text-sm mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Challenges</span>
              </div>
              <div className="text-3xl font-bold text-purple">{stats.challengesCompleted}</div>
            </div>

            <div className="bg-surface-0 rounded-lg p-4 border border-surface-1">
              <div className="flex items-center gap-2 text-overlay text-sm mb-2">
                {stats.currentStreak > 0 ? (
                  <span className="text-base">🔥</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                <span>Current Streak</span>
              </div>
              <div className="text-3xl font-bold text-peach">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
              </div>
            </div>

            <div className="bg-surface-0 rounded-lg p-4 border border-surface-1">
              <div className="flex items-center gap-2 text-overlay text-sm mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Best Streak</span>
              </div>
              <div className="text-3xl font-bold text-danger">
                {stats.bestStreak} {stats.bestStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-surface-0 rounded-lg p-6 border border-surface-1">
            <h3 className="text-lg font-semibold text-text mb-4">Activity Heatmap</h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month labels */}
                
                <div className="flex justify-between mb-2 ml-8">
                  {monthLabels.map((label, i) => (
                    <span key={i} className="text-xs text-overlay">
                      {label.text}
                    </span>
                  ))}
                </div>

                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-[2px] text-xs text-overlay pr-2">
                    <div style={{ height: '12px' }}>Mon</div>
                    <div style={{ height: '12px' }}></div>
                    <div style={{ height: '12px' }}>Wed</div>
                    <div style={{ height: '12px' }}></div>
                    <div style={{ height: '12px' }}>Fri</div>
                    <div style={{ height: '12px' }}></div>
                    <div style={{ height: '12px' }}></div>
                  </div>

                  {/* Heatmap grid */}
                  <div className="flex gap-[2px]">
                    {heatmapData.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[2px]">
                        {week.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`w-3 h-3 rounded-sm ${getColorForCount(day.count)}`}
                            title={day.count >= 0 ? `${day.count} runs on ${day.dateKey}` : ''}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-xs text-overlay">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-base" title="0 runs" />
                    <div className="w-3 h-3 rounded-sm bg-[#0e4429]" title="1-2 runs" />
                    <div className="w-3 h-3 rounded-sm bg-[#006d32]" title="3-5 runs" />
                    <div className="w-3 h-3 rounded-sm bg-[#26a641]" title="6-9 runs" />
                    <div className="w-3 h-3 rounded-sm bg-[#39d353]" title="10+ runs" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div className="bg-surface-0 rounded-lg p-6 border border-surface-1">
            <h3 className="text-lg font-semibold text-text mb-4">Language Breakdown</h3>
            <div className="space-y-4">
              {/* JavaScript */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text">JavaScript</span>
                  <span className="text-overlay">
                    {stats.runsPerLanguage.javascript} runs ({jsPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-base rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warn transition-all"
                    style={{ width: `${jsPercent}%` }}
                  />
                </div>
              </div>

              {/* Python */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text">Python</span>
                  <span className="text-overlay">
                    {stats.runsPerLanguage.python} runs ({pyPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-base rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${pyPercent}%` }}
                  />
                </div>
              </div>

              {/* HTML */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text">HTML</span>
                  <span className="text-overlay">
                    {stats.runsPerLanguage.html} runs ({htmlPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-base rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success transition-all"
                    style={{ width: `${htmlPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Longest Program */}
          <div className="bg-surface-0 rounded-lg p-6 border border-surface-1 text-center">
            <div className="text-sm text-overlay mb-2">Longest Program</div>
            <div className="text-2xl font-bold text-text">
              Your biggest creation used <span className="text-accent">{stats.longestProgram}</span> blocks
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
