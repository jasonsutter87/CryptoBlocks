/**
 * Featured History — a living timeline of every project CryptoBlocks has highlighted.
 * Public page showing featured projects in reverse chronological order.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { SharedProject } from '../types/shareplace'
import { fetchShowcase } from './api'

export default function FeaturedHistoryPage() {
  const [featured, setFeatured] = useState<SharedProject[]>([])
  const [spotlight, setSpotlight] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShowcase().then((data) => {
      setFeatured(data.featured)
      setSpotlight(data.spotlight)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-full bg-base">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⭐</span>
            <h1 className="text-3xl font-bold text-text tracking-tight">Featured Projects</h1>
          </div>
          <p className="text-subtext text-lg">
            The best projects built by the CryptoBlocks community — hand-picked and spotlighted.
          </p>
        </div>

        {loading ? (
          <div className="text-overlay animate-pulse text-center py-16">Loading featured projects...</div>
        ) : (
          <>
            {/* Featured — admin picked */}
            {featured.length > 0 && (
              <section className="mb-12">
                <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">Hand-Picked by CryptoBlocks</h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-surface-1" />

                  <div className="space-y-6">
                    {featured.map((project) => (
                      <div key={project.id} className="relative pl-12">
                        {/* Timeline dot */}
                        <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-accent ring-4 ring-base" />

                        <Link
                          to={`/project/${project.id}`}
                          className="block bg-mantle border border-surface-0 rounded-xl p-5 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-text">{project.name}</span>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent rounded-full">Featured</span>
                              </div>
                              <p className="text-sm text-subtext mb-2">by <span className="text-accent">{project.author}</span></p>
                              {project.description && (
                                <p className="text-sm text-overlay line-clamp-2">{project.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-3 text-xs text-overlay">
                                <span>{project.category}</span>
                                <span>{project.blockCount} blocks</span>
                                <span>❤️ {project.likes}</span>
                                <span>📥 {project.downloads}</span>
                                <span className="ml-auto text-[10px]">{project.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Spotlight — daily rotation */}
            {spotlight.length > 0 && (
              <section className="mb-12">
                <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2">Today's Spotlight</h2>
                <p className="text-xs text-overlay mb-4">One random project per category — refreshes every 24 hours. Your project could be next.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {spotlight.map((project) => (
                    <Link
                      key={project.id}
                      to={`/project/${project.id}`}
                      className="bg-mantle border border-surface-0 rounded-xl p-4 hover:border-yellow-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500/15 text-yellow-400 rounded">{project.category}</span>
                        <span className="text-sm font-bold text-text truncate">{project.name}</span>
                      </div>
                      <p className="text-xs text-overlay mb-2">by {project.author}</p>
                      <div className="flex items-center gap-3 text-[10px] text-overlay">
                        <span>{project.blockCount} blocks</span>
                        <span>❤️ {project.likes}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {featured.length === 0 && spotlight.length === 0 && (
              <div className="bg-mantle border border-surface-0 rounded-xl p-12 text-center">
                <span className="text-4xl block mb-3">⭐</span>
                <p className="text-text font-semibold">No featured projects yet</p>
                <p className="text-sm text-overlay mt-1">Build something amazing and it might end up here.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
