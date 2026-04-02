export interface Checkpoint {
  id: string
  branchId: string
  parentId: string | null
  timestamp: number
  label: string
  snapshot: Record<string, unknown>
  blockCount: number
}

export interface Branch {
  id: string
  name: string
  parentBranchId: string | null
  forkPointId: string | null
  headId: string | null
  createdAt: number
}

export interface ProjectHistory {
  version: 1
  projectId: string
  activeBranchId: string
  branches: Branch[]
  checkpoints: Checkpoint[]
}
