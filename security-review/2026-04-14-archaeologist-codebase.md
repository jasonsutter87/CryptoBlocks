# Archaeologist Survey — Full Codebase

**Date:** 2026-04-13 (after hours)
**Scope:** `app/src/` full codebase — App.tsx, blocks, runner, toolbar, API client, Netlify functions
**Survival Score:** 4/10
**Verdict:** FRAGILE

---

## Will Survive

- **Block system** (`blocks/registry.ts`, `blocks/definitions/*.ts`) — clean, extensible, dumb-map pattern. Adding new blocks is mechanical.
- **Execution sandbox** — thoughtful. Iframe with CSP, Pyodide safety preamble, output capping, fallback strategy.
- **BlockDefinition** type with `implementations.javascript` / `implementations.python` is solid.

## At Risk / Critical Findings

### 1. App.tsx god component (TOP PRIORITY)

- **1,719 lines**, 44 `useState` calls, 60+ `useRef`/`useEffect`/`useCallback`
- Eight app modes tracked via union type
- Every new feature (daily challenges, collab, time travel, sprite editor, level editor) bolts onto the same function
- **Specific rot:** `handleRun` (lines 363-398) juggles 6 concerns — game loop cleanup, trace mode, HTML-vs-JS detection, live output streaming, canvas updates, code generation
- **Projection:** 3,000 lines by summer if unsplit

### 2. Unsigned JWT trust

- `verifyClerkToken` decodes JWT payload without verifying signature
- Falls back to calling Clerk API, but never validates the token is genuine
- Anyone can forge a JWT with arbitrary `sub` claim when `CLERK_SECRET_KEY` is unset
- **Fix:** verify signatures with Clerk's JWKS endpoint

### 3. `verifyClerkToken` duplicated 7×

- Identical function copy-pasted across 7 Netlify functions
- If one has a bug, all need fixing independently
- **Fix:** extract to `app/netlify/functions/_shared/auth.ts`

### 4. Direct execution for games bypasses sandbox

- `directExecution` uses `new Function()` in the parent window
- No sandbox at all — game blocks can access `document.cookie`, `localStorage`, full DOM
- Triggered by regex heuristic (`/__game/`) — a user writing `var mygame = 1` won't trigger; `refetch()` will

### 5. `/api/projects/my` is probably broken

- `clerkUser` is referenced but only defined inside POST handler
- Route likely throws at runtime

### 6. CDN dependency single points of failure

- Sandbox HTML loads `cdn.tailwindcss.com` — if CDN goes down, all HTML output breaks
- Pyodide pinned to `https://cdn.jsdelivr.net/pyodide/v0.27.5/full` — no fallback
- One CDN outage and Python execution dies

---

## Recommendations (ranked)

1. **Split App.tsx** — extract modes into route-level components or a state machine
2. **Verify JWT signatures** — use Clerk's JWKS endpoint
3. **Extract shared `verifyClerkToken`** — one source of truth
4. **Fix `/api/projects/my` `clerkUser` reference** — production bug
5. **CDN fallbacks** — self-host or bundle critical dependencies
6. **Schema-first runtime validation** — add Zod (in progress on `harden-v1`)
