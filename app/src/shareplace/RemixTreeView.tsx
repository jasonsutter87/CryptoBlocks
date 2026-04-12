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
          ? 'bg-[#89b4fa]/20 border border-[#89b4fa] text-[#cdd6f4]'
          : 'bg-[#181825] border border-[#313244] text-[#a6adc8] hover:border-[#45475a] hover:bg-[#1e1e2e]'
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-[#313244] flex items-center justify-center text-[10px] font-bold text-[#89b4fa] shrink-0">
        {(node.authorName || '?').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#cdd6f4]' : ''}`}>
          {node.name}
        </div>
        <div className="text-[10px] text-[#6c7086] truncate">
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
      <div className="w-px h-4 bg-[#45475a]" />
      {label && (
        <span className="text-[9px] text-[#6c7086] uppercase tracking-wider">{label}</span>
      )}
      <div className="w-px h-4 bg-[#45475a]" />
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
