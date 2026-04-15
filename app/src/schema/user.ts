/**
 * User-related schemas — notifications, daily scores, subscriptions,
 * free overrides.
 */
import { z } from 'zod'
import {
  Id, Timestamp, ClerkUserId, Name, Text, Email, UrlString, Username,
} from './primitives.js'

/** Notification */
export const NotificationType = z.enum([
  'remix', 'like', 'classroom_invite', 'assignment', 'submission',
  'feedback', 'discussion_reply', 'chat_mention', 'daily_challenge',
  'subscription', 'system',
])
export const Notification = z.object({
  id: Id,
  userId: ClerkUserId,
  type: NotificationType,
  title: Name,
  body: Text.default(''),
  link: UrlString.nullable().default(null),
  read: z.boolean().default(false),
  createdAt: Timestamp,
})
export type Notification = z.infer<typeof Notification>

/** Daily challenge score */
export const DailyScore = z.object({
  userId: ClerkUserId,
  userName: Username,
  dayNumber: z.number().int().min(1).max(10_000),
  blocksUsed: z.number().int().min(1).max(1000),
  solvedAt: Timestamp,
})
export type DailyScore = z.infer<typeof DailyScore>

export const SubmitDailyScoreInput = z.object({
  dayNumber: z.number().int().min(1).max(10_000),
  blocksUsed: z.number().int().min(1).max(1000),
})
export type SubmitDailyScoreInput = z.infer<typeof SubmitDailyScoreInput>

/** Subscription */
export const SubscriptionStatus = z.enum([
  'active', 'canceled', 'past_due', 'incomplete', 'trialing',
])
export const SubscriptionPlan = z.enum(['pro', 'teacher', 'student'])
export const Subscription = z.object({
  userId: ClerkUserId,
  stripeCustomerId: z.string().min(1).max(100),
  stripeSubscriptionId: z.string().min(1).max(100),
  status: SubscriptionStatus,
  plan: SubscriptionPlan,
  createdAt: Timestamp,
})
export type Subscription = z.infer<typeof Subscription>

/** Free override — admin-granted free access */
export const FreeOverride = z.object({
  email: Email,
  plan: SubscriptionPlan.default('pro'),
  note: Text.default(''),
  createdAt: Timestamp,
})
export type FreeOverride = z.infer<typeof FreeOverride>

export const FreeOverrideInput = z.object({
  email: Email,
  plan: SubscriptionPlan.optional().default('pro'),
  note: Text.optional().default(''),
})
export type FreeOverrideInput = z.infer<typeof FreeOverrideInput>
