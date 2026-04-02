import { useState } from 'react'
import { loadSettings, saveSettings } from '../settings'

interface SettingsModalProps {
  onClose: () => void
  onSettingsChanged: () => void
}

const INTERVAL_OPTIONS = [1, 2, 5, 10] as const

export default function SettingsModal({ onClose, onSettingsChanged }: SettingsModalProps) {
  const [settings, setSettings] = useState(() => loadSettings())

  const handleSave = () => {
    saveSettings(settings)
    onSettingsChanged()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-[#cdd6f4] font-semibold text-base mb-1">Settings</h2>
        <p className="text-[#6c7086] text-sm mb-5">Configure how CryptoBlocks behaves.</p>

        {/* Auto-save toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[#cdd6f4] font-medium">Auto-save checkpoints</p>
            <p className="text-xs text-[#6c7086] mt-0.5">Automatically save a checkpoint at regular intervals</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.autoSaveEnabled}
            onClick={() => setSettings((s) => ({ ...s, autoSaveEnabled: !s.autoSaveEnabled }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
              settings.autoSaveEnabled ? 'bg-[#a6e3a1]' : 'bg-[#45475a]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Interval selector */}
        <div className={`mb-6 transition-opacity ${settings.autoSaveEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="block text-sm text-[#cdd6f4] font-medium mb-2">
            Save interval
          </label>
          <div className="flex gap-2">
            {INTERVAL_OPTIONS.map((mins) => (
              <button
                key={mins}
                onClick={() => setSettings((s) => ({ ...s, autoSaveIntervalMinutes: mins }))}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                  settings.autoSaveIntervalMinutes === mins
                    ? 'bg-[#89b4fa] text-[#1e1e2e] border-[#89b4fa] font-semibold'
                    : 'bg-[#313244] text-[#cdd6f4] border-[#45475a] hover:border-[#89b4fa]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#cdd6f4] bg-[#313244] hover:bg-[#45475a] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-[#1e1e2e] bg-[#89b4fa] hover:bg-[#89b4fa]/80 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
