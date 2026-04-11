/**
 * Toolbar button + status indicator for the micro:bit Bluetooth connection.
 *
 * - Disconnected: shows "Connect micro:bit" button
 * - Connecting:   shows a spinner
 * - Connected:    shows a green dot + device name, click to disconnect
 *
 * Click handler must run in a user gesture for Web Bluetooth to work,
 * which is why we call `connect()` directly from onClick (no async state
 * dance between the click and the actual prompt).
 */

import { useEffect, useState } from 'react'
import {
  connect,
  disconnect,
  isConnected,
  getDeviceName,
  subscribe,
  ensureMicrobitGlobal,
} from '../hardware/microbit'

export default function MicrobitStatus() {
  const [connected, setConnected] = useState(isConnected())
  const [deviceName, setDeviceName] = useState(getDeviceName())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Install `window.__microbit` once so block-generated code can call it
    ensureMicrobitGlobal()

    return subscribe((event) => {
      if (event.type === 'connected') {
        setConnected(true)
        setDeviceName(getDeviceName())
        setBusy(false)
        setError(null)
      } else if (event.type === 'disconnected') {
        setConnected(false)
        setDeviceName(null)
        setBusy(false)
      }
    })
  }, [])

  const handleClick = async () => {
    setError(null)
    if (connected) {
      disconnect()
      return
    }
    setBusy(true)
    try {
      await connect()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // User cancelling the BLE prompt throws a NotFoundError — don't surface
      // that as an error, it's a deliberate action.
      if (!/cancell?ed|User cancelled/i.test(message) && !/NotFoundError/.test(String(err))) {
        setError(message)
      }
      setBusy(false)
    }
  }

  const title = connected
    ? `Connected: ${deviceName ?? 'micro:bit'} — click to disconnect`
    : busy
      ? 'Connecting…'
      : 'Connect a micro:bit over Bluetooth'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title={title}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] disabled:opacity-60"
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          connected ? 'bg-[#a6e3a1] animate-pulse' : busy ? 'bg-[#f9e2af]' : 'bg-[#6c7086]'
        }`}
      />
      <span className="whitespace-nowrap">
        {connected ? 'micro:bit' : busy ? 'Pairing…' : 'micro:bit'}
      </span>
      {error && <span className="sr-only">{error}</span>}
    </button>
  )
}
