/**
 * Multi-select tag picker — click to toggle. Used by Upload and Edit
 * modals instead of a comma-separated text input.
 */

const AVAILABLE_TAGS = [
  'game', 'music', 'art', 'animation', 'story', 'puzzle',
  'tool', 'tutorial', 'beginner', 'intermediate', 'advanced',
  'remix', 'multiplayer', 'AI', 'vision', 'sound',
  'micro:bit', 'hardware', 'math', 'science', 'web',
] as const

interface TagSelectorProps {
  selected: string[]
  onChange: (tags: string[]) => void
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else if (selected.length < 5) {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {AVAILABLE_TAGS.map((tag) => {
        const active = selected.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              active
                ? 'bg-accent text-base font-semibold'
                : 'bg-surface-0 text-subtext hover:bg-surface-1'
            }`}
          >
            {tag}
          </button>
        )
      })}
      {selected.length >= 5 && (
        <span className="text-[10px] text-overlay self-center ml-1">max 5</span>
      )}
    </div>
  )
}
