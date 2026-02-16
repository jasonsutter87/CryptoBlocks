import type { LabPack } from '../types'

export const beginner: LabPack = {
  id: 'lab-beginner',
  name: 'Beginner',
  description: 'Start your coding journey with classic fundamentals',
  icon: '🌱',
  color: '#a6e3a1',
  exercises: [
    {
      id: 'lab-b-1',
      title: 'Reverse a String',
      description: 'Write code that reverses the string "hello" and prints the result.\n\nExample:\nInput: "hello"\nOutput: "olleh"',
      difficulty: 'beginner',
      expectedOutput: ['olleh'],
      starterCode: '// Reverse the string "hello" and print it\nvar text = "hello";\n',
      hints: [
        'You can split a string into an array of characters with .split("")',
        'Arrays have a .reverse() method',
        'Join the array back with .join("")',
      ],
    },
    {
      id: 'lab-b-2',
      title: 'FizzBuzz',
      description: 'Print numbers 1 to 15. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz".\n\nExpected output:\n1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz',
      difficulty: 'beginner',
      expectedOutput: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'],
      starterCode: '// Print FizzBuzz for numbers 1 to 15\n',
      hints: [
        'Use a for loop from 1 to 15',
        'Check divisibility with the modulo operator %',
        'Check for divisible by both 3 AND 5 first!',
      ],
    },
    {
      id: 'lab-b-3',
      title: 'Palindrome Checker',
      description: 'Check if each of these words is a palindrome (same forwards and backwards). Print "true" or "false" for each.\n\nWords: racecar, hello, level, world, madam',
      difficulty: 'beginner',
      expectedOutput: ['true', 'false', 'true', 'false', 'true'],
      starterCode: '// Check if each word is a palindrome\nvar words = ["racecar", "hello", "level", "world", "madam"];\n',
      hints: [
        'A palindrome reads the same forwards and backwards',
        'You can reverse a string using .split("").reverse().join("")',
        'Compare the original with the reversed version',
      ],
    },
    {
      id: 'lab-b-4',
      title: 'Sum of Array',
      description: 'Calculate and print the sum of all numbers in the array [4, 8, 15, 16, 23, 42].',
      difficulty: 'beginner',
      expectedOutput: ['108'],
      starterCode: '// Sum all numbers and print the total\nvar numbers = [4, 8, 15, 16, 23, 42];\n',
      hints: [
        'Create a variable to hold the running total',
        'Use a for loop to iterate through the array',
        'Add each element to the total',
      ],
    },
    {
      id: 'lab-b-5',
      title: 'Count Vowels',
      description: 'Count the number of vowels (a, e, i, o, u) in the string "CryptoBlocks is awesome" and print the count.',
      difficulty: 'beginner',
      expectedOutput: ['8'],
      starterCode: '// Count vowels in this string\nvar text = "CryptoBlocks is awesome";\n',
      hints: [
        'Convert the string to lowercase first',
        'Check each character against "aeiou"',
        'You can use indexOf or includes to check membership',
      ],
    },
  ],
}
