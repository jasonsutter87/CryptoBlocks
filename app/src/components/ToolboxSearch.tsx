/**
 * ToolboxSearch — search input overlaid above the Blockly toolbox.
 * When a query is typed, a flat filtered toolbox XML is injected.
 * Clearing the query restores the normal categorized toolbox.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import * as Blockly from 'blockly'
import { registry } from '../blocks/registry'
import { getToolboxXml } from '../blocks/blockly-register'

interface ToolboxSearchProps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
}

/** Escape special XML characters to prevent injection via block names. */
function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function buildSearchToolboxXml(query: string): string {
  const q = query.toLowerCase()
  const allDefs = registry.getAll()

  const matching = allDefs.filter((def) => {
    const nameLower = def.name.toLowerCase().replace(/_/g, ' ')
    const labelLower = (def.description || def.name).toLowerCase()
    return nameLower.includes(q) || labelLower.includes(q)
  })

  if (matching.length === 0) {
    return `<xml><category name="No results" colour="#888"></category></xml>`
  }

  const blockXml = matching
    .map((def) => `<block type="${escapeXml('cb_' + def.name)}"></block>`)
    .join('\n')

  return `<xml><category name="Search results" colour="#7c3aed">${blockXml}</category></xml>`
}

export default function ToolboxSearch({ workspaceRef }: ToolboxSearchProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applySearch = useCallback((q: string) => {
    const ws = workspaceRef.current
    if (!ws) return
    if (!q.trim()) {
      ws.updateToolbox(getToolboxXml())
    } else {
      ws.updateToolbox(buildSearchToolboxXml(q))
    }
  }, [workspaceRef])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => applySearch(q), 180)
  }, [applySearch])

  const handleClear = useCallback(() => {
    setQuery('')
    applySearch('')
  }, [applySearch])

  // Restore toolbox on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      workspaceRef.current?.updateToolbox(getToolboxXml())
    }
  }, [workspaceRef])

  return (
    <div
      className="absolute top-0 left-0 z-30 flex items-center gap-1 px-2 py-1.5"
      style={{ width: 210 }} // roughly toolbox width
    >
      <div
        className={`flex items-center gap-1 w-full rounded-lg border px-2 py-1 transition-colors ${
          focused
            ? 'border-accent/60 bg-surface-0'
            : 'border-surface-1/60 bg-black/40'
        }`}
      >
        <span className="text-[10px] text-overlay shrink-0">🔍</span>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search blocks..."
          className="bg-transparent text-text text-xs outline-none w-full placeholder-overlay/60"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-[10px] text-overlay hover:text-text shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
