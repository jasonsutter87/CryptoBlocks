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

/**
 * Cached sensor state, updated ~10× per second by streaming frames from
 * the firmware. Read blocks return whatever's in here at the moment they
 * execute, so they're synchronous and cheap.
 */
export interface SensorState {
  temperature: number  // °C
  lightLevel: number   // 0..255
  accelX: number       // milli-g
  accelY: number
  accelZ: number
  compassHeading: number  // 0..359°
  buttonA: boolean
  buttonB: boolean
}

const sensorState: SensorState = {
  temperature: 0,
  lightLevel: 0,
  accelX: 0,
  accelY: 0,
  accelZ: 0,
  compassHeading: 0,
  buttonA: false,
  buttonB: false,
}

export function getSensorState(): Readonly<SensorState> {
  return sensorState
}

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
  // B:<button>:<1|0>  → button event (edge-triggered)
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
  // S:<key>:<val>:<key>:<val>...  → sensor frame (streamed periodically)
  // Example: S:t:23:l:180:ax:-50:ay:12:az:-1024:h:234:ba:0:bb:1
  if (msg.startsWith('S:')) {
    const parts = msg.slice(2).split(':')
    for (let i = 0; i + 1 < parts.length; i += 2) {
      const key = parts[i]
      const raw = parts[i + 1]
      const num = Number(raw)
      if (Number.isNaN(num)) continue
      switch (key) {
        case 't':  sensorState.temperature = num; break
        case 'l':  sensorState.lightLevel = num; break
        case 'ax': sensorState.accelX = num; break
        case 'ay': sensorState.accelY = num; break
        case 'az': sensorState.accelZ = num; break
        case 'h':  sensorState.compassHeading = num; break
        case 'ba': sensorState.buttonA = num === 1; break
        case 'bb': sensorState.buttonB = num === 1; break
      }
    }
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

/**
 * Drive a servo attached to the given pin to an angle (0..180).
 *
 * For the Parallax cyber:bot, the left wheel is on P13 and the right wheel
 * is on P12 by default. 90 is stop (for continuous-rotation servos),
 * 0 is full reverse, 180 is full forward.
 */
export async function setServo(pin: number, angle: number): Promise<void> {
  const p = Math.max(0, Math.min(20, Math.floor(pin)))
  const a = Math.max(0, Math.min(180, Math.floor(angle)))
  await sendCommand(`V:${p}:${a}`)
}

/**
 * Write a digital value (0 or 1) to a pin. Useful for LEDs, buzzers,
 * and whisker bump switches on the cyber:bot.
 */
export async function digitalWrite(pin: number, value: 0 | 1): Promise<void> {
  const p = Math.max(0, Math.min(20, Math.floor(pin)))
  await sendCommand(`D:${p}:${value}`)
}

/**
 * High-level cyber:bot drive helper.
 *
 * Assumes continuous-rotation servos on pins P13 (left) and P12 (right)
 * — the Parallax cyber:bot wiring. Sends both servo commands, waits for
 * the given duration, then stops both wheels.
 *
 * direction: 'forward' | 'back' | 'left' | 'right' | 'stop'
 */
export async function drive(direction: string, seconds: number): Promise<void> {
  const LEFT_PIN = 13
  const RIGHT_PIN = 12
  // Continuous-rotation servos: 0 = full reverse, 90 = stop, 180 = full forward.
  // Left and right wheels face opposite directions, so "forward" is 180 on one
  // and 0 on the other.
  let leftAngle = 90
  let rightAngle = 90
  switch (direction) {
    case 'forward':
      leftAngle = 180
      rightAngle = 0
      break
    case 'back':
      leftAngle = 0
      rightAngle = 180
      break
    case 'left':
      leftAngle = 0
      rightAngle = 0
      break
    case 'right':
      leftAngle = 180
      rightAngle = 180
      break
    case 'stop':
    default:
      leftAngle = 90
      rightAngle = 90
  }
  await setServo(LEFT_PIN, leftAngle)
  await setServo(RIGHT_PIN, rightAngle)
  if (direction !== 'stop' && seconds > 0) {
    const ms = Math.max(0, Math.min(60_000, Math.floor(seconds * 1000)))
    await new Promise((resolve) => setTimeout(resolve, ms))
    await setServo(LEFT_PIN, 90)
    await setServo(RIGHT_PIN, 90)
  }
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
  setServo: (pin: number, angle: number) => Promise<void>
  digitalWrite: (pin: number, value: 0 | 1) => Promise<void>
  drive: (direction: string, seconds: number) => Promise<void>
  onButton: (button: ButtonName, handler: () => void | Promise<void>) => () => void
  onShake: (handler: () => void | Promise<void>) => () => void
  // Synchronous sensor readers — return whatever's in the latest streamed frame
  getTemperature: () => number
  getLightLevel: () => number
  getAccelX: () => number
  getAccelY: () => number
  getAccelZ: () => number
  getCompassHeading: () => number
  isButtonPressed: (button: 'A' | 'B') => boolean
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
    setServo,
    digitalWrite,
    drive,
    getTemperature: () => sensorState.temperature,
    getLightLevel: () => sensorState.lightLevel,
    getAccelX: () => sensorState.accelX,
    getAccelY: () => sensorState.accelY,
    getAccelZ: () => sensorState.accelZ,
    getCompassHeading: () => sensorState.compassHeading,
    isButtonPressed: (button) => (button === 'A' ? sensorState.buttonA : sensorState.buttonB),
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
