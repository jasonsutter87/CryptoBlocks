import { useState, useMemo, useEffect, useCallback } from 'react'
import ProjectCard from './ProjectCard'
import { MOCK_PROJECTS } from './mock-data'
import type { SharedProject } from '../types/shareplace'
import ProjectDetailModal from './ProjectDetailModal'
import UploadModal from './UploadModal'
import { fetchProjects } from './api'

const CATEGORIES = ['All', 'Games', 'Art', 'Web', 'Sound', 'Data', 'AI'] as const

type SortOption = 'newest' | 'downloads' | 'likes'

export default function ShareplacePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [sort, setSort] = useState<SortOption>('newest')
  const [selectedProject, setSelectedProject] = useState<SharedProject | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [liveProjects, setLiveProjects] = useState<SharedProject[] | null>(null)

  const loadProjects = useCallback(async () => {
    const projects = await fetchProjects({ category: activeCategory, search: search.trim() || undefined })
    setLiveProjects(projects.length > 0 ? projects : null)
  }, [activeCategory, search])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Use live API data when available, fall back to mock data
  const baseProjects = liveProjects ?? MOCK_PROJECTS

  const filtered = useMemo(() => {
    let projects = [...baseProjects]

    // Client-side filtering only needed for mock data (API handles it server-side)
    if (!liveProjects) {
      if (activeCategory !== 'All') {
        projects = projects.filter((p) => p.category === activeCategory)
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        projects = projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
    }

    if (sort === 'newest') {
      projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else if (sort === 'downloads') {
      projects.sort((a, b) => b.downloads - a.downloads)
    } else if (sort === 'likes') {
      projects.sort((a, b) => b.likes - a.likes)
    }

    return projects
  }, [baseProjects, search, activeCategory, sort, liveProjects])

  return (
    <div className="min-h-full bg-[#1e1e2e]">
      {/* Hero */}
      <div className="bg-[#181825] border-b border-[#313244]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#cdd6f4] tracking-tight mb-3">
              Shareplace
            </h1>
            <p className="text-[#a6adc8] text-lg mb-8">
              Discover, share, and remix block projects built by the community.
            </p>

            {/* Search + Upload row */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c7086] pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects, authors, tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] pl-11 pr-4 py-3 rounded-xl border border-[#45475a] focus:outline-none focus:border-[#89b4fa] transition-colors text-sm"
                />
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#1e1e2e] bg-[#89b4fa] hover:bg-[#89b4fa]/80 rounded-xl transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[#89b4fa] text-[#1e1e2e]'
                    : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] hover:text-[#cdd6f4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-[#313244] text-[#cdd6f4] border border-[#45475a] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#89b4fa] transition-colors cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="downloads">Most Downloaded</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        {/* Result count */}
        <p className="text-xs text-[#6c7086] mb-6">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' && ` in ${activeCategory}`}
          {search.trim() && ` matching "${search.trim()}"`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg
              className="w-16 h-16 text-[#45475a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[#6c7086] text-lg font-medium">No projects found</p>
            <p className="text-[#45475a] text-sm">
              Try a different search or category filter
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All') }}
              className="mt-2 px-4 py-2 bg-[#313244] text-[#a6adc8] rounded-lg text-sm hover:bg-[#45475a] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOwner={false}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onPublished={loadProjects} />
      )}
    </div>
  )
}
