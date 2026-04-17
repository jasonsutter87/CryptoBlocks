/**
 * Hand tracking via MediaPipe Tasks Vision (HandLandmarker).
 *
 * Replaces the old TF.js hand-pose-detection pipeline — one import,
 * no version conflicts, same hand state output.
 *
 * Landmark indices (MediaPipe hand model):
 *     0 = wrist
 *     4 = thumb tip
 *     8 = index finger tip
 *    12 = middle finger tip
 *    16 = ring finger tip
 *    20 = pinky tip
 *     9 = middle finger base (palm center proxy)
 */

export interface HandState {
  handCount: number
  indexX: number
  indexY: number
  thumbX: number
  thumbY: number
  palmX: number
  palmY: number
  isPinching: boolean
  fingersUp: number
}

const state: HandState = {
  handCount: 0,
  indexX: 0, indexY: 0,
  thumbX: 0, thumbY: 0,
  palmX: 0, palmY: 0,
  isPinching: false,
  fingersUp: 0,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let handLandmarker: any = null
let loading: Promise<void> | null = null
let loopHandle: number | null = null

async function ensureLandmarker(): Promise<void> {
  if (handLandmarker) return
  if (loading) { await loading; return }
  loading = (async () => {
    const { FilesetResolver, HandLandmarker } = await import(
      // @ts-expect-error — CDN module, no type declarations
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
    )
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
    )
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
    })
  })()
  try { await loading } catch (err) { loading = null; throw err }
}

export async function startHandTracking(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = (window as any).__cbCamera as HTMLVideoElement | undefined
  if (!video) {
    console.warn('[hands] camera not started — call "start camera" first')
    return false
  }
  try {
    await ensureLandmarker()
  } catch (err) {
    console.error('[hands] model load failed', err)
    return false
  }
  if (loopHandle === null) scheduleFrame()
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

function processFrame(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = (window as any).__cbCamera as HTMLVideoElement | undefined
  if (!handLandmarker || !video || video.readyState < 2 || video.videoWidth === 0) {
    scheduleFrame()
    return
  }

  try {
    const result = handLandmarker.detectForVideo(video, performance.now())
    const landmarks = result.landmarks ?? []
    state.handCount = landmarks.length

    if (landmarks.length > 0) {
      const lm = landmarks[0] as Array<{ x: number; y: number; z: number }>

      const index = lm[8]
      const thumb = lm[4]
      const palm  = lm[9]

      // MediaPipe Tasks returns landmarks in 0..1 range already
      state.indexX = clamp01(index.x)
      state.indexY = clamp01(index.y)
      state.thumbX = clamp01(thumb.x)
      state.thumbY = clamp01(thumb.y)
      state.palmX  = clamp01(palm.x)
      state.palmY  = clamp01(palm.y)

      const dx = state.indexX - state.thumbX
      const dy = state.indexY - state.thumbY
      state.isPinching = Math.sqrt(dx * dx + dy * dy) < 0.08

      // Fingers up: tip y < pip y (in normalized coords, smaller y = higher)
      const tipIdxs = [4, 8, 12, 16, 20]
      const pipIdxs = [3, 6, 10, 14, 18]
      let up = 0
      for (let i = 0; i < tipIdxs.length; i++) {
        if (lm[tipIdxs[i]].y < lm[pipIdxs[i]].y) up++
      }
      state.fingersUp = up
    } else {
      resetHandFields()
    }
  } catch {
    // Single-frame errors are normal (hand leaving frame, etc.)
  }

  scheduleFrame()
}

function resetState(): void {
  state.handCount = 0
  resetHandFields()
}

function resetHandFields(): void {
  state.indexX = 0; state.indexY = 0
  state.thumbX = 0; state.thumbY = 0
  state.palmX = 0;  state.palmY = 0
  state.isPinching = false
  state.fingersUp = 0
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

export function getHandState(): Readonly<HandState> {
  return state
}
