/**
 * Hand tracking via TensorFlow.js hand-pose-detection (MediaPipe Hands
 * under the hood). Loads from jsDelivr on first use, then runs a
 * requestAnimationFrame loop on the CryptoBlocks camera, caching the
 * latest normalized finger/palm positions in a shared state object so
 * read blocks are synchronous.
 *
 * Landmark indices we care about (MediaPipe hand model):
 *     0 = wrist
 *     4 = thumb tip
 *     8 = index finger tip
 *    12 = middle finger tip
 *    16 = ring finger tip
 *    20 = pinky tip
 *     9 = middle finger base (used as palm center)
 */

import { loadScriptOnce } from './loader'

const TFJS_CDN = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js'
const TFJS_BACKEND_WEBGL_CDN =
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.22.0/dist/tf-backend-webgl.min.js'
const TFJS_CONVERTER_CDN =
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.22.0/dist/tf-converter.min.js'
const HAND_POSE_CDN =
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.0.1/dist/hand-pose-detection.min.js'

/** Normalized 0..1 range — easier for kids than raw pixels. */
export interface HandState {
  handCount: number
  indexX: number
  indexY: number
  thumbX: number
  thumbY: number
  palmX: number
  palmY: number
  isPinching: boolean
  /** 0–5 — count of finger tips that are "up" relative to palm */
  fingersUp: number
}

const state: HandState = {
  handCount: 0,
  indexX: 0,
  indexY: 0,
  thumbX: 0,
  thumbY: 0,
  palmX: 0,
  palmY: 0,
  isPinching: false,
  fingersUp: 0,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let detector: any = null
let detectorPromise: Promise<unknown> | null = null
let loopHandle: number | null = null

async function getDetector(): Promise<void> {
  if (detector) return
  if (detectorPromise) {
    await detectorPromise
    return
  }
  detectorPromise = (async () => {
    await loadScriptOnce(TFJS_CDN)
    await loadScriptOnce(TFJS_BACKEND_WEBGL_CDN)
    await loadScriptOnce(TFJS_CONVERTER_CDN)
    await loadScriptOnce(HAND_POSE_CDN)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hpd = (window as any).handPoseDetection
    if (!hpd) throw new Error('hand-pose-detection failed to initialize')
    const model = hpd.SupportedModels.MediaPipeHands
    detector = await hpd.createDetector(model, {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
      modelType: 'lite',
      maxHands: 2,
    })
  })()
  try {
    await detectorPromise
  } catch (err) {
    detectorPromise = null
    throw err
  }
}

/** Start the per-frame hand detection loop if it isn't already running. */
export async function startHandTracking(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = (window as any).__cbCamera as HTMLVideoElement | undefined
  if (!video) {
    // eslint-disable-next-line no-console
    console.warn('[hands] camera not started — call "start camera" first')
    return false
  }
  try {
    await getDetector()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[hands] detector load failed', err)
    return false
  }
  if (loopHandle === null) {
    scheduleFrame()
  }
  return true
}

export function stopHandTracking(): void {
  if (loopHandle !== null) {
    cancelAnimationFrame(loopHandle)
    loopHandle = null
  }
  resetState()
}

function scheduleFrame(): void {
  loopHandle = requestAnimationFrame(processFrame)
}

async function processFrame(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = (window as any).__cbCamera as HTMLVideoElement | undefined
  if (!detector || !video || video.readyState < 2 || video.videoWidth === 0) {
    scheduleFrame()
    return
  }

  try {
    const hands = await detector.estimateHands(video, { flipHorizontal: false })
    state.handCount = hands.length

    if (hands.length > 0) {
      const hand = hands[0]
      const keypoints = hand.keypoints as Array<{ x: number; y: number; name?: string }>
      const w = video.videoWidth || 1
      const h = video.videoHeight || 1

      const index = keypoints[8]
      const thumb = keypoints[4]
      const palm = keypoints[9]

      state.indexX = clamp01(index.x / w)
      state.indexY = clamp01(index.y / h)
      state.thumbX = clamp01(thumb.x / w)
      state.thumbY = clamp01(thumb.y / h)
      state.palmX = clamp01(palm.x / w)
      state.palmY = clamp01(palm.y / h)

      // Pinch: normalized distance between thumb tip and index tip
      const dx = state.indexX - state.thumbX
      const dy = state.indexY - state.thumbY
      const dist = Math.sqrt(dx * dx + dy * dy)
      state.isPinching = dist < 0.08

      // Fingers up: for each finger (index, middle, ring, pinky, thumb),
      // check if the tip is "above" (smaller y) its knuckle. Simple and
      // works well enough for kid games.
      const tipIdxs = [4, 8, 12, 16, 20]
      const pipIdxs = [3, 6, 10, 14, 18]
      let up = 0
      for (let i = 0; i < tipIdxs.length; i++) {
        const tip = keypoints[tipIdxs[i]]
        const pip = keypoints[pipIdxs[i]]
        if (tip && pip && tip.y < pip.y) up++
      }
      state.fingersUp = up
    } else {
      resetHandFields()
    }
  } catch (err) {
    // Don't spam console on every frame — log once per second at most
    // eslint-disable-next-line no-console
    console.error('[hands] frame error', err)
  }

  scheduleFrame()
}

function resetState(): void {
  state.handCount = 0
  resetHandFields()
}

function resetHandFields(): void {
  state.indexX = 0
  state.indexY = 0
  state.thumbX = 0
  state.thumbY = 0
  state.palmX = 0
  state.palmY = 0
  state.isPinching = false
  state.fingersUp = 0
}

function clamp01(n: number): number {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

export function getHandState(): Readonly<HandState> {
  return state
}
