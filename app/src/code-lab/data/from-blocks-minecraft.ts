import type { LabPack } from '../types'

export const fromBlocksMinecraft: LabPack = {
  id: 'from-blocks-minecraft',
  name: 'From Blocks: Minecraft',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '⛏️',
  color: '#a6e3a1',
  exercises: [
    {
      id: 'lab-fb-mc-1',
      title: 'Craft a Pickaxe',
      description:
        'You already solved this with blocks — Join Text blocks building a crafting recipe string. Now do the same in JavaScript.\n\nPrint the crafting recipe: "3 sticks + 2 diamonds = Diamond Pickaxe"',
      difficulty: 'beginner',
      expectedOutput: ['3 sticks + 2 diamonds = Diamond Pickaxe'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Print the crafting recipe using string concatenation\n',
      hints: [
        'You can concatenate strings with +.',
        'Or just pass the whole string directly to console.log().',
        'console.log("3 sticks + 2 diamonds = Diamond Pickaxe")',
      ],
    },
    {
      id: 'lab-fb-mc-2',
      title: 'Mine Diamonds',
      description:
        'You already solved this with blocks — two Print blocks in sequence. Now do the same in JavaScript.\n\nPrint "Mining..." then print "Found 5 diamonds!" each on its own line.',
      difficulty: 'beginner',
      expectedOutput: ['Mining...', 'Found 5 diamonds!'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Print two lines in order\n',
      hints: [
        'Two console.log() calls, one after the other.',
        'console.log("Mining...") then console.log("Found 5 diamonds!")',
      ],
    },
    {
      id: 'lab-fb-mc-3',
      title: 'Build a House',
      description:
        'You already solved this with blocks — a Repeat loop printing "Placing wall" 4 times. Now do the same in JavaScript.\n\nUse a loop to print "Placing wall" exactly 4 times.',
      difficulty: 'intermediate',
      expectedOutput: ['Placing wall', 'Placing wall', 'Placing wall', 'Placing wall'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Use a loop to print "Placing wall" 4 times\n',
      hints: [
        'A for loop: for (var i = 0; i < 4; i++) { ... }',
        'Put console.log("Placing wall") inside the loop body.',
      ],
    },
    {
      id: 'lab-fb-mc-4',
      title: 'Enchantment Table',
      description:
        'You already solved this with blocks — a Multiply block for 8 levels × 3 power. Now do the same in JavaScript.\n\nAn enchantment has 8 levels. Each level gives 3 power. Print the total enchantment power.',
      difficulty: 'intermediate',
      expectedOutput: ['24'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Calculate 8 levels * 3 power per level and print the result\n',
      hints: [
        'Multiply with *: 8 * 3',
        'console.log(8 * 3)',
      ],
    },
    {
      id: 'lab-fb-mc-5',
      title: 'Creeper Warning',
      description:
        'You already solved this with blocks — a Less Than block feeding an If/Else. Now do the same in JavaScript.\n\nA creeper is 3 blocks away. If the distance is less than 5, print "RUN!" — otherwise print "Safe".',
      difficulty: 'advanced',
      expectedOutput: ['RUN!'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// If distance < 5, print "RUN!", otherwise print "Safe"\nvar distance = 3;\n',
      hints: [
        'Use an if/else statement: if (distance < 5) { ... } else { ... }',
        'console.log("RUN!") in the if branch, console.log("Safe") in the else branch.',
      ],
    },
  ],
}
