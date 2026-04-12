/**
 * Installs `window.__vision` — the unified surface that block-generated
 * code calls into for MobileNet classification + MediaPipe hand tracking.
 *
 * Runs in the parent window so the loaded TF.js state persists across
 * Run presses. The runner forces direct execution whenever code touches
 * `__vision` (see src/execution/runner.ts).
 */

import {
  classifyCamera,
  classifyUrl,
  getLatestClassification,
  type ClassificationResult,
} from './image-classifier'
import {
  startHandTracking,
  stopHandTracking,
  getHandState,
  type HandState,
} from './hand-tracker'

export interface VisionGlobal {
  classifyCamera: () => Promise<ClassificationResult>
  classifyUrl: (url: string) => Promise<ClassificationResult>
  getLatestClassification: () => Readonly<ClassificationResult>
  startHandTracking: () => Promise<boolean>
  stopHandTracking: () => void
  getHandState: () => Readonly<HandState>
}

let installed = false

export function ensureVisionGlobal(): void {
  if (installed) return
  const api: VisionGlobal = {
    classifyCamera,
    classifyUrl,
    getLatestClassification,
    startHandTracking,
    stopHandTracking,
    getHandState,
  }
  ;(window as unknown as { __vision: VisionGlobal }).__vision = api
  installed = true
}
