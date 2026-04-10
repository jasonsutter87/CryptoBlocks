import { useState, useCallback } from 'react'
import { loadProfile, saveProfile, type UserProfile } from './profile-storage'
import { loadSettings, saveSettings, type UserSettings } from '../settings'

function getInitials(displayName: string, username: string): string {
  const source = displayName.trim() || username.trim()
  if (!source) return '?'
  const words = source.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#313244] rounded-xl p-6 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-[#a6adc8] uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#cdd6f4]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#6c7086]">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full bg-[#1e1e2e] border border-[#45475a] rounded-lg px-3 py-2 text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] transition-colors'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile)
  const [settings, setSettings] = useState<UserSettings>(loadSettings)
  const [profileSaved, setProfileSaved] = useState(false)
  const [clearCheckpointConfirm, setClearCheckpointConfirm] = useState(false)
  const [clearWorkspaceConfirm, setClearWorkspaceConfirm] = useState(false)

  // Profile handlers
  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...patch }))
    setProfileSaved(false)
  }, [])

  const handleSaveProfile = () => {
    saveProfile(profile)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  // Settings handlers — save immediately on change
  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  // Data handlers
  const handleClearCheckpoints = () => {
    if (!clearCheckpointConfirm) {
      setClearCheckpointConfirm(true)
      return
    }
    localStorage.removeItem('cryptoblocks-checkpoints')
    setClearCheckpointConfirm(false)
  }

  const handleClearWorkspace = () => {
    if (!clearWorkspaceConfirm) {
      setClearWorkspaceConfirm(true)
      return
    }
    localStorage.removeItem('cryptoblocks-workspace')
    setClearWorkspaceConfirm(false)
  }

  const initials = getInitials(profile.displayName, profile.username)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">Profile & Settings</h1>
        <p className="text-sm text-[#6c7086]">Manage your identity, preferences, and data.</p>
      </div>

      {/* Profile section */}
      <SectionCard title="Profile">
        {/* Avatar + name row */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-[#1e1e2e] shrink-0 select-none"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {initials}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-[#cdd6f4]">
              {profile.displayName || 'Anonymous'}
            </span>
            {profile.username && (
              <span className="text-xs text-[#6c7086]">@{profile.username}</span>
            )}
          </div>
        </div>

        <Field label="Display Name" hint="How your name appears across CryptoBlocks.">
          <input
            type="text"
            className={inputClass}
            placeholder="Your name"
            value={profile.displayName}
            onChange={e => updateProfile({ displayName: e.target.value })}
          />
        </Field>

        <Field label="Username" hint="Your @handle for Shareplace (future).">
          <input
            type="text"
            className={inputClass}
            placeholder="yourhandle"
            value={profile.username}
            onChange={e =>
              updateProfile({ username: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })
            }
          />
        </Field>

        <Field label="Bio" hint="A short description shown on your Shareplace profile.">
          <textarea
            className={`${inputClass} resize-none`}
            placeholder="Tell us a little about yourself..."
            rows={3}
            value={profile.bio}
            onChange={e => updateProfile({ bio: e.target.value })}
          />
        </Field>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#89b4fa]/90 transition-colors"
          >
            Save Profile
          </button>
          {profileSaved && (
            <span className="text-xs text-[#a6e3a1]">Saved.</span>
          )}
        </div>
      </SectionCard>

      {/* Editor settings section */}
      <SectionCard title="Editor Settings">
        {/* Auto-save toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-[#cdd6f4]">Auto-Save</span>
            <span className="text-xs text-[#6c7086]">Automatically save your workspace at a set interval.</span>
          </div>
          <button
            role="switch"
            aria-checked={settings.autoSaveEnabled}
            onClick={() => updateSettings({ autoSaveEnabled: !settings.autoSaveEnabled })}
            className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
              settings.autoSaveEnabled ? 'bg-[#89b4fa]' : 'bg-[#45475a]'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-[#1e1e2e] transition-transform ${
                settings.autoSaveEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Auto-save interval */}
        <Field label="Auto-Save Interval">
          <select
            className={`${inputClass} cursor-pointer`}
            value={settings.autoSaveIntervalMinutes}
            disabled={!settings.autoSaveEnabled}
            onChange={e => updateSettings({ autoSaveIntervalMinutes: Number(e.target.value) })}
          >
            <option value={1}>Every 1 minute</option>
            <option value={2}>Every 2 minutes</option>
            <option value={5}>Every 5 minutes</option>
            <option value={10}>Every 10 minutes</option>
          </select>
        </Field>

        {/* Theme selector */}
        <Field label="Theme">
          <select className={`${inputClass} cursor-not-allowed opacity-60`} disabled>
            <option value="dark">Dark</option>
            <option value="light">Light (Coming Soon)</option>
          </select>
        </Field>
      </SectionCard>

      {/* Data section */}
      <SectionCard title="Data">
        <div className="flex flex-col gap-4">
          {/* Export */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[#cdd6f4]">Export All Data</span>
              <span className="text-xs text-[#6c7086]">Download your workspace and settings as a JSON file.</span>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#313244] border border-[#45475a] text-[#6c7086] cursor-not-allowed opacity-60 shrink-0"
            >
              Export
            </button>
          </div>

          <div className="border-t border-[#45475a]" />

          {/* Clear checkpoints */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[#cdd6f4]">Clear Checkpoint History</span>
              <span className="text-xs text-[#6c7086]">Remove all saved checkpoints from local storage.</span>
            </div>
            <button
              onClick={handleClearCheckpoints}
              onBlur={() => setClearCheckpointConfirm(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                clearCheckpointConfirm
                  ? 'bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/90'
                  : 'bg-[#313244] border border-[#45475a] text-[#a6adc8] hover:border-[#f38ba8] hover:text-[#f38ba8]'
              }`}
            >
              {clearCheckpointConfirm ? 'Confirm?' : 'Clear'}
            </button>
          </div>

          <div className="border-t border-[#45475a]" />

          {/* Clear workspace */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[#cdd6f4]">Clear Workspace</span>
              <span className="text-xs text-[#6c7086]">Wipe the saved workspace state from local storage.</span>
            </div>
            <button
              onClick={handleClearWorkspace}
              onBlur={() => setClearWorkspaceConfirm(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                clearWorkspaceConfirm
                  ? 'bg-[#f38ba8] text-[#1e1e2e] hover:bg-[#f38ba8]/90'
                  : 'bg-[#313244] border border-[#45475a] text-[#a6adc8] hover:border-[#f38ba8] hover:text-[#f38ba8]'
              }`}
            >
              {clearWorkspaceConfirm ? 'Confirm?' : 'Clear'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* About section */}
      <SectionCard title="About">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a6adc8]">Version</span>
            <span className="text-sm font-mono text-[#6c7086]">v0.2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a6adc8]">Source</span>
            <a
              href="https://github.com/jasonsutter87/CryptoBlocks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#89b4fa] hover:underline"
            >
              GitHub
            </a>
          </div>
          <div className="border-t border-[#45475a] pt-3">
            <p className="text-xs text-[#6c7086] italic">Built with blocks. Powered by curiosity.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
