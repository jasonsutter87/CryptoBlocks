/**
 * Web Gamepad API — polls connected controllers and caches state
 * so block reads are synchronous. Works with any Bluetooth or USB
 * controller (PS4, PS5, Xbox, Switch Pro, 8BitDo, generic).
 *
 * Standard mapping (most controllers):
 *   Button 0 = A / Cross
 *   Button 1 = B / Circle
 *   Button 2 = X / Square
 *   Button 3 = Y / Triangle
 *   Button 4 = LB / L1
 *   Button 5 = RB / R1
 *   Button 12 = D-pad Up
 *   Button 13 = D-pad Down
 *   Button 14 = D-pad Left
 *   Button 15 = D-pad Right
 *   Axis 0 = Left stick X (-1 left, +1 right)
 *   Axis 1 = Left stick Y (-1 up, +1 down)
 *   Axis 2 = Right stick X
 *   Axis 3 = Right stick Y
 */

export interface GamepadState {
  connected: boolean
  buttonA: boolean
  buttonB: boolean
  buttonX: boolean
  buttonY: boolean
  buttonLB: boolean
  buttonRB: boolean
  dpadUp: boolean
  dpadDown: boolean
  dpadLeft: boolean
  dpadRight: boolean
  leftStickX: number
  leftStickY: number
  rightStickX: number
  rightStickY: number
  anyButton: boolean
}

const state: GamepadState = {
  connected: false,
  buttonA: false, buttonB: false, buttonX: false, buttonY: false,
  buttonLB: false, buttonRB: false,
  dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false,
  leftStickX: 0, leftStickY: 0, rightStickX: 0, rightStickY: 0,
  anyButton: false,
}

let polling = false

function poll() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
  let found = false

  for (const gp of gamepads) {
    if (!gp) continue
    found = true

    const b = (i: number) => gp.buttons[i]?.pressed ?? false
    const a = (i: number) => {
      const v = gp.axes[i] ?? 0
      return Math.abs(v) < 0.1 ? 0 : Math.round(v * 100) / 100
    }

    state.connected = true
    state.buttonA = b(0)
    state.buttonB = b(1)
    state.buttonX = b(2)
    state.buttonY = b(3)
    state.buttonLB = b(4)
    state.buttonRB = b(5)
    state.dpadUp = b(12)
    state.dpadDown = b(13)
    state.dpadLeft = b(14)
    state.dpadRight = b(15)
    state.leftStickX = a(0)
    state.leftStickY = a(1)
    state.rightStickX = a(2)
    state.rightStickY = a(3)
    state.anyButton = gp.buttons.some((btn) => btn.pressed)
    break
  }

  if (!found) {
    state.connected = false
    state.buttonA = false; state.buttonB = false; state.buttonX = false; state.buttonY = false
    state.buttonLB = false; state.buttonRB = false
    state.dpadUp = false; state.dpadDown = false; state.dpadLeft = false; state.dpadRight = false
    state.leftStickX = 0; state.leftStickY = 0; state.rightStickX = 0; state.rightStickY = 0
    state.anyButton = false
  }

  if (polling) requestAnimationFrame(poll)
}

function startPolling() {
  if (polling) return
  polling = true
  requestAnimationFrame(poll)
}

export function getGamepadState(): Readonly<GamepadState> {
  return state
}

export interface GamepadGlobal {
  isConnected: () => boolean
  buttonA: () => boolean
  buttonB: () => boolean
  buttonX: () => boolean
  buttonY: () => boolean
  buttonLB: () => boolean
  buttonRB: () => boolean
  dpadUp: () => boolean
  dpadDown: () => boolean
  dpadLeft: () => boolean
  dpadRight: () => boolean
  leftStickX: () => number
  leftStickY: () => number
  rightStickX: () => number
  rightStickY: () => number
  anyButton: () => boolean
}

let installed = false

export function ensureGamepadGlobal(): void {
  if (installed) return

  startPolling()

  window.addEventListener('gamepadconnected', () => {
    // eslint-disable-next-line no-console
    console.log('🎮 Gamepad connected!')
    startPolling()
  })

  window.addEventListener('gamepaddisconnected', () => {
    // eslint-disable-next-line no-console
    console.log('🎮 Gamepad disconnected')
  })

  const api: GamepadGlobal = {
    isConnected: () => state.connected,
    buttonA: () => state.buttonA,
    buttonB: () => state.buttonB,
    buttonX: () => state.buttonX,
    buttonY: () => state.buttonY,
    buttonLB: () => state.buttonLB,
    buttonRB: () => state.buttonRB,
    dpadUp: () => state.dpadUp,
    dpadDown: () => state.dpadDown,
    dpadLeft: () => state.dpadLeft,
    dpadRight: () => state.dpadRight,
    leftStickX: () => state.leftStickX,
    leftStickY: () => state.leftStickY,
    rightStickX: () => state.rightStickX,
    rightStickY: () => state.rightStickY,
    anyButton: () => state.anyButton,
  }

  ;(window as unknown as { __gamepad: GamepadGlobal }).__gamepad = api
  installed = true
}
