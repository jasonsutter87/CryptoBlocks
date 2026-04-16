/**
 * Dedup-aware merge for id-bearing arrays. Appends only entries from
 * `incoming` whose id is not already present in `existing`. Returns the
 * original array reference when there's nothing new (avoids a React
 * re-render from a fresh array allocation).
 */
export function mergeUnique<T extends { id: string }>(
  existing: T[],
  incoming: T[],
): T[] {
  const seen = new Set(existing.map((item) => item.id))
  const fresh = incoming.filter((item) => !seen.has(item.id))
  return fresh.length === 0 ? existing : [...existing, ...fresh]
}
