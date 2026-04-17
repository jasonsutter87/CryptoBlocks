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
    document.documentElement.setAttribute('data-theme', settings.theme)
    onSettingsChanged()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-text font-semibold text-base mb-1">Settings</h2>
        <p className="text-overlay text-sm mb-5">Configure how CryptoBlocks behaves.</p>

        {/* Auto-save toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text font-medium">Auto-save checkpoints</p>
            <p className="text-xs text-overlay mt-0.5">Automatically save a checkpoint at regular intervals</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.autoSaveEnabled}
            onClick={() => setSettings((s) => ({ ...s, autoSaveEnabled: !s.autoSaveEnabled }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
              settings.autoSaveEnabled ? 'bg-success' : 'bg-surface-1'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text font-medium">Theme</p>
            <p className="text-xs text-overlay mt-0.5">Switch between dark and light mode</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: 'dark' as const }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                settings.theme === 'dark' ? 'bg-accent text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: 'light' as const }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                settings.theme === 'light' ? 'bg-accent text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              ☀️ Light
            </button>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text font-medium">Language</p>
            <p className="text-xs text-overlay mt-0.5">Interface language</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings((s) => ({ ...s, locale: 'en' as const }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                settings.locale === 'en' ? 'bg-accent text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, locale: 'es' as const }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                settings.locale === 'es' ? 'bg-accent text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {/* Interval selector */}
        <div className={`mb-6 transition-opacity ${settings.autoSaveEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="block text-sm text-text font-medium mb-2">
            Save interval
          </label>
          <div className="flex gap-2">
            {INTERVAL_OPTIONS.map((mins) => (
              <button
                key={mins}
                onClick={() => setSettings((s) => ({ ...s, autoSaveIntervalMinutes: mins }))}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                  settings.autoSaveIntervalMinutes === mins
                    ? 'bg-accent text-base border-accent font-semibold'
                    : 'bg-surface-0 text-text border-surface-1 hover:border-accent'
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
            className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-base bg-accent hover:bg-accent/80 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
