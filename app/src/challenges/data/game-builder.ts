import type { ThemePack } from '../types'

export const gameBuilder: ThemePack = {
  id: 'game-builder',
  name: 'Game Builder',
  description: 'Build game characters using objects and properties',
  icon: '🎮',
  color: '#94e2d5',
  challenges: [
    {
      id: 'gb-1',
      title: 'Player Profile',
      description:
        'Every game needs a player! Create an object called "player", set the property "name" to "Hero", then print the name using Get Property.',
      difficulty: 'beginner',
      theme: 'game-builder',
      expectedOutput: ['Hero'],
      par: 5,
      hints: [
        'Create Object makes an empty object. Set Property adds data to it.',
        'Create Object "player", Set Property "player" → "name" → "Hero", then Print( Get Property "player" → "name" ).',
      ],
      allowedCategories: ['Basics', 'Data'],
    },
    {
      id: 'gb-2',
      title: 'Health Bar',
      description:
        'Display the player\'s health! Create "player", set "health" to 100, then print "HP: 100" using Join Text and Get Property.',
      difficulty: 'beginner',
      theme: 'game-builder',
      expectedOutput: ['HP: 100'],
      par: 6,
      hints: [
        'Use Join Text to combine "HP: " with the health value.',
        'Create Object "player", Set Property health to 100, then Print( Join Text "HP: " + Get Property "player" "health" ).',
      ],
      allowedCategories: ['Basics', 'Text', 'Data'],
    },
    {
      id: 'gb-3',
      title: 'Level Check',
      description:
        'Is the player strong enough? Create "player" with "level" set to 15. If the level is greater than 10, print "Boss unlocked!" — otherwise print "Keep grinding".',
      difficulty: 'intermediate',
      theme: 'game-builder',
      expectedOutput: ['Boss unlocked!'],
      par: 8,
      hints: [
        'Use Get Property to read the level, then Greater Than to compare it.',
        'Create player, set level to 15. Then Print( If Then( Greater Than( Get Property level, 10 ), "Boss unlocked!", "Keep grinding" ) ).',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic', 'Data'],
    },
    {
      id: 'gb-4',
      title: 'Damage Calculator',
      description:
        'Critical hit! Create "weapon" with "damage" set to 25. Multiply the damage by 3 and print the total.',
      difficulty: 'intermediate',
      theme: 'game-builder',
      expectedOutput: ['75'],
      par: 6,
      hints: [
        'Use Get Property to read the damage value, then Multiply it.',
        'Create "weapon", set damage to 25. Print( Multiply( Get Property "weapon" "damage", 3 ) ).',
      ],
      allowedCategories: ['Basics', 'Math', 'Data'],
    },
    {
      id: 'gb-5',
      title: 'Character Sheet',
      description:
        'Print a full character summary! Create "hero" with name "Knight" and level 5. Calculate power as level times 10. Print "Knight - Power: 50".',
      difficulty: 'advanced',
      theme: 'game-builder',
      expectedOutput: ['Knight - Power: 50'],
      par: 10,
      hints: [
        'You need multiple Set Property calls, then Join Text to build the output string.',
        'Create "hero", set name to "Knight", set level to 5. Use Join Text to build the string with Get Property for name and Multiply for power (level * 10).',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Data'],
    },
  ],
}
