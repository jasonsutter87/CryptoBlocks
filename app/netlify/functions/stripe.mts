/**
 * Netlify Function — Stripe billing.
 *
 * POST /api/stripe/checkout   → create a Checkout Session (auth required)
 * POST /api/stripe/portal     → create a Customer Portal session (manage sub)
 * GET  /api/stripe/status     → check if current user has an active subscription
 * POST /api/stripe/webhook    → Stripe webhook for subscription events
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion })

async function verifyClerkToken(token: string): Promise<{ sub: string; email?: string; name?: string } | null> {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.sub) return null
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const res = await fetch(`https://api.clerk.com/v1/users/${payload.sub}`, {
          headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` },
        })
        if (res.ok) {
          const user = await res.json()
          return {
            sub: payload.sub,
            name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || undefined,
            email: user.email_addresses?.[0]?.email_address,
          }
        }
      } catch {}
    }
    return { sub: payload.sub }
  } catch {
    return null
  }
}

interface TursoRow { [key: string]: unknown }

async function tursoExecute(sql: string, args: (string | number | null)[] = []): Promise<{ rows: TursoRow[] }> {
  const baseUrl = (process.env.TURSO_URL || '').replace('libsql://', 'https://')
  const token = process.env.TURSO_AUTH_TOKEN || ''
  const res = await fetch(`${baseUrl}/v3/pipeline`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map((a) => {
          if (a === null) return { type: 'null', value: null }
          if (typeof a === 'number') return { type: Number.isInteger(a) ? 'integer' : 'float', value: String(a) }
          return { type: 'text', value: String(a) }
        }) } },
        { type: 'close' },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Turso ${res.status}`)
  const data = await res.json()
  const result = data?.results?.[0]?.response?.result
  if (!result) return { rows: [] }
  const cols: string[] = result.cols.map((c: { name: string }) => c.name)
  return {
    rows: result.rows.map((row: Array<{ value: unknown }>) => {
      const obj: TursoRow = {}
      for (let i = 0; i < cols.length; i++) obj[cols[i]] = row[i]?.value ?? null
      return obj
    }),
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  })
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } })

  const url = new URL(req.url)
  const path = url.pathname.replace('/.netlify/functions/stripe', '').replace('/api/stripe', '')
  const segments = path.split('/').filter(Boolean)

  try {
    if (!process.env.STRIPE_SECRET_KEY) return json({ error: 'Stripe not configured' }, 500)

    // POST /api/stripe/checkout — create Checkout Session
    // Body: { plan: 'pro' | 'teacher' }
    if (req.method === 'POST' && segments[0] === 'checkout') {
      const authHeader = req.headers.get('Authorization') || ''
      const user = await verifyClerkToken(authHeader.replace('Bearer ', ''))
      if (!user) return json({ error: 'Sign in to upgrade' }, 401)

      const body = await req.json().catch(() => ({})) as { plan?: string }
      const plan = body.plan || 'pro'

      // Find or create Stripe customer
      let customerId: string | null = null
      const existing = await tursoExecute(
        'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
        [user.sub],
      )
      if (existing.rows.length > 0 && existing.rows[0].stripe_customer_id) {
        customerId = String(existing.rows[0].stripe_customer_id)
      } else {
        const customer = await stripe.customers.create({
          metadata: { clerk_user_id: user.sub },
          email: user.email || undefined,
          name: user.name || undefined,
        })
        customerId = customer.id
      }

      const lineItems: Array<{ price_data: { currency: string; product: string; recurring: { interval: string }; unit_amount: number }; quantity: number }> = []

      if (plan === 'teacher') {
        // Teacher base: $25/month
        lineItems.push({
          price_data: {
            currency: 'usd',
            product: process.env.STRIPE_TEACHER_PRODUCT_ID || 'prod_UKGdxapGBhJGfR',
            recurring: { interval: 'month' },
            unit_amount: 2500,
          },
          quantity: 1,
        })
        // Per-student: $3.50/month — starts at 0, updated when students join
        lineItems.push({
          price_data: {
            currency: 'usd',
            product: process.env.STRIPE_STUDENT_PRODUCT_ID || 'prod_UKGeLR2xlgPsqj',
            recurring: { interval: 'month' },
            unit_amount: 350,
          },
          quantity: 0,
        })
      } else {
        // Pro: $10/month
        lineItems.push({
          price_data: {
            currency: 'usd',
            product: process.env.STRIPE_PRODUCT_ID || 'prod_UK2SC9xh2YTlMQ',
            recurring: { interval: 'month' },
            unit_amount: 1000,
          },
          quantity: 1,
        })
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: lineItems,
        success_url: `${url.origin}/?upgraded=1`,
        cancel_url: `${url.origin}/?cancelled=1`,
        metadata: { clerk_user_id: user.sub, plan },
      })

      return json({ url: session.url })
    }

    // POST /api/stripe/portal — Customer Portal for managing subscription
    if (req.method === 'POST' && segments[0] === 'portal') {
      const authHeader = req.headers.get('Authorization') || ''
      const user = await verifyClerkToken(authHeader.replace('Bearer ', ''))
      if (!user) return json({ error: 'Sign in' }, 401)

      const sub = await tursoExecute(
        'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
        [user.sub],
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

    // GET /api/stripe/status — check subscription status + plan type
    if (req.method === 'GET' && segments[0] === 'status') {
      const authHeader = req.headers.get('Authorization') || ''
      const user = await verifyClerkToken(authHeader.replace('Bearer ', ''))
      if (!user) return json({ isPro: false, plan: 'free' })

      const sub = await tursoExecute(
        'SELECT status, plan FROM subscriptions WHERE user_id = ? AND status = ?',
        [user.sub, 'active'],
      )
      if (sub.rows.length === 0) return json({ isPro: false, plan: 'free' })
      const plan = String(sub.rows[0].plan || 'pro')
      return json({ isPro: true, plan })
    }

    // POST /api/stripe/webhook — handle Stripe events
    if (req.method === 'POST' && segments[0] === 'webhook') {
      const body = await req.text()
      let event: Stripe.Event

      const sig = req.headers.get('stripe-signature')
      if (sig && process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
      } else {
        event = JSON.parse(body) as Stripe.Event
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const clerkUserId = session.metadata?.clerk_user_id
        const plan = session.metadata?.plan || 'pro'
        if (clerkUserId && session.customer) {
          await tursoExecute(
            `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan, created_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT (user_id) DO UPDATE SET
               stripe_customer_id = excluded.stripe_customer_id,
               stripe_subscription_id = excluded.stripe_subscription_id,
               status = 'active',
               plan = excluded.plan`,
            [clerkUserId, String(session.customer), String(session.subscription), 'active', plan, Date.now()],
          )
        }
      }

      if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status === 'active' ? 'active' : 'cancelled'
        await tursoExecute(
          'UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?',
          [status, sub.id],
        )
      }

      return json({ received: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Stripe error:', message)
    return json({ error: 'Internal server error', detail: message }, 500)
  }
}
