/**
 * CollabModal — "Code with Friends" modal.
 * Two modes: Create a room or Join a room.
 */

import { useState } from 'react'
import { nanoid } from 'nanoid'

interface CollabModalProps {
  onClose: () => void
  onCreateRoom: (roomId: string, roomCode: string, roomName: string) => void
  onJoinRoom: (roomCode: string) => void
}

/** Generate a 6-char uppercase alphanumeric code (no ambiguous chars) */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I/L
  let code = ''
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

export default function CollabModal({ onClose, onCreateRoom, onJoinRoom }: CollabModalProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const handleCreate = () => {
    const name = roomName.trim() || 'My Room'
    const roomId = nanoid(12)
    const code = generateRoomCode()
    onCreateRoom(roomId, code, name)
  }

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length >= 4) {
      onJoinRoom(code)
    }
  }

  const tabBtn = (t: 'create' | 'join', label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
        tab === t
          ? 'bg-[#89b4fa] text-[#1e1e2e]'
          : 'text-[#6c7086] hover:text-[#cdd6f4]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#cdd6f4] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Code with Friends
          </h2>
          <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#313244] rounded-lg p-1 mb-5">
          {tabBtn('create', 'Start a Room')}
          {tabBtn('join', 'Join a Room')}
        </div>

        {/* Create tab */}
        {tab === 'create' && (
          <div>
            <label className="block text-xs text-[#6c7086] mb-1.5">Room name</label>
            <input
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="My awesome project"
              maxLength={40}
              className="w-full px-3 py-2 bg-[#313244] border border-[#45475a] rounded-lg text-[#cdd6f4] text-sm placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-4"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="w-full py-2.5 bg-[#89b4fa] text-[#1e1e2e] font-semibold rounded-lg hover:bg-[#b4befe] transition-colors text-sm"
            >
              Create Room
            </button>
          </div>
        )}

        {/* Join tab */}
        {tab === 'join' && (
          <div>
            <label className="block text-xs text-[#6c7086] mb-1.5">Room code</label>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-3 py-2 bg-[#313244] border border-[#45475a] rounded-lg text-[#cdd6f4] text-sm placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] mb-1 text-center font-mono text-lg tracking-widest"
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
            <p className="text-xs text-[#6c7086] mb-4 text-center">Ask your friend for the 6-letter code</p>
            <button
              onClick={handleJoin}
              disabled={joinCode.trim().length < 4}
              className="w-full py-2.5 bg-[#a6e3a1] text-[#1e1e2e] font-semibold rounded-lg hover:bg-[#a6e3a1]/80 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
