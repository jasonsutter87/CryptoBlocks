import type { Chapter } from '../types'

export const chapter4: Chapter = {
  id: 'ch-4',
  number: 4,
  title: 'Math',
  description: 'Learn how to do calculations in JavaScript — from basic arithmetic to handy shortcuts.',
  icon: '➕',
  color: '#fab387',
  lessons: [
    {
      id: 'ch-4-1',
      title: 'Basic operators',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-4-1-1',
          prompt: 'Print the result of 8 times 9.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['72'],
          hints: [
            'Use * for multiplication.',
            'Try: console.log(8 * 9)',
          ],
        },
        {
          id: 'ex-4-1-2',
          prompt: 'Print the result of 50 minus 17.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['33'],
          hints: [
            'Use - for subtraction.',
            'Try: console.log(50 - 17)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Basic operators' },
        {
          type: 'paragraph',
          text: 'JavaScript can do all the math you learned in school. You use special symbols called operators to tell it what kind of math to do.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(10 + 3)   // 13  — addition\nconsole.log(10 - 3)   // 7   — subtraction\nconsole.log(10 * 3)   // 30  — multiplication\nconsole.log(10 / 3)   // 3.33... — division',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Notice that * means multiply and / means divide. On a keyboard those symbols are easier to type than × and ÷.',
        },
        {
          type: 'paragraph',
          text: 'You can also use variables in your math. JavaScript will look up the value and calculate.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let apples = 5\nlet oranges = 3\nconsole.log(apples + oranges)  // 8',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Remember: adding two strings joins them. "3" + "4" gives "34", not 7. That is why type matters!',
        },
        { type: 'exercise', exerciseId: 'ex-4-1-1' },
        { type: 'exercise', exerciseId: 'ex-4-1-2' },
      ],
    },
    {
      id: 'ch-4-2',
      title: 'Order of operations',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-4-2-1',
          prompt: 'Print the result of (2 + 3) * 4.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['20'],
          hints: [
            'Parentheses go first.',
            'Try: console.log((2 + 3) * 4)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Order of operations' },
        {
          type: 'paragraph',
          text: 'When you have a math expression with multiple operators, JavaScript follows a specific order — just like in school math.',
        },
        {
          type: 'paragraph',
          text: 'You might remember PEMDAS: Parentheses, Exponents, Multiplication, Division, Addition, Subtraction. JavaScript uses the same rules.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(2 + 3 * 4)    // 14, not 20 — multiply first!\nconsole.log((2 + 3) * 4)  // 20 — parentheses go first',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'The first line gives 14 because multiplication happens before addition. If you want addition first, use parentheses.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'When in doubt, add parentheses. They make your code clearer and ensure the math happens in the right order.',
        },
        { type: 'exercise', exerciseId: 'ex-4-2-1' },
      ],
    },
    {
      id: 'ch-4-3',
      title: 'Modulo (%) and remainders',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-4-3-1',
          prompt: 'Print the remainder of 17 divided by 5.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['2'],
          hints: [
            'Use the % operator.',
            '17 divided by 5 is 3 with a remainder of 2.',
            'Try: console.log(17 % 5)',
          ],
        },
        {
          id: 'ex-4-3-2',
          prompt: 'Print the result of 20 % 4 to check if 20 is evenly divisible by 4.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['0'],
          hints: [
            'If the result is 0, the number divides evenly.',
            'Try: console.log(20 % 4)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Modulo (%) and remainders' },
        {
          type: 'paragraph',
          text: 'The % operator is called modulo. It gives you the remainder after dividing two numbers.',
        },
        {
          type: 'paragraph',
          text: 'Remember long division? If you divide 13 by 4, you get 3 with a remainder of 1. That remainder is what % gives you.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(13 % 4)   // 1 — remainder of 13 ÷ 4\nconsole.log(10 % 2)   // 0 — 10 divides evenly\nconsole.log(7 % 3)    // 1 — remainder of 7 ÷ 3',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: 'Why is this useful?',
        },
        {
          type: 'paragraph',
          text: 'Modulo is great for checking if a number is even or odd. If number % 2 equals 0, it is even. If it equals 1, it is odd.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(8 % 2)   // 0 — even!\nconsole.log(9 % 2)   // 1 — odd!',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Modulo is used everywhere in games — for wrapping around lists, alternating colors in rows, or cycling through items.',
        },
        { type: 'exercise', exerciseId: 'ex-4-3-1' },
        { type: 'exercise', exerciseId: 'ex-4-3-2' },
      ],
    },
    {
      id: 'ch-4-4',
      title: 'Math shortcuts',
      estimatedMinutes: 5,
      exercises: [
        {
          id: 'ex-4-4-1',
          prompt: 'Start with a variable count set to 5, then add 3 using +=, and print it.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['8'],
          hints: [
            'Use let count = 5 to start.',
            'Then count += 3 adds 3 to it.',
            'Then console.log(count)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Math shortcuts' },
        {
          type: 'paragraph',
          text: 'In programming, you often need to add or subtract from a variable. JavaScript has shortcuts to make this faster.',
        },
        {
          type: 'heading', level: 2, text: '+= and -=',
        },
        {
          type: 'paragraph',
          text: 'Instead of writing score = score + 10, you can write score += 10. They do the same thing.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let score = 0\nscore += 10\nconsole.log(score)  // 10\n\nscore += 5\nconsole.log(score)  // 15\n\nscore -= 3\nconsole.log(score)  // 12',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '++ and --',
        },
        {
          type: 'paragraph',
          text: 'To add or subtract just 1, you can use ++ or --. These are called increment and decrement.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let lives = 3\nlives--\nconsole.log(lives)  // 2\n\nlet coins = 10\ncoins++\nconsole.log(coins)  // 11',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'These shortcuts are everywhere in JavaScript. You will use += and ++ all the time when writing loops.',
        },
        { type: 'exercise', exerciseId: 'ex-4-4-1' },
      ],
    },
  ],
}
