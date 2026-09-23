/**
 * My Blocks Library — single panel for managing user-authored custom blocks
 * across both scopes.
 *
 * Two sections:
 *  - Global: lives in localStorage, shared across every project.
 *  - This Project: bundled into the .blocks file only, never enters the
 *    global library.
 *
 * Per-row actions: Edit (re-opens CreateBlockModal), Delete, Move scope.
 * Rename is intentionally NOT here — block name = Blockly type id and gets
 * baked into workspace XML. That's a separate change.
 */

import type { BlockDefinition } from '../types/block'

interface Props {
  globalBlocks: BlockDefinition[]
  workspaceBlocks: BlockDefinition[]
  onEdit: (block: BlockDefinition) => void
  onDelete: (block: BlockDefinition) => void
  onMoveScope: (block: BlockDefinition, target: 'global' | 'workspace') => void
  onClose: () => void
}

function prettyName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function BlockRow({
  block,
  scope,
  onEdit,
  onDelete,
  onMoveScope,
}: {
  block: BlockDefinition
  scope: 'global' | 'workspace'
  onEdit: (b: BlockDefinition) => void
  onDelete: (b: BlockDefinition) => void
  onMoveScope: (b: BlockDefinition, target: 'global' | 'workspace') => void
}) {
  const target = scope === 'global' ? 'workspace' : 'global'
  const moveLabel = target === 'workspace' ? 'Move to project' : 'Make global'
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-mantle border border-surface-0 hover:border-surface-1 transition-colors">
      <span
        className="w-3 h-3 rounded-sm shrink-0"
        style={{ backgroundColor: block.color }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text truncate">{prettyName(block.name)}</div>
        <div className="text-xs text-overlay truncate">
          {block.description || <span className="italic">No description</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onMoveScope(block, target)}
          className="px-2 py-1 text-xs text-overlay hover:text-text hover:bg-surface-0 rounded transition-colors"
          title={
            target === 'workspace'
              ? 'Move into this project only — removed from your global library'
              : 'Promote to your global library — available in every project'
          }
        >
          {moveLabel}
        </button>
        <button
          onClick={() => onEdit(block)}
          className="px-2 py-1 text-xs text-accent hover:bg-surface-0 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(block)}
          className="px-2 py-1 text-xs text-danger hover:bg-surface-0 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default function MyBlocksLibrary({
  globalBlocks,
  workspaceBlocks,
  onEdit,
  onDelete,
  onMoveScope,
  onClose,
}: Props) {
  const total = globalBlocks.length + workspaceBlocks.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-base border border-surface-0 rounded-xl w-[680px] max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-0">
          <div>
            <h2 className="text-lg font-bold text-text">My Blocks Library</h2>
            <p className="text-xs text-overlay mt-0.5">
              {total === 0
                ? 'No custom blocks yet — create one from the Build menu.'
                : `${total} custom block${total === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-overlay hover:text-text transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-warn">Global</h3>
              <span className="text-[10px] text-overlay">Available in every project</span>
            </div>
            {globalBlocks.length === 0 ? (
              <p className="text-xs text-overlay px-1">Nothing here yet.</p>
            ) : (
              <div className="space-y-1.5">
                {globalBlocks.map((b) => (
                  <BlockRow
                    key={b.name}
                    block={b}
                    scope="global"
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMoveScope={onMoveScope}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">This Project</h3>
              <span className="text-[10px] text-overlay">Travels with the .blocks file</span>
            </div>
            {workspaceBlocks.length === 0 ? (
              <p className="text-xs text-overlay px-1">No project-only blocks yet.</p>
            ) : (
              <div className="space-y-1.5">
                {workspaceBlocks.map((b) => (
                  <BlockRow
                    key={b.name}
                    block={b}
                    scope="workspace"
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMoveScope={onMoveScope}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-surface-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text hover:bg-surface-0 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
