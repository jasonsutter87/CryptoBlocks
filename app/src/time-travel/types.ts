/**
 * Shared types for the Time Travel feature.
 */

export interface Snapshot {
  /** Opaque Blockly workspace state from `workspaces.save()` */
  state: Record<string, unknown>
  /** Epoch ms when the snapshot was captured */
  timestamp: number
  /** The Blockly event type that triggered the snapshot (for display) */
  eventType: string
  /** Number of top-level blocks in the workspace — cheap to compute, useful for UI hints */
  blockCount: number
}
