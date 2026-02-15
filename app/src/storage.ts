import * as Blockly from 'blockly'
import type { BlockDefinition } from './types/block'

const CUSTOM_BLOCKS_KEY = 'cryptoblocks_custom_blocks'
const WORKSPACE_KEY = 'cryptoblocks_workspace'
const FILE_VERSION = 1

interface BlocksFile {
  version: number
  customBlocks: BlockDefinition[]
  workspace: Record<string, unknown>
}

// --- localStorage ---

export function saveCustomBlocksToLocal(blocks: BlockDefinition[]) {
  localStorage.setItem(CUSTOM_BLOCKS_KEY, JSON.stringify(blocks))
}

export function saveWorkspaceToLocal(workspace: Blockly.WorkspaceSvg) {
  const state = Blockly.serialization.workspaces.save(workspace)
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state))
}

export function loadFromLocalStorage(): {
  customBlocks: BlockDefinition[]
  workspaceState: Record<string, unknown> | null
} {
  let customBlocks: BlockDefinition[] = []
  let workspaceState: Record<string, unknown> | null = null

  try {
    const blocksJson = localStorage.getItem(CUSTOM_BLOCKS_KEY)
    if (blocksJson) customBlocks = JSON.parse(blocksJson)
  } catch {
    // corrupted data, ignore
  }

  try {
    const wsJson = localStorage.getItem(WORKSPACE_KEY)
    if (wsJson) workspaceState = JSON.parse(wsJson)
  } catch {
    // corrupted data, ignore
  }

  return { customBlocks, workspaceState }
}

// --- .blocks file export/import ---

export function exportBlocksFile(
  customBlocks: BlockDefinition[],
  workspace: Blockly.WorkspaceSvg
) {
  const data: BlocksFile = {
    version: FILE_VERSION,
    customBlocks,
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

export function importBlocksFile(
  file: File
): Promise<{ customBlocks: BlockDefinition[]; workspaceState: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data: BlocksFile = JSON.parse(reader.result as string)
        if (!data.version || !data.workspace) {
          reject(new Error('Invalid .blocks file'))
          return
        }
        resolve({
          customBlocks: data.customBlocks ?? [],
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
