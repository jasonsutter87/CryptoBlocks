/**
 * micro:bit Web Bluetooth client.
 *
 * Connects to a BBC micro:bit running the CryptoBlocks relay firmware
 * (see `firmware.md` for the MakeCode source). Uses the Nordic UART
 * Service (NUS) for bidirectional messaging.
 *
 * Protocol (newline-delimited text, ≤20 bytes per packet):
 *
 *   Browser → micro:bit:
 *     T:<text>           — scroll text across LED matrix
 *     I:<icon>           — show built-in icon (heart, yes, no, smile, ...)
 *     P:<hz>:<ms>        — play tone at <hz> for <ms> milliseconds
 *     C:                 — clear LED matrix
 *     L:<x>:<y>:<0|1>    — set single LED at (x, y)
 *
 *   micro:bit → browser:
 *     B:A:1 / B:A:0      — button A pressed / released
 *     B:B:1 / B:B:0      — button B
 *     B:AB:1             — both buttons
 *     M:S                — shake detected
 *
 * All connection state lives in the parent window (not in the sandboxed
 * execution iframe). Blocks call `window.__microbit` which is exposed
 * as a global once `ensureMicrobitGlobal()` has run.
 */

// Nordic UART Service — the standard BLE profile the micro:bit uses
// for generic messaging when you start the UART service in MakeCode.
const NUS_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
const NUS_TX_CHAR = '6e400002-b5a3-f393-e0a9-e50e24dcca9e' // browser writes here
const NUS_RX_CHAR = '6e400003-b5a3-f393-e0a9-e50e24dcca9e' // micro:bit writes here

// BLE default MTU is 23 bytes; minus 3 for ATT header = 20 bytes payload.
// We'll chunk anything longer than this across multiple packets.
const MAX_PACKET_BYTES = 20

export type ButtonName = 'A' | 'B' | 'AB'
export type MicrobitEvent =
  | { type: 'buttonDown'; button: ButtonName }
  | { type: 'buttonUp'; button: ButtonName }
  | { type: 'shake' }
  | { type: 'connected' }
  | { type: 'disconnected' }

export type MicrobitListener = (event: MicrobitEvent) => void

interface MicrobitState {
  device: BluetoothDevice | null
  server: BluetoothRemoteGATTServer | null
  txChar: BluetoothRemoteGATTCharacteristic | null
  rxChar: BluetoothRemoteGATTCharacteristic | null
  listeners: Set<MicrobitListener>
  /** Bytes pending write — we serialize BLE writes to avoid GATT queue errors */
  writeQueue: Promise<void>
  rxBuffer: string
}

const state: MicrobitState = {
  device: null,
  server: null,
  txChar: null,
  rxChar: null,
  listeners: new Set(),
  writeQueue: Promise.resolve(),
  rxBuffer: '',
}

export function isConnected(): boolean {
  return !!state.server?.connected
}

export function getDeviceName(): string | null {
  return state.device?.name ?? null
}

export function subscribe(listener: MicrobitListener): () => void {
  state.listeners.add(listener)
  return () => state.listeners.delete(listener)
}

function emit(event: MicrobitEvent): void {
  for (const listener of state.listeners) {
    try {
      listener(event)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[microbit] listener threw', err)
    }
  }
}

/**
 * Prompt the user to pair with a micro:bit. Must be called from a user
 * gesture (click handler) — the browser enforces this for WebBluetooth.
 */
export async function connect(): Promise<void> {
  if (!('bluetooth' in navigator)) {
    throw new Error(
      'Web Bluetooth is not available in this browser. Use Chrome or Edge on desktop.'
    )
  }

  if (isConnected()) return

  const device = await navigator.bluetooth.requestDevice({
    // micro:bit devices advertise as "BBC micro:bit [XXXXX]"
    filters: [{ namePrefix: 'BBC micro:bit' }],
    optionalServices: [NUS_SERVICE],
  })

  device.addEventListener('gattserverdisconnected', handleDisconnect)
  state.device = device

  const server = await device.gatt!.connect()
  state.server = server

  const service = await server.getPrimaryService(NUS_SERVICE)
  state.txChar = await service.getCharacteristic(NUS_TX_CHAR)
  state.rxChar = await service.getCharacteristic(NUS_RX_CHAR)

  await state.rxChar.startNotifications()
  state.rxChar.addEventListener('characteristicvaluechanged', handleRxNotification)

  emit({ type: 'connected' })
}

export function disconnect(): void {
  if (state.server?.connected) {
    state.server.disconnect()
  } else {
    // If the GATT object is already gone, still clean up state
    handleDisconnect()
  }
}

function handleDisconnect(): void {
  state.device?.removeEventListener('gattserverdisconnected', handleDisconnect)
  if (state.rxChar) {
    try {
      state.rxChar.removeEventListener('characteristicvaluechanged', handleRxNotification)
    } catch {
      // Already detached
    }
  }
  state.device = null
  state.server = null
  state.txChar = null
  state.rxChar = null
  state.rxBuffer = ''
  emit({ type: 'disconnected' })
}

function handleRxNotification(event: Event): void {
  const target = event.target as BluetoothRemoteGATTCharacteristic
  const value = target.value
  if (!value) return

  const decoder = new TextDecoder()
  state.rxBuffer += decoder.decode(value)

  // Process complete newline-terminated messages
  let newlineIdx = state.rxBuffer.indexOf('\n')
  while (newlineIdx !== -1) {
    const msg = state.rxBuffer.slice(0, newlineIdx).trim()
    state.rxBuffer = state.rxBuffer.slice(newlineIdx + 1)
    if (msg) handleRxMessage(msg)
    newlineIdx = state.rxBuffer.indexOf('\n')
  }
}

function handleRxMessage(msg: string): void {
  // B:<button>:<1|0>  → button event
  if (msg.startsWith('B:')) {
    const [, button, pressed] = msg.split(':')
    if (button === 'A' || button === 'B' || button === 'AB') {
      emit({ type: pressed === '1' ? 'buttonDown' : 'buttonUp', button })
    }
    return
  }
  // M:S → shake
  if (msg === 'M:S') {
    emit({ type: 'shake' })
    return
  }
  // Unknown messages are ignored (future-compatible)
}

/**
 * Write a command string to the micro:bit. Commands are serialized via
 * a promise queue so we never overlap writes (BLE GATT is strict about
 * one-op-at-a-time per characteristic).
 */
export function sendCommand(command: string): Promise<void> {
  if (!state.txChar) {
    return Promise.reject(new Error('micro:bit is not connected'))
  }

  // Append newline if missing so the firmware's readUntil() delimiter works
  const payload = command.endsWith('\n') ? command : command + '\n'
  const bytes = new TextEncoder().encode(payload)

  const txChar = state.txChar
  const write = async (): Promise<void> => {
    // Chunk across multiple packets if the payload exceeds MTU
    for (let offset = 0; offset < bytes.length; offset += MAX_PACKET_BYTES) {
      const chunk = bytes.slice(offset, offset + MAX_PACKET_BYTES)
      await txChar.writeValueWithoutResponse(chunk)
    }
  }

  state.writeQueue = state.writeQueue.then(write, write)
  return state.writeQueue
}

// -----------------------------------------------------------------------------
// High-level API — used directly by block implementations via `window.__microbit`
// -----------------------------------------------------------------------------

export async function showText(text: string): Promise<void> {
  const sanitized = String(text).replace(/\n/g, ' ').slice(0, 40)
  await sendCommand('T:' + sanitized)
}

/**
 * Built-in icons supported by MakeCode's `basic.showIcon`. Pass the name,
 * e.g. "heart" or "yes". Any unknown name is silently ignored by the firmware.
 */
export async function showIcon(icon: string): Promise<void> {
  await sendCommand('I:' + icon.toLowerCase())
}

export async function playTone(hz: number, ms: number): Promise<void> {
  const freq = Math.max(1, Math.min(20000, Math.floor(hz)))
  const duration = Math.max(1, Math.min(10000, Math.floor(ms)))
  await sendCommand(`P:${freq}:${duration}`)
}

export async function clearScreen(): Promise<void> {
  await sendCommand('C:')
}

export async function setLed(x: number, y: number, on: boolean): Promise<void> {
  const cx = Math.max(0, Math.min(4, Math.floor(x)))
  const cy = Math.max(0, Math.min(4, Math.floor(y)))
  await sendCommand(`L:${cx}:${cy}:${on ? 1 : 0}`)
}

// -----------------------------------------------------------------------------
// Global installation — blocks compile to code that calls `__microbit.*`
// -----------------------------------------------------------------------------

export interface MicrobitGlobal {
  isConnected: () => boolean
  showText: (text: string) => Promise<void>
  showIcon: (icon: string) => Promise<void>
  playTone: (hz: number, ms: number) => Promise<void>
  clearScreen: () => Promise<void>
  setLed: (x: number, y: number, on: boolean) => Promise<void>
  onButton: (button: ButtonName, handler: () => void | Promise<void>) => () => void
  onShake: (handler: () => void | Promise<void>) => () => void
}

let globalInstalled = false

/**
 * Install `window.__microbit` so block-generated code can call into the
 * hardware module without importing anything. Idempotent.
 *
 * Block handlers registered via `onButton` / `onShake` persist across runs
 * until the next call to `resetMicrobitHandlers()`.
 */
export function ensureMicrobitGlobal(): void {
  if (globalInstalled) return
  const persistentHandlers: Array<() => void> = []

  const api: MicrobitGlobal = {
    isConnected,
    showText,
    showIcon,
    playTone,
    clearScreen,
    setLed,
    onButton(button, handler) {
      const unsubscribe = subscribe((event) => {
        if (event.type === 'buttonDown' && event.button === button) {
          Promise.resolve(handler()).catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[microbit] button handler threw', err)
          })
        }
      })
      persistentHandlers.push(unsubscribe)
      return unsubscribe
    },
    onShake(handler) {
      const unsubscribe = subscribe((event) => {
        if (event.type === 'shake') {
          Promise.resolve(handler()).catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[microbit] shake handler threw', err)
          })
        }
      })
      persistentHandlers.push(unsubscribe)
      return unsubscribe
    },
  }

  ;(window as unknown as { __microbit: MicrobitGlobal; __microbitResetHandlers: () => void }).__microbit = api
  ;(window as unknown as { __microbitResetHandlers: () => void }).__microbitResetHandlers = () => {
    while (persistentHandlers.length > 0) {
      const fn = persistentHandlers.pop()
      fn?.()
    }
  }

  globalInstalled = true
}

/** Clear any block-registered event handlers without disconnecting the device. */
export function resetMicrobitHandlers(): void {
  const reset = (window as unknown as { __microbitResetHandlers?: () => void }).__microbitResetHandlers
  reset?.()
}
