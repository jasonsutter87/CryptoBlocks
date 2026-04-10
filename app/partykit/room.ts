/**
 * PartyKit room server for "Coding with Friends"
 *
 * Handles Yjs document sync over WebSockets.
 * Auth verification (Clerk JWT) will be added when Turso is set up.
 * For now, rooms are open — anyone with the room ID can join.
 */

import type * as Party from 'partykit/server'
import { onConnect } from 'y-partykit'

const MAX_CONNECTIONS = 6

export default class CollabRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Enforce max room size
    const currentCount = [...this.room.getConnections()].length
    if (currentCount > MAX_CONNECTIONS) {
      conn.close(4001, 'Room is full (max 6 editors)')
      return
    }

    // TODO: Verify Clerk JWT from ctx.request.url searchParams
    // const url = new URL(ctx.request.url)
    // const token = url.searchParams.get('token')
    // if (!token) { conn.close(4003, 'Unauthorized'); return }

    // Delegate to y-partykit for Yjs sync protocol
    return onConnect(conn, this.room, {
      // Persist the Yjs document in PartyKit's built-in storage
      persist: { mode: 'snapshot' },
    })
  }
}
