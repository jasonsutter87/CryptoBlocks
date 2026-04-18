/**
 * Easter Egg Knowledge Graph — admin-only conspiracy board showing
 * every joke, pun, reference, and hidden layer in CryptoBlocks.
 */

import React from 'react'

interface Node {
  id: string
  label: string
  type: 'root' | 'command' | 'seed' | 'badge' | 'reference' | 'game' | 'crypto' | 'milestone'
  depth: number
}

interface Edge {
  from: string
  to: string
  label?: string
}

const NODES: Node[] = [
  // Roots
  { id: 'terminal', label: 'Hacker Terminal', type: 'root', depth: 0 },
  { id: 'badges', label: 'Badge System', type: 'root', depth: 0 },
  { id: 'ctf', label: 'CTF Treasure Hunt', type: 'root', depth: 0 },

  // Terminal commands
  { id: 'eggvault', label: 'eggVault', type: 'command', depth: 1 },
  { id: 'cmd-cake', label: 'cake', type: 'command', depth: 1 },
  { id: 'cmd-doom', label: 'doom', type: 'command', depth: 1 },
  { id: 'cmd-matrix', label: 'matrix', type: 'command', depth: 1 },
  { id: 'cmd-snake', label: 'snake', type: 'command', depth: 1 },
  { id: 'cmd-invaders', label: 'invaders', type: 'command', depth: 1 },
  { id: 'cmd-rickroll', label: 'rickroll', type: 'command', depth: 1 },
  { id: 'cmd-hack', label: 'hack', type: 'command', depth: 1 },

  // CTF Seeds
  { id: 'seed-hello', label: 'cb-seed-hello-world', type: 'seed', depth: 1 },
  { id: 'seed-42', label: 'cb-seed-42', type: 'seed', depth: 1 },
  { id: 'seed-1729', label: 'cb-seed-1729', type: 'seed', depth: 1 },
  { id: 'seed-1337', label: 'cb-seed-1337', type: 'seed', depth: 1 },
  { id: 'seed-2600', label: 'cb-seed-2600', type: 'seed', depth: 1 },
  { id: 'seed-404', label: 'cb-seed-404', type: 'seed', depth: 1 },

  // Badges from seeds
  { id: 'badge-hello', label: 'Hello Indeed', type: 'badge', depth: 2 },
  { id: 'badge-deep', label: 'Deep Thought 🧠', type: 'badge', depth: 2 },
  { id: 'badge-taxi', label: 'Taxicab 🚕', type: 'badge', depth: 2 },
  { id: 'badge-elite', label: '1337 💀', type: 'badge', depth: 2 },
  { id: 'badge-phreak', label: 'Phreaker 📞', type: 'badge', depth: 2 },
  { id: 'badge-404', label: '404 👻', type: 'badge', depth: 2 },

  // Badges from commands
  { id: 'badge-cake', label: 'The Cake Is A Lie 🎂', type: 'badge', depth: 2 },
  { id: 'badge-egg', label: 'Egg Hunter 🥚', type: 'badge', depth: 2 },
  { id: 'badge-snek', label: 'Snek 🐍', type: 'badge', depth: 2 },
  { id: 'badge-cadet', label: 'Space Cadet 👾', type: 'badge', depth: 2 },
  { id: 'badge-dslayer', label: 'Doom Slayer 💀', type: 'badge', depth: 2 },
  { id: 'badge-dvet', label: 'Doom Veteran 🔥', type: 'badge', depth: 2 },
  { id: 'badge-matrix', label: 'Red Pill 💊', type: 'badge', depth: 2 },
  { id: 'badge-hacker', label: 'Easter Egg Hunter 🥚', type: 'badge', depth: 2 },

  // Crypto badges
  { id: 'badge-finney', label: 'Finney 🔐', type: 'crypto', depth: 2 },
  { id: 'badge-satoshi', label: 'Satoshi ₿', type: 'crypto', depth: 2 },

  // Milestone badges
  { id: 'badge-moon', label: 'Moon Walker 🌙', type: 'milestone', depth: 2 },
  { id: 'badge-god', label: 'Block God 👑', type: 'milestone', depth: 2 },
  { id: 'badge-architect', label: 'The Architect 🔱', type: 'milestone', depth: 2 },

  // Real-world references (depth 3)
  { id: 'ref-hitchhiker', label: "Hitchhiker's Guide to the Galaxy", type: 'reference', depth: 3 },
  { id: 'ref-douglas', label: 'Douglas Adams', type: 'reference', depth: 4 },
  { id: 'ref-ramanujan', label: 'Srinivasa Ramanujan', type: 'reference', depth: 3 },
  { id: 'ref-hardy', label: 'G.H. Hardy', type: 'reference', depth: 3 },
  { id: 'ref-taxicab-story', label: '"Dull number" taxi ride, 1919', type: 'reference', depth: 4 },
  { id: 'ref-leet', label: 'Leet speak / hacker culture', type: 'reference', depth: 3 },
  { id: 'ref-bbs', label: 'BBS era, 1980s', type: 'reference', depth: 4 },
  { id: 'ref-crunch', label: 'Captain Crunch (John Draper)', type: 'reference', depth: 3 },
  { id: 'ref-woz', label: 'Steve Wozniak', type: 'reference', depth: 4 },
  { id: 'ref-apple', label: 'Apple Computer', type: 'reference', depth: 5 },
  { id: 'ref-phreaking', label: 'Phone phreaking, 2600 Hz', type: 'reference', depth: 3 },
  { id: 'ref-2600mag', label: '2600 Magazine', type: 'reference', depth: 4 },
  { id: 'ref-http', label: 'HTTP status codes', type: 'reference', depth: 3 },
  { id: 'ref-tbl', label: 'Tim Berners-Lee', type: 'reference', depth: 4 },
  { id: 'ref-portal', label: 'Portal (Valve, 2007)', type: 'reference', depth: 3 },
  { id: 'ref-glados', label: 'GLaDOS', type: 'reference', depth: 4 },
  { id: 'ref-id', label: 'id Software', type: 'reference', depth: 3 },
  { id: 'ref-carmack', label: 'John Carmack', type: 'reference', depth: 3 },
  { id: 'ref-raycasting', label: 'Raycasting (Wolfenstein 3D, 1992)', type: 'reference', depth: 4 },
  { id: 'ref-wachowski', label: 'The Wachowskis', type: 'reference', depth: 3 },
  { id: 'ref-matrix-film', label: 'The Matrix (1999)', type: 'reference', depth: 3 },
  { id: 'ref-nokia', label: 'Nokia 6110 (1997)', type: 'reference', depth: 3 },
  { id: 'ref-taito', label: 'Taito (1978)', type: 'reference', depth: 3 },
  { id: 'ref-rick', label: 'Rick Astley — Never Gonna Give You Up (1987)', type: 'reference', depth: 3 },
  { id: 'ref-halfinney', label: 'Hal Finney', type: 'reference', depth: 3 },
  { id: 'ref-firstbtc', label: 'First Bitcoin transaction (2009)', type: 'reference', depth: 4 },
  { id: 'ref-rpow', label: 'RPOW (Reusable Proof of Work)', type: 'reference', depth: 4 },
  { id: 'ref-als', label: 'Coded through ALS until the end', type: 'reference', depth: 5 },
  { id: 'ref-satoshi', label: 'Satoshi Nakamoto', type: 'reference', depth: 3 },
  { id: 'ref-whitepaper', label: 'Bitcoin whitepaper (2008)', type: 'reference', depth: 4 },
  { id: 'ref-pow', label: 'Proof of Work', type: 'reference', depth: 4 },
  { id: 'ref-apollo', label: 'Apollo program — 238,900 miles', type: 'reference', depth: 3 },
  { id: 'ref-matrix-char', label: 'The Architect (Matrix Revolutions)', type: 'reference', depth: 3 },
  { id: 'ref-juiceshop', label: 'OWASP Juice Shop', type: 'reference', depth: 3 },
  { id: 'ref-idor', label: 'IDOR vulnerability pattern', type: 'reference', depth: 4 },
]

const EDGES: Edge[] = [
  // Terminal → commands
  { from: 'terminal', to: 'eggvault', label: 'hidden command' },
  { from: 'terminal', to: 'cmd-cake', label: 'hidden command' },
  { from: 'terminal', to: 'cmd-doom', label: 'in help menu' },
  { from: 'terminal', to: 'cmd-matrix', label: 'in help menu' },
  { from: 'terminal', to: 'cmd-snake', label: 'in help menu' },
  { from: 'terminal', to: 'cmd-invaders', label: 'in help menu' },
  { from: 'terminal', to: 'cmd-rickroll', label: 'in help menu' },
  { from: 'terminal', to: 'cmd-hack', label: 'in help menu' },

  // eggVault → CTF
  { from: 'eggvault', to: 'ctf', label: 'hints at' },
  { from: 'ctf', to: 'seed-hello' },
  { from: 'ctf', to: 'seed-42', label: '"life, universe, everything"' },
  { from: 'ctf', to: 'seed-1729', label: '"interesting taxi ride"' },
  { from: 'ctf', to: 'seed-1337', label: '"only the elite"' },
  { from: 'ctf', to: 'seed-2600', label: '"Captain Crunch whistled"' },
  { from: 'ctf', to: 'seed-404', label: '"page does not exist"' },

  // Seeds → Badges
  { from: 'seed-hello', to: 'badge-hello', label: 'remix →' },
  { from: 'seed-42', to: 'badge-deep', label: 'remix →' },
  { from: 'seed-1729', to: 'badge-taxi', label: 'remix →' },
  { from: 'seed-1337', to: 'badge-elite', label: 'remix →' },
  { from: 'seed-2600', to: 'badge-phreak', label: 'remix →' },
  { from: 'seed-404', to: 'badge-404', label: 'remix →' },

  // Commands → Badges
  { from: 'cmd-cake', to: 'badge-cake' },
  { from: 'eggvault', to: 'badge-egg' },
  { from: 'cmd-snake', to: 'badge-snek' },
  { from: 'cmd-invaders', to: 'badge-cadet' },
  { from: 'cmd-doom', to: 'badge-dslayer', label: 'clear level 1' },
  { from: 'cmd-doom', to: 'badge-dvet', label: 'reach level 5' },
  { from: 'cmd-matrix', to: 'badge-matrix' },
  { from: 'cmd-hack', to: 'badge-hacker' },

  // Badges → References
  { from: 'badge-deep', to: 'ref-hitchhiker', label: '"42"' },
  { from: 'ref-hitchhiker', to: 'ref-douglas' },
  { from: 'badge-taxi', to: 'ref-ramanujan' },
  { from: 'badge-taxi', to: 'ref-hardy' },
  { from: 'ref-ramanujan', to: 'ref-taxicab-story' },
  { from: 'badge-elite', to: 'ref-leet' },
  { from: 'ref-leet', to: 'ref-bbs' },
  { from: 'badge-phreak', to: 'ref-crunch' },
  { from: 'badge-phreak', to: 'ref-phreaking' },
  { from: 'ref-crunch', to: 'ref-woz' },
  { from: 'ref-woz', to: 'ref-apple' },
  { from: 'ref-phreaking', to: 'ref-2600mag' },
  { from: 'badge-404', to: 'ref-http' },
  { from: 'ref-http', to: 'ref-tbl' },
  { from: 'badge-cake', to: 'ref-portal' },
  { from: 'ref-portal', to: 'ref-glados' },
  { from: 'badge-dslayer', to: 'ref-id' },
  { from: 'badge-dslayer', to: 'ref-carmack' },
  { from: 'ref-carmack', to: 'ref-raycasting' },
  { from: 'badge-matrix', to: 'ref-wachowski' },
  { from: 'badge-matrix', to: 'ref-matrix-film' },
  { from: 'badge-snek', to: 'ref-nokia' },
  { from: 'badge-cadet', to: 'ref-taito' },
  { from: 'cmd-rickroll', to: 'ref-rick' },

  // Crypto badges → References
  { from: 'badges', to: 'badge-finney' },
  { from: 'badges', to: 'badge-satoshi' },
  { from: 'badge-finney', to: 'ref-halfinney' },
  { from: 'ref-halfinney', to: 'ref-firstbtc' },
  { from: 'ref-halfinney', to: 'ref-rpow' },
  { from: 'ref-halfinney', to: 'ref-als' },
  { from: 'badge-satoshi', to: 'ref-satoshi' },
  { from: 'ref-satoshi', to: 'ref-whitepaper' },
  { from: 'ref-satoshi', to: 'ref-pow' },

  // Milestone badges → References
  { from: 'badges', to: 'badge-moon' },
  { from: 'badges', to: 'badge-god' },
  { from: 'badges', to: 'badge-architect' },
  { from: 'badge-moon', to: 'ref-apollo' },
  { from: 'badge-architect', to: 'ref-matrix-char' },
  { from: 'badge-god', to: 'ref-pow', label: '"proof of work — literally"' },

  // CTF meta
  { from: 'ctf', to: 'ref-juiceshop', label: 'inspired by' },
  { from: 'ref-juiceshop', to: 'ref-idor' },
]

const TYPE_COLORS: Record<Node['type'], string> = {
  root: '#a855f7',
  command: '#a6e3a1',
  seed: '#89b4fa',
  badge: '#f9e2af',
  reference: '#6c7086',
  game: '#f38ba8',
  crypto: '#f9e2af',
  milestone: '#eab308',
}

export default function EasterEggGraph() {
  const nodeMap = new Map(NODES.map(n => [n.id, n]))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🕸️</span>
        <div>
          <h3 className="text-text font-bold text-lg">Easter Egg Knowledge Graph</h3>
          <p className="text-xs text-overlay">{NODES.length} nodes · {EDGES.length} connections · every joke, pun, and reference mapped</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-overlay capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Graph as tree list — each root expands into its connections */}
      <div className="space-y-4">
        {NODES.filter(n => n.depth === 0).map(root => (
          <div key={root.id} className="bg-mantle border border-surface-0 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: TYPE_COLORS[root.type] }} />
              <span className="text-text font-bold">{root.label}</span>
            </div>
            <div className="ml-4 border-l-2 border-surface-1 pl-4 space-y-1.5">
              {renderChildren(root.id, nodeMap, new Set())}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-surface-0 rounded-xl p-4 flex flex-wrap gap-6">
        <div>
          <div className="text-2xl font-bold text-accent">{NODES.filter(n => n.type === 'badge' || n.type === 'crypto' || n.type === 'milestone').length}</div>
          <div className="text-xs text-overlay">Easter egg badges</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-success">{NODES.filter(n => n.type === 'command').length}</div>
          <div className="text-xs text-overlay">Hidden commands</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">{NODES.filter(n => n.type === 'seed').length}</div>
          <div className="text-xs text-overlay">CTF seeds</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-overlay">{NODES.filter(n => n.type === 'reference').length}</div>
          <div className="text-xs text-overlay">Real-world references</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">{Math.max(...NODES.map(n => n.depth)) + 1}</div>
          <div className="text-xs text-overlay">Layers deep</div>
        </div>
      </div>
    </div>
  )
}

function renderChildren(parentId: string, nodeMap: Map<string, Node>, visited: Set<string>): React.ReactNode[] {
  if (visited.has(parentId)) return []
  visited.add(parentId)

  const children = EDGES
    .filter(e => e.from === parentId)
    .map(e => ({ edge: e, node: nodeMap.get(e.to)! }))
    .filter(c => c.node)

  return children.map(({ edge, node }) => (
    <div key={node.id}>
      <div className="flex items-center gap-2 py-0.5">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[node.type] }} />
        <span className={`text-sm ${node.type === 'reference' ? 'text-overlay italic' : 'text-text'}`}>
          {node.label}
        </span>
        {edge.label && (
          <span className="text-[10px] text-overlay/60 ml-1">— {edge.label}</span>
        )}
      </div>
      {EDGES.some(e => e.from === node.id) && !visited.has(node.id) && (
        <div className="ml-4 border-l border-surface-1 pl-3 space-y-0.5">
          {renderChildren(node.id, nodeMap, visited)}
        </div>
      )}
    </div>
  ))
}
