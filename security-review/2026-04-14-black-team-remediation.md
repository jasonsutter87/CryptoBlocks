# Black Team Remediation — harden-v1

**Date:** 2026-04-14
**Branch:** `harden-v1`
**Trigger:** Black Team offensive sweep (Mr-BlackKeys lead, Specter, CashOut, Burn1t)
**Pre-remediation score:** 3 CRITICAL, 5 HIGH, 6 MEDIUM, 7 LOW (functional — no P0 incidents)
**Post-remediation status:** all CRITICAL + HIGH + all actionable MED/LOW closed; Purple Team re-verified

---

## CRITICAL — closed

### C1. Stripe webhook trusts `session.metadata.plan`
`stripe.mts` previously wrote `plan = session.metadata?.plan || 'pro'` on `checkout.session.completed`. Anyone able to cause a session to reach the webhook with `metadata.plan = 'teacher'` (including internal misuse and future dashboard tools) would get Teacher for the cost of Pro or less.

**Fix:** `resolvePlanFromSubscription()` reads `sub.items.data[].price.product` and compares to our `PRICES` config. Metadata is no longer a trust anchor anywhere in the webhook handler.

### C2. Webhook trusts `session.metadata.clerk_user_id`
Same handler used `session.metadata?.clerk_user_id` to decide which user row to upsert — any forged or mis-scoped session metadata could take over another user's subscription row.

**Fix:** `resolveClerkUserId()` looks up `subscriptions.stripe_customer_id → user_id` in our DB first. On a brand-new customer, falls back to `customers.metadata.clerk_user_id` — and we set that ourselves at `stripe.customers.create` time, so it is server-written, not client-supplied.

### C3. `subscription.updated / deleted` update was not customer-scoped
`UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?` would fire against *any* row with that subscription id — feasible because `stripe_subscription_id` had no UNIQUE constraint.

**Fix:** scope the UPDATE by `stripe_subscription_id AND stripe_customer_id`. A mismatched row is untouched.

### H1 / H2 — Sandbox escape → Clerk JWT exfiltration
The execution iframe used `allow-same-origin`, which places it in the parent's `localStorage` partition. Kid-authored shared-project code could read Clerk session tokens directly. Worse, the `directExecution` fallback ran any code containing the string `fetch(` in the **parent window**, with zero sandboxing.

**Fix (runner.ts):**
- Remove `allow-same-origin` from the sandbox iframe. Iframe origin is now literal `'null'`.
- Update postMessage origin check from `window.location.origin` to `'null'`.
- Delete `directExecution()` and the `needsDirectExec` regex shortcut entirely. Code that cannot run in the sandbox now errors out rather than escaping.
- Tighten the iframe CSP: `connect-src 'none'`.

**Known feature regressions** (authorized by product owner):
- `fetch()` and `WebSocket` from user code
- micro:bit BLE
- speech / vision / gamepad blocks
- Keyboard-driven games

These must be reimplemented via a postMessage-bridged capability API before they return.

---

## HIGH — closed

### H3. CORS `*` + `Authorization` allowed on every endpoint
Previously `Access-Control-Allow-Origin: *` with `Allow-Headers: Authorization`. Combined with any sandbox escape this was the cross-origin CSRF vector.

**Fix:** `_lib/http.ts` now reads `ALLOWED_ORIGINS` from env (defaults to `cryptoblocks.app` + localhost dev ports). Origin is captured per-invocation via `AsyncLocalStorage` (see `withRequest`) so every `json()` and `cors()` response echoes the *approved* origin only, with `Vary: Origin`. All 8 handler files wrap their default export with `withRequest()`.

### H4. Shareplace private-project listing with NULL `visibility`
Rows inserted before the `visibility` column existed were treated as public by the `IS NULL OR = 'public'` branch.

**Fix:** one-time `UPDATE projects SET visibility = 'public' WHERE visibility IS NULL` in the projects.mts migration; listing filter now `visibility = 'public'` only.

### H5. Join codes leaked to students; no rate limit on guesses
Every classroom member saw the 6-char join code in `GET /api/classrooms/:id`. Combined with a 10^9-code space and no rate limit, enumeration was feasible.

**Fix:** join code only returned to the teacher (checked by `c.teacher_id === user.sub`). `POST /api/classrooms/join` uses a `join_attempts` table: 10 failed guesses per rolling hour → 429. Counter resets on a successful match or window expiry.

---

## MEDIUM — closed

### M1. Admin analytics could OOM on malicious workspaces
`admin.mts /analytics` parsed up to 200 workspace JSON blobs with the schema-side 2MB cap — ~400MB plus recursion overhead per dashboard load.

**Fix:** SQL-level cap (`length(workspace_json) <= 256KB`) + existing `MAX_BLOCK_DEPTH = 50` recursion bound.

### M2. `ensureSchema` race on cold-start bursts
Parallel cold-started instances each issued their own `ALTER TABLE` / `CREATE TABLE IF NOT EXISTS`, swallowing real errors.

**Fix:** serialize per-process via `globalThis.__projectsMigrationPromise`. First request runs the migration; the rest `await` the same promise.

### M3. Teacher check + mutation was not transactional (TOCTOU)
`requireClassroomTeacher` verified ownership, then a separate `UPDATE` ran. If ownership flipped between the two, the wrong row could be written.

**Fix:** scope the UPDATE itself:
- classroom description: `... WHERE id = ? AND teacher_id = ?`
- submission feedback: `... WHERE id = ? AND assignment_id IN (SELECT id FROM assignments WHERE classroom_id = ?)` (submissions has no `classroom_id` column — Purple Team caught the initial fix and this is the corrected form).

### M4. Banned-word list bypassable by Unicode tricks
Regex matched only on lowercased raw text — `fｕck`, `f\u200buck`, and NFC/NFKC variants passed.

**Fix:** `normalize()` does NFKC folding + strips `\u200B..\u200D\uFEFF` before the word-boundary match.

### M5. Unlimited "student Pro" seats on a Teacher plan
A teacher could enroll any number of students; each got Pro as long as the teacher's subscription was active. The second line item's `quantity` was never incremented — direct revenue leak.

**Fix:** `stripe.mts /status` caps grants to the first `TEACHER_SEAT_LIMIT = 30` students per classroom via a `ROW_NUMBER() OVER (PARTITION BY classroom_id ORDER BY joined_at ASC)` CTE. Students beyond seat 30 stay free.

### M6. GitHub push `content` cap
Already capped at 1MB via `FileContent = z.string().max(1_000_000)` in the schema. No change needed.

---

## LOW — closed

### L1. Daily challenge `dayNumber` from client
`daily.mts /solve` accepted any `dayNumber` in the schema range — streak faking / leaderboard pollution.

**Fix:** compute `dayNumber` server-side from `Date.now()` against a fixed epoch (2024-01-01 UTC). Client value is ignored on the solve path.

### L4. JWT verification fell back to `keys[0]` on missing `kid`
A stale first-position JWK could verify old-signed tokens forever across Clerk rotations.

**Fix:** `auth.ts` rejects any JWT without a `kid` header.

### L5. No issuer binding
A token from another Clerk tenant (staging, a different project) signed by the same rotating JWKS endpoint would validate.

**Fix:** compare `payload.iss` to `process.env.CLERK_ISSUER` when set (no-op until the env var is configured).

### L6. Chat `after` cursor unbounded
`Number(after)` yielded `NaN` on garbage input and had no upper bound.

**Fix:** reject anything that's not an integer in `[0, Date.now()]`.

### L7. No FERPA consent on classroom export
The JSON export contained student work + chat history for former members with no privacy notice.

**Fix:** export payload now includes a `privacyNotice` string and an `exportedBy` record (who, when, from where).

---

## Env knobs required before prod deploy

| Variable | Purpose | Example |
|---|---|---|
| `ALLOWED_ORIGINS` | CORS allowlist | `https://cryptoblocks.app,https://www.cryptoblocks.app` |
| `CLERK_ISSUER` | JWT issuer binding | `https://clerk.cryptoblocks.app` (from Clerk dashboard) |
| `STRIPE_PRODUCT_ID` / `STRIPE_TEACHER_PRODUCT_ID` / `STRIPE_STUDENT_PRODUCT_ID` | Plan resolution anchors | `prod_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature check | `whsec_...` |

---

## Purple Team re-verification

All 16 findings verified closed. Two regressions caught in the first pass:
1. ❌→✅ Submissions UPDATE used non-existent `classroom_id` column — corrected to gate via assignments.
2. ⚠️→✅ `json()` responses omitted CORS headers in 136 call sites after the first CORS rewrite — fixed via `AsyncLocalStorage` capture and `withRequest` handler wrappers.

## Open items (deferred, non-security)

- `subscription.updated` does not re-resolve the plan. A user who upgrades Pro → Teacher through the Stripe portal stays labelled Pro in our DB until the next `checkout.session.completed`. Pre-existing; tracked separately.
- Two download endpoints still set `Access-Control-Allow-Origin: *` manually — intentional for public share links, but document the exception.

## Files touched

Backend:
- `app/netlify/functions/_lib/http.ts` (CORS, AsyncLocalStorage, `withRequest`)
- `app/netlify/functions/_lib/auth.ts` (kid required, issuer binding)
- `app/netlify/functions/_lib/moderation.ts` (NFKC, ZWJ strip)
- `app/netlify/functions/_lib/index.ts` (re-export `withRequest`)
- `app/netlify/functions/stripe.mts` (plan/user derivation, seat cap)
- `app/netlify/functions/classrooms.mts` (join code, rate limit, TOCTOU, cursor, privacy notice)
- `app/netlify/functions/projects.mts` (visibility cleanup, migration serialization)
- `app/netlify/functions/daily.mts` (server-side dayNumber)
- `app/netlify/functions/admin.mts` (workspace size cap)
- plus `withRequest` wrap in `github.mts`, `leaderboard.mts`, `notifications.mts`

Frontend:
- `app/src/execution/runner.ts` (sandbox lockdown)

## Commits

- `9a4d774` — Black Team remediation: Stripe trust, sandbox lockdown, CORS, more
- *(this session)* — Remaining M/L items + Purple Team regression fixes
