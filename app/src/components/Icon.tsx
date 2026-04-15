/**
 * Icon registry. One source of truth for inline SVG paths.
 *
 * Why a registry: the toolbar previously inlined 60 stroke-path SVGs, with
 * the same Save / Load / Publish paths duplicated across desktop and mobile
 * menus. Renaming a tool meant editing the SVG in 3 places. This file is
 * the place to add or change an icon.
 *
 * Conventions:
 *  - All icons use viewBox="0 0 24 24" and currentColor stroke (heroicons
 *    outline-style). Pass color through a parent `text-*` class.
 *  - "fill" group uses fill="currentColor" for solid play/stop glyphs.
 *  - Default size is 1em (inherits from font-size); override via className.
 */

import type { CSSProperties } from 'react'

type IconName =
  | 'chevron-down' | 'folder' | 'plus' | 'bars' | 'dots-vertical'
  | 'download' | 'upload' | 'cloud-up' | 'cube' | 'check' | 'clock'
  | 'trash' | 'cog' | 'mobile-app' | 'code-brackets' | 'link'
  | 'pages' | 'book' | 'flag' | 'book-classroom' | 'bars-chart'
  | 'users' | 'arrow-undo' | 'arrow-redo' | 'expand' | 'cloud-up-arrow'
  | 'sparkles' | 'bolt' | 'dashboard-grid' | 'user-circle' | 'book-open'
  | 'blocks-2x2' | 'swap' | 'play' | 'stop'

const STROKE_PATHS: Record<string, string> = {
  'chevron-down': 'M19 9l-7 7-7-7',
  'folder': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  'plus': 'M12 4v16m8-8H4',
  'bars': 'M4 6h16M4 12h16M4 18h16',
  'dots-vertical': 'M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z',
  'download': 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3',
  'upload': 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5-5 5M12 3v12',
  'cloud-up': 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z M14 11l-2-2m0 0l-2 2m2-2v6',
  'cube': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  'check': 'M5 13l4 4L19 7',
  'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'trash': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  'cog': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  'mobile-app': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'code-brackets': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  'link': 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  'pages': 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'flag': 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11',
  'book-classroom': 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  'bars-chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'users': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'arrow-undo': 'M3 10h10a5 5 0 010 10H9m-6-10l4-4-4-4',
  'arrow-redo': 'M21 10H11a5 5 0 000 10h4m6-10l-4-4 4-4',
  'expand': 'M4 8V5a1 1 0 011-1h3M4 16v3a1 1 0 001 1h3m10-11V5a1 1 0 00-1-1h-3m4 11v3a1 1 0 01-1 1h-3',
  'cloud-up-arrow': 'M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'sparkles': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  'bolt': 'M13 10V3L4 14h7v7l9-11h-7z',
  'dashboard-grid': 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z',
  'user-circle': 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
  'book-open': 'M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z',
  'swap': 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
}

const FILL_PATHS: Record<string, string> = {
  'play': 'polygon:5,3 19,12 5,21',
  'stop': 'rect:6 6 12 12',
  'blocks-2x2': 'rect4',
}

interface IconProps {
  name: IconName
  className?: string
  style?: CSSProperties
  strokeWidth?: number
}

export function Icon({ name, className, style, strokeWidth = 2 }: IconProps) {
  const stroke = STROKE_PATHS[name]
  if (stroke) {
    // Multiple paths are concatenated in STROKE_PATHS with a leading space
    // before the next `M` command. Split on that boundary only when the M is
    // followed by a number/space (not by a letter in a path mnemonic).
    const parts = stroke.split(/(?=\sM[\s\d-])/g).map((p) => p.trim()).filter(Boolean)
    return (
      <svg
        className={className ?? 'w-4 h-4'}
        style={style}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      >
        {parts.map((d, i) => (
          <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
        ))}
      </svg>
    )
  }

  // Solid glyphs
  if (name === 'play') {
    return (
      <svg className={className ?? 'w-4 h-4'} style={style} fill="currentColor" viewBox="0 0 24 24">
        <polygon points="5,3 19,12 5,21" />
      </svg>
    )
  }
  if (name === 'stop') {
    return (
      <svg className={className ?? 'w-4 h-4'} style={style} fill="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="1" />
      </svg>
    )
  }
  if (name === 'blocks-2x2') {
    return (
      <svg className={className ?? 'w-3 h-3'} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  }
  return null
}
