const SETTINGS_KEY = 'cryptoblocks-settings'

export interface UserSettings {
  autoSaveEnabled: boolean
  autoSaveIntervalMinutes: number
}

const DEFAULTS: UserSettings = {
  autoSaveEnabled: true,
  autoSaveIntervalMinutes: 5,
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
