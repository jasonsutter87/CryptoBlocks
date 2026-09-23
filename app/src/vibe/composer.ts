/**
 * "My First Vibe App" composer — plain words in, a brick tree out.
 *
 * The real composer is werbos's `auto_compose` (model-free: it maps the
 * request onto verified bricks and runs it before answering). Everything
 * behind the `Composer` interface is swappable, so the UI doesn't care
 * whether it's werbos on sr8, a future in-browser port, or the stub.
 *
 * Contract with the werbos endpoint:
 *   POST {base}/compose  {"prompt": "..."}
 *   → {"ok": true, "tree": <brick tree>, "output": "...", "bricks": [...]}
 *   → {"ok": false, "reason": "..."}              (honest abstain)
 */

import type { BrickTree } from '../converters/brick-tree-to-workspace'

export type ComposeResult =
  | { ok: true; tree: BrickTree; output?: string; bricks: string[] }
  | { ok: false; reason: string }

export interface Composer {
  /** Short label shown in the UI so it's obvious which engine answered. */
  name: string
  compose(prompt: string, signal?: AbortSignal): Promise<ComposeResult>
}

export function werbosComposer(baseUrl: string): Composer {
  const base = baseUrl.replace(/\/+$/, '')
  return {
    name: 'werbos',
    async compose(prompt, signal) {
      let res: Response
      try {
        res = await fetch(`${base}/compose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal,
        })
      } catch (err) {
        if ((err as Error).name === 'AbortError') throw err
        return { ok: false, reason: "Can't reach the block builder right now." }
      }
      if (!res.ok) return { ok: false, reason: `The block builder had a problem (${res.status}).` }
      const data = await res.json() as Partial<ComposeResult> & { reason?: string }
      if (data.ok && 'tree' in data) {
        return { ok: true, tree: data.tree, output: data.output, bricks: data.bricks ?? [] }
      }
      return { ok: false, reason: data.reason || "I don't know how to build that yet." }
    },
  }
}

/**
 * Stand-in until werbos is wired up: handles the "say hello" family so the
 * UI can be built and demoed end to end. Deliberately tiny.
 */
export const stubComposer: Composer = {
  name: 'stub',
  async compose(prompt) {
    const m = prompt.trim().match(/^(?:make (?:me )?(?:a )?(?:block|app|program) that )?(?:says?|prints?|shows?|displays?)\s+["']?(.+?)["']?[.!]?$/i)
    if (m) {
      return { ok: true, tree: [{ print: m[1] }], output: m[1], bricks: ['print'] }
    }
    return { ok: false, reason: "I don't know how to build that yet. Try \"say hello\"." }
  },
}

export function getComposer(): Composer {
  const url = import.meta.env.VITE_VIBE_COMPOSER_URL as string | undefined
  return url ? werbosComposer(url) : stubComposer
}
