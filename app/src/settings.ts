import * as Blockly from 'blockly'

const SETTINGS_KEY = 'cryptoblocks-settings'

export type WorkspaceTheme = 'dark' | 'midnight' | 'ocean' | 'forest' | 'slate'

export interface WorkspaceThemeConfig {
  label: string
  bg: string
  grid: string
  swatch: string
}

export const WORKSPACE_THEMES: Record<WorkspaceTheme, WorkspaceThemeConfig> = {
  dark:     { label: 'Dark',     bg: '#1e1e2e', grid: '#2a2a3d', swatch: '#1e1e2e' },
  midnight: { label: 'Midnight', bg: '#0d1117', grid: '#161b22', swatch: '#0d1117' },
  ocean:    { label: 'Ocean',    bg: '#0a192f', grid: '#112240', swatch: '#0a192f' },
  forest:   { label: 'Forest',   bg: '#1a1f16', grid: '#2d3a1f', swatch: '#1a1f16' },
  slate:    { label: 'Slate',    bg: '#1e293b', grid: '#334155', swatch: '#1e293b' },
}

export interface UserSettings {
  autoSaveEnabled: boolean
  autoSaveIntervalMinutes: number
  theme: 'dark' | 'light'
  locale: 'en' | 'es'
  workspaceTheme: WorkspaceTheme
}

const DEFAULTS: UserSettings = {
  autoSaveEnabled: true,
  autoSaveIntervalMinutes: 5,
  theme: 'dark',
  locale: 'en',
  workspaceTheme: 'dark',
}

/** Build a Blockly Theme with the given workspace background color. */
function buildBlocklyTheme(config: WorkspaceThemeConfig): Blockly.Theme {
  return Blockly.Theme.defineTheme('cb-workspace-' + config.bg.replace('#', ''), {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: config.bg,
    },
  })
}

/** Apply workspace theme colors to an injected workspace. */
export function applyWorkspaceTheme(workspace: Blockly.WorkspaceSvg, themeKey: WorkspaceTheme): void {
  const config = WORKSPACE_THEMES[themeKey] ?? WORKSPACE_THEMES.dark

  // Set Blockly theme with the correct background color
  workspace.setTheme(buildBlocklyTheme(config))

  // Update grid line colors
  const svg = workspace.getParentSvg()
  if (svg) {
    const lines = svg.querySelectorAll('pattern line')
    lines.forEach((line) => {
      ;(line as SVGLineElement).setAttribute('stroke', config.grid)
    })
  }
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
