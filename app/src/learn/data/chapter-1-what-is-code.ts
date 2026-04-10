import type { Chapter } from '../types'
import { block, textVal, workspace, resetIds } from '../blockHelpers'

function simplePrintPreview(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, { message: textVal('Hi!') }, 20, 20),
  )
}

export const chapter1: Chapter = {
  id: 'chapter-1',
  number: 1,
  title: 'What is Code?',
  description: 'Start here. Learn what code is, where JavaScript runs, and write your very first line.',
  icon: '💡',
  color: '#89b4fa',
  lessons: [
    {
      id: 'lesson-1-1',
      title: 'What is a program?',
      estimatedMinutes: 5,
      exercises: [],
      blocks: [
        {
          type: 'heading',
          level: 1,
          text: 'What is a program?',
        },
        {
          type: 'paragraph',
          text: 'A program is a list of instructions that tells a computer what to do.',
        },
        {
          type: 'paragraph',
          text: 'Computers are very fast, but they are not smart on their own. They need you to tell them exactly what to do, step by step.',
        },
        {
          type: 'paragraph',
          text: 'Think of it like a recipe. A recipe tells you: first, mix the flour. Then, add two eggs. Then, bake for 30 minutes. A program works the same way — each line is one instruction.',
        },
        {
          type: 'paragraph',
          text: 'The language you use to write those instructions is called a programming language. There are many programming languages, but in CryptoBlocks you will learn JavaScript.',
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Every app, game, and website you use was written by someone writing code!',
        },
        {
          type: 'paragraph',
          text: 'Here is the most famous first program in the world. It simply prints a greeting:',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log("Hello, world!")',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'That single line tells the computer: "Print the words Hello, world! to the screen." Simple, right?',
        },
      ],
    },
    {
      id: 'lesson-1-2',
      title: 'Where JavaScript runs',
      estimatedMinutes: 5,
      exercises: [],
      blocks: [
        {
          type: 'heading',
          level: 1,
          text: 'Where JavaScript runs',
        },
        {
          type: 'paragraph',
          text: 'JavaScript is one of the most popular programming languages on the planet. And the cool thing about it? It runs almost everywhere.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'In your browser',
        },
        {
          type: 'paragraph',
          text: 'Every website you visit uses JavaScript. When you click a button and something happens, that is JavaScript doing its job.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'On servers',
        },
        {
          type: 'paragraph',
          text: 'JavaScript also runs on computers called servers — the machines that store websites and send them to your browser when you visit.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'On phones',
        },
        {
          type: 'paragraph',
          text: 'Many mobile apps are built with JavaScript too. Apps like Discord, Slack, and even parts of Instagram use it.',
        },
        {
          type: 'heading',
          level: 2,
          text: 'Even in space',
        },
        {
          type: 'paragraph',
          text: "SpaceX uses JavaScript in some of their software. So yes — JavaScript has literally been to space.",
        },
        {
          type: 'callout',
          variant: 'tip',
          text: "You're running JavaScript right now in CryptoBlocks!",
        },
        {
          type: 'paragraph',
          text: 'That is one of the best things about learning JavaScript — once you know it, you can build almost anything.',
        },
      ],
    },
    {
      id: 'lesson-1-3',
      title: 'Your first line of code',
      estimatedMinutes: 10,
      exercises: [
        {
          id: 'ex-1-3-1',
          prompt: 'Print "Hello, CryptoBlocks!" to the output.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['Hello, CryptoBlocks!'],
          hints: [
            'Use console.log() to print text.',
            'Make sure the text is inside quotes.',
            'Try: console.log("Hello, CryptoBlocks!")',
          ],
        },
        {
          id: 'ex-1-3-2',
          prompt: 'Print "Im now a programmer!" to the output.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['Im now a programmer!'],
          hints: [
            'Use console.log() just like in the example.',
            'Put the text inside quotes.',
            'Try: console.log("Im now a programmer!")',
          ],
        },
      ],
      blocks: [
        {
          type: 'heading',
          level: 1,
          text: 'Your first line of code',
        },
        {
          type: 'paragraph',
          text: 'The first thing almost every programmer learns to do is print text to the screen.',
        },
        {
          type: 'paragraph',
          text: 'In JavaScript, you do that with a tool called console.log. It takes whatever you put inside the parentheses and prints it out.',
        },
        {
          type: 'code_with_blocks',
          language: 'javascript',
          code: 'console.log("Hi!")',
          blockWorkspace: simplePrintPreview(),
        },
        {
          type: 'paragraph',
          text: 'When you run that code, you will see the word Hi! appear in the output area.',
        },
        {
          type: 'paragraph',
          text: 'The quotes around Hi! tell JavaScript that it is a piece of text, not a command. In programming, text inside quotes is called a string.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'You can put anything you want inside the quotes. Try your name, a joke, or even an emoji!',
        },
        {
          type: 'paragraph',
          text: 'Now it is your turn. Try the exercises below to practice writing your first lines of code.',
        },
        {
          type: 'exercise',
          exerciseId: 'ex-1-3-1',
        },
        {
          type: 'exercise',
          exerciseId: 'ex-1-3-2',
        },
      ],
    },
  ],
}
