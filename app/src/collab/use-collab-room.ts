/**
 * React hook for managing the collab room lifecycle.
 *
 * Creates a Y.Doc, connects to PartyKit via WebSocket,
 * and exposes the doc + connection status to the component tree.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-partykit/provider'
import type { ConnectionStatus, CollabUser, PresenceState } from './types'
import { COLLAB_COLORS } from './types'

// Dev: local PartyKit server. Prod: deployed PartyKit URL.
const PARTYKIT_HOST =
  import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999'

interface UseCollabRoomOptions {
  roomId: string
  user: CollabUser
  enabled?: boolean
}

interface UseCollabRoomResult {
  ydoc: Y.Doc | null
  status: ConnectionStatus
  peers: PresenceState[]
  disconnect: () => void
}

export function useCollabRoom({
  roomId,
  user,
  enabled = true,
}: UseCollabRoomOptions): UseCollabRoomResult {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [peers, setPeers] = useState<PresenceState[]>([])
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)

  useEffect(() => {
    if (!enabled || !roomId) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    setStatus('connecting')

    const provider = new WebsocketProvider(PARTYKIT_HOST, roomId, ydoc, {
      connect: true,
    })
    providerRef.current = provider

    provider.on('status', ({ status: s }: { status: string }) => {
      setStatus(s === 'connected' ? 'connected' : s === 'connecting' ? 'connecting' : 'disconnected')
    })

    // Set local awareness (presence)
    const colorIndex = Math.abs(hashCode(user.id)) % COLLAB_COLORS.length
    const awareness = provider.awareness
    awareness.setLocalState({
      user: { ...user, color: COLLAB_COLORS[colorIndex] },
      selectedBlockId: null,
      cursor: null,
    } satisfies PresenceState)

    // Listen for awareness changes (peers joining/leaving/moving)
    const onAwarenessChange = () => {
      const states: PresenceState[] = []
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID) return // skip self
        if (state.user) {
          states.push(state as PresenceState)
        }
      })
      setPeers(states)
    }
    awareness.on('change', onAwarenessChange)

    return () => {
      awareness.off('change', onAwarenessChange)
      provider.disconnect()
      provider.destroy()
      ydoc.destroy()
      ydocRef.current = null
      providerRef.current = null
      setStatus('disconnected')
      setPeers([])
    }
  }, [roomId, user.id, enabled])

  const disconnect = useCallback(() => {
    providerRef.current?.disconnect()
    setStatus('disconnected')
  }, [])

  return {
    ydoc: ydocRef.current,
    status,
    peers,
    disconnect,
  }
}

/** Simple string hash for deterministic color assignment */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
