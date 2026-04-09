import type { Chapter } from '../types'

export const chapter7: Chapter = {
  id: 'ch-7',
  number: 7,
  title: 'Lists',
  description: 'Learn how to store and work with collections of values using arrays.',
  icon: '📋',
  color: '#f9e2af',
  lessons: [
    {
      id: 'ch-7-1',
      title: 'Creating arrays',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-7-1-1',
          prompt: 'Create an array called colors with three colors, then print the first one.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['red'],
          hints: [
            'Use square brackets: let colors = ["red", "green", "blue"]',
            'Arrays start at index 0.',
            'Print with: console.log(colors[0])',
          ],
        },
        {
          id: 'ex-7-1-2',
          prompt: 'Create an array of 3 numbers, then print the last one.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['30'],
          hints: [
            'Try: let nums = [10, 20, 30]',
            'The last index is 2 (arrays start at 0).',
            'Try: console.log(nums[2])',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Creating arrays' },
        {
          type: 'paragraph',
          text: 'An array is a list of values stored in one variable. Instead of making separate variables for every item, you can group them together.',
        },
        {
          type: 'paragraph',
          text: 'Think of an array like a row of lockers. Each locker has a number, and you can open any locker by its number.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let fruits = ["apple", "banana", "cherry"]\nconsole.log(fruits)',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: 'Getting items by index',
        },
        {
          type: 'paragraph',
          text: 'Each item in an array has an index — a number that tells you its position. The first item is at index 0, not 1.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let fruits = ["apple", "banana", "cherry"]\nconsole.log(fruits[0])  // apple\nconsole.log(fruits[1])  // banana\nconsole.log(fruits[2])  // cherry',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Arrays in JavaScript always start at index 0. So the first item is [0], the second is [1], the third is [2], and so on.',
        },
        { type: 'exercise', exerciseId: 'ex-7-1-1' },
        { type: 'exercise', exerciseId: 'ex-7-1-2' },
      ],
    },
    {
      id: 'ch-7-2',
      title: 'Adding and removing',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-7-2-1',
          prompt: 'Start with an array ["cat", "dog"], push "fish" to it, then print the array.',
          starterCode: 'let pets = ["cat", "dog"]\n// Add "fish" here\n',
          expectedOutput: ['cat,dog,fish'],
          hints: [
            'Use .push() to add to the end.',
            'Try: pets.push("fish")',
            'Then: console.log(pets)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Adding and removing' },
        {
          type: 'paragraph',
          text: 'Arrays are not frozen. You can add or remove items whenever you want using built-in methods.',
        },
        {
          type: 'heading', level: 2, text: 'Adding items',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let items = ["sword"]\nitems.push("shield")     // add to the end\nconsole.log(items)       // ["sword", "shield"]\n\nitems.unshift("helmet")  // add to the start\nconsole.log(items)       // ["helmet", "sword", "shield"]',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: 'Removing items',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let items = ["a", "b", "c"]\nitems.pop()    // removes the last item\nconsole.log(items)  // ["a", "b"]\n\nitems.shift()  // removes the first item\nconsole.log(items)  // ["b"]',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Memory trick: push/pop work on the end (like a stack of trays). shift/unshift work on the start (like a queue).',
        },
        { type: 'exercise', exerciseId: 'ex-7-2-1' },
      ],
    },
    {
      id: 'ch-7-3',
      title: 'Finding things',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-7-3-1',
          prompt: 'Print the length of the array ["a", "b", "c", "d"].',
          starterCode: '// Write your code below\n',
          expectedOutput: ['4'],
          hints: [
            'Use .length on an array.',
            'Try: console.log(["a", "b", "c", "d"].length)',
          ],
        },
        {
          id: 'ex-7-3-2',
          prompt: 'Check if the array ["cat", "dog", "fish"] includes "dog" and print the result.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['true'],
          hints: [
            'Use .includes() to check if an item is in the array.',
            'Try: console.log(["cat", "dog", "fish"].includes("dog"))',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Finding things' },
        {
          type: 'paragraph',
          text: 'Arrays have built-in methods to help you find information about the list.',
        },
        {
          type: 'heading', level: 2, text: '.length',
        },
        {
          type: 'paragraph',
          text: '.length tells you how many items are in the array.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let scores = [85, 90, 78, 92]\nconsole.log(scores.length)  // 4',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '.includes()',
        },
        {
          type: 'paragraph',
          text: '.includes() checks if a specific value is in the array. It returns true or false.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let colors = ["red", "green", "blue"]\nconsole.log(colors.includes("green"))  // true\nconsole.log(colors.includes("yellow")) // false',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '.indexOf()',
        },
        {
          type: 'paragraph',
          text: '.indexOf() tells you the position of an item. If it is not found, it returns -1.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let colors = ["red", "green", "blue"]\nconsole.log(colors.indexOf("green"))  // 1\nconsole.log(colors.indexOf("yellow")) // -1',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Checking for -1 from indexOf() is a classic way to tell if something is missing from a list.',
        },
        { type: 'exercise', exerciseId: 'ex-7-3-1' },
        { type: 'exercise', exerciseId: 'ex-7-3-2' },
      ],
    },
  ],
}
