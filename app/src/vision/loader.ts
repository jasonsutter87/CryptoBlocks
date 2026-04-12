/**
 * Shared dynamic script loader for lazy-loading TensorFlow.js, MobileNet,
 * and the hand-pose-detection package from a CDN the first time a vision
 * block is used. Keeps the main bundle lean — no vision weights ship
 * unless a kid actually drags a vision block into their workspace.
 *
 * We cache `in-flight` promises by URL so repeated calls from multiple
 * vision blocks in a single run don't queue redundant network requests.
 */

const inflight = new Map<string, Promise<void>>()

export function loadScriptOnce(src: string): Promise<void> {
  const existing = inflight.get(src)
  if (existing) return existing

  // Script already resolved in a previous run → short-circuit.
  if (document.querySelector(`script[data-cb-vision-src="${src}"]`)) {
    return Promise.resolve()
  }

  const loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.cbVisionSrc = src
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error(`Vision: failed to load ${src} — check network/CSP`))
    document.head.appendChild(script)
  })

  inflight.set(src, loading)
  return loading
}
