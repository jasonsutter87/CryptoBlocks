import type { LabPack } from '../types'

export const fromBlocksSecretAgent: LabPack = {
  id: 'from-blocks-secret-agent',
  name: 'From Blocks: Secret Agent',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '🕵️',
  color: '#fab387',
  exercises: [
    {
      id: 'lab-fb-sa-1',
      title: 'Encode the Message',
      description:
        'You already solved this with blocks — an Uppercase block on "attack at dawn". Now do the same in JavaScript.\n\nConvert "attack at dawn" to uppercase and print the result.',
      difficulty: 'beginner',
      expectedOutput: ['ATTACK AT DAWN'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Convert "attack at dawn" to uppercase and print it\n',
      hints: [
        'Strings have a .toUpperCase() method.',
        'console.log("attack at dawn".toUpperCase())',
      ],
    },
    {
      id: 'lab-fb-sa-2',
      title: 'Whisper Mode',
      description:
        'You already solved this with blocks — a Lowercase block on "DANGER ZONE". Now do the same in JavaScript.\n\nConvert "DANGER ZONE" to lowercase and print the result.',
      difficulty: 'beginner',
      expectedOutput: ['danger zone'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Convert "DANGER ZONE" to lowercase and print it\n',
      hints: [
        'Strings have a .toLowerCase() method.',
        'console.log("DANGER ZONE".toLowerCase())',
      ],
    },
    {
      id: 'lab-fb-sa-3',
      title: 'Cipher Swap',
      description:
        'You already solved this with blocks — Replace Text swapping "hello" for "goodbye". Now do the same in JavaScript.\n\nReplace "hello" with "goodbye" in "Say hello to my friend" and print the result.',
      difficulty: 'intermediate',
      expectedOutput: ['Say goodbye to my friend'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Replace "hello" with "goodbye" in the sentence and print it\n',
      hints: [
        'Use .replace() for a single replacement: str.replace("hello", "goodbye")',
        'console.log("Say hello to my friend".replace("hello", "goodbye"))',
      ],
    },
    {
      id: 'lab-fb-sa-4',
      title: 'Mirror Code',
      description:
        'You already solved this with blocks — Reverse Text on "desserts". Now do the same in JavaScript.\n\nReverse the string "desserts" and print the result.',
      difficulty: 'intermediate',
      expectedOutput: ['stressed'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Reverse "desserts" and print it\n',
      hints: [
        'Split into characters, reverse the array, join back: "desserts".split("").reverse().join("")',
        'console.log("desserts".split("").reverse().join(""))',
      ],
    },
    {
      id: 'lab-fb-sa-5',
      title: 'Full Decode',
      description:
        'You already solved this with blocks — Reverse Text nested inside Uppercase. Now do the same in JavaScript.\n\nTake "olleh", reverse it to decode it, then uppercase the result for the report. Print the final output.',
      difficulty: 'advanced',
      expectedOutput: ['HELLO'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Reverse "olleh", then uppercase the result, then print\n',
      hints: [
        'Chain the operations: reverse first, then toUpperCase().',
        'console.log("olleh".split("").reverse().join("").toUpperCase())',
      ],
    },
  ],
}
