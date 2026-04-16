# Archaeologist Survey — Schema Foundation (harden-v1)

**Date:** 2026-04-14
**Scope:** `app/src/schema/` — Zod schema foundation on `harden-v1` branch
**Final Survival Score:** 9.7/10
**Verdict:** DURABLE

---

## Pipeline Progression

| Stage | Score | Tests | Notes |
|-------|-------|-------|-------|
| Initial build | — | 57 | Primitives, mixins, 13-table entity coverage |
| Harden pass | — | 76 | Control chars, dangerous protocols, JSON depth, pagination |
| DRY pass 1 | — | 76 | `bounded()` factory, shared refinements |
| DRY pass 2 | — | 76 | `AuthoredWithAvatar` mixin, `BlockCount`/`Counter`/`ExternalId` |
| DRY pass 3 | — | 76 | `PublishProjectInput` derived via `.omit().partial()`, input from entity |
| Archaeologist #1 | **8/10** | 76 | 5 findings flagged |
| Fixes applied | — | 84 | Inlined factory, `.strict()` everywhere, fast-fail, drift test |
| Archaeologist #2 | **9.5/10** | 84 | Omit list duplication flagged |
| Drift test fix | **9.7/10** | 84 | Bidirectional derivation |

---

## Archaeologist #1 — 8/10

**Will Survive:**
- Single-source bounds block at top of `primitives.ts`
- Mixins spread-as-const
- `schema.test.ts` is the documentation
- Control-char + protocol rejection in primitive layer

**At Risk:**
1. `bounded()` factory — clever, `ZodString | ZodEffects` union with `as` casts
2. `ColorString` regex bypassed `bounded()` — inconsistent
3. `PublishProjectInput` — `.omit().partial()` chain is fragile; Project field additions silently change the input contract
4. `Timestamp` capped at year 2100 — will bite a grandchild

**Netlify wiring concerns:**
- `WorkspaceJson` runs `JSON.parse` on every refinement — 2MB blob = CPU time bomb on Netlify's 10s limit
- `safeParse` errors may leak schema internals — must return generic `{ error: 'Invalid input' }`

---

## Archaeologist #2 — 9.5/10

Applied 5 fixes:
1. Inlined `bounded()` factory — 4 call sites with 3-line chains beat 20-line factory with type gymnastics
2. `ColorString` error message improved
3. All 11 `*Input` schemas now `.strict()` — reject unknown fields from clients
4. `WorkspaceJson` fast-fail first-char check before `JSON.parse`
5. New `WorkspaceJsonParsed` schema for already-parsed callers (no double-parse)
6. Drift-guard test for `PublishProjectInput`

**Remaining 0.2:**
- Drift-guard test had duplicated omit list — flagged for follow-up

---

## Archaeologist #3 — 9.7/10

**Fix:** Drift test now bidirectional:
- Every `Project` field must appear in `PublishProjectInput` OR the `SERVER_SET` allowlist
- Every `SERVER_SET` field must actually exist on `Project` (catches typos)

If either list drifts, the test fails with the specific field name.

**Remaining 0.3:**
- **0.2** — schema outliving Zod itself requires JSON Schema export (plain-spec fallback)
- **0.1** — zero abstractions would fight DRY

---

## Final State

- **84 tests passing**
- **13 tables covered** (Project, Classroom, ClassMember, Assignment, Submission, Discussion, Reply, ChatMessage, Notification, DailyScore, Subscription, FreeOverride, + PageParams)
- **All strings bounded**, control-char filtered, dangerous protocols blocked
- **All Input schemas `.strict()`**
- **Drift guard** prevents contract rot
- **Single-source bounds** at top of `primitives.ts`

---

## Commits (branch: `harden-v1`)

1. `32798db` — foundational Zod schema (57 tests)
2. `16262b1` — harden: control chars, protocols, JSON depth, pagination (76 tests)
3. `43953b3` — DRY x3: factory, mixins, derived inputs
4. `1e83387` — Archaeologist 8→9.5 fixes (84 tests)
5. `d84ec16` — bidirectional drift guard, 9.5→9.7
