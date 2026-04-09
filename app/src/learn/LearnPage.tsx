import { useState } from 'react'
import { ALL_CHAPTERS } from './index'
import { isLessonComplete, markLessonComplete } from './progress'
import type { Chapter, Lesson, LessonBlock, LessonExercise } from './types'

// ─── Block renderers ─────────────────────────────────────────────────────────

function HeadingBlock({ block }: { block: LessonBlock }) {
  const text = block.text ?? ''
  if (block.level === 1) {
    return <h1 className="text-3xl font-bold text-[#cdd6f4] mt-8 mb-4 first:mt-0">{text}</h1>
  }
  if (block.level === 2) {
    return <h2 className="text-xl font-semibold text-[#cdd6f4] mt-6 mb-3">{text}</h2>
  }
  return <h3 className="text-lg font-semibold text-[#cdd6f4] mt-4 mb-2">{text}</h3>
}

function ParagraphBlock({ block }: { block: LessonBlock }) {
  return <p className="text-[#a6adc8] leading-relaxed mb-4">{block.text}</p>
}

function CodeBlock({ block }: { block: LessonBlock }) {
  return (
    <div className="my-5">
      <pre className="bg-[#11111b] border border-[#313244] rounded-lg px-5 py-4 overflow-x-auto">
        <code className="text-[#cdd6f4] font-mono text-sm leading-relaxed whitespace-pre">
          {block.code}
        </code>
      </pre>
      {block.runnable && (
        <div className="mt-2 flex justify-end">
          <button
            className="px-3 py-1.5 bg-[#89b4fa]/10 text-[#89b4fa] border border-[#89b4fa]/30 rounded text-sm font-medium hover:bg-[#89b4fa]/20 transition-colors cursor-not-allowed opacity-60"
            disabled
            title="Code runner coming soon"
          >
            Run (coming soon)
          </button>
        </div>
      )}
    </div>
  )
}

const CALLOUT_STYLES: Record<string, { border: string; bg: string; icon: string; label: string }> = {
  info:    { border: 'border-[#89b4fa]',  bg: 'bg-[#89b4fa]/10',  icon: 'ℹ️',  label: 'Info' },
  tip:     { border: 'border-[#a6e3a1]',  bg: 'bg-[#a6e3a1]/10',  icon: '💡', label: 'Tip' },
  warning: { border: 'border-[#f9e2af]',  bg: 'bg-[#f9e2af]/10',  icon: '⚠️', label: 'Note' },
}

function CalloutBlock({ block }: { block: LessonBlock }) {
  const variant = block.variant ?? 'info'
  const styles = CALLOUT_STYLES[variant]
  return (
    <div className={`my-5 flex gap-3 border-l-4 ${styles.border} ${styles.bg} rounded-r-lg px-4 py-3`}>
      <span className="text-lg shrink-0">{styles.icon}</span>
      <p className="text-[#cdd6f4] text-sm leading-relaxed">{block.text}</p>
    </div>
  )
}

function ExerciseBlock({ exercise }: { exercise: LessonExercise }) {
  return (
    <div className="my-6 border border-[#313244] rounded-xl bg-[#181825] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#313244]/50 border-b border-[#313244]">
        <span className="text-base">✏️</span>
        <span className="text-sm font-semibold text-[#cdd6f4]">Exercise</span>
      </div>
      <div className="px-4 py-4">
        <p className="text-[#a6adc8] mb-4">{exercise.prompt}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {exercise.hints.slice(0, 1).map((hint, i) => (
              <span key={i} className="text-xs text-[#6c7086] bg-[#313244] px-2 py-1 rounded">
                Hint: {hint}
              </span>
            ))}
          </div>
          <button
            className="px-3 py-1.5 bg-[#89b4fa]/10 text-[#89b4fa] border border-[#89b4fa]/30 rounded text-sm font-medium hover:bg-[#89b4fa]/20 transition-colors cursor-not-allowed opacity-60"
            disabled
            title="Exercise runner coming soon"
          >
            Open in Editor → (coming soon)
          </button>
        </div>
      </div>
    </div>
  )
}

function LessonBlockRenderer({ block, exercises }: { block: LessonBlock; exercises: LessonExercise[] }) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlock block={block} />
    case 'paragraph':
      return <ParagraphBlock block={block} />
    case 'code':
      return <CodeBlock block={block} />
    case 'callout':
      return <CalloutBlock block={block} />
    case 'exercise': {
      const exercise = exercises.find(e => e.id === block.exerciseId)
      if (!exercise) return null
      return <ExerciseBlock exercise={exercise} />
    }
    default:
      return null
  }
}

// ─── Lesson view ─────────────────────────────────────────────────────────────

function LessonView({ lesson, onMarkComplete }: { lesson: Lesson; onMarkComplete: () => void }) {
  const complete = isLessonComplete(lesson.id)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#6c7086] font-mono uppercase tracking-wider">
          {lesson.estimatedMinutes} min read
        </span>
        {complete && (
          <span className="text-xs text-[#a6e3a1] flex items-center gap-1">
            <span>✓</span> Completed
          </span>
        )}
      </div>

      <div>
        {lesson.blocks.map((block, i) => (
          <LessonBlockRenderer key={i} block={block} exercises={lesson.exercises} />
        ))}
      </div>

      {!complete && (
        <div className="mt-10 pt-6 border-t border-[#313244]">
          <button
            onClick={onMarkComplete}
            className="px-5 py-2.5 bg-[#89b4fa] text-[#1e1e2e] rounded-lg font-semibold text-sm hover:bg-[#b4d0fb] transition-colors"
          >
            Mark as complete ✓
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function ChapterSidebar({
  chapters,
  selectedChapterId,
  selectedLessonId,
  onSelectLesson,
}: {
  chapters: Chapter[]
  selectedChapterId: string
  selectedLessonId: string
  onSelectLesson: (chapterId: string, lessonId: string) => void
}) {
  return (
    <aside className="w-64 shrink-0 bg-[#181825] border-r border-[#313244] overflow-y-auto">
      <div className="px-4 py-5 border-b border-[#313244]">
        <h2 className="text-sm font-bold text-[#cdd6f4] tracking-wide uppercase">Chapters</h2>
      </div>
      <nav className="py-2">
        {chapters.map(chapter => {
          const totalLessons = chapter.lessons.length
          const completedLessons = chapter.lessons.filter(l => isLessonComplete(l.id)).length
          const isCurrentChapter = chapter.id === selectedChapterId

          return (
            <div key={chapter.id}>
              {/* Chapter header */}
              <div
                className={`flex items-center gap-3 px-4 py-3 ${
                  isCurrentChapter ? 'bg-[#313244]/50' : ''
                }`}
              >
                <span className="text-xl">{chapter.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[#6c7086] font-mono">Chapter {chapter.number}</div>
                  <div className="text-sm font-semibold text-[#cdd6f4] truncate">{chapter.title}</div>
                  <div className="text-xs text-[#6c7086] mt-0.5">
                    {completedLessons}/{totalLessons} done
                  </div>
                </div>
              </div>

              {/* Lessons */}
              {isCurrentChapter && (
                <div className="mb-1">
                  {chapter.lessons.map((lesson, idx) => {
                    const isActive = lesson.id === selectedLessonId
                    const done = isLessonComplete(lesson.id)
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(chapter.id, lesson.id)}
                        className={`w-full text-left flex items-center gap-3 px-4 pl-10 py-2.5 transition-colors ${
                          isActive
                            ? 'bg-[#89b4fa]/10 text-[#89b4fa]'
                            : 'text-[#a6adc8] hover:bg-[#313244]/50 hover:text-[#cdd6f4]'
                        }`}
                      >
                        <span className="text-sm shrink-0">
                          {done ? '✓' : `${idx + 1}.`}
                        </span>
                        <span className="text-sm truncate">{lesson.title}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

// ─── Chapter picker (when no lesson is selected) ─────────────────────────────

function ChapterPicker({
  chapters,
  onSelectChapter,
}: {
  chapters: Chapter[]
  onSelectChapter: (chapterId: string) => void
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[#cdd6f4] mb-2">Learn JavaScript</h1>
      <p className="text-[#a6adc8] mb-10 text-lg">
        A beginner-friendly course. Start from zero and build real things.
      </p>
      <div className="grid gap-4">
        {chapters.map(chapter => {
          const total = chapter.lessons.length
          const done = chapter.lessons.filter(l => isLessonComplete(l.id)).length
          const totalMins = chapter.lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0)
          return (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className="text-left flex items-start gap-5 p-5 bg-[#181825] border border-[#313244] rounded-xl hover:border-[#89b4fa]/40 hover:bg-[#313244]/30 transition-all group"
            >
              <span className="text-4xl">{chapter.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#6c7086] font-mono mb-1">Chapter {chapter.number}</div>
                <div className="text-lg font-semibold text-[#cdd6f4] group-hover:text-[#89b4fa] transition-colors">
                  {chapter.title}
                </div>
                <p className="text-sm text-[#a6adc8] mt-1">{chapter.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#6c7086]">
                  <span>{total} lessons</span>
                  <span>~{totalMins} min</span>
                  {done > 0 && (
                    <span className="text-[#a6e3a1]">{done}/{total} completed</span>
                  )}
                </div>
              </div>
              <span className="text-[#6c7086] group-hover:text-[#89b4fa] transition-colors text-xl">→</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  // Force re-render when completion state changes
  const [, setTick] = useState(0)

  const selectedChapter = selectedChapterId
    ? ALL_CHAPTERS.find(c => c.id === selectedChapterId) ?? null
    : null

  const selectedLesson = selectedChapter && selectedLessonId
    ? selectedChapter.lessons.find(l => l.id === selectedLessonId) ?? null
    : null

  function handleSelectChapter(chapterId: string) {
    const chapter = ALL_CHAPTERS.find(c => c.id === chapterId)
    if (!chapter) return
    setSelectedChapterId(chapterId)
    setSelectedLessonId(chapter.lessons[0]?.id ?? null)
  }

  function handleSelectLesson(chapterId: string, lessonId: string) {
    setSelectedChapterId(chapterId)
    setSelectedLessonId(lessonId)
  }

  function handleMarkComplete() {
    if (!selectedLessonId) return
    markLessonComplete(selectedLessonId)
    setTick(t => t + 1)
  }

  if (!selectedChapterId) {
    return (
      <div className="min-h-screen bg-[#1e1e2e]">
        <ChapterPicker chapters={ALL_CHAPTERS} onSelectChapter={handleSelectChapter} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1e1e2e] flex">
      <ChapterSidebar
        chapters={ALL_CHAPTERS}
        selectedChapterId={selectedChapterId}
        selectedLessonId={selectedLessonId ?? ''}
        onSelectLesson={handleSelectLesson}
      />

      <main className="flex-1 overflow-y-auto">
        {selectedLesson ? (
          <LessonView lesson={selectedLesson} onMarkComplete={handleMarkComplete} />
        ) : (
          <div className="flex items-center justify-center h-64 text-[#6c7086]">
            Select a lesson to begin.
          </div>
        )}
      </main>
    </div>
  )
}
