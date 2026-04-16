import { describe, it, expect, vi } from 'vitest'
import { snapshotSandbox } from './modeWorkspace'

vi.mock('blockly', () => ({
  serialization: {
    workspaces: {
      save: vi.fn(() => ({ blocks: { blocks: [] } })),
      load: vi.fn(),
    },
  },
}))

describe('snapshotSandbox', () => {
  it('returns null when workspace is null', () => {
    expect(snapshotSandbox(null, true)).toBeNull()
  })

  it('returns null when not in sandbox mode', () => {
    const fakeWs = {} as never
    expect(snapshotSandbox(fakeWs, false)).toBeNull()
  })

  it('returns serialized workspace when in sandbox with a workspace', async () => {
    const Blockly = await import('blockly')
    const fakeWs = {} as never
    const result = snapshotSandbox(fakeWs, true)
    expect(Blockly.serialization.workspaces.save).toHaveBeenCalledWith(fakeWs)
    expect(result).toEqual({ blocks: { blocks: [] } })
  })
})
