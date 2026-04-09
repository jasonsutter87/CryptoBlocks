import type { Chapter } from '../types'

export const chapter2: Chapter = {
  id: 'ch-2',
  number: 2,
  title: 'Values and Types',
  description: 'Explore the different kinds of data JavaScript understands — text, numbers, booleans, and nothing at all.',
  icon: '📦',
  color: '#a6e3a1',
  lessons: [
    {
      id: 'ch-2-1',
      title: 'Text (Strings)',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-2-1-1',
          prompt: 'Print the string "Coding is awesome!" to the output.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['Coding is awesome!'],
          hints: [
            'Use console.log() to print.',
            'Put your text inside quotes.',
            'Try: console.log("Coding is awesome!")',
          ],
        },
        {
          id: 'ex-2-1-2',
          prompt: 'Print your favorite food as a string.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['pizza'],
          hints: [
            'Use console.log() with quotes.',
            'The expected output is: pizza',
            'Try: console.log("pizza")',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Text (Strings)' },
        {
          type: 'paragraph',
          text: 'In JavaScript, text is called a string. Any time you want to store words, sentences, or letters, you use a string.',
        },
        {
          type: 'paragraph',
          text: 'You make a string by wrapping text in quotes. You can use double quotes or single quotes — both work.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log("Hello!")\nconsole.log(\'Hi there!\')',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Think of the quotes like the edges of a picture frame. They tell JavaScript exactly where the text starts and ends.',
        },
        {
          type: 'heading', level: 2, text: 'What can go in a string?',
        },
        {
          type: 'paragraph',
          text: 'Anything! Letters, numbers, spaces, punctuation, even emoji. As long as it is inside quotes, JavaScript treats it as text.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log("My score is 100!")\nconsole.log("I love pizza 🍕")',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Numbers inside quotes are still strings! "42" is text, not a number. That matters when you do math.',
        },
        {
          type: 'paragraph',
          text: 'Now try writing your own strings below.',
        },
        { type: 'exercise', exerciseId: 'ex-2-1-1' },
        { type: 'exercise', exerciseId: 'ex-2-1-2' },
      ],
    },
    {
      id: 'ch-2-2',
      title: 'Numbers',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-2-2-1',
          prompt: 'Print the result of 15 + 27.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['42'],
          hints: [
            'Use console.log() with a math expression.',
            'No quotes needed — this is a number, not text.',
            'Try: console.log(15 + 27)',
          ],
        },
        {
          id: 'ex-2-2-2',
          prompt: 'Print the result of 100 divided by 4.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['25'],
          hints: [
            'Use / for division in JavaScript.',
            'Try: console.log(100 / 4)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Numbers' },
        {
          type: 'paragraph',
          text: 'Numbers in JavaScript work just like you would expect. You can write whole numbers or decimals, and do math on them.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(42)\nconsole.log(3.14)',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Notice there are no quotes. That is what makes it a number — not text.',
        },
        {
          type: 'heading', level: 2, text: 'Basic math',
        },
        {
          type: 'paragraph',
          text: 'JavaScript can do math right inside console.log. Use +, -, *, and / for the four basic operations.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(10 + 5)   // 15\nconsole.log(10 - 3)   // 7\nconsole.log(4 * 6)    // 24\nconsole.log(20 / 4)   // 5',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'In JavaScript, both 7 and 7.0 are the same type. There is no separate "integer" type like some other languages.',
        },
        { type: 'exercise', exerciseId: 'ex-2-2-1' },
        { type: 'exercise', exerciseId: 'ex-2-2-2' },
      ],
    },
    {
      id: 'ch-2-3',
      title: 'True or False (Booleans)',
      estimatedMinutes: 5,
      exercises: [
        {
          id: 'ex-2-3-1',
          prompt: 'Print the boolean value true.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['true'],
          hints: [
            'true is a special keyword in JavaScript — no quotes needed.',
            'Try: console.log(true)',
          ],
        },
        {
          id: 'ex-2-3-2',
          prompt: 'Print the result of checking if 10 is greater than 5.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['true'],
          hints: [
            'Use the > operator.',
            'Try: console.log(10 > 5)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'True or False (Booleans)' },
        {
          type: 'paragraph',
          text: 'Sometimes in code, you need a simple yes-or-no answer. Is this number bigger? Is the user logged in? Did the button get clicked?',
        },
        {
          type: 'paragraph',
          text: 'For those situations, JavaScript has a type called a boolean. A boolean can only be one of two values: true or false.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(true)\nconsole.log(false)',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'You write true and false without quotes. They are special keywords in JavaScript.',
        },
        {
          type: 'heading', level: 2, text: 'Where do booleans come from?',
        },
        {
          type: 'paragraph',
          text: 'Most of the time, booleans come from comparing things. Is 5 bigger than 3? Is this name equal to "Alex"?',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(5 > 3)        // true\nconsole.log(10 === 10)    // true\nconsole.log(4 > 100)      // false',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'You will use booleans a lot when writing if statements. They are the on/off switch of your code!',
        },
        { type: 'exercise', exerciseId: 'ex-2-3-1' },
        { type: 'exercise', exerciseId: 'ex-2-3-2' },
      ],
    },
    {
      id: 'ch-2-4',
      title: 'Nothing (null and undefined)',
      estimatedMinutes: 5,
      exercises: [
        {
          id: 'ex-2-4-1',
          prompt: 'Print the value null.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['null'],
          hints: [
            'null is a keyword in JavaScript — no quotes.',
            'Try: console.log(null)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Nothing (null and undefined)' },
        {
          type: 'paragraph',
          text: 'Sometimes a value does not exist yet, or it is intentionally empty. JavaScript has two ways to represent "nothing".',
        },
        {
          type: 'heading', level: 2, text: 'null',
        },
        {
          type: 'paragraph',
          text: 'null means "intentionally empty". You use it when you want to say: this thing exists, but it has no value right now.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(null)',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Think of null like an empty box. The box is there — you just have not put anything in it yet.',
        },
        {
          type: 'heading', level: 2, text: 'undefined',
        },
        {
          type: 'paragraph',
          text: 'undefined means "this was never given a value". JavaScript uses it automatically when something has not been set up.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let x\nconsole.log(x)  // undefined',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'The difference: null is a deliberate empty value. undefined is when JavaScript does not know what the value is yet.',
        },
        { type: 'exercise', exerciseId: 'ex-2-4-1' },
      ],
    },
  ],
}
