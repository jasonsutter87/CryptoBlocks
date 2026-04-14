/**
 * /example/:id route — loads an example project into the workspace.
 * Shareable URLs like /example/flappy-bird, /example/hello-world, etc.
 */
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Lazy import to avoid circular deps — examples imports from workspaces
let _examples: Array<{ id: string; name: string; workspace: Record<string, unknown> }> | null = null

async function getExamples() {
  if (_examples) return _examples
  const mod = await import('./index')
  _examples = mod.EXAMPLES || []
  return _examples!
}

export default function ExampleLoader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) { navigate('/'); return }

    getExamples().then((examples) => {
      const example = examples.find((e) => e.id === id)
      if (!example) {
        navigate('/')
        return
      }

      // Store workspace in sessionStorage so App.tsx can pick it up
      sessionStorage.setItem('cb-load-example', JSON.stringify({
        id: example.id,
        name: example.name,
        workspace: example.workspace,
      }))

      // Navigate to home — App.tsx will detect and load the workspace
      navigate('/', { replace: true })
    })
  }, [id, navigate])

  return (
    <div className="h-screen w-screen bg-[#1e1e2e] flex items-center justify-center">
      <div className="text-[#cdd6f4] text-lg animate-pulse">Loading example...</div>
    </div>
  )
}
