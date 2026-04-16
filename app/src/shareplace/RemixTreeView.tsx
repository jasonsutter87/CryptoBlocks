/**
 * RemixTreeView — visualizes the remix lineage of a project.
 *
 * Shows ancestors (chain of parent projects going up), the current
 * project highlighted in the middle, and direct children (remixes)
 * branching below. Each node is a clickable mini-card.
 */

import type { RemixTreeNode } from './api'

interface RemixTreeViewProps {
  ancestors: RemixTreeNode[]
  currentProject: { id: string; name: string; authorName?: string }
  children: RemixTreeNode[]
  remixCount: number
  onNodeClick?: (id: string) => void
}

function TreeNode({
  node,
  isCurrent,
  onClick,
}: {
  node: { id: string; name: string; authorName?: string; likes?: number }
  isCurrent?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors w-full max-w-xs ${
        isCurrent
          ? 'bg-accent/20 border border-accent text-text'
          : 'bg-mantle border border-surface-0 text-subtext hover:border-surface-1 hover:bg-base'
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-surface-0 flex items-center justify-center text-[10px] font-bold text-accent shrink-0">
        {(node.authorName || '?').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-text' : ''}`}>
          {node.name}
        </div>
        <div className="text-[10px] text-overlay truncate">
          by {node.authorName || 'Anonymous'}
          {node.likes != null && node.likes > 0 ? ` · ${node.likes} ♥` : ''}
        </div>
      </div>
    </button>
  )
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0">
      <div className="w-px h-4 bg-surface-1" />
      {label && (
        <span className="text-[9px] text-overlay uppercase tracking-wider">{label}</span>
      )}
      <div className="w-px h-4 bg-surface-1" />
    </div>
  )
}

export default function RemixTreeView({
  ancestors,
  currentProject,
  children,
  remixCount,
  onNodeClick,
}: RemixTreeViewProps) {
  if (ancestors.length === 0 && children.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Ancestors chain (oldest first → newest) */}
      {ancestors.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center gap-0">
          <TreeNode
            node={node}
            onClick={() => onNodeClick?.(node.id)}
          />
          <Connector label={i === ancestors.length - 1 ? 'remixed as' : undefined} />
        </div>
      ))}

      {/* Current project (highlighted) */}
      <TreeNode
        node={{ ...currentProject, authorName: currentProject.authorName }}
        isCurrent
      />

      {/* Children (direct remixes) */}
      {children.length > 0 && (
        <>
          <Connector label={`${remixCount} remix${remixCount !== 1 ? 'es' : ''}`} />
          <div className="flex flex-wrap justify-center gap-2 max-w-md">
            {children.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                onClick={() => onNodeClick?.(node.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
