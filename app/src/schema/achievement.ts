/**
 * Achievement / badge schemas.
 *
 * Achievement metadata lives in definitions.ts (client+server shared).
 * The DB only stores (user_id, achievement_id, unlocked_at).
 */

import { z } from 'zod'

export const Rarity = z.enum(['common', 'rare', 'epic', 'legendary'])
export type Rarity = z.infer<typeof Rarity>

export const AchievementId = z.string().min(1).max(50).regex(/^[a-z0-9-]+$/)

export const UnlockInput = z.object({
  achievementId: AchievementId,
}).strict()
export type UnlockInput = z.infer<typeof UnlockInput>
