import type { Chapter } from '../types'

export const chapter9: Chapter = {
  id: 'ch-9',
  number: 9,
  title: 'Loops',
  description: 'Repeat actions without writing the same code over and over.',
  icon: '🔁',
  color: '#eba0ac',
  lessons: [
    {
      id: 'ch-9-1',
      title: 'for loops',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-9-1-1',
          prompt: 'Use a for loop to print the numbers 1 through 5, one per line.',
          starterCode: '// Write your for loop below\n',
          expectedOutput: ['1', '2', '3', '4', '5'],
          hints: [
            'Start i at 1, run while i <= 5, increment with i++.',
            'Try: for (let i = 1; i <= 5; i++)',
            'Inside the loop: console.log(i)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'for loops' },
        {
          type: 'paragraph',
          text: 'A loop repeats code. Instead of writing console.log 100 times, you write it once inside a loop and let the loop handle the rest.',
        },
        {
          type: 'paragraph',
          text: 'A for loop is the most common kind. It counts from a start number to an end number.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'for (let i = 0; i < 5; i++) {\n  console.log(i)\n}',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'A for loop has three parts separated by semicolons:',
        },
        {
          type: 'paragraph',
          text: '1. let i = 0 — start with i at 0. 2. i < 5 — keep going while i is less than 5. 3. i++ — add 1 to i after each loop.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'The variable i stands for "index". It is just a counter that tracks which loop you are on.',
        },
        { type: 'exercise', exerciseId: 'ex-9-1-1' },
      ],
    },
    {
      id: 'ch-9-2',
      title: 'while loops',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-9-2-1',
          prompt: 'Use a while loop to print "tick" 3 times.',
          starterCode: 'let count = 0\n// Write your while loop below\n',
          expectedOutput: ['tick', 'tick', 'tick'],
          hints: [
            'Run the loop while count < 3.',
            'Inside: console.log("tick") and count++',
            'Try: while (count < 3) { console.log("tick"); count++ }',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'while loops' },
        {
          type: 'paragraph',
          text: 'A while loop keeps running as long as a condition is true. It is useful when you do not know exactly how many times you need to loop.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let energy = 5\n\nwhile (energy > 0) {\n  console.log("Running!")\n  energy--\n}',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'This loop keeps running as long as energy is greater than 0. Each time through, it decreases energy by 1.',
        },
        {
          type: 'paragraph',
          text: 'When energy hits 0, the condition is false and the loop stops.',
        },
        {
          type: 'callout',
          variant: 'warning',
          text: 'Be careful! If the condition never becomes false, the loop runs forever. This is called an infinite loop and it will freeze your program.',
        },
        { type: 'exercise', exerciseId: 'ex-9-2-1' },
      ],
    },
    {
      id: 'ch-9-3',
      title: 'for..of — looping through a list',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-9-3-1',
          prompt: 'Use a for..of loop to print each item in ["apple", "banana", "cherry"].',
          starterCode: 'let fruits = ["apple", "banana", "cherry"]\n// Write your for..of loop below\n',
          expectedOutput: ['apple', 'banana', 'cherry'],
          hints: [
            'Use: for (let fruit of fruits)',
            'Inside the loop: console.log(fruit)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'for..of — looping through a list' },
        {
          type: 'paragraph',
          text: 'The for..of loop is the easiest way to go through every item in an array. You do not need an index or a counter.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let colors = ["red", "green", "blue"]\n\nfor (let color of colors) {\n  console.log(color)\n}',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Each time through the loop, the variable color holds the next item from the array. Clean and simple.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Use for..of when you want every item in the list. Use a regular for loop when you need the index number.',
        },
        { type: 'exercise', exerciseId: 'ex-9-3-1' },
      ],
    },
    {
      id: 'ch-9-4',
      title: 'break and continue',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-9-4-1',
          prompt: 'Loop from 1 to 10 but use break to stop when you reach 5. Print each number.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['1', '2', '3', '4', '5'],
          hints: [
            'Use a for loop: for (let i = 1; i <= 10; i++)',
            'Print i each loop.',
            'Add: if (i === 5) break — this stops after printing 5.',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'break and continue' },
        {
          type: 'paragraph',
          text: 'Sometimes you need more control over how a loop runs. break and continue give you that.',
        },
        {
          type: 'heading', level: 2, text: 'break — stop the loop early',
        },
        {
          type: 'paragraph',
          text: 'break immediately exits the loop, even if the condition is still true.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'for (let i = 0; i < 10; i++) {\n  if (i === 3) break\n  console.log(i)\n}\n// Prints: 0, 1, 2',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: 'continue — skip to the next round',
        },
        {
          type: 'paragraph',
          text: 'continue skips the rest of the current loop and goes to the next iteration.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'for (let i = 0; i < 5; i++) {\n  if (i === 2) continue\n  console.log(i)\n}\n// Prints: 0, 1, 3, 4  (skips 2)',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'break is like pulling an emergency exit. continue is like saying "skip this one, keep going".',
        },
        { type: 'exercise', exerciseId: 'ex-9-4-1' },
      ],
    },
  ],
}
