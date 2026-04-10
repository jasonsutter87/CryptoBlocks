/**
 * RoomCreatedModal — shows the room code and copy link after creating a room.
 * Big, friendly, kid-readable.
 */

import { useState } from 'react'

interface RoomCreatedModalProps {
  roomCode: string
  roomName: string
  onClose: () => void
}

export default function RoomCreatedModal({ roomCode, roomName, onClose }: RoomCreatedModalProps) {
  const [copied, setCopied] = useState(false)

  const inviteLink = `${window.location.origin}/collab/${roomCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
    } catch {
      // fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Celebration icon */}
        <div className="text-4xl mb-3">🎉</div>

        <h2 className="text-lg font-bold text-[#cdd6f4] mb-1">Room Created!</h2>
        <p className="text-sm text-[#6c7086] mb-5">{roomName}</p>

        {/* Big room code */}
        <div className="mb-4">
          <p className="text-xs text-[#6c7086] mb-2">Share this code with your friend:</p>
          <button
            onClick={handleCopyCode}
            className="inline-block bg-[#313244] border-2 border-dashed border-[#45475a] rounded-xl px-6 py-3 font-mono text-3xl font-bold text-[#89b4fa] tracking-[0.3em] hover:border-[#89b4fa] transition-colors"
            title="Click to copy code"
          >
            {roomCode}
          </button>
        </div>

        {/* Copy link button */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 bg-[#89b4fa] text-[#1e1e2e] font-semibold rounded-lg hover:bg-[#b4befe] transition-colors text-sm flex items-center justify-center gap-2 mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? 'Copied!' : 'Copy Invite Link'}
        </button>

        <button
          onClick={onClose}
          className="text-sm text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
        >
          Start building
        </button>
      </div>
    </div>
  )
}
