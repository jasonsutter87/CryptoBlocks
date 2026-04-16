import type { SharedProject } from '../types/shareplace'

interface ProjectCardProps {
  project: SharedProject
  onClick?: () => void
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Games: 'from-accent/30 to-sapphire/20',
  Art: 'from-purple/30 to-[#f5c2e7]/20',
  Web: 'from-danger/30 to-[#eba0ac]/20',
  Sound: 'from-peach/30 to-warn/20',
  Data: 'from-success/30 to-[#94e2d5]/20',
  AI: 'from-warn/30 to-peach/20',
}

const CATEGORY_ICON_COLORS: Record<string, string> = {
  Games: '#89b4fa',
  Art: '#cba6f7',
  Web: '#f38ba8',
  Sound: '#fab387',
  Data: '#a6e3a1',
  AI: '#f9e2af',
}

const CATEGORY_PILL_COLORS: Record<string, string> = {
  Games: 'bg-accent/15 text-accent',
  Art: 'bg-purple/15 text-purple',
  Web: 'bg-danger/15 text-danger',
  Sound: 'bg-peach/15 text-peach',
  Data: 'bg-success/15 text-success',
  AI: 'bg-warn/15 text-warn',
}

function CategoryThumbnail({ category }: { category: string }) {
  const gradient = CATEGORY_GRADIENTS[category] ?? 'from-surface-0/60 to-surface-1/40'
  const color = CATEGORY_ICON_COLORS[category] ?? '#6c7086'

  const icons: Record<string, React.ReactNode> = {
    Games: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-60">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h-3m0 0H9m3 0V9m0 3v3M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    Art: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-60">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    Web: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-60">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    Sound: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-60">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
    Data: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-60">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    AI: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-60">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  }

  return (
    <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center rounded-t-xl`}>
      <div style={{ color }}>
        {icons[category] ?? icons['Web']}
      </div>
    </div>
  )
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const pillClass = CATEGORY_PILL_COLORS[project.category] ?? 'bg-surface-1/40 text-subtext'

  return (
    <div
      onClick={onClick}
      className="group bg-surface-0 rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-surface-1 hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-black/30"
    >
      <CategoryThumbnail category={project.category} />

      <div className="p-4 flex flex-col gap-2">
        {/* Name + category pill + pro badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text leading-tight">{project.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {project.tags.some(t => t === 'pro' || t === 'sprite-editor' || t === 'level-editor' || t === 'gamepad') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-purple/20 text-purple">
                ✨ Pro Tools
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pillClass}`}>
              {project.category}
            </span>
          </div>
        </div>

        {/* Author + remix badge */}
        <p className="text-xs text-overlay">
          by {project.author}
          {project.parentId && (
            <span className="ml-1.5 text-success">🔀 remix</span>
          )}
        </p>

        {/* Description */}
        <p className="text-sm text-subtext line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-overlay bg-base px-1.5 py-0.5 rounded font-mono">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-1 pt-2 border-t border-surface-1/50">
          {/* Block count */}
          <span className="flex items-center gap-1 text-xs text-subtext">
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {project.blockCount}
          </span>

          {/* Downloads */}
          <span className="flex items-center gap-1 text-xs text-subtext">
            <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            {project.downloads.toLocaleString()}
          </span>

          {/* Likes */}
          <span className="flex items-center gap-1 text-xs text-subtext">
            <svg className="w-3.5 h-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {project.likes}
          </span>
        </div>
      </div>
    </div>
  )
}
