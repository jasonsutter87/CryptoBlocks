/**
 * CollabPage — wrapper that connects a collab room, then renders the main App.
 *
 * Reads room code from URL params. Connects to PartyKit.
 * Passes ydoc down to App via context so BlockEditor can bind to it.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as Y from 'yjs'
import { useCollabRoom } from './use-collab-room'
import CollaboratorBar from './CollaboratorBar'
import type { CollabUser } from './types'
import App from '../App'

/** Temporary user until Clerk is wired up */
function getTempUser(): CollabUser {
  let stored = localStorage.getItem('cryptoblocks-collab-user')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch { /* regenerate */ }
  }
  const user: CollabUser = {
    id: crypto.randomUUID(),
    name: `Coder${Math.floor(Math.random() * 9000) + 1000}`,
    avatar: '',
    color: '',
  }
  localStorage.setItem('cryptoblocks-collab-user', JSON.stringify(user))
  return user
}

export default function CollabPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const [user] = useState(getTempUser)

  const { ydoc, status, peers, disconnect } = useCollabRoom({
    roomId: roomCode || '',
    user,
    enabled: !!roomCode,
  })

  const handleLeave = () => {
    disconnect()
    navigate('/')
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/collab/${roomCode}`
    try {
      await navigator.clipboard.writeText(link)
    } catch { /* fallback */ }
  }

  if (!roomCode) {
    navigate('/')
    return null
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Collab bar at the very top */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#89b4fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium text-[#cdd6f4]">Coding with Friends</span>
        </div>
        <CollaboratorBar
          peers={peers}
          status={status}
          roomCode={roomCode}
          onLeave={handleLeave}
          onCopyLink={handleCopyLink}
        />
      </div>

      {/* Main app — ydoc will be passed via CollabContext */}
      <div className="flex-1 min-h-0">
        <CollabContext.Provider value={ydoc}>
          <App />
        </CollabContext.Provider>
      </div>
    </div>
  )
}

/** Context to pass ydoc down to BlockEditor without threading props through App */
import { createContext, useContext } from 'react'

export const CollabContext = createContext<Y.Doc | null>(null)
export function useCollabDoc(): Y.Doc | null {
  return useContext(CollabContext)
}
