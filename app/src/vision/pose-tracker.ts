/**
 * Body pose tracking via MediaPipe Tasks Vision (PoseLandmarker).
 * Classifies the user's pose as idle / jumping / ducking and exposes
 * simple state for blocks. Same architecture as hand-tracker.ts.
 */

export interface PoseState {
  personVisible: boolean
  pose: 'idle' | 'jumping' | 'ducking'
  headY: number
  shoulderY: number
}

const state: PoseState = {
  personVisible: false,
  pose: 'idle',
  headY: 0,
  shoulderY: 0,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let poseLandmarker: any = null
let loading: Promise<void> | null = null
let loopHandle: number | null = null

// Baseline shoulder Y captured when tracking starts — used to detect
// jump (shoulder rises) and duck (shoulder drops).
let baselineShoulderY: number | null = null
let baselineFrames = 0

async function ensureLandmarker(): Promise<void> {
  if (poseLandmarker) return
  if (loading) { await loading; return }
  loading = (async () => {
    const { FilesetResolver, PoseLandmarker } = await import(
      // @ts-expect-error — CDN module
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
    )
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
    )
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    })
  })()
  try { await loading } catch (err) { loading = null; throw err }
}

export async function startPoseTracking(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = (window as any).__cbCamera as HTMLVideoElement | undefined
  if (!video) {
    console.warn('[pose] camera not started')
    return false
  }
  try {
    await ensureLandmarker()
  } catch (err) {
    console.error('[pose] model load failed', err)
    return false
  }
  baselineShoulderY = null
  baselineFrames = 0
  if (loopHandle === null) scheduleFrame()
  return true
}

export function stopPoseTracking(): void {
  if (loopHandle !== null) {
    cancelAnimationFrame(loopHandle)
    loopHandle = null
  }
  state.personVisible = false
  state.pose = 'idle'
}

function scheduleFrame(): void {
  loopHandle = requestAnimationFrame(processFrame)
}

function processFrame(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = (window as any).__cbCamera as HTMLVideoElement | undefined
  if (!poseLandmarker || !video || video.readyState < 2 || video.videoWidth === 0) {
    scheduleFrame()
    return
  }

  try {
    const result = poseLandmarker.detectForVideo(video, performance.now())
    const lm = result.landmarks?.[0] as Array<{ x: number; y: number; z: number }> | undefined

    if (lm && lm.length >= 28) {
      state.personVisible = true

      const lShoulder = lm[11], rShoulder = lm[12]
      const nose = lm[0]

      const shoulderY = (lShoulder.y + rShoulder.y) / 2
      const wristY = (lm[15].y + lm[16].y) / 2

      state.headY = nose.y
      state.shoulderY = shoulderY

      // Capture baseline over first ~30 frames (1 second at 30fps)
      if (baselineShoulderY === null) {
        baselineShoulderY = shoulderY
        baselineFrames = 1
      } else if (baselineFrames < 30) {
        baselineShoulderY = baselineShoulderY * 0.9 + shoulderY * 0.1
        baselineFrames++
      }

      // Classify: in normalized coords, y=0 is top, y=1 is bottom.
      // Jump: shoulders rise (y decreases from baseline by > 0.08)
      // Duck: shoulders drop (y increases from baseline by > 0.08) OR
      //       knees rise (knee y decreases significantly)
      const dy = shoulderY - (baselineShoulderY ?? shoulderY)

      if (dy < -0.06) {
        state.pose = 'jumping'
      } else if (dy > 0.06 || wristY > shoulderY + 0.15) {
        state.pose = 'ducking'
      } else {
        state.pose = 'idle'
      }
    } else {
      state.personVisible = false
      state.pose = 'idle'
    }
  } catch {
    // Frame errors are normal during transitions
  }

  scheduleFrame()
}

export function getPoseState(): Readonly<PoseState> {
  return state
}
