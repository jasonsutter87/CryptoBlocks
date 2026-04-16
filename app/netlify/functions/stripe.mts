/**
 * Netlify Function — Stripe billing.
 *
 * POST /api/stripe/checkout   → create a Checkout Session (auth required)
 * POST /api/stripe/portal     → create a Customer Portal session (manage sub)
 * GET  /api/stripe/status     → check if current user has an active subscription
 * POST /api/stripe/webhook    → Stripe webhook for subscription events (signed)
 */

import Stripe from 'stripe'
import {
  json, cors, logError, withRequest, parsePath, verifyFromRequest, tursoExecute,
  requireAuth,
} from './_lib/index.js'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
})

const CheckoutInput = z.object({
  plan: z.enum(['pro', 'teacher']).default('pro'),
}).strict()

// Centralized price config — single source for product IDs and amounts
const PRICES = {
  pro: {
    product: process.env.STRIPE_PRODUCT_ID || 'prod_UK2SC9xh2YTlMQ',
    unitAmount: 1000,
  },
  teacher: {
    product: process.env.STRIPE_TEACHER_PRODUCT_ID || 'prod_UKGdxapGBhJGfR',
    unitAmount: 2500,
  },
  student: {
    product: process.env.STRIPE_STUDENT_PRODUCT_ID || 'prod_UKGeLR2xlgPsqj',
    unitAmount: 350,
  },
} as const

function buildLineItems(plan: 'pro' | 'teacher') {
  if (plan === 'teacher') {
    return [
      {
        price_data: {
          currency: 'usd', product: PRICES.teacher.product,
          recurring: { interval: 'month' }, unit_amount: PRICES.teacher.unitAmount,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd', product: PRICES.student.product,
          recurring: { interval: 'month' }, unit_amount: PRICES.student.unitAmount,
        },
        quantity: 0, // starts at 0, incremented as students join
      },
    ]
  }
  return [{
    price_data: {
      currency: 'usd', product: PRICES.pro.product,
      recurring: { interval: 'month' }, unit_amount: PRICES.pro.unitAmount,
    },
    quantity: 1,
  }]
}

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors()

  const segments = parsePath(req, 'stripe')

  try {
    if (!process.env.STRIPE_SECRET_KEY) return json({ error: 'Stripe not configured' }, 500)

    const user = await verifyFromRequest(req)
    const url = new URL(req.url)

    // POST /api/stripe/checkout — create Checkout Session
    if (req.method === 'POST' && segments[0] === 'checkout') {
      const authErr = requireAuth(user, 'Sign in to upgrade')
      if (authErr) return authErr

      const raw = await req.json().catch(() => null)
      const parsed = CheckoutInput.safeParse(raw)
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)
      const { plan } = parsed.data

      // Find or create Stripe customer (idempotent on user.sub)
      let customerId: string
      const existing = await tursoExecute(
        'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
        [user!.sub],
      )
      if (existing.rows.length > 0 && existing.rows[0].stripe_customer_id) {
        customerId = String(existing.rows[0].stripe_customer_id)
      } else {
        const customer = await stripe.customers.create({
          metadata: { clerk_user_id: user!.sub },
          email: user!.email || undefined,
          name: user!.name || undefined,
        })
        customerId = customer.id
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: buildLineItems(plan),
        success_url: `${url.origin}/?upgraded=1`,
        cancel_url: `${url.origin}/?cancelled=1`,
        metadata: { clerk_user_id: user!.sub, plan },
      })

      return json({ url: session.url })
    }

    // POST /api/stripe/portal — Customer Portal for managing subscription
    if (req.method === 'POST' && segments[0] === 'portal') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const sub = await tursoExecute(
        'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
        [user!.sub],
      )
      if (sub.rows.length === 0 || !sub.rows[0].stripe_customer_id) {
        return json({ error: 'No subscription found' }, 404)
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: String(sub.rows[0].stripe_customer_id),
        return_url: `${url.origin}/profile`,
      })
      return json({ url: session.url })
    }

    // GET /api/stripe/status — check subscription + plan type
    if (req.method === 'GET' && segments[0] === 'status') {
      if (!user) return json({ isPro: false, plan: 'free' })

      // Free overrides first (admin-granted Pro/Teacher)
      if (user.email) {
        const override = await tursoExecute(
          'SELECT plan FROM free_overrides WHERE email = ?',
          [user.email.toLowerCase()],
        )
        if (override.rows.length > 0) {
          return json({ isPro: true, plan: String(override.rows[0].plan || 'pro'), override: true })
        }
      }

      // Direct subscription
      const sub = await tursoExecute(
        'SELECT status, plan FROM subscriptions WHERE user_id = ? AND status = ?',
        [user.sub, 'active'],
      )
      if (sub.rows.length > 0) {
        return json({ isPro: true, plan: String(sub.rows[0].plan || 'pro') })
      }

      // Student in a teacher's classroom (teacher has active TEACHER plan).
      // A Pro user who creates a classroom does NOT grant Pro to their students.
      //
      // Seat cap: the teacher plan includes the first TEACHER_SEAT_LIMIT
      // students per classroom. Beyond that, students stay on free until
      // the teacher pays for more seats. Without this cap, a teacher could
      // enroll 10,000 kids on a $25 plan and give them all Pro — direct
      // revenue leak (prevents unlimited free Pro seats on a $25 teacher plan).
      const TEACHER_SEAT_LIMIT = 30
      const teacherGrant = await tursoExecute(
        `WITH ranked_members AS (
           SELECT cm.user_id,
                  cm.classroom_id,
                  ROW_NUMBER() OVER (PARTITION BY cm.classroom_id ORDER BY cm.joined_at ASC) AS seat_no
           FROM class_members cm
           JOIN classrooms c ON cm.classroom_id = c.id
           JOIN subscriptions s ON c.teacher_id = s.user_id
             AND s.status = 'active' AND s.plan = 'teacher'
           WHERE cm.role = 'student'
         )
         SELECT 1 FROM ranked_members WHERE user_id = ? AND seat_no <= ? LIMIT 1`,
        [user.sub, TEACHER_SEAT_LIMIT],
      )
      if (teacherGrant.rows.length > 0) {
        return json({ isPro: true, plan: 'student-via-teacher' })
      }

      return json({ isPro: false, plan: 'free' })
    }

    // POST /api/stripe/webhook — handle Stripe events (signature verified)
    if (req.method === 'POST' && segments[0] === 'webhook') {
      const sig = req.headers.get('stripe-signature')
      if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return json({ error: 'Webhook signature verification required' }, 400)
      }

      const body = await req.text()
      let event: Stripe.Event
      try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
      } catch (err) {
        logError('stripe:webhook-sig', err)
        return json({ error: 'Invalid signature' }, 400)
      }

      await handleStripeEvent(event)
      return json({ received: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    logError('stripe', err)
    return json({ error: 'Internal server error' }, 500)
  }
}

/**
 * Map a Stripe subscription's authoritative product IDs to our internal plan
 * string. This replaces the webhook's previous trust in client-controllable
 * `metadata.plan` — only trust fields signed by Stripe. Stripe signs the subscription object
 * but NOT arbitrary metadata keys.
 */
function resolvePlanFromSubscription(sub: Stripe.Subscription): 'pro' | 'teacher' | null {
  const productIds = sub.items.data
    .map((item) => item.price?.product)
    .filter((p): p is string => typeof p === 'string')
  if (productIds.includes(PRICES.teacher.product)) return 'teacher'
  if (productIds.includes(PRICES.pro.product)) return 'pro'
  return null
}

/**
 * Resolve Clerk user id from a Stripe customer, via our own mapping first
 * (subscriptions.stripe_customer_id) and falling back to the customer's
 * server-set metadata. Never trust session.metadata here — session metadata is client-influenceable.
 */
async function resolveClerkUserId(customerId: string): Promise<string | null> {
  const known = await tursoExecute(
    'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ? LIMIT 1',
    [customerId],
  )
  if (known.rows.length > 0) return String(known.rows[0].user_id)
  // First-time checkout: read metadata we set in `stripe.customers.create`.
  const cust = await stripe.customers.retrieve(customerId)
  if (cust.deleted) return null
  const id = (cust as Stripe.Customer).metadata?.clerk_user_id
  return typeof id === 'string' && id.length > 0 ? id : null
}

/** Process a verified Stripe event. Errors are caught by the outer try/catch. */
async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (!session.customer || !session.subscription) return

    const customerId = String(session.customer)
    const subscriptionId = String(session.subscription)

    // Pull the signed subscription — the only trustworthy source for plan.
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    const plan = resolvePlanFromSubscription(sub)
    if (!plan) {
      logError('stripe', new Error(`Unknown subscription products for ${subscriptionId}`))
      return
    }

    const clerkUserId = await resolveClerkUserId(customerId)
    if (!clerkUserId) {
      logError('stripe', new Error(`No Clerk user for customer ${customerId}`))
      return
    }

    await tursoExecute(
      `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET
         stripe_customer_id = excluded.stripe_customer_id,
         stripe_subscription_id = excluded.stripe_subscription_id,
         status = 'active',
         plan = excluded.plan`,
      [clerkUserId, customerId, subscriptionId, String(sub.status), plan, Date.now()],
    )
    return
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    // Preserve actual status — past_due/incomplete/trialing/unpaid users
    // are NOT cancelled (Stripe is retrying their card).
    //
    // Scope by BOTH subscription_id and customer_id — prevents a row whose
    // stripe_subscription_id was tampered with from cancelling a different
    // user (prevents a mismatched subscription row from cancelling a different user).
    await tursoExecute(
      'UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ? AND stripe_customer_id = ?',
      [String(sub.status), sub.id, String(sub.customer)],
    )
  }
}

export default withRequest(handler)
