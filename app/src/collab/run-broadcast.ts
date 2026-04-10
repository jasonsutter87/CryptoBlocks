/**
 * Run Broadcast — "Run for Everyone" in collab rooms.
 *
 * Uses a Y.Map to broadcast a run signal. When any client sets the
 * `runRequestedAt` timestamp, all other clients trigger execution.
 */

import * as Y from 'yjs'

interface RunBroadcastBinding {
  requestRunForEveryone: () => void
  destroy: () => void
}

export function bindRunBroadcast(
  ydoc: Y.Doc,
  onRemoteRun: () => void
): RunBroadcastBinding {
  const yrun = ydoc.getMap<number>('run-broadcast')
  let lastSeen = yrun.get('requestedAt') ?? 0

  function onYjsChange() {
    const ts = yrun.get('requestedAt') ?? 0
    if (ts > lastSeen) {
      lastSeen = ts
      onRemoteRun()
    }
  }

  yrun.observe(onYjsChange)

  return {
    requestRunForEveryone() {
      yrun.set('requestedAt', Date.now())
    },
    destroy() {
      yrun.unobserve(onYjsChange)
    },
  }
}
