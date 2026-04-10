/**
 * CollaboratorBar — shows colored avatar circles for each peer in the room.
 * Displays connection status and a leave button.
 */

import type { PresenceState, ConnectionStatus } from './types'

interface CollaboratorBarProps {
  peers: PresenceState[]
  status: ConnectionStatus
  roomCode: string
  onLeave: () => void
  onCopyLink: () => void
}

const statusDot: Record<ConnectionStatus, string> = {
  connected: 'bg-[#a6e3a1]',
  connecting: 'bg-[#f9e2af] animate-pulse',
  disconnected: 'bg-[#f38ba8]',
}

const statusLabel: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected',
}

export default function CollaboratorBar({ peers, status, roomCode, onLeave, onCopyLink }: CollaboratorBarProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-[#313244] rounded-lg">
      {/* Status dot */}
      <div className="flex items-center gap-1.5" title={statusLabel[status]}>
        <div className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
        <span className="text-xs text-[#6c7086] font-mono">{roomCode}</span>
      </div>

      {/* Peer avatars */}
      {peers.length > 0 && (
        <div className="flex items-center -space-x-1.5">
          {peers.map((peer, i) => (
            <div
              key={peer.user.id || i}
              className="w-6 h-6 rounded-full border-2 border-[#313244] flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: peer.user.color }}
              title={peer.user.name}
            >
              {peer.user.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* Copy invite link */}
      <button
        onClick={onCopyLink}
        className="text-[#89b4fa] hover:text-[#b4befe] transition-colors"
        title="Copy invite link"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      {/* Leave */}
      <button
        onClick={onLeave}
        className="text-xs text-[#f38ba8] hover:text-[#f38ba8]/80 font-medium transition-colors"
        title="Leave room"
      >
        Leave
      </button>
    </div>
  )
}
