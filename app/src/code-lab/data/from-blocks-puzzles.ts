import type { LabPack } from '../types'

export const fromBlocksPuzzles: LabPack = {
  id: 'from-blocks-puzzles',
  name: 'From Blocks: Block Puzzles',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '🧩',
  color: '#cba6f7',
  exercises: [
    {
      id: 'lab-fb-bp-1',
      title: 'True or False',
      description:
        'You already solved this one with blocks — an If Then block wired to a boolean value. Now do the same in JavaScript.\n\nIf a condition is true, print "yes". Otherwise print "no". Use true as your condition.',
      difficulty: 'intermediate',
      expectedOutput: ['yes'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// If true, print "yes". Otherwise print "no".\n',
      hints: [
        'Use an if/else statement: if (true) { ... } else { ... }',
        'Put console.log("yes") in the if branch and console.log("no") in the else branch.',
      ],
    },
    {
      id: 'lab-fb-bp-2',
      title: 'Double Trouble',
      description:
        'You already solved this with blocks — a Multiply block connected to 6 and 7. Now do the same in JavaScript.\n\nMultiply 6 by 7 and print the answer.',
      difficulty: 'intermediate',
      expectedOutput: ['42'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Multiply 6 * 7 and print the result\n',
      hints: [
        'JavaScript uses * for multiplication.',
        'console.log(6 * 7) will do it in one line.',
      ],
    },
    {
      id: 'lab-fb-bp-3',
      title: 'Pick the Bigger',
      description:
        'You already solved this with blocks — a Greater Than block driving an If Then. Now do the same in JavaScript.\n\nCompare 7 and 3. If 7 is greater, print "7 wins". Otherwise print "3 wins".',
      difficulty: 'intermediate',
      expectedOutput: ['7 wins'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// If 7 > 3, print "7 wins", otherwise print "3 wins"\n',
      hints: [
        'Use an if statement with the > operator: if (7 > 3) { ... }',
        'Put console.log("7 wins") in the if branch and console.log("3 wins") in the else branch.',
      ],
    },
    {
      id: 'lab-fb-bp-4',
      title: 'Hip Hip Hooray',
      description:
        'You already solved this with blocks — a Repeat loop printing a joined text twice. Now do the same in JavaScript.\n\nJoin "hip " and "hooray!" into one string, then print it exactly 2 times using a loop.',
      difficulty: 'intermediate',
      expectedOutput: ['hip hooray!', 'hip hooray!'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Combine "hip " and "hooray!" then print the result twice using a loop\n',
      hints: [
        'Concatenate strings with +: "hip " + "hooray!"',
        'Use a for loop that runs 2 times: for (var i = 0; i < 2; i++) { ... }',
        'Store the combined text in a variable first, then log it inside the loop.',
      ],
    },
    {
      id: 'lab-fb-bp-5',
      title: 'Variable Vault',
      description:
        'You already solved this with blocks — Set Global storing 42 in "secret", then Get Global printing it. Now do the same in JavaScript.\n\nStore the number 42 in a variable called "secret", then print it.',
      difficulty: 'intermediate',
      expectedOutput: ['42'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Store 42 in a variable called "secret", then print it\n',
      hints: [
        'Declare a variable: var secret = 42;',
        'Then print it: console.log(secret)',
      ],
    },
  ],
}
