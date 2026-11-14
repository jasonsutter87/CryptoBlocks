/**
 * Billing for CryptoBlocks: a thin layer over launchkit/billing (vendored, unchanged, in app/vendor/launchkit).
 *
 * - The user id is the billing org (CryptoBlocks has no orgs).
 * - Plans match by Stripe *product id*, so subscribers created from the old inline `price_data`
 *   (auto-generated prices) keep matching.
 * - Teacher = a base line item + a per-student seat line item ($3.50, stays at 0: per-student billing is off).
 * - `entitlements.onChange` mirrors plan/status into the `subscriptions` table, which `/api/stripe/status`
 *   and the admin dashboard still read.
 * - Who gets Pro through a teacher stays the SQL ranking in stripe.mts; billing only supplies the subscription.
 */

import { createBilling, createStripeRest } from '../../../vendor/launchkit/billing.js'
import { keyPart } from '../../../vendor/launchkit/store.js'
import { tursoExecute } from './turso.js'

/** The teacher plan includes this many students per classroom (and the seat line item is capped at it). */
export const TEACHER_SEAT_LIMIT = 30

export interface KV {
  get(k: string): Promise<any>
  set(k: string, v: unknown): Promise<void>
  del(k: string): Promise<void>
  list(prefix?: string): Promise<string[]>
}

/** launchkit's 4-method store over a Turso table. */
export function tursoStore(): KV {
  let ready: Promise<unknown> | null = null
  const init = () => (ready ??= tursoExecute(
    'CREATE TABLE IF NOT EXISTS billing_kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)',
  ).catch((e) => { ready = null; throw e }))
  return {
    async get(k) {
      await init()
      const r = await tursoExecute('SELECT v FROM billing_kv WHERE k = ?', [k])
      return r.rows.length ? JSON.parse(String(r.rows[0].v)) : null
    },
    async set(k, v) {
      await init()
      await tursoExecute(
        'INSERT INTO billing_kv (k, v) VALUES (?, ?) ON CONFLICT (k) DO UPDATE SET v = excluded.v',
        [k, JSON.stringify(v)],
      )
    },
    async del(k) {
      await init()
      await tursoExecute('DELETE FROM billing_kv WHERE k = ?', [k])
    },
    async list(prefix = '') {
      await init()
      const r = await tursoExecute('SELECT k FROM billing_kv WHERE substr(k, 1, ?) = ? ORDER BY k', [prefix.length, prefix])
      return r.rows.map((row) => String(row.k))
    },
  }
}

// ---- plans (env var names unchanged)
export function productIds() {
  return {
    pro: process.env.STRIPE_PRODUCT_ID || 'prod_UK2SC9xh2YTlMQ',
    teacher: process.env.STRIPE_TEACHER_PRODUCT_ID || 'prod_UKGdxapGBhJGfR',
    student: process.env.STRIPE_STUDENT_PRODUCT_ID || 'prod_UKGeLR2xlgPsqj',
  }
}

export function planConfig() {
  const p = productIds()
  return {
    pro: {
      productId: p.pro,
      inlinePrice: { currency: 'usd', unitAmount: 1000, interval: 'month', productId: p.pro },
    },
    teacher: {
      productId: p.teacher,
      lineItems: [
        { role: 'base', inlinePrice: { currency: 'usd', unitAmount: 2500, interval: 'month', productId: p.teacher } },
        // Starts at 0; setQuantity raises it as students join. Capped at the per-classroom limit.
        { role: 'seat', inlinePrice: { currency: 'usd', unitAmount: 350, interval: 'month', productId: p.student }, quantity: 0, max: TEACHER_SEAT_LIMIT },
      ],
    },
  }
}

// ---- mirror into the `subscriptions` table
async function mirrorSubscription(orgId: string, after: { plan: string | null; status: string }, store: KV) {
  const rec = await store.get(`orgs/${keyPart(orgId)}`)
  await tursoExecute(
    `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET status = excluded.status, plan = excluded.plan`,
    [orgId, rec?.customerId ?? '', rec?.subscriptionId ?? '', after.status, after.plan ?? 'pro', Date.now()],
  )
}

/** Copy the stripe ids onto the row once billing has recorded them (best effort: nothing reads them any more). */
export async function backfillIds(orgId: string, store: KV) {
  const rec = await store.get(`orgs/${keyPart(orgId)}`)
  if (!rec?.customerId || !rec?.subscriptionId) return
  await tursoExecute(
    'UPDATE subscriptions SET stripe_customer_id = ?, stripe_subscription_id = ? WHERE user_id = ?',
    [rec.customerId, rec.subscriptionId, orgId],
  )
}

export interface BuildOptions {
  store: KV
  stripe: unknown
  webhookSecret?: string | null
  now?: () => number
}

export function buildBilling({ store, stripe, webhookSecret, now }: BuildOptions) {
  return createBilling({
    store,
    stripe,
    plans: planConfig(),
    webhookSecret: webhookSecret ?? undefined,
    ...(now ? { now } : {}),
    entitlements: {
      onChange: async ({ orgId, after }: { orgId: string; after: { plan: string | null; status: string } }) => {
        await mirrorSubscription(orgId, after, store)
      },
    },
  })
}

export type Billing = ReturnType<typeof buildBilling>

// ---- migration of existing subscribers
const STATUS_MAP: Record<string, string> = {
  active: 'active', trialing: 'trialing', past_due: 'past_due', canceled: 'canceled',
  unpaid: 'canceled', paused: 'canceled', incomplete_expired: 'canceled', incomplete: 'none',
}

/**
 * Seed billing's store from the old `subscriptions` rows: org record (customer, subscription, plan, status) and
 * the customer -> user mapping. Stamp 0, so the next real event (renewal webhook) always applies. Idempotent:
 * an org billing already has is left alone, and a done-flag skips the scan afterwards.
 */
export async function migrateSubscriptions(store: KV): Promise<number> {
  if (await store.get('meta/migrated-subscriptions')) return 0
  const rows = await tursoExecute(
    'SELECT user_id, stripe_customer_id, stripe_subscription_id, status, plan FROM subscriptions',
  )
  let n = 0
  for (const r of rows.rows) {
    const userId = String(r.user_id)
    const sub = r.stripe_subscription_id ? String(r.stripe_subscription_id) : null
    const cus = r.stripe_customer_id ? String(r.stripe_customer_id) : null
    if (!sub || !cus) continue
    if (!(await store.get(`orgs/${keyPart(userId)}`))) {
      const plan = r.plan === 'teacher' ? 'teacher' : 'pro'
      await store.set(`orgs/${keyPart(userId)}`, {
        orgId: userId, customerId: cus, subscriptionId: sub, subCreated: null, plan,
        status: STATUS_MAP[String(r.status)] ?? 'canceled', seats: plan === 'teacher' ? 0 : null,
        currentPeriodEnd: null, cancelAtPeriodEnd: false, pastDueSince: null, stamp: 0,
      })
      n++
    }
    if (!(await store.get(`customers/${keyPart(cus)}`))) await store.set(`customers/${keyPart(cus)}`, userId)
  }
  await store.set('meta/migrated-subscriptions', { at: Date.now(), count: n })
  return n
}

// ---- teacher seats
/** Students who currently get Pro through this teacher: per classroom, the first TEACHER_SEAT_LIMIT by join time. */
export async function teacherSeatCount(teacherId: string): Promise<number> {
  const r = await tursoExecute(
    `WITH ranked AS (
       SELECT ROW_NUMBER() OVER (PARTITION BY cm.classroom_id ORDER BY cm.joined_at ASC) AS seat_no
       FROM class_members cm
       JOIN classrooms c ON cm.classroom_id = c.id
       WHERE c.teacher_id = ? AND cm.role = 'student'
     )
     SELECT COUNT(*) AS n FROM ranked WHERE seat_no <= ?`,
    [teacherId, TEACHER_SEAT_LIMIT],
  )
  return Number(r.rows[0]?.n ?? 0)
}

/**
 * NOT CALLED, on purpose. Per-student billing is available but off: the seat item stays at quantity 0, so
 * teachers pay only the $25 base, as before this refactor. To turn it on (a deliberate pricing change), call this
 * when students join/leave and after a teacher's checkout is confirmed.
 *
 * Make the Stripe seat item match the teacher's students. A no-op for anyone who is not on a live teacher plan.
 * Returns the seat count it set, or null when there was nothing to do.
 */
export async function syncTeacherSeats(billing: Billing, teacherId: string): Promise<number | null> {
  const st = await billing.status(teacherId)
  if (st.plan !== 'teacher' || !['active', 'trialing', 'past_due'].includes(st.status)) return null
  const n = await teacherSeatCount(teacherId)
  await billing.setQuantity(teacherId, 'seat', n)
  return n
}

// ---- the app's instance
let current: { billing: Billing; store: KV } | null = null
let migrated = false

/** For tests: use a billing built around a fake Stripe. */
export function setBilling(b: { billing: Billing; store: KV } | null) { current = b; migrated = false }

export async function getBilling(): Promise<Billing | null> {
  const ctx = await getBillingContext()
  return ctx?.billing ?? null
}

export async function getBillingContext(): Promise<{ billing: Billing; store: KV } | null> {
  if (!current) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) return null
    const store = tursoStore()
    current = {
      store,
      billing: buildBilling({
        store,
        stripe: createStripeRest({ secretKey, apiVersion: '2025-03-31.basil' }),
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      }),
    }
  }
  if (!migrated) { await migrateSubscriptions(current.store); migrated = true }
  return current
}
