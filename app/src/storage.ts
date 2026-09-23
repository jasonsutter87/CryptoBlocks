import * as Blockly from 'blockly'
import type { BlockDefinition } from './types/block'

const CUSTOM_BLOCKS_KEY = 'cryptoblocks_custom_blocks'
const WORKSPACE_BLOCKS_KEY = 'cryptoblocks_workspace_blocks'
const WORKSPACE_KEY = 'cryptoblocks_workspace'
const FILE_VERSION = 1

// Max size for implementation code strings (CB-R2-003)
const MAX_IMPL_SIZE = 10_000

// Valid block categories
const VALID_CATEGORIES = new Set([
  'Basics', 'Math', 'Text', 'Lists', 'Logic', 'Web', 'Games',
  'Sound', 'Art', 'Data', 'Crypto', 'AI', 'Hardware', 'My Blocks',
])

// Valid input/output types
const VALID_TYPES = new Set(['string', 'number', 'boolean', 'any'])

interface BlocksFile {
  version: number
  customBlocks: BlockDefinition[]
  workspace: Record<string, unknown>
}

/**
 * Validates a single BlockDefinition against the expected schema (CB-R2-003, CB-R2-009).
 * Returns null if valid, or an error message if invalid.
 */
function validateBlockDefinition(block: unknown): block is BlockDefinition {
  if (!block || typeof block !== 'object') return false
  const b = block as Record<string, unknown>

  // Required string fields
  if (typeof b.name !== 'string' || b.name.length === 0 || b.name.length > 100) return false
  if (typeof b.author !== 'string' || b.author.length > 200) return false
  if (typeof b.version !== 'string' || b.version.length > 50) return false
  if (typeof b.description !== 'string' || b.description.length > 500) return false
  if (typeof b.category !== 'string' || !VALID_CATEGORIES.has(b.category)) return false
  if (typeof b.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(b.color)) return false

  // Block name must be alphanumeric + underscore (no injection)
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(b.name)) return false

  // Inputs array
  if (!Array.isArray(b.inputs)) return false
  for (const input of b.inputs) {
    if (!input || typeof input !== 'object') return false
    if (typeof input.name !== 'string' || input.name.length === 0) return false
    if (typeof input.type !== 'string' || !VALID_TYPES.has(input.type)) return false
    if (typeof input.description !== 'string') return false
  }

  // Outputs array
  if (!Array.isArray(b.outputs)) return false
  for (const output of b.outputs) {
    if (!output || typeof output !== 'object') return false
    if (typeof output.name !== 'string') return false
    if (typeof output.type !== 'string' || !VALID_TYPES.has(output.type)) return false
  }

  // Implementations
  if (!b.implementations || typeof b.implementations !== 'object') return false
  const impl = b.implementations as Record<string, unknown>
  if (typeof impl.javascript !== 'string' || impl.javascript.length > MAX_IMPL_SIZE) return false
  if (typeof impl.python !== 'string' || impl.python.length > MAX_IMPL_SIZE) return false

  // Implementation must define a function (not arbitrary code)
  if (!/^\s*(async\s+)?function\s+\w+/.test(impl.javascript as string)) return false
  if (!/^\s*(async\s+)?def\s+\w+/.test(impl.python as string)) return false

  // Tests array (optional validation - just ensure it's an array)
  if (!Array.isArray(b.tests)) return false

  // Optional fields
  if (b.shape !== undefined && b.shape !== 'value' && b.shape !== 'statement') return false
  if (b.scope !== undefined && b.scope !== 'global' && b.scope !== 'workspace') return false

  return true
}

/**
 * Sanitize a block definition array, filtering out invalid entries.
 */
function sanitizeBlocks(raw: unknown): BlockDefinition[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(validateBlockDefinition) as BlockDefinition[]
}

// --- localStorage ---

/**
 * Save the user's GLOBAL custom-block library (My Blocks across all projects).
 * Pre-scope blocks are treated as global; that's still the default.
 */
export function saveCustomBlocksToLocal(blocks: BlockDefinition[]) {
  localStorage.setItem(CUSTOM_BLOCKS_KEY, JSON.stringify(blocks))
}

/**
 * Save the WORKSPACE-scoped custom blocks for the current project.
 * Lives separately so workspace blocks don't pollute the global library.
 */
export function saveWorkspaceBlocksToLocal(blocks: BlockDefinition[]) {
  localStorage.setItem(WORKSPACE_BLOCKS_KEY, JSON.stringify(blocks))
}

export function saveWorkspaceToLocal(workspace: Blockly.WorkspaceSvg) {
  const state = Blockly.serialization.workspaces.save(workspace)
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state))
}

export function loadFromLocalStorage(): {
  customBlocks: BlockDefinition[]
  workspaceBlocks: BlockDefinition[]
  workspaceState: Record<string, unknown> | null
} {
  let customBlocks: BlockDefinition[] = []
  let workspaceBlocks: BlockDefinition[] = []
  let workspaceState: Record<string, unknown> | null = null

  try {
    const blocksJson = localStorage.getItem(CUSTOM_BLOCKS_KEY)
    if (blocksJson) {
      const parsed = JSON.parse(blocksJson)
      // Schema validation (CB-R2-009)
      // Force scope='global' for any legacy blocks missing the field.
      customBlocks = sanitizeBlocks(parsed).map((b) => ({ ...b, scope: 'global' as const }))
    }
  } catch {
    // corrupted data, ignore
  }

  try {
    const wsBlocksJson = localStorage.getItem(WORKSPACE_BLOCKS_KEY)
    if (wsBlocksJson) {
      const parsed = JSON.parse(wsBlocksJson)
      workspaceBlocks = sanitizeBlocks(parsed).map((b) => ({ ...b, scope: 'workspace' as const }))
    }
  } catch {
    // corrupted data, ignore
  }

  try {
    const wsJson = localStorage.getItem(WORKSPACE_KEY)
    if (wsJson) {
      const parsed = JSON.parse(wsJson)
      // Basic structure check for workspace state
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        workspaceState = parsed
      }
    }
  } catch {
    // corrupted data, ignore
  }

  return { customBlocks, workspaceBlocks, workspaceState }
}

// --- .blocks file export/import ---

/**
 * Export both pools merged into a single `customBlocks` array; each entry
 * carries its own `scope` so import can route them back to the right pool.
 * Pre-scope files (no scope field) are treated as global on import.
 */
export function exportBlocksFile(
  globalBlocks: BlockDefinition[],
  workspaceBlocks: BlockDefinition[],
  workspace: Blockly.WorkspaceSvg
) {
  const merged: BlockDefinition[] = [
    ...globalBlocks.map((b) => ({ ...b, scope: 'global' as const })),
    ...workspaceBlocks.map((b) => ({ ...b, scope: 'workspace' as const })),
  ]
  const data: BlocksFile = {
    version: FILE_VERSION,
    customBlocks: merged,
    workspace: Blockly.serialization.workspaces.save(workspace),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'project.blocks'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- GitHub token ---

const GITHUB_TOKEN_KEY = 'cryptoblocks_github_token'
const GITHUB_USERNAME_KEY = 'cryptoblocks_github_username'

export function saveGitHubToken(token: string) {
  sessionStorage.setItem(GITHUB_TOKEN_KEY, token)
}

export function loadGitHubToken(): string | null {
  return sessionStorage.getItem(GITHUB_TOKEN_KEY)
}

export function clearGitHubToken() {
  sessionStorage.removeItem(GITHUB_TOKEN_KEY)
  sessionStorage.removeItem(GITHUB_USERNAME_KEY)
}

export function saveGitHubUsername(username: string) {
  sessionStorage.setItem(GITHUB_USERNAME_KEY, username)
}

export function loadGitHubUsername(): string | null {
  return sessionStorage.getItem(GITHUB_USERNAME_KEY)
}

// --- .blocks file export/import ---

export function importBlocksFile(
  file: File
): Promise<{
  globalBlocks: BlockDefinition[]
  workspaceBlocks: BlockDefinition[]
  workspaceState: Record<string, unknown>
}> {
  return new Promise((resolve, reject) => {
    // Reject files over 5MB
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File too large (max 5MB)'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data: BlocksFile = JSON.parse(reader.result as string)
        if (!data.version || !data.workspace) {
          reject(new Error('Invalid .blocks file'))
          return
        }
        if (typeof data.workspace !== 'object' || Array.isArray(data.workspace)) {
          reject(new Error('Invalid workspace data in .blocks file'))
          return
        }

        // Validate and sanitize imported blocks (CB-R2-003), then split by scope.
        // Pre-scope files (no scope field) are treated as global.
        const validBlocks = sanitizeBlocks(data.customBlocks)
        const globalBlocks = validBlocks
          .filter((b) => (b.scope ?? 'global') === 'global')
          .map((b) => ({ ...b, scope: 'global' as const }))
        const workspaceBlocks = validBlocks
          .filter((b) => b.scope === 'workspace')
          .map((b) => ({ ...b, scope: 'workspace' as const }))

        resolve({
          globalBlocks,
          workspaceBlocks,
          workspaceState: data.workspace,
        })
      } catch {
        reject(new Error('Failed to parse .blocks file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
