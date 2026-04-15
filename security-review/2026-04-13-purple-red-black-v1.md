# Security Review — Purple/Red/Black Team v1 (Live Codebase)

**Date:** 2026-04-13
**Scope:** CryptoBlocks production code (main branch)
**Result:** 4 vulnerabilities fixed (1 CRITICAL)

---

## Purple Team — Prevention

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 1 | SQL injection pattern in `admin.mts` — table name interpolated via template literal | Medium | Quoted identifier with double-quote escaping + Set-based allowlist |
| 2 | IDOR: `GET /api/projects/:id` exposed private projects to anyone with UUID | High | Private projects return 404 unless viewer is owner |
| 3 | IDOR: `DELETE /api/projects/:id` allowed any auth user to delete in dev mode | High | Non-admins can only delete their own projects |
| 4 | Download count inflation — `POST /api/projects/:id/download` has no auth/rate limit | Low | Documented, accepted risk (low-friction design) |

## Red Team — Verification

All Purple fixes verified. Documented accepted risks:
- Sandbox iframe uses `allow-same-origin` (required for fetch/WebSocket/camera) — mitigated by CSP
- Download count no auth (low-friction design)
- Daily challenge block count is client-reported (can't verify server-side)
- Like dedup not enforced

## Black Team — Offensive

### CRITICAL: Stripe webhook signature bypass

The `/api/stripe/webhook` endpoint accepted unsigned payloads when `STRIPE_WEBHOOK_SECRET` was not set, allowing anyone to POST fake `checkout.session.completed` events and grant themselves a paid subscription.

**Fix:** webhook now REQUIRES both `stripe-signature` header and `STRIPE_WEBHOOK_SECRET`. Returns 400 if either is missing. No fallback to unsigned `JSON.parse`.

### Accepted Risks

- `directExecution` fallback runs user code in main context (required for hardware blocks)
- `allow-same-origin` on sandbox iframe (required for fetch/camera/WebSocket, mitigated by CSP)

---

## Commits

- `d380ffb` — Purple Team fixes
- `d5eec46` — Red Team verification
- `51e906f` — Black Team CRITICAL Stripe fix
