import type { LabPack } from '../types'

export const fromBlocksBeginner: LabPack = {
  id: 'from-blocks-beginner',
  name: 'From Blocks: Beginner',
  description: 'You already solved these with blocks. Now try them in JavaScript!',
  icon: '🧱',
  color: '#89b4fa',
  exercises: [
    {
      id: 'lab-fb-1',
      title: 'Hello World',
      description:
        'You already solved this one with blocks — a Print block wired to a text value. Now do the same thing in JavaScript.\n\nPrint "Hello World" to the console.',
      difficulty: 'beginner',
      expectedOutput: ['Hello World'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Print "Hello World" to the console\n',
      hints: [
        'Use console.log() to print a value.',
        'Pass a string in quotes: console.log("Hello World")',
      ],
    },
    {
      id: 'lab-fb-2',
      title: 'Countdown',
      description:
        'In the blocks version you stacked four Print blocks to count down. In JavaScript, write code that prints 3, 2, 1, and GO! — each on its own line.',
      difficulty: 'beginner',
      expectedOutput: ['3', '2', '1', 'GO!'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Print 3, 2, 1, GO! each on its own line\n',
      hints: [
        'Four console.log() calls will do it — one per line of output.',
        'Numbers can be passed directly: console.log(3). Strings need quotes: console.log("GO!")',
      ],
    },
    {
      id: 'lab-fb-3',
      title: 'Math Wizard',
      description:
        'With blocks you connected a Multiply block to a Print block to compute 7 × 8. In JavaScript, use the * operator to calculate the same thing and print the result.',
      difficulty: 'beginner',
      expectedOutput: ['56'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Calculate 7 times 8 and print the answer\n',
      hints: [
        'JavaScript uses * for multiplication: 7 * 8',
        'Wrap the expression inside console.log() to print it.',
      ],
    },
    {
      id: 'lab-fb-4',
      title: 'Say It Twice',
      description:
        'In the blocks version you used a Repeat block set to 2 to print "CryptoBlocks" twice. In JavaScript, use a for loop to print "CryptoBlocks" exactly 2 times.',
      difficulty: 'intermediate',
      expectedOutput: ['CryptoBlocks', 'CryptoBlocks'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Use a loop to print "CryptoBlocks" exactly 2 times\n',
      hints: [
        'A for loop: for (var i = 0; i < 2; i++) { ... }',
        'Put your console.log() call inside the loop body.',
      ],
    },
    {
      id: 'lab-fb-5',
      title: 'Variable Master',
      description:
        'With blocks you used Set Global to store "Alex" in a variable called "name", then printed "Hello, Alex!" using Join Text. Do the same in JavaScript: declare a variable, assign a value, and print the greeting.',
      difficulty: 'intermediate',
      expectedOutput: ['Hello, Alex!'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create a variable called "name" with the value "Alex"\n// Then print "Hello, Alex!"\n',
      hints: [
        'Declare a variable with var: var name = "Alex";',
        'Concatenate strings with +: "Hello, " + name + "!"',
        'Pass the full expression into console.log().',
      ],
    },
  ],
}
