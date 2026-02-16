import type { ThemePack } from '../types'

export const treasureHunt: ThemePack = {
  id: 'treasure-hunt',
  name: 'Treasure Hunt',
  description: 'Collect loot and manage your inventory with lists',
  icon: '🗺️',
  color: '#74c7ec',
  challenges: [
    {
      id: 'th-1',
      title: 'Start Your Inventory',
      description:
        'Every adventurer needs a bag! Create a list called "loot", add "gold coin" to it, then use Print List to see your inventory.',
      difficulty: 'beginner',
      theme: 'treasure-hunt',
      expectedOutput: ['loot: [gold coin]'],
      par: 4,
      hints: [
        'Use Create List from the Lists category, then Add To List.',
        'Create List "loot", then Add To List "loot" with item "gold coin", then Print List "loot".',
      ],
      allowedCategories: ['Basics', 'Lists'],
    },
    {
      id: 'th-2',
      title: 'Stock Up',
      description:
        'Gear up for the dungeon! Create a list "loot", add "sword", "shield", and "potion" — then print the list.',
      difficulty: 'beginner',
      theme: 'treasure-hunt',
      expectedOutput: ['loot: [sword, shield, potion]'],
      par: 6,
      hints: [
        'Use Add To List three times — once for each item.',
        'Create List "loot". Add "sword", then "shield", then "potion". Finally Print List "loot".',
      ],
      allowedCategories: ['Basics', 'Lists'],
    },
    {
      id: 'th-3',
      title: 'How Much Loot?',
      description:
        'How big is your haul? Create "loot", add "gem", "ring", and "crown", then print the number of items using List Length.',
      difficulty: 'intermediate',
      theme: 'treasure-hunt',
      expectedOutput: ['3'],
      par: 6,
      hints: [
        'List Length returns a number — how many items are in the list.',
        'Create and fill the list, then use Print with List Length "loot" to show "3".',
      ],
      allowedCategories: ['Basics', 'Lists'],
    },
    {
      id: 'th-4',
      title: 'Find the Key',
      description:
        'The key is hidden in a chest! Create list "chest", add "rock", "key", "dust". Use Get From List to grab the item at position 1 and print it.',
      difficulty: 'intermediate',
      theme: 'treasure-hunt',
      expectedOutput: ['key'],
      par: 7,
      hints: [
        'Lists start counting at 0! Position 0 is "rock", position 1 is "key".',
        'Create "chest", add the 3 items, then Print( Get From List "chest" at index 1 ).',
      ],
      allowedCategories: ['Basics', 'Lists'],
    },
    {
      id: 'th-5',
      title: 'Drop the Junk',
      description:
        'Your bag is too heavy! Create "bag" with "gem", "trash", "gold". Remove the item at position 1 to toss the trash, then print the bag.',
      difficulty: 'advanced',
      theme: 'treasure-hunt',
      expectedOutput: ['bag: [gem, gold]'],
      par: 7,
      hints: [
        'Remove From List removes the item at a specific position.',
        'Create "bag", add 3 items, use Remove From List at index 1, then Print List "bag".',
      ],
      allowedCategories: ['Basics', 'Lists'],
    },
  ],
}
