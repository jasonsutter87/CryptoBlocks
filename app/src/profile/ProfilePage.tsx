import { useState, useCallback, useEffect, useMemo } from 'react'
import { useUser, useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { loadProfile, saveProfile, type UserProfile } from './profile-storage'
import { loadSettings, saveSettings, type UserSettings } from '../settings'
import { fetchProjects } from '../shareplace/api'
import { fetchClassrooms, type Classroom } from '../teacher/api'
import { loadDailyState, getEffectiveStreak } from '../daily/state'
import { getDayNumber } from '../daily/getTodaysPuzzle'
import { useIsPro, openCheckout, openPortal } from '../billing/useIsPro'
import type { SharedProject } from '../types/shareplace'

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
  const { user: clerkUser } = useUser()
  const [profile, setProfile] = useState<UserProfile>(loadProfile)
  const [settings, setSettings] = useState<UserSettings>(loadSettings)
  const [profileSaved, setProfileSaved] = useState(false)
  const [clearCheckpointConfirm, setClearCheckpointConfirm] = useState(false)
  const [clearWorkspaceConfirm, setClearWorkspaceConfirm] = useState(false)
  const { getToken } = useAuth()
  const { isPro } = useIsPro()
  const [myProjects, setMyProjects] = useState<SharedProject[]>([])
  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([])
  const dailyState = useMemo(() => loadDailyState(), [])
  const dailyStreak = getEffectiveStreak(dailyState, getDayNumber())

  useEffect(() => {
    fetchProjects().then((all) => {
      const authorName = clerkUser?.fullName || clerkUser?.username || profile.displayName
      if (authorName) {
        setMyProjects(all.filter((p) => p.author === authorName))
      }
    })
    fetchClassrooms(getToken).then(setMyClassrooms)
  }, [clerkUser, profile.displayName, getToken])

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

      {/* Clerk identity card */}
      <SignedIn>
        {clerkUser && (
          <div className="bg-[#313244] rounded-xl p-6 flex items-center gap-4">
            {clerkUser.imageUrl ? (
              <img src={clerkUser.imageUrl} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#89b4fa] flex items-center justify-center text-xl font-bold text-[#1e1e2e]">
                {(clerkUser.fullName || clerkUser.username || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-lg font-bold text-[#cdd6f4]">{clerkUser.fullName || clerkUser.username}</div>
              <div className="text-sm text-[#6c7086]">{clerkUser.primaryEmailAddress?.emailAddress}</div>
              <div className="text-xs text-[#a6e3a1] mt-1">{myProjects.length} shared project{myProjects.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <div className="bg-[#313244] rounded-xl p-6 flex items-center justify-between">
          <div>
            <div className="text-[#cdd6f4] font-semibold">Sign in to save your identity</div>
            <div className="text-sm text-[#6c7086]">Your name and avatar will appear in collab and on shared projects.</div>
          </div>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-[#cba6f7] text-[#1e1e2e] rounded-lg text-sm font-bold hover:bg-[#cba6f7]/80 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* Subscription */}
      <SignedIn>
        <SectionCard title="Subscription">
          {isPro ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-sm font-bold text-[#cdd6f4]">CryptoBlocks Pro</div>
                  <div className="text-xs text-[#a6e3a1]">Active subscription</div>
                </div>
              </div>
              <button
                onClick={() => openPortal(getToken)}
                className="px-4 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg text-sm font-semibold transition-colors"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#cdd6f4]">Free Plan</div>
                <div className="text-xs text-[#6c7086]">Upgrade to unlock build tools, exports, classrooms, and more.</div>
              </div>
              <button
                onClick={() => openCheckout(getToken)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#f9e2af] to-[#fab387] text-[#1e1e2e] rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Upgrade — $10/mo
              </button>
            </div>
          )}
        </SectionCard>
      </SignedIn>

      {/* My shared projects */}
      {myProjects.length > 0 && (
        <SectionCard title="My Shared Projects">
          <div className="flex flex-col gap-2">
            {myProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-[#1e1e2e] rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#cdd6f4]">{p.name}</div>
                  <div className="text-xs text-[#6c7086]">{p.category} · {p.blockCount} blocks · {p.likes} likes</div>
                </div>
                <a href="/shareplace" className="text-xs text-[#89b4fa] hover:text-[#74c7ec]">View</a>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Daily Challenge stats */}
      <SectionCard title="Daily Challenge">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#fab387]">{dailyStreak}🔥</div>
            <div className="text-[10px] text-[#6c7086]">Current Streak</div>
          </div>
          <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#f9e2af]">{dailyState.longestStreak}</div>
            <div className="text-[10px] text-[#6c7086]">Longest Streak</div>
          </div>
          <div className="bg-[#1e1e2e] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#a6e3a1]">{dailyState.totalSolved}</div>
            <div className="text-[10px] text-[#6c7086]">Total Solved</div>
          </div>
        </div>
      </SectionCard>

      {/* Classrooms */}
      {myClassrooms.length > 0 && (
        <SectionCard title="My Classrooms">
          <div className="flex flex-col gap-2">
            {myClassrooms.map((c) => (
              <a key={c.id} href="/teacher" className="flex items-center justify-between bg-[#1e1e2e] rounded-lg px-4 py-3 hover:bg-[#181825] transition-colors">
                <div>
                  <div className="text-sm font-semibold text-[#cdd6f4]">{c.name}</div>
                  <div className="text-xs text-[#6c7086]">by {c.teacherName} · {c.memberCount} members</div>
                </div>
                <span className="text-sm font-mono text-[#89b4fa]">{c.joinCode}</span>
              </a>
            ))}
          </div>
        </SectionCard>
      )}

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
          <select
            className={inputClass}
            value={settings.theme || 'dark'}
            onChange={(e) => {
              const theme = e.target.value as 'dark' | 'light'
              updateSettings({ theme })
              document.documentElement.setAttribute('data-theme', theme)
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
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
