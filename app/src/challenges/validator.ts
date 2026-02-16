export function validateOutput(actual: string[], expected: string[]): boolean {
  if (actual.length !== expected.length) return false
  return actual.every((line, i) => line.trim() === expected[i].trim())
}

export function calculateStars(blockCount: number, par: number): 1 | 2 | 3 {
  if (blockCount <= par - 2) return 3
  if (blockCount <= par) return 2
  return 1
}

export function countBlocks(workspace: { getAllBlocks(ordered: boolean): unknown[] }): number {
  return workspace.getAllBlocks(false).length
}
