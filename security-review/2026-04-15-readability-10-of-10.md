# Readability Roadmap — 7.5 → 10/10

**Date:** 2026-04-15
**Branch:** `harden-v1`
**Premise:** the 2029-dev walking into this codebase cold. How many seconds of
confusion before they can ship their first change?

Current state: **7.5/10**. Schema + API + tabs + small hooks are great. What
drags the score down is captured below, ranked by leverage.

---

## Blockers to 10/10

### 1. App.tsx is still 1478 lines — split the modal layer
**Why it hurts:** the root of the app is the file every new contributor opens
first. 25 `useState`, 40 `useCallback`, 250 lines of modal JSX makes the whole
thing feel load-bearing. Nobody touches it without fear.

**Fix:**
- Extract `<ModalLayer>` that takes a single `modals` prop bag (or registers
  via a `useModalRegistry` hook) — drops ~250 lines.
- Group the 25 states by concern into a couple of custom hooks
  (`useSandboxState`, `useModeState`). App.tsx becomes the composition layer,
  not the state store.

**Target:** App.tsx < 700 lines.

---

### 2. Rename "Black Team C1" / "Purple Team A3" comments to intent
**Why it hurts:** these names are agent references from April 2026 that mean
nothing to a 2029 reader. The *intent* survives but the naming becomes
cryptic.

**Fix:** sweep every comment that references an agent finding by code and
rewrite to describe the attack or invariant. Keep the code anchor as a
one-line parenthetical if we want traceability: `(historic finding: forged
webhook metadata)` instead of `(Black Team C1)`.

**Files:** `runner.ts`, `stripe.mts`, `classrooms.mts`, `daily.mts`,
`admin.mts`, `auth.ts`, `moderation.ts`, `projects.mts`, `http.ts`,
`useExecution.ts`, `modeWorkspace.ts`, `ChatTab.tsx`.

---

### 3. No `.env.example` — hidden dependencies
**Why it hurts:** `ALLOWED_ORIGINS`, `CLERK_ISSUER`, `STRIPE_*`,
`CLERK_JWKS_URL`, `CLERK_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_EMAILS`, `NODE_ENV`,
`CLERK_ALLOW_UNSIGNED` — unset means different behavior, often silently.
2029-dev clones the repo, runs it, nothing works, nothing tells them why.

**Fix:** `app/.env.example` with every required var, its purpose, example
value format, and the failure mode when unset.

---

### 4. Tailwind color hex zoo → theme tokens
**Why it hurts:** `bg-[#89b4fa]`, `text-[#cdd6f4]`, `border-[#313244]`
repeated across 60+ files. Rebrand = search-and-replace nightmare. Catppuccin
Mocha palette is used but the *names* (crust, mantle, surface0, blue, peach)
aren't in the codebase.

**Fix:** `tailwind.config.ts` theme extension with semantic names:
```
colors: {
  bg: { base: '#1e1e2e', surface: '#181825', elevated: '#313244' },
  text: { primary: '#cdd6f4', muted: '#6c7086' },
  accent: { primary: '#89b4fa', success: '#a6e3a1', warn: '#f9e2af', danger: '#f38ba8' },
}
```
Then codemod existing classes. Instant design-system legibility.

---

### 5. Zero tests for the new hooks/components
**Why it hurts:** `useExecution`'s abort-before-run invariant is load-bearing
for sandbox safety. `modeWorkspace.snapshotSandbox` decides whether the
user's unsaved work survives a mode switch. `ChatTab`'s mergeUnique dedup
prevents duplicate messages. 2029-dev edits any of these and has no
guardrails.

**Fix:** `tests/hooks.test.ts` with at minimum:
- `useExecution`: calling `run()` twice in a row aborts the first
- `useExecution`: `finish()` flips `isRunning` false and publishes the result
- `modeWorkspace.snapshotSandbox` returns null when not in sandbox
- `ChatTab.mergeUnique` dedups by id (pull out as a pure helper first)

Target: ~50 tests covering the new surface.

---

### 6. Silent `.catch(() => {})` everywhere
**Why it hurts:** `ensureSchema` swallows every DB error. A real migration
failure in production just disappears. 2029-dev debugs for an hour.

**Fix:** replace every `.catch(() => {})` with `.catch((err) => logError(scope, err))`.
The error stays non-fatal but is observable.

**Files:** `projects.mts` (migration), `notifications.ts` (createNotification
already uses logError — good), and any others.

---

### 7. Giant inline HTML template in runner.ts
**Why it hurts:** 60-line backtick string that mixes CSP meta tag, sandbox
preamble, user-code wrapper, and postMessage bridge. Changing any one thing
requires parsing the whole template in your head.

**Fix:** split into constants:
```
const IFRAME_CSP = `default-src 'none'; script-src ...`
const IFRAME_PREAMBLE = `var __sendMsg = ...`
const IFRAME_USER_CODE_WRAPPER = (encoded: string) => `...`
const buildIframeHtml = (code: string) => `...`
```
Each piece is self-documenting by name.

---

### 8. `globalThis.__projectsMigrated` — confusing side effect
**Why it hurts:** module-level mutable global that 2029-dev unfamiliar with
serverless cold-start patterns will stare at.

**Fix:** move to an explicit module-level variable with a comment:
```ts
// Per-instance cache: true once ensureSchema has completed on THIS Netlify
// function instance. Reset implicitly when the instance cold-starts.
let migrated = false
let migrating: Promise<void> | null = null
```
Drop the `globalThis` augmentation. Same behavior, no global weirdness.

---

### 9. `AppMode` string union scattered everywhere
**Why it hurts:** 9 string literals (`'sandbox'`, `'challenges'`,
`'active-challenge'`, `'blocksets'`, ...) referenced in dozens of places.
Renaming a mode = dangerous.

**Fix:** `app/src/types/appMode.ts` with:
```ts
export const APP_MODES = ['sandbox', 'challenges', 'active-challenge', ...] as const
export type AppMode = typeof APP_MODES[number]
export const isActiveMode = (m: AppMode): boolean => m.startsWith('active-')
```
Then `import { AppMode, isActiveMode } from '@/types/appMode'` everywhere.
Compiler catches typos, rename is one edit.

---

### 10. Toolbar's 4 inline dropdown menus
**Why it hurts:** ~200 lines each, copy-pasted button shape, menu items
mixed with gating logic. Adding a menu item means reading all 4 menus to
find where.

**Fix:** data-driven. Each menu is an array:
```ts
const FILE_MENU: MenuItem[] = [
  { icon: 'download', color: 'accent-primary', label: 'Save .blocks', onClick: onExport, requiresAuth: true },
  ...
]
<DropdownMenu items={FILE_MENU} open={openMenu === 'file'} onClose={...} />
```
Adding an item is one line. Gating logic is a property, not a JSX wrapper.

**Target:** Toolbar.tsx < 350 lines.

---

## Non-blockers (nice-to-have, < 1% each)

- ESLint rule that bans `.catch(() => {})` — prevents regression of #6.
- Prettier auto-run on commit via a lightweight pre-commit hook.
- `CONTRIBUTING.md` — where to add a new block, a new game mode, a new API
  endpoint. Five paragraphs.
- Per-file header comment where missing (current coverage is ~70%).

---

## Effort estimate

| Item | Hours | Impact |
|---|---|---|
| 1. App.tsx modal split | 2 | HUGE |
| 2. Comment sweep | 1 | MEDIUM |
| 3. `.env.example` | 0.5 | HIGH |
| 4. Tailwind tokens + codemod | 2 | HIGH |
| 5. Hook tests | 2 | HIGH (safety net) |
| 6. Silent catch audit | 0.5 | MEDIUM |
| 7. runner.ts template split | 0.75 | MEDIUM |
| 8. `globalThis` cleanup | 0.25 | LOW |
| 9. AppMode module | 0.5 | MEDIUM |
| 10. Toolbar dropdowns | 2 | HUGE |
| **Total** | **~11.5 hours** | **7.5 → 10.0** |

Can be done in one dedicated session or spread across a week of pre-PR
polishing.

## How to confirm 10/10 when done

Re-run the Archaeologist on the frontend. The score to beat: 9.7 TIMELESS
(schema layer's current mark). 10/10 is an aspirational ceiling — anything
9.5+ on the rubric is "this codebase will survive the next rewrite cycle."
