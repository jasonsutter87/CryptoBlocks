/**
 * Keyboard state tracker — parent-side.
 *
 * The sandbox iframe has null origin and a hidden element, so keydown
 * events inside user code never fire reliably. Parent listens, caches,
 * and forwards state via the capability bridge.
 *
 * The exported snapshot uses DOM `KeyboardEvent.code` names so the
 * iframe can check `keys['ArrowUp']`, `keys['Space']`, `keys['KeyW']`
 * without any mapping layer.
 */

const keys: Record<string, boolean> = {}
let installed = false

export function ensureKeyboardGlobal(): void {
  if (installed) return
  installed = true

  window.addEventListener('keydown', (e) => { keys[e.code] = true })
  window.addEventListener('keyup', (e) => { keys[e.code] = false })

  // Clear on blur — prevents "sticky key" when the user tabs away
  // mid-press.
  window.addEventListener('blur', () => {
    for (const k of Object.keys(keys)) keys[k] = false
  })
}

/** Snapshot of keys currently pressed — consumed once per animation frame. */
export function getKeyboardSnapshot(): Record<string, boolean> {
  return { ...keys }
}
