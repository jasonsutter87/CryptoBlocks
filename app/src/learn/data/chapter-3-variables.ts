import type { Chapter } from '../types'

export const chapter3: Chapter = {
  id: 'ch-3',
  number: 3,
  title: 'Variables',
  description: 'Learn how to store and label information so you can use it later.',
  icon: '🏷️',
  color: '#89b4fa',
  lessons: [
    {
      id: 'ch-3-1',
      title: 'What is a variable?',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-3-1-1',
          prompt: 'Create a variable called favoriteColor, set it to "blue", and print it.',
          starterCode: '// Create your variable below\n',
          expectedOutput: ['blue'],
          hints: [
            'Use let to create a variable.',
            'Assign a value with = like: let favoriteColor = "blue"',
            'Then use console.log(favoriteColor) to print it.',
          ],
        },
        {
          id: 'ex-3-1-2',
          prompt: 'Create a variable called age, set it to 14, and print it.',
          starterCode: '// Create your variable below\n',
          expectedOutput: ['14'],
          hints: [
            'Numbers do not need quotes.',
            'Try: let age = 14',
            'Then: console.log(age)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'What is a variable?' },
        {
          type: 'paragraph',
          text: 'A variable is like a labeled box. You put a value inside the box, give the box a name, and then you can find that value any time by using the name.',
        },
        {
          type: 'paragraph',
          text: 'For example, imagine a box with the label "score". You put the number 100 inside. Now whenever you need the score, you just ask for "score" and JavaScript knows what to give you.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let score = 100\nconsole.log(score)',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'The word let tells JavaScript you are creating a new variable. The = puts the value into the box. And score is the name of the box.',
        },
        {
          type: 'heading', level: 2, text: 'Three ways to create a variable',
        },
        {
          type: 'paragraph',
          text: 'JavaScript has three keywords for creating variables: var, let, and const. You will mostly use let and const.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'var oldWay = "from the early days"\nlet modern = "the usual choice"\nconst fixed = "this one cannot change"',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Use let when the value might change later. Use const when it should stay the same. Avoid var — it is old and has some quirks.',
        },
        { type: 'exercise', exerciseId: 'ex-3-1-1' },
        { type: 'exercise', exerciseId: 'ex-3-1-2' },
      ],
    },
    {
      id: 'ch-3-2',
      title: 'Naming variables',
      estimatedMinutes: 5,
      exercises: [
        {
          id: 'ex-3-2-1',
          prompt: 'Create a variable called playerName, set it to "Alex", and print it.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['Alex'],
          hints: [
            'Remember: camelCase means no spaces, each new word is capitalized.',
            'Try: let playerName = "Alex"',
            'Then: console.log(playerName)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Naming variables' },
        {
          type: 'paragraph',
          text: 'You can name a variable almost anything, but there are rules and conventions that make your code easier to read.',
        },
        {
          type: 'heading', level: 2, text: 'The rules (you must follow these)',
        },
        {
          type: 'paragraph',
          text: 'Variable names cannot have spaces. They cannot start with a number. And they cannot use special characters like ! or @.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: '// Good names\nlet playerScore = 0\nlet userName = "Sam"\nlet isReady = true\n\n// Bad names (will cause errors)\n// let player score = 0\n// let 1stPlace = "Alex"',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: 'camelCase convention',
        },
        {
          type: 'paragraph',
          text: 'When a variable name has multiple words, JavaScript developers use camelCase. That means: no spaces, and every word after the first starts with a capital letter.',
        },
        {
          type: 'paragraph',
          text: 'It looks like a camel\'s humps: playerScore, firstName, isLoggedIn.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Good names describe what is inside the box. favColor is okay. c is bad. favoriteColor is perfect.',
        },
        { type: 'exercise', exerciseId: 'ex-3-2-1' },
      ],
    },
    {
      id: 'ch-3-3',
      title: 'Changing values',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-3-3-1',
          prompt: 'Create a variable called points, set it to 10, then change it to 25, and print it.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['25'],
          hints: [
            'Use let (not const) so you can change the value.',
            'Reassign with: points = 25 (no let on the second line)',
            'Then console.log(points)',
          ],
        },
        {
          id: 'ex-3-3-2',
          prompt: 'Create a const called maxScore set to 100 and print it.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['100'],
          hints: [
            'Use const instead of let.',
            'Try: const maxScore = 100',
            'Then: console.log(maxScore)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Changing values' },
        {
          type: 'paragraph',
          text: 'One of the most powerful things about variables is that you can change what is inside them.',
        },
        {
          type: 'paragraph',
          text: 'Imagine your score starts at 0. Then you earn some points. Then more. Each time, you update the score variable.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let score = 0\nconsole.log(score)  // 0\n\nscore = 50\nconsole.log(score)  // 50\n\nscore = 99\nconsole.log(score)  // 99',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'When you reassign a variable, you just use the name and = again. You do not write let a second time.',
        },
        {
          type: 'heading', level: 2, text: 'const cannot be changed',
        },
        {
          type: 'paragraph',
          text: 'If you declare a variable with const, it is locked. You can read it, but you cannot change it.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'const maxLives = 3\nconsole.log(maxLives)\n\n// This would cause an error:\n// maxLives = 5',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'warning',
          text: 'Trying to reassign a const will crash your program. Use const when the value must never change — like a max speed or a game setting.',
        },
        { type: 'exercise', exerciseId: 'ex-3-3-1' },
        { type: 'exercise', exerciseId: 'ex-3-3-2' },
      ],
    },
  ],
}
