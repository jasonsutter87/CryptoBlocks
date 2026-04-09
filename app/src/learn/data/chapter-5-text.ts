import type { Chapter } from '../types'

export const chapter5: Chapter = {
  id: 'ch-5',
  number: 5,
  title: 'Text',
  description: 'Learn how to combine, format, and work with text in JavaScript.',
  icon: '📝',
  color: '#f38ba8',
  lessons: [
    {
      id: 'ch-5-1',
      title: 'Joining text',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-5-1-1',
          prompt: 'Create variables firstName and lastName, then print the full name "Ada Lovelace" by joining them with a space.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['Ada Lovelace'],
          hints: [
            'Set firstName to "Ada" and lastName to "Lovelace".',
            'Join them with +, including a space: firstName + " " + lastName',
            'Try: console.log(firstName + " " + lastName)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Joining text' },
        {
          type: 'paragraph',
          text: 'You already know + adds numbers. But when you use + on strings, it joins them together. This is called concatenation.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log("Hello" + " " + "World!")  // Hello World!',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Notice that space in the middle. If you leave it out, the words get stuck together: "HelloWorld!".',
        },
        {
          type: 'paragraph',
          text: 'You can also join strings and variables together.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let name = "Jordan"\nconsole.log("Hello, " + name + "!")',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'warning',
          text: 'Be careful mixing numbers and strings with +. "5" + 3 gives "53" (string joining), not 8 (addition).',
        },
        { type: 'exercise', exerciseId: 'ex-5-1-1' },
      ],
    },
    {
      id: 'ch-5-2',
      title: 'Template literals',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-5-2-1',
          prompt: 'Use a template literal to print "My name is Sam and I am 13 years old."',
          starterCode: 'let name = "Sam"\nlet age = 13\n// Use a template literal below\n',
          expectedOutput: ['My name is Sam and I am 13 years old.'],
          hints: [
            'Use backticks ` instead of regular quotes.',
            'Use ${name} and ${age} inside the string.',
            'Try: console.log(`My name is ${name} and I am ${age} years old.`)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Template literals' },
        {
          type: 'paragraph',
          text: 'Joining strings with + works, but it gets messy fast. Template literals are a cleaner way to build strings that include variables.',
        },
        {
          type: 'paragraph',
          text: 'Instead of regular quotes, you use backtick characters. Then you can drop any variable right into the string using ${}.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let name = "Taylor"\nlet age = 12\nconsole.log(`Hello, ${name}! You are ${age} years old.`)',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Everything inside ${} gets evaluated and inserted into the string. It is much easier to read than a chain of + signs.',
        },
        {
          type: 'heading', level: 2, text: 'Math inside template literals',
        },
        {
          type: 'paragraph',
          text: 'You can even do math inside the ${}.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let price = 5\nlet qty = 3\nconsole.log(`Total: ${price * qty} dollars`)',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'The backtick key is usually in the top-left corner of your keyboard, under the Escape key.',
        },
        { type: 'exercise', exerciseId: 'ex-5-2-1' },
      ],
    },
    {
      id: 'ch-5-3',
      title: 'Common string methods',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-5-3-1',
          prompt: 'Print the length of the string "JavaScript".',
          starterCode: '// Write your code below\n',
          expectedOutput: ['10'],
          hints: [
            'Use .length on a string.',
            'Try: console.log("JavaScript".length)',
          ],
        },
        {
          id: 'ex-5-3-2',
          prompt: 'Print the string "hello world" in all uppercase.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['HELLO WORLD'],
          hints: [
            'Use .toUpperCase() on the string.',
            'Try: console.log("hello world".toUpperCase())',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Common string methods' },
        {
          type: 'paragraph',
          text: 'Strings come with built-in tools called methods. You use them by putting a dot after the string, then calling the method.',
        },
        {
          type: 'heading', level: 2, text: '.length',
        },
        {
          type: 'paragraph',
          text: '.length tells you how many characters are in a string. It counts every letter, space, and symbol.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log("hello".length)   // 5\nconsole.log("hi there".length) // 8',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '.toUpperCase() and .toLowerCase()',
        },
        {
          type: 'paragraph',
          text: 'These convert all the letters to uppercase or lowercase.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log("hello".toUpperCase())   // HELLO\nconsole.log("WORLD".toLowerCase())   // world',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '.includes()',
        },
        {
          type: 'paragraph',
          text: '.includes() checks if one string contains another. It gives back true or false.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log("hello world".includes("world"))  // true\nconsole.log("hello world".includes("pizza"))  // false',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'These are just a few of the many string methods. There are also .replace(), .slice(), .split(), and more to explore!',
        },
        { type: 'exercise', exerciseId: 'ex-5-3-1' },
        { type: 'exercise', exerciseId: 'ex-5-3-2' },
      ],
    },
  ],
}
