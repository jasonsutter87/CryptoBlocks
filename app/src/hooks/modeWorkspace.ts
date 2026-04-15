/**
 * Workspace transitions for entering/exiting a gameplay mode (challenge,
 * blockset, golf). Pure helpers — no React. The "save sandbox → swap
 * toolbox → clear → maybe load starter blocks" dance was duplicated four
 * times in App.tsx.
 */

import * as Blockly from 'blockly'
import { getToolboxXml, getFilteredToolboxXml } from '../blocks/blockly-register'

export interface EnterModeOptions {
  /** null = full toolbox; non-null = restricted to these category names */
  allowedCategories?: string[] | null
  /** Optional starter workspace state to load + lock against deletion */
  starterBlocks?: Record<string, unknown> | null
}

/** Save the current sandbox workspace into a ref slot (caller-owned). */
export function snapshotSandbox(
  workspace: Blockly.WorkspaceSvg | null,
  isSandbox: boolean,
): Record<string, unknown> | null {
  if (!workspace || !isSandbox) return null
  return Blockly.serialization.workspaces.save(workspace)
}

/** Apply toolbox + clear + load starter blocks. Safe on null workspace. */
export function enterMode(
  workspace: Blockly.WorkspaceSvg | null,
  opts: EnterModeOptions = {},
): void {
  if (!workspace) return
  const toolbox = opts.allowedCategories
    ? getFilteredToolboxXml(opts.allowedCategories)
    : getToolboxXml()
  workspace.updateToolbox(toolbox)
  workspace.clear()
  if (opts.starterBlocks) {
    Blockly.serialization.workspaces.load(opts.starterBlocks, workspace)
    for (const b of workspace.getAllBlocks(false)) {
      b.setDeletable(false)
    }
  }
}

/** Restore the full toolbox + previously snapshotted sandbox state. */
export function exitToSandbox(
  workspace: Blockly.WorkspaceSvg | null,
  saved: Record<string, unknown> | null,
): void {
  if (!workspace) return
  workspace.updateToolbox(getToolboxXml())
  workspace.clear()
  if (saved) {
    Blockly.serialization.workspaces.load(saved, workspace)
  }
}
