/**
 * Minimal ambient type declarations for the Web Bluetooth API.
 *
 * We don't use @types/web-bluetooth as a dep to keep the install lean —
 * this file covers only the surface we actually touch in `microbit.ts`.
 */

interface BluetoothRequestDeviceFilter {
  name?: string
  namePrefix?: string
  services?: string[]
}

interface BluetoothRequestDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[]
  optionalServices?: string[]
  acceptAllDevices?: boolean
}

interface BluetoothDeviceEventMap {
  gattserverdisconnected: Event
}

interface BluetoothDevice extends EventTarget {
  readonly id: string
  readonly name?: string
  readonly gatt?: BluetoothRemoteGATTServer
  addEventListener<K extends keyof BluetoothDeviceEventMap>(
    type: K,
    listener: (ev: BluetoothDeviceEventMap[K]) => unknown,
  ): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener<K extends keyof BluetoothDeviceEventMap>(
    type: K,
    listener: (ev: BluetoothDeviceEventMap[K]) => unknown,
  ): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
}

interface BluetoothRemoteGATTServer {
  readonly device: BluetoothDevice
  readonly connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
}

interface BluetoothRemoteGATTService {
  readonly uuid: string
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>
}

interface BluetoothRemoteGATTCharacteristicEventMap {
  characteristicvaluechanged: Event
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly uuid: string
  readonly value?: DataView
  readValue(): Promise<DataView>
  writeValue(value: BufferSource): Promise<void>
  writeValueWithResponse(value: BufferSource): Promise<void>
  writeValueWithoutResponse(value: BufferSource): Promise<void>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener<K extends keyof BluetoothRemoteGATTCharacteristicEventMap>(
    type: K,
    listener: (ev: BluetoothRemoteGATTCharacteristicEventMap[K]) => unknown,
  ): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener<K extends keyof BluetoothRemoteGATTCharacteristicEventMap>(
    type: K,
    listener: (ev: BluetoothRemoteGATTCharacteristicEventMap[K]) => unknown,
  ): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
}

interface Bluetooth {
  requestDevice(options?: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>
  getAvailability(): Promise<boolean>
}

interface Navigator {
  readonly bluetooth: Bluetooth
}
