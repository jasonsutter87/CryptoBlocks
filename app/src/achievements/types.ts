export interface Achievement {
  id: string
  name: string
  description: string
  icon: string // emoji
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  secret?: boolean // hidden until unlocked
}

export interface UnlockedAchievement {
  achievementId: string
  unlockedAt: number // timestamp
}
