import type { Chapter } from '../types'

export const chapter10: Chapter = {
  id: 'ch-10',
  number: 10,
  title: 'Functions',
  description: 'Write reusable blocks of code that you can call whenever you need them.',
  icon: '⚙️',
  color: '#74c7ec',
  lessons: [
    {
      id: 'ch-10-1',
      title: 'What is a function?',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-10-1-1',
          prompt: 'Write a function called greet that prints "Hello from a function!" then call it.',
          starterCode: '// Write your function below\n',
          expectedOutput: ['Hello from a function!'],
          hints: [
            'Define it with: function greet() { ... }',
            'Inside: console.log("Hello from a function!")',
            'Call it with: greet()',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'What is a function?' },
        {
          type: 'paragraph',
          text: 'A function is a named block of code that you can run whenever you need it. Write the instructions once, then reuse them as many times as you want.',
        },
        {
          type: 'paragraph',
          text: 'Imagine a blender. You put ingredients in, press the button, and it blends. You do not need to know how the motor works — you just press the button. A function is like that button.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'function sayHello() {\n  console.log("Hello!")\n}\n\nsayHello()  // call the function\nsayHello()  // call it again',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'The function keyword tells JavaScript you are defining a function. The name is sayHello. The code inside the curly braces runs every time you call it.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Defining a function does not run it. You have to call it by writing its name followed by ().',
        },
        { type: 'exercise', exerciseId: 'ex-10-1-1' },
      ],
    },
    {
      id: 'ch-10-2',
      title: 'Parameters — passing info in',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-10-2-1',
          prompt: 'Write a function called greetUser that takes a name parameter and prints "Hello, [name]!". Call it with "Sam".',
          starterCode: '// Write your function below\n',
          expectedOutput: ['Hello, Sam!'],
          hints: [
            'Define: function greetUser(name) { ... }',
            'Inside: console.log("Hello, " + name + "!")',
            'Call with: greetUser("Sam")',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Parameters — passing info in' },
        {
          type: 'paragraph',
          text: 'A function gets more useful when you can pass information into it. Those inputs are called parameters.',
        },
        {
          type: 'paragraph',
          text: 'You list the parameters inside the parentheses when you define the function. Then when you call it, you pass in the actual values.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'function greet(name) {\n  console.log("Hey, " + name + "!")\n}\n\ngreet("Taylor")  // Hey, Taylor!\ngreet("Jordan")  // Hey, Jordan!',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'You can also have multiple parameters. Just separate them with commas.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'function add(a, b) {\n  console.log(a + b)\n}\n\nadd(3, 7)   // 10\nadd(10, 5)  // 15',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Parameters are like ingredient slots on a recipe. You define the slots, and whoever calls the function fills them in.',
        },
        { type: 'exercise', exerciseId: 'ex-10-2-1' },
      ],
    },
    {
      id: 'ch-10-3',
      title: 'Return values — passing info back',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-10-3-1',
          prompt: 'Write a function called double that returns a number multiplied by 2. Call it with 6 and print the result.',
          starterCode: '// Write your function below\n',
          expectedOutput: ['12'],
          hints: [
            'Define: function double(n) { return n * 2 }',
            'Call and print: console.log(double(6))',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Return values — passing info back' },
        {
          type: 'paragraph',
          text: 'So far our functions just print things. But often you want a function to calculate something and give the result back to you.',
        },
        {
          type: 'paragraph',
          text: 'You do that with the return keyword. It sends a value back out of the function.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'function add(a, b) {\n  return a + b\n}\n\nlet result = add(4, 6)\nconsole.log(result)  // 10',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Once you return a value, you can store it in a variable, use it in another expression, or pass it to console.log.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(add(2, 3))         // 5\nconsole.log(add(10, 5) * 2)   // 30',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'warning',
          text: 'return also stops the function immediately. Any code after return inside the function will not run.',
        },
        { type: 'exercise', exerciseId: 'ex-10-3-1' },
      ],
    },
    {
      id: 'ch-10-4',
      title: 'Arrow functions',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-10-4-1',
          prompt: 'Write an arrow function called square that returns a number times itself. Print square(7).',
          starterCode: '// Write your arrow function below\n',
          expectedOutput: ['49'],
          hints: [
            'Try: const square = (n) => n * n',
            'Then: console.log(square(7))',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Arrow functions' },
        {
          type: 'paragraph',
          text: 'There is a shorter way to write functions in JavaScript called arrow functions. They look a little different but do the same thing.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: '// Regular function\nfunction add(a, b) {\n  return a + b\n}\n\n// Arrow function — same thing, less typing\nconst add = (a, b) => a + b\n\nconsole.log(add(3, 4))  // 7',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'The => is called the "fat arrow". If the function body is just one expression, you can skip the curly braces and the return keyword.',
        },
        {
          type: 'paragraph',
          text: 'If you need multiple lines, you still use curly braces and return.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'const greet = (name) => {\n  const message = "Hello, " + name\n  return message\n}\n\nconsole.log(greet("Sam"))',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Arrow functions are very common in modern JavaScript. You will see them everywhere, especially when working with arrays and callbacks.',
        },
        { type: 'exercise', exerciseId: 'ex-10-4-1' },
      ],
    },
  ],
}
