/**
 * Netlify Function — Stripe billing.
 *
 * POST /api/stripe/checkout   → create a Checkout Session (auth required)
 * POST /api/stripe/portal     → create a Customer Portal session (manage sub)
 * GET  /api/stripe/status     → check if current user has an active subscription
 * POST /api/stripe/confirm    → return-from-checkout sync ({ sessionId }), so Pro shows before the webhook lands
 * POST /api/stripe/webhook    → Stripe webhook for subscription events (signed, raw body)
 *
 * Stripe itself is launchkit/billing (vendor/launchkit); see _lib/billing.ts.
 */

import {
  json, cors, logError, withRequest, parsePath, verifyFromRequest, tursoExecute,
  requireAuth,
} from './_lib/index.js'
import { BillingError } from '../../vendor/launchkit/billing.js'
import { getBillingContext, TEACHER_SEAT_LIMIT } from './_lib/billing.js'
import { z } from 'zod'

const CheckoutInput = z.object({
  plan: z.enum(['pro', 'teacher']).default('pro'),
}).strict()

const ConfirmInput = z.object({ sessionId: z.string().regex(/^cs_[A-Za-z0-9_]+$/) }).strict()

/** A BillingError carries the status the app should answer with; anything else is ours to log. */
function billingErrorResponse(err: unknown): Response | null {
  if (!(err instanceof BillingError)) return null
  if (err.code === 'bad-signature' || err.code === 'stale-timestamp' || err.code === 'no-raw-body' || err.code === 'bad-payload') {
    return json({ error: 'Invalid signature' }, 400)
  }
  if (err.code === 'already-subscribed') return json({ error: 'You already have a subscription. Use Manage billing to change it.' }, 409)
  if (err.code === 'no-customer') return json({ error: 'No subscription found' }, 404)
  if (err.code === 'wrong-org') return json({ error: 'Not found' }, 404)
  logError('stripe', err)
  return json({ error: err.status && err.status < 500 ? 'Invalid request' : 'Internal server error' }, err.status ?? 500)
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

      const ctx = await getBillingContext()
      if (!ctx) return json({ error: 'Stripe not configured' }, 500)
      const checkoutUrl = await ctx.billing.checkout(user!.sub, {
        planId: plan,
        customerEmail: user!.email || undefined,
        // {CHECKOUT_SESSION_ID} is filled in by Stripe; the return page sends it to /api/stripe/confirm.
        successUrl: `${url.origin}/?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${url.origin}/?cancelled=1`,
      })

      return json({ url: checkoutUrl })
    }

    // POST /api/stripe/portal — Customer Portal for managing subscription
    if (req.method === 'POST' && segments[0] === 'portal') {
      const authErr = requireAuth(user)
      if (authErr) return authErr

      const ctx = await getBillingContext()
      if (!ctx) return json({ error: 'Stripe not configured' }, 500)
      return json({ url: await ctx.billing.portal(user!.sub, { returnUrl: `${url.origin}/profile` }) })
    }

    // POST /api/stripe/confirm — the return page asks Stripe about its own checkout session
    if (req.method === 'POST' && segments[0] === 'confirm') {
      const authErr = requireAuth(user)
      if (authErr) return authErr
      const parsed = ConfirmInput.safeParse(await req.json().catch(() => null))
      if (!parsed.success) return json({ error: 'Invalid input' }, 400)

      const ctx = await getBillingContext()
      if (!ctx) return json({ error: 'Stripe not configured' }, 500)
      const { status, applied } = await ctx.billing.confirm(user!.sub, parsed.data.sessionId)
      return json({ applied, plan: status.plan, status: status.status })
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

      const ctx = await getBillingContext()
      if (!ctx) return json({ error: 'Stripe not configured' }, 500)
      // Raw body: the signature covers the exact bytes.
      const body = await req.text()
      await ctx.billing.handleWebhook(body, sig)
      return json({ received: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    const res = billingErrorResponse(err)
    if (res) return res
    logError('stripe', err)
    return json({ error: 'Internal server error' }, 500)
  }
}

export default withRequest(handler)
