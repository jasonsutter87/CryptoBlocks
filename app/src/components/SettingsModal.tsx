import { useState } from 'react'
import { loadSettings, saveSettings } from '../settings'
import { t } from '../i18n'

interface SettingsModalProps {
  onClose: () => void
  onSettingsChanged: () => void
}

const INTERVAL_OPTIONS = [1, 2, 5, 10] as const

const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac')
const mod = isMac ? '⌘' : 'Ctrl'

const HOTKEYS = [
  { keys: `${mod}+G`, desc: 'Snap all blocks to grid' },
  { keys: `${mod}+A`, desc: 'Select all blocks' },
  { keys: `${mod}+Shift+A`, desc: 'Deselect all' },
  { keys: `${mod}+L`, desc: 'Tidy / auto-layout blocks' },
  { keys: `${mod}+Click`, desc: 'Multi-select blocks' },
  { keys: `${mod}+Shift+S`, desc: 'Create Text block' },
  { keys: `${mod}+I`, desc: 'Create Number block' },
  { keys: `${mod}+B`, desc: 'Create Boolean block' },
  { keys: `${mod}+F`, desc: 'Find block on workspace' },
  { keys: `${mod}+.`, desc: 'Collapse / expand all blocks' },
  { keys: `${mod}+Z`, desc: 'Undo' },
  { keys: `${mod}+Shift+Z`, desc: 'Redo' },
] as const

export default function SettingsModal({ onClose, onSettingsChanged }: SettingsModalProps) {
  const [settings, setSettings] = useState(() => loadSettings())
  const [showHotkeys, setShowHotkeys] = useState(false)

  const handleSave = () => {
    saveSettings(settings)
    document.documentElement.setAttribute('data-theme', settings.theme)
    window.dispatchEvent(new Event('cb:workspace-theme-changed'))
    onSettingsChanged()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        {showHotkeys ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-text font-semibold text-base">⌨️ Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHotkeys(false)}
                className="text-xs text-accent hover:underline"
              >
                ← Back
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {HOTKEYS.map((h) => (
                <div key={h.keys} className="flex items-center justify-between">
                  <span className="text-sm text-subtext">{h.desc}</span>
                  <kbd className="text-xs font-mono bg-surface-0 text-text px-2 py-1 rounded border border-surface-1">{h.keys}</kbd>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowHotkeys(false)}
                className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
        <>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-text font-semibold text-base">{t('Settings')}</h2>
          <button
            onClick={() => setShowHotkeys(true)}
            className="text-xs text-overlay hover:text-accent transition-colors flex items-center gap-1"
            title="Keyboard shortcuts"
          >
            ⌨️ Hotkeys
          </button>
        </div>
        <p className="text-overlay text-sm mb-5">{t('Configure how CryptoBlocks behaves.')}</p>

        {/* Auto-save toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text font-medium">{t('Auto-save checkpoints')}</p>
            <p className="text-xs text-overlay mt-0.5">{t('Automatically save a checkpoint at regular intervals')}</p>
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
            <p className="text-sm text-text font-medium">{t('Theme')}</p>
            <p className="text-xs text-overlay mt-0.5">{t('Switch between dark and light mode')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: 'dark' as const }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                settings.theme === 'dark' ? 'bg-accent text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              🌙 {t('Dark')}
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: 'light' as const }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                settings.theme === 'light' ? 'bg-accent text-base' : 'bg-surface-0 text-text hover:bg-surface-1'
              }`}
            >
              ☀️ {t('Light')}
            </button>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text font-medium">{t('Language')}</p>
            <p className="text-xs text-overlay mt-0.5">{t('Interface language')}</p>
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

        {/* Workspace background color */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text font-medium">Workspace Color</p>
            <p className="text-xs text-overlay mt-0.5">Background color of the block canvas</p>
          </div>
          <label className="relative w-8 h-8 rounded-full border-2 border-surface-1 hover:border-accent cursor-pointer transition-all hover:scale-110 overflow-hidden" style={{ backgroundColor: settings.workspaceBg }}>
            <input
              type="color"
              value={settings.workspaceBg}
              onChange={(e) => setSettings((s) => ({ ...s, workspaceBg: e.target.value }))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Show grid */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text font-medium">Show Grid</p>
            <p className="text-xs text-overlay mt-0.5">Grid dots on the workspace</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => setSettings((s) => ({ ...s, showGrid: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-surface-1 rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>

        {/* Interval selector */}
        <div className={`mb-6 transition-opacity ${settings.autoSaveEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="block text-sm text-text font-medium mb-2">
            {t('Save interval')}
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
            {t('Cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-base bg-accent hover:bg-accent/80 rounded-lg transition-colors"
          >
            {t('Save')}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
