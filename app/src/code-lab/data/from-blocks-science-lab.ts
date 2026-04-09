import type { LabPack } from '../types'

export const fromBlocksScienceLab: LabPack = {
  id: 'from-blocks-science-lab',
  name: 'From Blocks: Science Lab',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '🔬',
  color: '#b4befe',
  exercises: [
    {
      id: 'lab-fb-sl-1',
      title: 'Cell Division',
      description:
        'You already solved this with blocks — a Power block computing 2^4. Now do the same in JavaScript.\n\n1 cell doubles every hour. After 4 hours, how many cells? Compute 2 to the power of 4 and print the result.',
      difficulty: 'beginner',
      expectedOutput: ['16'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Compute 2^4 and print the result\n',
      hints: [
        'Use Math.pow(2, 4) or the ** operator: 2 ** 4',
        'console.log(Math.pow(2, 4))',
      ],
    },
    {
      id: 'lab-fb-sl-2',
      title: 'Lab Measurement',
      description:
        'You already solved this with blocks — a Round block on a decimal. Now do the same in JavaScript.\n\nYour measurement reads 3.7 mL. Round it to the nearest whole number and print the result.',
      difficulty: 'beginner',
      expectedOutput: ['4'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Round 3.7 to the nearest whole number and print it\n',
      hints: [
        'Use Math.round() to round to the nearest integer.',
        'console.log(Math.round(3.7))',
      ],
    },
    {
      id: 'lab-fb-sl-3',
      title: 'Growth Pattern',
      description:
        'You already solved this with blocks — a Fibonacci block returning the first 6 numbers. Now do the same in JavaScript.\n\nGenerate the first 6 Fibonacci numbers and print them as a comma-separated string.',
      difficulty: 'intermediate',
      expectedOutput: ['0,1,1,2,3,5'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Generate the first 6 Fibonacci numbers and print them comma-separated\n',
      hints: [
        'Start with [0, 1] and keep pushing a + b while length < 6.',
        'var fib = [0, 1]; while (fib.length < 6) { fib.push(fib[fib.length-2] + fib[fib.length-1]); }',
        'console.log(fib.join(","))',
      ],
    },
    {
      id: 'lab-fb-sl-4',
      title: 'Chemical Ratio',
      description:
        'You already solved this with blocks — a Divide block for 18 / 2. Now do the same in JavaScript.\n\nWater needs 2 hydrogen atoms per molecule. You have 18 hydrogen atoms. How many water molecules can you make? Divide and print.',
      difficulty: 'intermediate',
      expectedOutput: ['9'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Divide 18 by 2 and print the result\n',
      hints: [
        'JavaScript division uses /.',
        'console.log(18 / 2)',
      ],
    },
    {
      id: 'lab-fb-sl-5',
      title: 'Energy Formula',
      description:
        "You already solved this with blocks — Power then Multiply for E = m * c^2. Now do the same in JavaScript.\n\nUsing mass = 2 and speed = 3 (simplified), compute E = m * c^2. First square the speed, then multiply by mass. Print the result.",
      difficulty: 'advanced',
      expectedOutput: ['18'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Compute E = m * c^2 where m = 2 and c = 3\n',
      hints: [
        'Square the speed first: 3 ** 2 or Math.pow(3, 2)',
        'Then multiply by mass: 2 * (3 ** 2)',
        'console.log(2 * Math.pow(3, 2))',
      ],
    },
  ],
}
