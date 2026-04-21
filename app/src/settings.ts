import * as Blockly from 'blockly'

const SETTINGS_KEY = 'cryptoblocks-settings'

const DEFAULT_WORKSPACE_BG = '#1e1e2e'

/** Derive a visible grid color from the background hex. */
function deriveGridColor(bg: string): string {
  const r = Math.min(255, parseInt(bg.slice(1, 3), 16) + 35)
  const g = Math.min(255, parseInt(bg.slice(3, 5), 16) + 35)
  const b = Math.min(255, parseInt(bg.slice(5, 7), 16) + 35)
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
  const gridColor = deriveGridColor(safeBg)

  const svg = workspace.getParentSvg()
  if (!svg) return

  // Set background color on the SVG container
  ;(svg as SVGElement).style.backgroundColor = safeBg

  const bgRect = svg.querySelector('.blocklyMainBackground') as SVGRectElement | null
  const grid = workspace.getGrid()
  const patternId = grid?.getPatternId()

  if (showGrid && patternId) {
    // Restore the pattern fill on the background rect so dots show through
    if (bgRect) {
      bgRect.style.fill = ''
      bgRect.setAttribute('fill', `url(#${patternId})`)
    }
    // Update grid line stroke color to match the bg
    const pattern = svg.querySelector(`#${CSS.escape(patternId)}`)
    if (pattern) {
      // Set the pattern background to our color
      const patternRect = pattern.querySelector('rect')
      if (patternRect) {
        patternRect.setAttribute('fill', safeBg)
      }
      const lines = pattern.querySelectorAll('line')
      lines.forEach((line) => {
        ;(line as SVGLineElement).setAttribute('stroke', gridColor)
      })
    }
  } else {
    // No grid — solid background, remove pattern reference
    if (bgRect) {
      bgRect.style.fill = safeBg
    }
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
