/**
 * User-related schemas — notifications, daily scores, subscriptions,
 * free overrides.
 */
import { z } from 'zod'
import {
  Id, Timestamp, ClerkUserId, Name, Text, Email, UrlString, Username,
  ExternalId, DayNumber, BlocksUsed,
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
  dayNumber: DayNumber,
  blocksUsed: BlocksUsed,
  solvedAt: Timestamp,
})
export type DailyScore = z.infer<typeof DailyScore>

/** Input for submitting a daily score — derived from DailyScore */
export const SubmitDailyScoreInput = DailyScore.pick({ dayNumber: true, blocksUsed: true }).strict()
export type SubmitDailyScoreInput = z.infer<typeof SubmitDailyScoreInput>

/** Subscription */
export const SubscriptionStatus = z.enum([
  'active', 'canceled', 'past_due', 'incomplete', 'trialing',
])
export const SubscriptionPlan = z.enum(['pro', 'teacher', 'student'])
export const Subscription = z.object({
  userId: ClerkUserId,
  stripeCustomerId: ExternalId,
  stripeSubscriptionId: ExternalId,
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

/** Input for creating a free override — derived, drops createdAt */
export const FreeOverrideInput = FreeOverride.omit({ createdAt: true }).strict()
export type FreeOverrideInput = z.infer<typeof FreeOverrideInput>
