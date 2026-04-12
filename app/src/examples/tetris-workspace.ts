/**
 * Tetris — one block launches the full game with Korobeiniki music.
 */

import { resetIds, block, workspace } from './workspaces'

export function tetrisWorkspace(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_start_tetris', undefined, undefined, 50, 50),
  )
}
