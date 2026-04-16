/**
 * CollabPage — wrapper that connects a collab room, then renders the main App.
 *
 * Reads room code from URL params. Connects to PartyKit.
 * Passes ydoc + awareness down to App via context so BlockEditor can bind.
 */

import { createContext, useContext, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../auth'
import * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import { useCollabRoom } from './use-collab-room'
import CollaboratorBar from './CollaboratorBar'
import type { CollabUser } from './types'
import App from '../App'

/** Build a CollabUser from Clerk auth state, falling back to a random temp user. */
function useTempOrClerkUser(): CollabUser {
  const { user: clerkUser, isLoaded } = useUser()

  return useMemo(() => {
    // Clerk user is signed in — use their real identity
    if (isLoaded && clerkUser) {
      return {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || 'Coder',
        avatar: clerkUser.imageUrl || '',
        color: '',
      }
    }

    // Not signed in — fall back to localStorage temp user
    let stored = localStorage.getItem('cryptoblocks-collab-user')
    if (stored) {
      try {
        return JSON.parse(stored) as CollabUser
      } catch { /* regenerate */ }
    }
    const temp: CollabUser = {
      id: crypto.randomUUID(),
      name: `Coder${Math.floor(Math.random() * 9000) + 1000}`,
      avatar: '',
      color: '',
    }
    localStorage.setItem('cryptoblocks-collab-user', JSON.stringify(temp))
    return temp
  }, [clerkUser, isLoaded])
}

/** Context carrying both ydoc and awareness */
interface CollabContextValue {
  ydoc: Y.Doc | null
  awareness: Awareness | null
}

export const CollabContext = createContext<CollabContextValue>({ ydoc: null, awareness: null })

export function useCollabDoc(): Y.Doc | null {
  return useContext(CollabContext).ydoc
}

export function useCollabAwareness(): Awareness | null {
  return useContext(CollabContext).awareness
}

export default function CollabPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const user = useTempOrClerkUser()

  const { ydoc, awareness, status, peers, disconnect } = useCollabRoom({
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
      <div className="flex items-center justify-between px-2 py-1 bg-mantle border-b border-surface-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium text-text">Coding with Friends</span>
          <span className="text-xs text-overlay hidden sm:inline">
            {localStorage.getItem(`collab-room-name-${roomCode}`) || ''}
          </span>
        </div>
        <CollaboratorBar
          peers={peers}
          status={status}
          roomCode={roomCode}
          onLeave={handleLeave}
          onCopyLink={handleCopyLink}
        />
      </div>

      {/* Main app */}
      <div className="flex-1 min-h-0">
        <CollabContext.Provider value={{ ydoc, awareness }}>
          <App />
        </CollabContext.Provider>
      </div>
    </div>
  )
}
