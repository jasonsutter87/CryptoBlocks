/**
 * Seed script — uploads all built-in examples to Shareplace via the live API.
 * Run with: npx tsx scripts/seed-shareplace.ts
 */

import { EXAMPLES } from '../src/examples/index'

const API = 'https://app.getcryptoblocks.com/api/projects'

async function seed() {
  console.log(`Seeding ${EXAMPLES.length} examples to Shareplace...\n`)

  for (const ex of EXAMPLES) {
    const payload = {
      name: ex.name,
      authorName: 'CryptoBlocks',
      description: ex.description,
      category: ex.tags[0] || 'General',
      workspaceJson: JSON.stringify(ex.workspace),
      tags: ex.tags,
      blockCount: countBlocks(ex.workspace),
    }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        console.log(`  ✓ ${ex.name} → ${data.id}`)
      } else {
        const err = await res.text()
        console.error(`  ✗ ${ex.name} → ${res.status}: ${err}`)
      }
    } catch (err) {
      console.error(`  ✗ ${ex.name} → ${err}`)
    }
  }

  console.log('\nDone!')
}

function countBlocks(ws: Record<string, unknown>): number {
  try {
    const blocks = (ws as { blocks?: { blocks?: unknown[] } })?.blocks?.blocks
    return Array.isArray(blocks) ? blocks.length : 0
  } catch {
    return 0
  }
}

seed()
