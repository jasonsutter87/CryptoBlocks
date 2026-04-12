/**
 * MobileNet image classification.
 *
 * Lazy-loads TF.js + the MobileNet wrapper from jsDelivr the first time
 * a classification is requested, then caches both the model and the
 * most recent prediction so synchronous "last label / last confidence"
 * read blocks can return instantly.
 */

import { loadScriptOnce } from './loader'

const TFJS_CDN = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js'
const MOBILENET_CDN =
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MobileNetModel = { classify: (input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => Promise<Array<{ className: string; probability: number }>> }

let modelPromise: Promise<MobileNetModel> | null = null

/** One-shot lazy init of the MobileNet model. Subsequent calls return the cached promise. */
function getModel(): Promise<MobileNetModel> {
  if (modelPromise) return modelPromise
  modelPromise = (async () => {
    await loadScriptOnce(TFJS_CDN)
    await loadScriptOnce(MOBILENET_CDN)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mobilenet = (window as any).mobilenet
    if (!mobilenet) throw new Error('MobileNet failed to initialize')
    const model = await mobilenet.load()
    return model as MobileNetModel
  })()
  // If the promise rejects we want to allow retry on next call
  modelPromise.catch(() => {
    modelPromise = null
  })
  return modelPromise
}

export interface ClassificationResult {
  label: string
  confidence: number
}

const latest: ClassificationResult = { label: '', confidence: 0 }

/**
 * Classify an HTMLImageElement / HTMLVideoElement / HTMLCanvasElement
 * using MobileNet. Returns the top prediction and caches it for the
 * synchronous "last label" blocks.
 */
async function classifyElement(
  element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<ClassificationResult> {
  try {
    const model = await getModel()
    const predictions = await model.classify(element)
    if (predictions.length === 0) {
      latest.label = 'unknown'
      latest.confidence = 0
    } else {
      // MobileNet returns labels like "golden retriever, Canis familiaris"
      // — take just the first part for kid-friendly output.
      latest.label = String(predictions[0].className).split(',')[0].trim()
      latest.confidence = Math.round(predictions[0].probability * 100) / 100
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[vision] classify failed', err)
    latest.label = 'error'
    latest.confidence = 0
  }
  return { ...latest }
}

/** Classify the current frame of the CryptoBlocks camera. */
export async function classifyCamera(): Promise<ClassificationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = (window as any).__cbCamera as HTMLVideoElement | undefined
  if (!video) {
    return { label: 'no camera — call "start camera" first', confidence: 0 }
  }
  if (video.readyState < 2 || video.videoWidth === 0) {
    return { label: 'camera not ready', confidence: 0 }
  }
  return classifyElement(video)
}

/** Classify an image fetched by URL. */
export async function classifyUrl(url: string): Promise<ClassificationResult> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('image failed to load'))
      img.src = url
    })
    return classifyElement(img)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[vision] classifyUrl failed', err)
    return { label: 'error', confidence: 0 }
  }
}

export function getLatestClassification(): Readonly<ClassificationResult> {
  return latest
}
