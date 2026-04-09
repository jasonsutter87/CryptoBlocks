import type { LabPack } from '../types'

export const fromBlocksTreasureHunt: LabPack = {
  id: 'from-blocks-treasure-hunt',
  name: 'From Blocks: Treasure Hunt',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '🗺️',
  color: '#74c7ec',
  exercises: [
    {
      id: 'lab-fb-th-1',
      title: 'Start Your Inventory',
      description:
        'You already solved this with blocks — Create List, Add To List, Print List. Now do the same in JavaScript.\n\nCreate an array called "loot", add "gold coin" to it, then print it in the format "loot: [gold coin]".',
      difficulty: 'beginner',
      expectedOutput: ['loot: [gold coin]'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create a loot array, add "gold coin", print in format "loot: [gold coin]"\n',
      hints: [
        'Declare an array: var loot = [];',
        'Add an item: loot.push("gold coin");',
        'Print with: console.log("loot: [" + loot.join(", ") + "]")',
      ],
    },
    {
      id: 'lab-fb-th-2',
      title: 'Stock Up',
      description:
        'You already solved this with blocks — three Add To List calls then Print List. Now do the same in JavaScript.\n\nCreate a "loot" array, add "sword", "shield", and "potion", then print it.',
      difficulty: 'beginner',
      expectedOutput: ['loot: [sword, shield, potion]'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create a loot array, add 3 items, print in "loot: [...]" format\n',
      hints: [
        'Use .push() three times, or initialize with all three: var loot = ["sword", "shield", "potion"];',
        'console.log("loot: [" + loot.join(", ") + "]")',
      ],
    },
    {
      id: 'lab-fb-th-3',
      title: 'How Much Loot?',
      description:
        'You already solved this with blocks — List Length on a filled list. Now do the same in JavaScript.\n\nCreate a "loot" array with "gem", "ring", and "crown". Print the number of items.',
      difficulty: 'intermediate',
      expectedOutput: ['3'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create loot array with 3 items, print the count\n',
      hints: [
        'Arrays have a .length property.',
        'var loot = ["gem", "ring", "crown"]; console.log(loot.length)',
      ],
    },
    {
      id: 'lab-fb-th-4',
      title: 'Find the Key',
      description:
        'You already solved this with blocks — Get From List at index 1. Now do the same in JavaScript.\n\nCreate a "chest" array with "rock", "key", "dust". Grab the item at index 1 and print it.',
      difficulty: 'intermediate',
      expectedOutput: ['key'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create the chest array, access index 1, print it\n',
      hints: [
        'Arrays are zero-indexed: index 0 is "rock", index 1 is "key".',
        'var chest = ["rock", "key", "dust"]; console.log(chest[1])',
      ],
    },
    {
      id: 'lab-fb-th-5',
      title: 'Drop the Junk',
      description:
        'You already solved this with blocks — Remove From List at index 1 then Print List. Now do the same in JavaScript.\n\nCreate a "bag" array with "gem", "trash", "gold". Remove the item at index 1, then print the bag.',
      difficulty: 'advanced',
      expectedOutput: ['bag: [gem, gold]'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create bag array, remove the item at index 1, print in "bag: [...]" format\n',
      hints: [
        'Use .splice(index, 1) to remove one element at a position.',
        'var bag = ["gem", "trash", "gold"]; bag.splice(1, 1);',
        'console.log("bag: [" + bag.join(", ") + "]")',
      ],
    },
  ],
}
