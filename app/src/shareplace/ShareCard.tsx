/**
 * ShareCard — generates a branded PNG image for sharing a project on social media.
 *
 * Renders to an offscreen canvas:
 *   - Dark background with gradient accent
 *   - Project name, author, category, block count
 *   - CryptoBlocks branding + URL
 *   - Downloads as PNG or copies to clipboard
 */

import { useCallback, useState } from 'react'
import type { SharedProject } from '../types/shareplace'

const CARD_W = 1200
const CARD_H = 630 // Twitter/OG standard

const CATEGORY_COLORS: Record<string, string> = {
  Games: '#89b4fa',
  Art: '#cba6f7',
  Web: '#f38ba8',
  Sound: '#fab387',
  Data: '#a6e3a1',
  AI: '#f9e2af',
  Basics: '#89b4fa',
  Logic: '#a6e3a1',
  Math: '#89b4fa',
  Text: '#cba6f7',
}

function generateCard(project: SharedProject): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')!

  const accent = CATEGORY_COLORS[project.category] || '#89b4fa'

  // Background
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Accent gradient bar at top
  const grad = ctx.createLinearGradient(0, 0, CARD_W, 0)
  grad.addColorStop(0, accent)
  grad.addColorStop(1, '#313244')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CARD_W, 6)

  // CryptoBlocks logo blocks (top-left)
  const blockColors = ['#89b4fa', '#f9e2af', '#a6e3a1']
  blockColors.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.roundRect(60 + i * 22, 50, 20, 20, 4)
    ctx.fill()
  })

  // "CryptoBlocks" text
  ctx.fillStyle = '#cdd6f4'
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText('CryptoBlocks', 136, 67)

  // Category pill
  ctx.fillStyle = accent + '30'
  ctx.beginPath()
  ctx.roundRect(60, 110, ctx.measureText(project.category).width + 32, 32, 16)
  ctx.fill()
  ctx.fillStyle = accent
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText(project.category, 76, 131)

  // Project name (large)
  ctx.fillStyle = '#cdd6f4'
  ctx.font = 'bold 56px sans-serif'
  const nameLines = wrapText(ctx, project.name, CARD_W - 120, 56)
  nameLines.forEach((line, i) => {
    ctx.fillText(line, 60, 210 + i * 66)
  })

  // Author
  const authorY = 210 + nameLines.length * 66 + 20
  ctx.fillStyle = '#6c7086'
  ctx.font = '24px sans-serif'
  ctx.fillText(`by ${project.author}`, 60, authorY)

  // Description (truncated)
  if (project.description) {
    ctx.fillStyle = '#a6adc8'
    ctx.font = '20px sans-serif'
    const descLines = wrapText(ctx, project.description, CARD_W - 120, 20)
    descLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, 60, authorY + 50 + i * 28)
    })
  }

  // Stats bar at bottom
  ctx.fillStyle = '#181825'
  ctx.fillRect(0, CARD_H - 80, CARD_W, 80)

  ctx.fillStyle = '#6c7086'
  ctx.font = '18px sans-serif'
  const stats = [
    `${project.blockCount} blocks`,
    `${project.likes} likes`,
    `${project.downloads} downloads`,
  ]
  stats.forEach((s, i) => {
    ctx.fillText(s, 60 + i * 200, CARD_H - 35)
  })

  // URL
  ctx.fillStyle = accent
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('app.getcryptoblocks.com', CARD_W - 60, CARD_H - 35)
  ctx.textAlign = 'left'

  return canvas
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `bold ${fontSize}px sans-serif`
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

interface ShareCardButtonProps {
  project: SharedProject
}

export default function ShareCardButton({ project }: ShareCardButtonProps) {
  const [generating, setGenerating] = useState(false)

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      const canvas = generateCard(project)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}-share.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Share card generation failed:', err)
    }
    setGenerating(false)
  }, [project])

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="flex items-center gap-2 px-3 py-2 text-xs text-text bg-surface-0 hover:bg-surface-1 rounded-lg transition-colors disabled:opacity-60"
      title="Download a shareable image card for social media"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      {generating ? 'Generating...' : 'Share Card'}
    </button>
  )
}
