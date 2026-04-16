import { useState, useCallback, useEffect, useMemo } from 'react'
import { useUser, useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { loadProfile, saveProfile, type UserProfile } from './profile-storage'
import { loadSettings, saveSettings, type UserSettings } from '../settings'
import { fetchProjects } from '../shareplace/api'
import { fetchClassrooms, type Classroom } from '../teacher/api'
import { loadDailyState, getEffectiveStreak } from '../daily/state'
import { getDayNumber } from '../daily/getTodaysPuzzle'
import { useIsPro, openCheckout, openPortal } from '../billing/useIsPro'
import { showToast } from '../components/Toast'
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
    <div className="bg-surface-0 rounded-xl p-6 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-subtext uppercase tracking-widest">{title}</h2>
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
      <label className="text-sm font-medium text-text">{label}</label>
      {children}
      {hint && <p className="text-xs text-overlay">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full bg-base border border-surface-1 rounded-lg px-3 py-2 text-sm text-text placeholder-overlay focus:outline-none focus:border-accent transition-colors'

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
        <h1 className="text-2xl font-bold text-text">Profile & Settings</h1>
        <p className="text-sm text-overlay">Manage your identity, preferences, and data.</p>
      </div>

      {/* Clerk identity card */}
      <SignedIn>
        {clerkUser && (
          <div className="bg-surface-0 rounded-xl p-6 flex items-center gap-4">
            {clerkUser.imageUrl ? (
              <img src={clerkUser.imageUrl} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-base">
                {(clerkUser.fullName || clerkUser.username || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-lg font-bold text-text">{clerkUser.fullName || clerkUser.username}</div>
              <div className="text-sm text-overlay">{clerkUser.primaryEmailAddress?.emailAddress}</div>
              <div className="text-xs text-success mt-1">{myProjects.length} shared project{myProjects.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <div className="bg-surface-0 rounded-xl p-6 flex items-center justify-between">
          <div>
            <div className="text-text font-semibold">Sign in to save your identity</div>
            <div className="text-sm text-overlay">Your name and avatar will appear in collab and on shared projects.</div>
          </div>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-purple text-base rounded-lg text-sm font-bold hover:bg-purple/80 transition-colors">
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
                  <div className="text-sm font-bold text-text">CryptoBlocks Pro</div>
                  <div className="text-xs text-success">Active subscription</div>
                </div>
              </div>
              <button
                onClick={() => openPortal(getToken)}
                className="px-4 py-2 bg-surface-0 hover:bg-surface-1 text-text rounded-lg text-sm font-semibold transition-colors"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold text-text">Free Plan</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-base rounded-xl p-4 border border-surface-0">
                  <div className="text-sm font-bold text-text mb-1">Pro</div>
                  <div className="text-2xl font-bold text-warn mb-1">$10<span className="text-sm text-overlay">/mo</span></div>
                  <div className="text-xs text-overlay mb-3">Build tools, exports, Sprite Editor, Level Editor</div>
                  <button
                    onClick={() => openCheckout(getToken, 'pro')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-warn to-peach text-base rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Upgrade to Pro
                  </button>
                </div>
                <div className="bg-base rounded-xl p-4 border border-accent/30">
                  <div className="text-sm font-bold text-accent mb-1">Teacher</div>
                  <div className="text-2xl font-bold text-accent mb-1">$25<span className="text-sm text-overlay">/mo + $3.50/student</span></div>
                  <div className="text-xs text-overlay mb-3">Unlimited classrooms, assignments, students get Pro</div>
                  <button
                    onClick={() => openCheckout(getToken, 'teacher')}
                    className="w-full px-4 py-2 bg-accent text-base rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Start Teacher Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </SignedIn>

      {/* My shared projects */}
      {myProjects.length > 0 && (
        <SectionCard title="My Shared Projects">
          <div className="flex flex-col gap-2">
            {myProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-base rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-text">{p.name}</div>
                  <div className="text-xs text-overlay">{p.category} · {p.blockCount} blocks · {p.likes} likes</div>
                </div>
                <a href="/shareplace" className="text-xs text-accent hover:text-sapphire">View</a>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Daily Challenge stats */}
      <SectionCard title="Daily Challenge">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-base rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-peach">{dailyStreak}🔥</div>
            <div className="text-[10px] text-overlay">Current Streak</div>
          </div>
          <div className="bg-base rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-warn">{dailyState.longestStreak}</div>
            <div className="text-[10px] text-overlay">Longest Streak</div>
          </div>
          <div className="bg-base rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-success">{dailyState.totalSolved}</div>
            <div className="text-[10px] text-overlay">Total Solved</div>
          </div>
        </div>
      </SectionCard>

      {/* Classrooms */}
      {myClassrooms.length > 0 && (
        <SectionCard title="My Classrooms">
          <div className="flex flex-col gap-2">
            {myClassrooms.map((c) => (
              <a key={c.id} href="/teacher" className="flex items-center justify-between bg-base rounded-lg px-4 py-3 hover:bg-mantle transition-colors">
                <div>
                  <div className="text-sm font-semibold text-text">{c.name}</div>
                  <div className="text-xs text-overlay">by {c.teacherName} · {c.memberCount} members</div>
                </div>
                <span className="text-sm font-mono text-accent">{c.joinCode}</span>
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
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-base shrink-0 select-none"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {initials}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text">
              {profile.displayName || 'Anonymous'}
            </span>
            {profile.username && (
              <span className="text-xs text-overlay">@{profile.username}</span>
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
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-base hover:bg-accent/90 transition-colors"
          >
            Save Profile
          </button>
          {profileSaved && (
            <span className="text-xs text-success">Saved.</span>
          )}
        </div>
      </SectionCard>

      {/* Editor settings section */}
      <SectionCard title="Editor Settings">
        {/* Auto-save toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text">Auto-Save</span>
            <span className="text-xs text-overlay">Automatically save your workspace at a set interval.</span>
          </div>
          <button
            role="switch"
            aria-checked={settings.autoSaveEnabled}
            onClick={() => updateSettings({ autoSaveEnabled: !settings.autoSaveEnabled })}
            className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
              settings.autoSaveEnabled ? 'bg-accent' : 'bg-surface-1'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-base transition-transform ${
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

        {/* Language selector */}
        <Field label="Language / Idioma">
          <select
            className={inputClass}
            value={settings.locale || 'en'}
            onChange={(e) => {
              const locale = e.target.value as 'en' | 'es'
              updateSettings({ locale })
              showToast(locale === 'es'
                ? 'Idioma cambiado. Recarga la página.'
                : 'Language changed. Reload to see changes.', 'success')
            }}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </Field>
      </SectionCard>

      {/* Data section */}
      <SectionCard title="Data">
        <div className="flex flex-col gap-4">
          {/* Export */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">Export All Data</span>
              <span className="text-xs text-overlay">Download your workspace and settings as a JSON file.</span>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-0 border border-surface-1 text-overlay cursor-not-allowed opacity-60 shrink-0"
            >
              Export
            </button>
          </div>

          <div className="border-t border-surface-1" />

          {/* Clear checkpoints */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">Clear Checkpoint History</span>
              <span className="text-xs text-overlay">Remove all saved checkpoints from local storage.</span>
            </div>
            <button
              onClick={handleClearCheckpoints}
              onBlur={() => setClearCheckpointConfirm(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                clearCheckpointConfirm
                  ? 'bg-danger text-base hover:bg-danger/90'
                  : 'bg-surface-0 border border-surface-1 text-subtext hover:border-danger hover:text-danger'
              }`}
            >
              {clearCheckpointConfirm ? 'Confirm?' : 'Clear'}
            </button>
          </div>

          <div className="border-t border-surface-1" />

          {/* Clear workspace */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">Clear Workspace</span>
              <span className="text-xs text-overlay">Wipe the saved workspace state from local storage.</span>
            </div>
            <button
              onClick={handleClearWorkspace}
              onBlur={() => setClearWorkspaceConfirm(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                clearWorkspaceConfirm
                  ? 'bg-danger text-base hover:bg-danger/90'
                  : 'bg-surface-0 border border-surface-1 text-subtext hover:border-danger hover:text-danger'
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
            <span className="text-sm text-subtext">Version</span>
            <span className="text-sm font-mono text-overlay">v0.2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-subtext">Source</span>
            <a
              href="https://github.com/jasonsutter87/CryptoBlocks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              GitHub
            </a>
          </div>
          <div className="border-t border-surface-1 pt-3">
            <p className="text-xs text-overlay italic">Built with blocks. Powered by curiosity.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
