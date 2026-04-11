/**
 * Speech + Audio Input module.
 *
 * Wraps three browser-native APIs into a small, kid-friendly surface:
 *   - SpeechSynthesis     (text-to-speech)
 *   - SpeechRecognition   (speech-to-text, WebKit-prefixed in Safari)
 *   - getUserMedia + AnalyserNode  (live microphone volume)
 *
 * The state (mic stream, audio context, analyser) lives in the parent
 * window so block-generated code can hit it via `window.__speech` and
 * the microphone stays live across multiple runs — kids can build a
 * "clap to make the sprite jump" game without having to re-permission
 * on every click of Run.
 */

// -----------------------------------------------------------------------------
// Text-to-speech
// -----------------------------------------------------------------------------

/**
 * Speak the given text aloud. If `wait` is true, the promise resolves when
 * the utterance finishes; otherwise it resolves immediately and the speech
 * continues in the background.
 */
export function say(text: string, wait = false): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(String(text))
      if (wait) {
        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
      }
      window.speechSynthesis.speak(utterance)
      if (!wait) resolve()
    } catch {
      resolve()
    }
  })
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore — some browsers throw if there's nothing to cancel
    }
  }
}

// -----------------------------------------------------------------------------
// Speech recognition
// -----------------------------------------------------------------------------

type SpeechRecognitionCtor = new () => {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/**
 * Listen for a single utterance and return the transcript. Resolves with
 * an empty string if the API is unavailable, permission is denied, or the
 * user doesn't say anything.
 */
export function listen(): Promise<string> {
  const SR = getSpeechRecognitionCtor()
  if (!SR) return Promise.resolve('')

  return new Promise((resolve) => {
    let resolved = false
    const finish = (text: string) => {
      if (resolved) return
      resolved = true
      resolve(text)
    }

    let rec: InstanceType<SpeechRecognitionCtor>
    try {
      rec = new SR()
    } catch {
      finish('')
      return
    }

    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
      try {
        finish(e.results[0][0].transcript || '')
      } catch {
        finish('')
      }
    }
    rec.onerror = () => finish('')
    rec.onend = () => finish('')

    try {
      rec.start()
    } catch {
      finish('')
    }
  })
}

// -----------------------------------------------------------------------------
// Microphone volume
// -----------------------------------------------------------------------------

let micStream: MediaStream | null = null
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null

/**
 * Request microphone permission and start the analyser. Idempotent —
 * calling it after the mic is already live is a no-op and returns true.
 * Returns false if the user denies permission or the API is unavailable.
 */
export async function startMic(): Promise<boolean> {
  if (analyser) return true
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false
  }
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Some TypeScript dom libs don't know about webkitAudioContext
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return false
    audioCtx = new Ctx()
    const source = audioCtx.createMediaStreamSource(micStream)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    return true
  } catch {
    micStream = null
    audioCtx = null
    analyser = null
    return false
  }
}

export function stopMic(): void {
  if (micStream) {
    for (const track of micStream.getTracks()) track.stop()
    micStream = null
  }
  if (audioCtx) {
    try { audioCtx.close() } catch { /* ignore */ }
    audioCtx = null
  }
  analyser = null
}

/**
 * Current microphone volume on a 0–100 scale, based on RMS of the time-domain
 * samples. Returns 0 when the mic isn't running.
 */
export function getMicVolume(): number {
  if (!analyser) return 0
  const data = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteTimeDomainData(data)
  let sumSquares = 0
  for (let i = 0; i < data.length; i++) {
    const centered = (data[i] - 128) / 128
    sumSquares += centered * centered
  }
  const rms = Math.sqrt(sumSquares / data.length)
  // RMS is roughly 0..1 in practice for speech — scale to 0..100 and clamp.
  return Math.min(100, Math.max(0, Math.round(rms * 300)))
}

// -----------------------------------------------------------------------------
// Global installation — block-generated code calls `window.__speech.*`
// -----------------------------------------------------------------------------

export interface SpeechGlobal {
  say: (text: string, wait?: boolean) => Promise<void>
  stopSpeaking: () => void
  listen: () => Promise<string>
  startMic: () => Promise<boolean>
  stopMic: () => void
  getMicVolume: () => number
}

let globalInstalled = false

export function ensureSpeechGlobal(): void {
  if (globalInstalled) return
  const api: SpeechGlobal = {
    say,
    stopSpeaking,
    listen,
    startMic,
    stopMic,
    getMicVolume,
  }
  ;(window as unknown as { __speech: SpeechGlobal }).__speech = api
  globalInstalled = true
}
