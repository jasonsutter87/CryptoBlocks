export const CATEGORIES = ['Games', 'Art', 'Web', 'Sound', 'Data', 'AI'] as const
export type Category = typeof CATEGORIES[number]
