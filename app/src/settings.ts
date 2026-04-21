import * as Blockly from 'blockly'

const SETTINGS_KEY = 'cryptoblocks-settings'

const DEFAULT_WORKSPACE_BG = '#1e1e2e'

/** Derive a slightly lighter grid color from the background hex. */
function deriveGridColor(bg: string): string {
  const r = Math.min(255, parseInt(bg.slice(1, 3), 16) + 18)
  const g = Math.min(255, parseInt(bg.slice(3, 5), 16) + 18)
  const b = Math.min(255, parseInt(bg.slice(5, 7), 16) + 18)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export interface UserSettings {
  autoSaveEnabled: boolean
  autoSaveIntervalMinutes: number
  theme: 'dark' | 'light'
  locale: 'en' | 'es'
  workspaceBg: string
  showGrid: boolean
}

const DEFAULTS: UserSettings = {
  autoSaveEnabled: true,
  autoSaveIntervalMinutes: 5,
  theme: 'dark',
  locale: 'en',
  workspaceBg: DEFAULT_WORKSPACE_BG,
  showGrid: true,
}

/** Apply workspace background color and grid visibility. */
export function applyWorkspaceTheme(workspace: Blockly.WorkspaceSvg, bg: string, showGrid = true): void {
  const safeBg = /^#[0-9a-fA-F]{6}$/.test(bg) ? bg : DEFAULT_WORKSPACE_BG
  const grid = showGrid ? deriveGridColor(safeBg) : 'transparent'

  const svg = workspace.getParentSvg()
  if (!svg) return

  // Force the background rect color via inline style
  const bgRect = svg.querySelector('.blocklyMainBackground') as SVGRectElement | null
  if (bgRect) {
    bgRect.style.fill = safeBg
  }

  ;(svg as SVGElement).style.backgroundColor = safeBg

  // Update grid line colors (transparent = hidden)
  const lines = svg.querySelectorAll('pattern line')
  lines.forEach((line) => {
    ;(line as SVGLineElement).setAttribute('stroke', grid)
  })
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
