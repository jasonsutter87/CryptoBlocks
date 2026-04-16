/** Relative-time formatter ("just now", "5m ago", "3d ago"). */
export function formatAge(ts: number): string {
  const ms = Date.now() - Number(ts)
  if (ms < 60_000) return 'just now'
  const min = Math.floor(ms / 60_000)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}
