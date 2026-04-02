const PROFILE_KEY = 'cryptoblocks-profile'

export interface UserProfile {
  displayName: string
  username: string
  bio: string
  avatarColor: string
}

const AVATAR_COLORS = ['#89b4fa', '#a6e3a1', '#f38ba8', '#fab387', '#cba6f7', '#f9e2af']

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

const DEFAULTS: UserProfile = {
  displayName: '',
  username: '',
  bio: '',
  avatarColor: randomAvatarColor(),
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
