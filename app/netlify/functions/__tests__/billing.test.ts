// @vitest-environment node
/**
 * Billing on launchkit/billing, end to end through the real handlers (stripe.mts, classrooms.mts), with
 * - a fake Stripe adapter (no network, no keys),
 * - real signed webhooks,
 * - a real SQLite database (in-memory libsql) behind tursoExecute, so the SQL that ranks students into
 *   teacher seats is the production SQL, not a stub.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient, type Client } from '@libsql/client'
import { signWebhook } from '../../../vendor/launchkit/billing.js'

process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
process.env.STRIPE_WEBHOOK_SECRET = `whsec_${'a'.repeat(32)}`
const SECRET = process.env.STRIPE_WEBHOOK_SECRET
const ORIGIN = 'https://cryptoblocks.test'

let db: Client
vi.mock('../_lib/turso.js', () => ({
  isTursoConfigured: () => true,
  tursoExecute: vi.fn(async (sql: string, args: unknown[] = []) => {
    const r = await db.execute({ sql, args: args as never })
    return { rows: r.rows.map((row) => ({ ...row })) }
  }),
}))

// Sign-in is covered by auth.test.ts; here the caller is named by a header.
vi.mock('../_lib/auth.js', async (orig) => ({
  ...(await orig<typeof import('../_lib/auth.js')>()),
  verifyFromRequest: async (req: Request) => {
    const sub = req.headers.get('x-test-user')
    return sub ? { sub, email: `${sub}@test.dev`, name: sub } : null
  },
}))

const { default: stripeHandler } = await import('../stripe.mts')
const { default: classroomsHandler } = await import('../classrooms.mts')
const { buildBilling, setBilling, tursoStore, migrateSubscriptions, teacherSeatCount } = await import('../_lib/billing.js')

// ---- fake Stripe adapter
const nowSec = () => Math.floor(Date.now() / 1000)
const PROD = { pro: 'prod_UK2SC9xh2YTlMQ', teacher: 'prod_UKGdxapGBhJGfR', student: 'prod_UKGeLR2xlgPsqj' }

interface Item { id: string; price: { id: string; product: string; recurring: object }; quantity: number }
interface RawSub { id: string; object: 'subscription'; customer: string; status: string; created: number; cancel_at_period_end: boolean; metadata: Record<string, string>; current_period_start: number; current_period_end: number; items: { data: Item[] } }

function fakeStripe() {
  const f = {
    calls: [] as Array<[string, ...unknown[]]>,
    subs: {} as Record<string, RawSub>,
    sessions: {} as Record<string, unknown>,
    n: 0,
    of: (name: string) => f.calls.filter((c) => c[0] === name),
    async createCheckoutSession(p: unknown, o: unknown) {
      f.calls.push(['createCheckoutSession', p, o])
      const id = `cs_${++f.n}`
      return { id, url: `https://checkout.stripe.test/${id}` }
    },
    async createPortalSession(p: unknown) { f.calls.push(['createPortalSession', p]); return { id: 'bps_1', url: 'https://billing.stripe.test/p/1' } },
    async retrieveSubscription(id: string) { f.calls.push(['retrieveSubscription', id]); return structuredClone(f.subs[id]) },
    async retrieveCheckoutSession(id: string) { f.calls.push(['retrieveCheckoutSession', id]); return structuredClone(f.sessions[id]) },
    async updateSubscription(id: string, params: { items: Array<{ id: string; quantity?: number }> }) {
      f.calls.push(['updateSubscription', id, params])
      for (const it of params.items) {
        const cur = f.subs[id].items.data.find((x) => x.id === it.id)
        if (cur && it.quantity !== undefined) cur.quantity = it.quantity
      }
      return f.subs[id]
    },
  }
  return f
}
type Fake = ReturnType<typeof fakeStripe>

/** A subscription as Stripe returns it. `auto` = created from inline price_data: price ids are auto-generated. */
function stripeSub(o: { id?: string; customer?: string; userId?: string; plan: 'pro' | 'teacher'; students?: number; status?: string; start?: number; auto?: string }): RawSub {
  const { id = 'sub_1', customer = 'cus_1', userId, plan, students = 0, status = 'active', start = nowSec(), auto = 'AUTO' } = o
  const rec = { interval: 'month', usage_type: 'licensed' }
  const items: Item[] = plan === 'teacher'
    ? [
        { id: 'si_base', price: { id: `price_${auto}_t`, product: PROD.teacher, recurring: rec }, quantity: 1 },
        { id: 'si_seat', price: { id: `price_${auto}_s`, product: PROD.student, recurring: rec }, quantity: students },
      ]
    : [{ id: 'si_pro', price: { id: `price_${auto}_p`, product: PROD.pro, recurring: rec }, quantity: 1 }]
  return {
    id, object: 'subscription', customer, status, created: nowSec() - 100, cancel_at_period_end: false,
    metadata: userId ? { orgId: userId } : {}, current_period_start: start, current_period_end: start + 30 * 86400, items: { data: items },
  }
}

// ---- harness
let stripe: Fake
let current: { billing: ReturnType<typeof buildBilling>; store: ReturnType<typeof tursoStore> }
let evt = 0
const store = () => tursoStore()

async function webhook(type: string, object: unknown, { id = `evt_${++evt}`, secret = SECRET } = {}) {
  const body = JSON.stringify({ id, object: 'event', type, created: nowSec(), data: { object } })
  const sig = await signWebhook(body, secret, nowSec())
  return stripeHandler(new Request(`${ORIGIN}/api/stripe/webhook`, { method: 'POST', headers: { 'stripe-signature': sig }, body }))
}
const api = (path: string, user: string | null, init: { method?: string; body?: unknown } = {}) =>
  new Request(`${ORIGIN}/api/stripe/${path}`, {
    method: init.method ?? 'GET',
    headers: { ...(user ? { 'x-test-user': user } : {}), 'content-type': 'application/json' },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  })
const status = async (user: string) => (await stripeHandler(api('status', user))).json() as Promise<{ isPro: boolean; plan: string }>
const join = (user: string, code: string) =>
  classroomsHandler(new Request(`${ORIGIN}/api/classrooms/join`, { method: 'POST', headers: { 'x-test-user': user, 'content-type': 'application/json' }, body: JSON.stringify({ code }) }))
const subRow = async (user: string) => (await db.execute({ sql: 'SELECT * FROM subscriptions WHERE user_id = ?', args: [user] })).rows[0]

/** A teacher with a live teacher plan, subscribed through the real checkout -> webhook path. */
async function subscribeTeacher(user = 'teacher_1') {
  const res = await stripeHandler(api('checkout', user, { method: 'POST', body: { plan: 'teacher' } }))
  expect(res.status).toBe(200)
  const sessionId = 'cs_1'
  stripe.subs.sub_1 = stripeSub({ plan: 'teacher', userId: user, students: 0 })
  stripe.sessions[sessionId] = { id: sessionId, mode: 'subscription', payment_status: 'paid', client_reference_id: user, customer: 'cus_1', subscription: 'sub_1', metadata: {} }
  const w = await webhook('checkout.session.completed', stripe.sessions[sessionId])
  expect(w.status).toBe(200)
  return sessionId
}

async function classroom(teacher: string, id = 'class_1', code = 'ABCDEF') {
  await db.execute({ sql: 'INSERT INTO classrooms (id, name, join_code, teacher_id, teacher_name, created_at) VALUES (?, ?, ?, ?, ?, ?)', args: [id, 'Period 1', code, teacher, teacher, 1] })
  await db.execute({ sql: "INSERT INTO class_members (classroom_id, user_id, user_name, user_avatar, role, joined_at) VALUES (?, ?, ?, '', 'teacher', 1)", args: [id, teacher, teacher] })
}
async function addStudents(id: string, from: number, to: number) {
  for (let i = from; i <= to; i++) {
    await db.execute({ sql: "INSERT INTO class_members (classroom_id, user_id, user_name, user_avatar, role, joined_at) VALUES (?, ?, ?, '', 'student', ?)", args: [id, `student_${i}`, `s${i}`, 1000 + i] })
  }
}

beforeEach(async () => { await reset() })

describe('checkout', () => {
  it('teacher checkout sends the base item and the per-student seat item (quantity 0), keeping prices and products', async () => {
    const res = await stripeHandler(api('checkout', 'teacher_1', { method: 'POST', body: { plan: 'teacher' } }))
    expect(res.status).toBe(200)
    expect((await res.json()).url).toBe('https://checkout.stripe.test/cs_1')
    const [, params] = stripe.of('createCheckoutSession')[0] as [string, Record<string, any>]
    expect(params.mode).toBe('subscription')
    expect(params.client_reference_id).toBe('teacher_1')
    expect(params.customer_email).toBe('teacher_1@test.dev')
    expect(params.line_items).toEqual([
      { price_data: { currency: 'usd', unit_amount: 2500, product: PROD.teacher, recurring: { interval: 'month' } }, quantity: 1 },
      { price_data: { currency: 'usd', unit_amount: 350, product: PROD.student, recurring: { interval: 'month' } }, quantity: 0 },
    ])
    expect(params.success_url).toBe(`${ORIGIN}/?upgraded=1&session_id={CHECKOUT_SESSION_ID}`)
    expect(params.cancel_url).toBe(`${ORIGIN}/?cancelled=1`)
  })

  it('pro checkout is one $10 item', async () => {
    await stripeHandler(api('checkout', 'pro_1', { method: 'POST', body: { plan: 'pro' } }))
    const [, params] = stripe.of('createCheckoutSession')[0] as [string, Record<string, any>]
    expect(params.line_items).toEqual([
      { price_data: { currency: 'usd', unit_amount: 1000, product: PROD.pro, recurring: { interval: 'month' } }, quantity: 1 },
    ])
  })

  it('needs sign-in', async () => {
    const res = await stripeHandler(api('checkout', null, { method: 'POST', body: { plan: 'pro' } }))
    expect(res.status).toBe(401)
    expect(stripe.calls).toHaveLength(0)
  })
})

describe('per-student billing is off: the seat item stays at 0', () => {
  it('students joining never touch the subscription; teachers keep paying only the base', async () => {
    await subscribeTeacher()
    await classroom('teacher_1')
    expect((await join('student_1', 'ABCDEF')).status).toBe(200)
    expect((await join('student_2', 'ABCDEF')).status).toBe(200)
    expect(stripe.of('updateSubscription')).toHaveLength(0)
    expect(stripe.subs.sub_1.items.data[1].quantity).toBe(0)
    const detail = await current.billing.status('teacher_1', { detail: true })
    expect(detail.seats).toBe(0)
    expect(detail.items.map((i: { role: string; quantity: number }) => [i.role, i.quantity])).toEqual([['base', 1], ['seat', 0]])
  })

  it('a teacher with no subscription costs nothing and changes nothing in Stripe', async () => {
    await classroom('free_teacher')
    expect((await join('student_1', 'ABCDEF')).status).toBe(200)
    expect(stripe.calls).toHaveLength(0)
  })

  it('the 30 cap holds in the Pro grant: the 31st student of a classroom gets no Pro, seat stays 0', async () => {
    await subscribeTeacher()
    await classroom('teacher_1')
    await addStudents('class_1', 1, 34)
    expect((await join('student_35', 'ABCDEF')).status).toBe(200)
    expect(stripe.of('updateSubscription')).toHaveLength(0)
    expect(await teacherSeatCount('teacher_1')).toBe(30)
    expect((await status('student_30')).isPro).toBe(true)
    expect(await status('student_31')).toEqual({ isPro: false, plan: 'free' })
    expect(await status('student_35')).toEqual({ isPro: false, plan: 'free' })
  })

  it('the seat line item stays in the plan with max 30 (available if per-student billing is switched on)', async () => {
    await subscribeTeacher()
    const r = await current.billing.setQuantity('teacher_1', 'seat', 45)
    expect(r.status.seats).toBe(30)
  })

  it('the cap is per classroom in the Pro grant: a second classroom has its own 30', async () => {
    await subscribeTeacher()
    await classroom('teacher_1', 'class_1', 'ABCDEF')
    await classroom('teacher_1', 'class_2', 'GHJKLM')
    await addStudents('class_2', 100, 101)
    expect(await teacherSeatCount('teacher_1')).toBe(2)
    expect((await status('student_100')).plan).toBe('student-via-teacher')
  })
})

describe('Pro reaches students as before', () => {
  it('student of an active teacher is Pro; the teacher plan itself is Pro; a Pro user\'s own classroom grants nothing', async () => {
    await subscribeTeacher()
    await classroom('teacher_1')
    await addStudents('class_1', 1, 2)
    expect(await status('teacher_1')).toEqual({ isPro: true, plan: 'teacher' })
    expect(await status('student_1')).toEqual({ isPro: true, plan: 'student-via-teacher' })
    expect(await status('nobody')).toEqual({ isPro: false, plan: 'free' })

    // a Pro (not teacher) subscriber with a classroom
    await stripeHandler(api('checkout', 'pro_1', { method: 'POST', body: { plan: 'pro' } }))
    stripe.subs.sub_9 = stripeSub({ id: 'sub_9', customer: 'cus_9', plan: 'pro', userId: 'pro_1' })
    await webhook('customer.subscription.created', stripe.subs.sub_9)
    expect(await status('pro_1')).toEqual({ isPro: true, plan: 'pro' })
    await classroom('pro_1', 'class_9', 'ZZZZZZ')
    await addStudents('class_9', 200, 200)
    expect(await status('student_200')).toEqual({ isPro: false, plan: 'free' })
  })

  it('admin-granted overrides still win, and a cancelled teacher\'s students lose Pro', async () => {
    await subscribeTeacher()
    await classroom('teacher_1')
    await addStudents('class_1', 1, 1)
    await db.execute({ sql: "INSERT INTO free_overrides (email, plan) VALUES ('student_1@test.dev', 'pro')" })
    expect(await status('student_1')).toMatchObject({ isPro: true, override: true })
    await db.execute({ sql: "DELETE FROM free_overrides" })
    stripe.subs.sub_1.status = 'canceled'
    await webhook('customer.subscription.deleted', stripe.subs.sub_1)
    expect(await status('student_1')).toEqual({ isPro: false, plan: 'free' })
    expect(await status('teacher_1')).toEqual({ isPro: false, plan: 'free' })
  })
})

describe('webhook', () => {
  it('a replayed webhook does nothing', async () => {
    await subscribeTeacher()
    const before = (await db.execute('SELECT * FROM billing_kv ORDER BY k')).rows.map((r) => [r.k, r.v])
    stripe.calls.length = 0

    stripe.subs.sub_1.status = 'past_due'
    const first = await webhook('customer.subscription.updated', stripe.subs.sub_1, { id: 'evt_dup' })
    expect(first.status).toBe(200)
    expect((await subRow('teacher_1')).status).toBe('past_due')
    const state = (await db.execute('SELECT * FROM billing_kv ORDER BY k')).rows.map((r) => [r.k, r.v])
    expect(state).not.toEqual(before)

    // Same event id again, while the world has moved on: nothing is applied.
    stripe.subs.sub_1.status = 'active'
    stripe.calls.length = 0
    const again = await webhook('customer.subscription.updated', stripe.subs.sub_1, { id: 'evt_dup' })
    expect(again.status).toBe(200)
    expect((await subRow('teacher_1')).status).toBe('past_due')
    expect((await db.execute('SELECT * FROM billing_kv ORDER BY k')).rows.map((r) => [r.k, r.v])).toEqual(state)
    expect(stripe.calls).toHaveLength(0)
  })

  it('a bad signature is rejected and applies nothing', async () => {
    const sub = stripeSub({ plan: 'teacher', userId: 'teacher_1' })
    stripe.subs.sub_1 = sub
    const wrongSecret = await webhook('customer.subscription.created', sub, { secret: `whsec_${'b'.repeat(32)}` })
    expect(wrongSecret.status).toBe(400)

    const body = JSON.stringify({ id: 'evt_x', object: 'event', type: 'customer.subscription.created', created: nowSec(), data: { object: sub } })
    const good = await signWebhook(body, SECRET, nowSec())
    const tampered = await stripeHandler(new Request(`${ORIGIN}/api/stripe/webhook`, { method: 'POST', headers: { 'stripe-signature': good }, body: body.replace('teacher_1', 'teacher_2') }))
    expect(tampered.status).toBe(400)
    const missing = await stripeHandler(new Request(`${ORIGIN}/api/stripe/webhook`, { method: 'POST', body }))
    expect(missing.status).toBe(400)

    expect(await subRow('teacher_1')).toBeUndefined()
    expect(stripe.calls).toHaveLength(0)
  })

  it('sync (confirm on the return page) and the webhook converge, in either order', async () => {
    const run = async (order: 'webhook-first' | 'confirm-first') => {
      await reset()
      await stripeHandler(api('checkout', 'teacher_1', { method: 'POST', body: { plan: 'teacher' } }))
      stripe.subs.sub_1 = stripeSub({ plan: 'teacher', userId: 'teacher_1', students: 0 })
      const session = { id: 'cs_1', mode: 'subscription', payment_status: 'paid', client_reference_id: 'teacher_1', customer: 'cus_1', subscription: 'sub_1', metadata: {} }
      stripe.sessions.cs_1 = session
      const confirm = () => stripeHandler(api('confirm', 'teacher_1', { method: 'POST', body: { sessionId: 'cs_1' } }))
      if (order === 'webhook-first') { await webhook('checkout.session.completed', session); expect((await confirm()).status).toBe(200) }
      else { expect((await confirm()).status).toBe(200); await webhook('checkout.session.completed', session) }
      await webhook('customer.subscription.created', stripe.subs.sub_1)
      await confirm()
      const billing = current.billing
      return { row: await subRow('teacher_1'), status: await billing.status('teacher_1', { detail: true }), pro: await status('teacher_1') }
    }
    const a = await run('webhook-first')
    const b = await run('confirm-first')
    expect(a.row).toMatchObject({ status: 'active', plan: 'teacher', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1' })
    expect({ ...a.row, created_at: 0 }).toEqual({ ...b.row, created_at: 0 })
    expect(a.status).toEqual(b.status)
    expect(a.pro).toEqual({ isPro: true, plan: 'teacher' })
    expect(b.pro).toEqual(a.pro)
  })

  it("confirm refuses another user's checkout session", async () => {
    await stripeHandler(api('checkout', 'teacher_1', { method: 'POST', body: { plan: 'teacher' } }))
    stripe.sessions.cs_1 = { id: 'cs_1', mode: 'subscription', payment_status: 'paid', client_reference_id: 'teacher_1', customer: 'cus_1', subscription: 'sub_1', metadata: {} }
    stripe.subs.sub_1 = stripeSub({ plan: 'teacher', userId: 'teacher_1' })
    const res = await stripeHandler(api('confirm', 'someone_else', { method: 'POST', body: { sessionId: 'cs_1' } }))
    expect(res.status).toBe(404)
    expect(await subRow('someone_else')).toBeUndefined()
  })
})

describe('existing subscribers (migration)', () => {
  /** Rows as the old code left them: ids and status from the old webhook, no billing_kv at all. */
  async function oldSubscriber(user: string, plan: 'pro' | 'teacher', cus: string, sub: string, st = 'active') {
    await db.execute({ sql: 'INSERT INTO subscriptions VALUES (?, ?, ?, ?, ?, ?)', args: [user, cus, sub, st, plan, 1] })
  }
  const fresh = () => { const kv = store(); current = { store: kv, billing: buildBilling({ store: kv, stripe, webhookSecret: SECRET }) }; setBilling(current); return kv }

  it('moves subscriptions rows into the billing store once, and again does nothing', async () => {
    await oldSubscriber('old_teacher', 'teacher', 'cus_old', 'sub_old')
    await oldSubscriber('old_pro', 'pro', 'cus_oldp', 'sub_oldp', 'canceled')
    await db.execute({ sql: "INSERT INTO subscriptions VALUES ('no_stripe', NULL, NULL, 'active', 'pro', 1)" })
    const kv = fresh()
    expect(await migrateSubscriptions(kv)).toBe(2)
    expect(await kv.get('orgs/old_teacher')).toMatchObject({ customerId: 'cus_old', subscriptionId: 'sub_old', plan: 'teacher', status: 'active', stamp: 0 })
    expect(await kv.get('orgs/old_pro')).toMatchObject({ plan: 'pro', status: 'canceled' })
    expect(await kv.get('customers/cus_old')).toBe('old_teacher')
    expect(await kv.get('orgs/no_stripe')).toBeNull()
    expect(await migrateSubscriptions(kv)).toBe(0)
  })

  it('a teacher on auto-generated inline prices still matches by productId, and the next renewal webhook applies', async () => {
    await oldSubscriber('old_teacher', 'teacher', 'cus_old', 'sub_old')
    await classroom('old_teacher')
    await addStudents('class_1', 1, 3)
    // What Stripe really has: price ids Stripe made up from price_data, plus the seat item at 3
    const start = nowSec()
    stripe.subs.sub_old = stripeSub({ id: 'sub_old', customer: 'cus_old', plan: 'teacher', students: 3, auto: 'Qx9AutoGenerated', start })
    // (no metadata.orgId: old checkouts did not set it, the customer mapping must do the work)
    fresh()

    // Renewal: Stripe sends invoice.paid, then the updated subscription (new period)
    const renew = start + 30 * 86400
    stripe.subs.sub_old.current_period_start = renew
    stripe.subs.sub_old.current_period_end = renew + 30 * 86400
    const paid = await webhook('invoice.paid', { id: 'in_1', customer: 'cus_old', subscription: 'sub_old' })
    expect(paid.status).toBe(200)
    const billing = current.billing
    const st = await billing.status('old_teacher', { detail: true })
    expect(st).toMatchObject({ plan: 'teacher', status: 'active', seats: 3, currentPeriodEnd: (renew + 30 * 86400) * 1000 })
    expect(st.items.map((i: { role: string }) => i.role)).toEqual(['base', 'seat'])
    expect(await subRow('old_teacher')).toMatchObject({ status: 'active', plan: 'teacher', stripe_customer_id: 'cus_old' })

    // Later: the card fails, then the subscription is deleted. Both apply to the same user.
    stripe.subs.sub_old.status = 'past_due'
    await webhook('invoice.payment_failed', { id: 'in_2', customer: 'cus_old', subscription: 'sub_old' })
    expect((await subRow('old_teacher')).status).toBe('past_due')
    stripe.subs.sub_old.status = 'canceled'
    await webhook('customer.subscription.deleted', stripe.subs.sub_old)
    expect((await subRow('old_teacher')).status).toBe('canceled')
    // seat quantity was never pushed back at Stripe on the way (3 already matched)
    expect(stripe.of('updateSubscription')).toHaveLength(0)
  })

  it('a Pro subscriber on an auto-generated price matches by productId and the renewal applies', async () => {
    await oldSubscriber('old_pro', 'pro', 'cus_p', 'sub_p')
    stripe.subs.sub_p = stripeSub({ id: 'sub_p', customer: 'cus_p', plan: 'pro', auto: 'ProAuto' })
    fresh()
    stripe.subs.sub_p.status = 'past_due'
    expect((await webhook('customer.subscription.updated', stripe.subs.sub_p)).status).toBe(200)
    expect(await subRow('old_pro')).toMatchObject({ status: 'past_due', plan: 'pro' })
    stripe.subs.sub_p.status = 'active'
    await webhook('invoice.paid', { id: 'in_3', customer: 'cus_p', subscription: 'sub_p' })
    expect(await subRow('old_pro')).toMatchObject({ status: 'active', plan: 'pro' })
    expect(await status('old_pro')).toEqual({ isPro: true, plan: 'pro' })
  })

  it('portal and checkout work for a migrated customer (reuses their Stripe customer, blocks a second subscription)', async () => {
    await oldSubscriber('old_pro', 'pro', 'cus_p', 'sub_p')
    fresh()
    const portal = await stripeHandler(api('portal', 'old_pro', { method: 'POST' }))
    expect(portal.status).toBe(200)
    expect(stripe.of('createPortalSession')[0][1]).toMatchObject({ customer: 'cus_p', return_url: `${ORIGIN}/profile` })
    const again = await stripeHandler(api('checkout', 'old_pro', { method: 'POST', body: { plan: 'pro' } }))
    expect(again.status).toBe(409)
    // a user who never subscribed has no portal
    expect((await stripeHandler(api('portal', 'never_paid', { method: 'POST' }))).status).toBe(404)
  })
})

async function reset() {
  db = createClient({ url: ':memory:' })
  await db.executeMultiple(`
    CREATE TABLE subscriptions (user_id TEXT PRIMARY KEY, stripe_customer_id TEXT, stripe_subscription_id TEXT, status TEXT, plan TEXT, created_at INTEGER);
    CREATE TABLE free_overrides (email TEXT PRIMARY KEY, plan TEXT);
    CREATE TABLE classrooms (id TEXT PRIMARY KEY, name TEXT, join_code TEXT, teacher_id TEXT, teacher_name TEXT, description TEXT, created_at INTEGER);
    CREATE TABLE class_members (classroom_id TEXT, user_id TEXT, user_name TEXT, user_avatar TEXT, role TEXT, joined_at INTEGER);
  `)
  stripe = fakeStripe()
  evt = 0
  const kv = store()
  current = { store: kv, billing: buildBilling({ store: kv, stripe, webhookSecret: SECRET }) }
  setBilling(current)
}
