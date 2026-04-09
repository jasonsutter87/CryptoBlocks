import type { LabPack } from '../types'

export const fromBlocksEuler: LabPack = {
  id: 'from-blocks-euler',
  name: 'From Blocks: Euler Blocks',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '⚡',
  color: '#f59e0b',
  exercises: [
    {
      id: 'lab-fb-eb-1',
      title: 'Power Up',
      description:
        'You already solved this with blocks — a Power block set to 2^10. Now do the same in JavaScript.\n\nCompute 2 to the power of 10 and print the answer.',
      difficulty: 'beginner',
      expectedOutput: ['1024'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Compute 2 to the power of 10 and print the result\n',
      hints: [
        'JavaScript has Math.pow(base, exponent) for exponentiation.',
        'Or use the ** operator: 2 ** 10',
        'console.log(Math.pow(2, 10)) outputs 1024.',
      ],
    },
    {
      id: 'lab-fb-eb-2',
      title: 'Order of Operations',
      description:
        'You already solved this with blocks — nested Add, Subtract, and Multiply blocks. Now do the same in JavaScript.\n\nCompute (7 + 3) × (12 − 4) and print the answer.',
      difficulty: 'beginner',
      expectedOutput: ['80'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Compute (7 + 3) * (12 - 4) and print the result\n',
      hints: [
        'JavaScript respects parentheses just like math.',
        'console.log((7 + 3) * (12 - 4)) does it in one line.',
      ],
    },
    {
      id: 'lab-fb-eb-3',
      title: 'Mirror Mirror',
      description:
        'You already solved this with blocks — Reverse Text and Equals checking if "racecar" is a palindrome. Now do the same in JavaScript.\n\nReverse "racecar" and check if it equals the original. Print true or false.',
      difficulty: 'beginner',
      expectedOutput: ['true'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Check if "racecar" is a palindrome and print true or false\n',
      hints: [
        'Reverse a string: "racecar".split("").reverse().join("")',
        'Compare with === to check equality.',
        'console.log("racecar" === "racecar".split("").reverse().join(""))',
      ],
    },
    {
      id: 'lab-fb-eb-4',
      title: 'Text Flip',
      description:
        'You already solved this with blocks — Uppercase then Reverse Text. Now do the same in JavaScript.\n\nUppercase "hello world" then reverse the whole thing. Print the result.',
      difficulty: 'beginner',
      expectedOutput: ['DLROW OLLEH'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Uppercase "hello world", then reverse it, then print\n',
      hints: [
        'Chain the operations: first .toUpperCase(), then reverse.',
        'To reverse: .split("").reverse().join("")',
        'console.log("hello world".toUpperCase().split("").reverse().join(""))',
      ],
    },
    {
      id: 'lab-fb-eb-5',
      title: "Gauss's Shortcut",
      description:
        "You already solved this with blocks — the formula n × (n + 1) / 2. Now do the same in JavaScript.\n\nFind the sum of all numbers from 1 to 100 using Gauss's formula. Print the answer.",
      difficulty: 'intermediate',
      expectedOutput: ['5050'],
      starterCode:
        "// You did this as a block challenge! Now write it in JavaScript.\n// Use the formula n * (n + 1) / 2 for n = 100\n",
      hints: [
        'The formula is: n * (n + 1) / 2',
        'var n = 100; console.log(n * (n + 1) / 2)',
      ],
    },
    {
      id: 'lab-fb-eb-6',
      title: 'How Long Is That?',
      description:
        'You already solved this with blocks — Join Text then Text Length. Now do the same in JavaScript.\n\nJoin "Fizz" and "Buzz" together, then print the length of the combined string.',
      difficulty: 'intermediate',
      expectedOutput: ['8'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Join "Fizz" and "Buzz", then print the length\n',
      hints: [
        'Concatenate with +: "Fizz" + "Buzz" gives "FizzBuzz".',
        'Use .length to get the string length.',
        'console.log(("Fizz" + "Buzz").length)',
      ],
    },
    {
      id: 'lab-fb-eb-7',
      title: 'Secret Swap',
      description:
        'You already solved this with blocks — Replace Text swapping "a" for "@". Now do the same in JavaScript.\n\nTake "attack at dawn" and replace every "a" with "@". Print the encoded message.',
      difficulty: 'intermediate',
      expectedOutput: ['@tt@ck @t d@wn'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Replace every "a" with "@" in "attack at dawn"\n',
      hints: [
        'Use .replaceAll() to replace all occurrences: "attack at dawn".replaceAll("a", "@")',
        'Or use a regex with the global flag: .replace(/a/g, "@")',
      ],
    },
    {
      id: 'lab-fb-eb-8',
      title: 'Logic Gate',
      description:
        'You already solved this with blocks — two comparisons combined with AND. Now do the same in JavaScript.\n\nIs 42 greater than 10 AND less than 100? Print the boolean result.',
      difficulty: 'intermediate',
      expectedOutput: ['true'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Check: is 42 > 10 AND 42 < 100? Print the result\n',
      hints: [
        'Use && for logical AND in JavaScript.',
        'console.log(42 > 10 && 42 < 100)',
      ],
    },
    {
      id: 'lab-fb-eb-9',
      title: 'Towers of Power',
      description:
        'You already solved this with blocks — three nested Power blocks. Now do the same in JavaScript.\n\nCompute 2^(2^(2^2)). Evaluate from the inside out. Print the result.',
      difficulty: 'advanced',
      expectedOutput: ['65536'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Compute 2^(2^(2^2)) — innermost first: 2^2=4, 2^4=16, 2^16=65536\n',
      hints: [
        'Work inside-out: 2**2 = 4, then 2**4 = 16, then 2**16 = 65536.',
        'console.log(2 ** (2 ** (2 ** 2)))',
      ],
    },
    {
      id: 'lab-fb-eb-10',
      title: 'The Counter',
      description:
        'You already solved this with blocks — a Repeat loop with a manual counter variable. Now do the same in JavaScript.\n\nUse a loop to print the numbers 1 through 5, one per line.',
      difficulty: 'advanced',
      expectedOutput: ['1', '2', '3', '4', '5'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Print numbers 1 through 5 using a loop\n',
      hints: [
        'A for loop: for (var i = 1; i <= 5; i++) { console.log(i); }',
        'The loop counter starts at 1 and goes up to and including 5.',
      ],
    },
  ],
}
