/** Collab system types */

export interface CollabUser {
  id: string
  name: string
  avatar: string
  color: string
}

export interface PresenceState {
  user: CollabUser
  selectedBlockId: string | null
  cursor: { x: number; y: number } | null
}

export interface CollabRoom {
  id: string
  code: string
  name: string
  ownerId: string
  createdAt: string
  isActive: boolean
}

export interface CollabMember {
  roomId: string
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: string
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

/** Colors assigned to collaborators */
export const COLLAB_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
] as const
