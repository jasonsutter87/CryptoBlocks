/**
 * SharedProjectLoader — loads a shared project by ID and redirects to the editor.
 *
 * Route: /project/:id
 *
 * Fetches the project workspace from the API, saves it to localStorage,
 * and redirects to / so the editor loads it. Shows a loading state while
 * fetching and an error if the project doesn't exist.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function SharedProjectLoader() {
  const { id } = useParams<{ id: string }>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/projects/${id}`)
        if (!res.ok) {
          setError('Project not found')
          return
        }
        const data = await res.json()
        if (data.workspaceJson) {
          // Store as a shared (read-only) project — the editor will show
          // a banner and lock editing until the user clicks "Make a Copy"
          localStorage.setItem('cryptoblocks_shared_view', JSON.stringify({
            id: id,
            name: data.name || 'Shared Project',
            authorName: data.authorName || 'Anonymous',
            workspaceJson: data.workspaceJson,
          }))
          window.location.href = '/?shared=1'
        } else {
          setError('Project has no workspace data')
        }
      } catch {
        setError('Failed to load project')
      }
    })()
  }, [id])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e2e]">
        <div className="text-center">
          <span className="text-5xl block mb-4">😕</span>
          <h1 className="text-xl font-bold text-[#cdd6f4] mb-2">{error}</h1>
          <a href="/" className="text-sm text-[#89b4fa] hover:text-[#74c7ec]">← Back to Editor</a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center bg-[#1e1e2e]">
      <div className="text-center">
        <span className="text-5xl block mb-4 animate-bounce">🧱</span>
        <h1 className="text-lg font-semibold text-[#cdd6f4] animate-pulse">Loading project...</h1>
      </div>
    </div>
  )
}
