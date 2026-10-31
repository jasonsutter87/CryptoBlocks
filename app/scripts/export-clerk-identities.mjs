#!/usr/bin/env node
/**
 * One-off: copy every Clerk user's verified email(s) and user id into Turso's
 * identity_links table, so a Gatekeep sign-in with the same verified email keeps
 * using the Clerk-era account id (see netlify/functions/_lib/gatekeep.ts).
 *
 *   node scripts/export-clerk-identities.mjs            # dry run: counts only
 *   node scripts/export-clerk-identities.mjs --apply    # write the links
 *
 * Needs CLERK_SECRET_KEY, TURSO_URL and TURSO_AUTH_TOKEN in the environment (the
 * site's own values, e.g. via `netlify dev:exec`). Prints counts, never emails.
 * Existing links are kept, never overwritten; safe to run again.
 */

const APPLY = process.argv.includes('--apply')
const { CLERK_SECRET_KEY, TURSO_URL, TURSO_AUTH_TOKEN } = process.env
if (!CLERK_SECRET_KEY || !TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error('Set CLERK_SECRET_KEY, TURSO_URL and TURSO_AUTH_TOKEN (e.g. run it with `netlify dev:exec`).')
  process.exit(2)
}

async function turso(statements) {
  const res = await fetch(`${TURSO_URL.replace('libsql://', 'https://')}/v3/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TURSO_AUTH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        ...statements.map(([sql, args = []]) => ({
          type: 'execute',
          stmt: { sql, args: args.map((a) => (typeof a === 'number' ? { type: 'integer', value: String(a) } : { type: 'text', value: String(a) })) },
        })),
        { type: 'close' },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const failed = data.results?.find((r) => r.type === 'error')
  if (failed) throw new Error(`Turso: ${failed.error?.message ?? 'statement failed'}`)
  return data.results
}

/** Every Clerk user, page by page. */
async function* clerkUsers() {
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`https://api.clerk.com/v1/users?limit=100&offset=${offset}&order_by=created_at`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` },
    })
    if (!res.ok) throw new Error(`Clerk HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const page = await res.json()
    const users = Array.isArray(page) ? page : page.data ?? []
    yield* users
    if (users.length < 100) return
  }
}

let users = 0
let noVerifiedEmail = 0
const links = new Map() // email -> clerk user id
const duplicates = new Set()
for await (const u of clerkUsers()) {
  users++
  const verified = (u.email_addresses ?? []).filter((e) => e.verification?.status === 'verified').map((e) => String(e.email_address).trim().toLowerCase())
  if (!verified.length) noVerifiedEmail++
  for (const email of verified) {
    if (links.has(email) && links.get(email) !== u.id) duplicates.add(email)
    else links.set(email, u.id)
  }
}
// An email on two Clerk accounts can't decide which one it means; leave those out.
for (const email of duplicates) links.delete(email)

console.log(`Clerk users: ${users}`)
console.log(`Verified emails to link: ${links.size}`)
console.log(`Users with no verified email (they'll start fresh on Gatekeep): ${noVerifiedEmail}`)
if (duplicates.size) console.log(`Emails on more than one Clerk account (skipped): ${duplicates.size}`)

if (!APPLY) {
  console.log('\nDry run: nothing written. Re-run with --apply to save the links.')
  process.exit(0)
}

await turso([[`CREATE TABLE IF NOT EXISTS identity_links (
  email TEXT PRIMARY KEY,
  legacy_sub TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'clerk',
  linked_at INTEGER NOT NULL
)`]])
const now = Date.now()
const entries = [...links]
for (let i = 0; i < entries.length; i += 50) {
  await turso(entries.slice(i, i + 50).map(([email, id]) => [
    "INSERT INTO identity_links (email, legacy_sub, source, linked_at) VALUES (?, ?, 'clerk', ?) ON CONFLICT(email) DO NOTHING",
    [email, id, now],
  ]))
}
const [count] = await turso([['SELECT COUNT(*) AS n FROM identity_links']])
console.log(`\nSaved. identity_links now holds ${count.response.result.rows[0][0].value} link(s).`)
