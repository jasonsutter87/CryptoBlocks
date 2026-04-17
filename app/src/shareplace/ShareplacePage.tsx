import { useState, useMemo, useEffect, useCallback } from 'react'
import ProjectCard from './ProjectCard'
import type { SharedProject } from '../types/shareplace'
import ProjectDetailModal from './ProjectDetailModal'
import UploadModal from './UploadModal'
import { fetchProjects } from './api'
import { useUser } from '../auth'

const CATEGORIES = ['All', 'Games', 'Art', 'Web', 'Sound', 'Data', 'AI'] as const

type SortOption = 'newest' | 'downloads' | 'likes'

export default function ShareplacePage() {
  const { user } = useUser()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [sort, setSort] = useState<SortOption>('newest')
  const [selectedProject, setSelectedProject] = useState<SharedProject | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [projects, setProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const result = await fetchProjects({ category: activeCategory, search: search.trim() || undefined })
    setProjects(result)
    setLoading(false)
  }, [activeCategory, search])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filtered = useMemo(() => {
    const sorted = [...projects]
    if (sort === 'newest') {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else if (sort === 'downloads') {
      sorted.sort((a, b) => b.downloads - a.downloads)
    } else if (sort === 'likes') {
      sorted.sort((a, b) => b.likes - a.likes)
    }
    return sorted
  }, [projects, sort])

  return (
    <div className="min-h-full bg-base">
      {/* Hero */}
      <div className="bg-mantle border-b border-surface-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3">
              Shareplace
            </h1>
            <p className="text-subtext text-lg mb-8">
              Discover, share, and remix block projects built by the community.
            </p>

            {/* Search + Upload row */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-overlay pointer-events-none"
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
                  className="w-full bg-surface-0 text-text placeholder-overlay pl-11 pr-4 py-3 rounded-xl border border-surface-1 focus:outline-none focus:border-accent transition-colors text-sm"
                />
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-base bg-accent hover:bg-accent/80 rounded-xl transition-colors shrink-0"
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
                    ? 'bg-accent text-base'
                    : 'bg-surface-0 text-subtext hover:bg-surface-1 hover:text-text'
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
            className="bg-surface-0 text-text border border-surface-1 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="downloads">Most Downloaded</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        {/* Result count */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="text-overlay animate-pulse">Loading projects...</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-overlay mb-6">
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
                <span className="text-6xl">🧱</span>
                <p className="text-text text-lg font-medium">
                  {search.trim() || activeCategory !== 'All' ? 'No projects found' : 'Be the first to share!'}
                </p>
                <p className="text-overlay text-sm text-center max-w-md">
                  {search.trim() || activeCategory !== 'All'
                    ? 'Try a different search or category filter'
                    : 'Build something in the editor, then come back here and hit Upload to share it with the community.'}
                </p>
                {(search.trim() || activeCategory !== 'All') ? (
                  <button
                    onClick={() => { setSearch(''); setActiveCategory('All') }}
                    className="mt-2 px-4 py-2 bg-surface-0 text-subtext rounded-lg text-sm hover:bg-surface-1 transition-colors"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="mt-2 px-5 py-2.5 bg-accent text-base rounded-lg text-sm font-bold hover:bg-sapphire transition-colors"
                  >
                    Upload your first project
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOwner={!!(user && (user.fullName === selectedProject.author || user.username === selectedProject.author))}
          onClose={() => setSelectedProject(null)}
          onEdit={loadProjects}
        />
      )}

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onPublished={loadProjects} />
      )}
    </div>
  )
}
