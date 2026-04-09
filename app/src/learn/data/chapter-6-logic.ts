import type { Chapter } from '../types'

export const chapter6: Chapter = {
  id: 'ch-6',
  number: 6,
  title: 'Logic',
  description: 'Make your code make decisions. Learn comparisons, if/else, and logical operators.',
  icon: '🔀',
  color: '#cba6f7',
  lessons: [
    {
      id: 'ch-6-1',
      title: 'Comparing values',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-6-1-1',
          prompt: 'Print the result of checking if 7 is equal to 7 using ===.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['true'],
          hints: [
            'Use === for strict equality.',
            'Try: console.log(7 === 7)',
          ],
        },
        {
          id: 'ex-6-1-2',
          prompt: 'Print the result of checking if 10 is not equal to 5.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['true'],
          hints: [
            'Use !== to check "not equal".',
            'Try: console.log(10 !== 5)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Comparing values' },
        {
          type: 'paragraph',
          text: 'Often in code you need to compare two values. Is the player score high enough? Is this name the same as that one? Comparisons answer those questions.',
        },
        {
          type: 'paragraph',
          text: 'Every comparison produces a boolean — either true or false.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(5 === 5)    // true  — strict equal\nconsole.log(5 !== 3)    // true  — not equal\nconsole.log(10 > 3)     // true  — greater than\nconsole.log(2 < 1)      // false — less than\nconsole.log(5 >= 5)     // true  — greater than or equal\nconsole.log(4 <= 3)     // false — less than or equal',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '=== vs ==',
        },
        {
          type: 'paragraph',
          text: 'You might see == in old code. The difference is that === also checks the type. So 5 === "5" is false (one is a number, one is a string), but 5 == "5" is true.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Always use === and !== instead of == and !=. It avoids sneaky bugs.',
        },
        { type: 'exercise', exerciseId: 'ex-6-1-1' },
        { type: 'exercise', exerciseId: 'ex-6-1-2' },
      ],
    },
    {
      id: 'ch-6-2',
      title: 'if and else',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-6-2-1',
          prompt: 'If the variable score is 80 or above, print "Pass". Otherwise print "Try again".',
          starterCode: 'let score = 80\n// Write your if/else below\n',
          expectedOutput: ['Pass'],
          hints: [
            'Use if (score >= 80) to check the condition.',
            'Put console.log("Pass") inside the if block.',
            'Put console.log("Try again") inside the else block.',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'if and else' },
        {
          type: 'paragraph',
          text: 'An if statement lets your code make a decision. "If this condition is true, do this. Otherwise, do something else."',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let score = 75\n\nif (score >= 60) {\n  console.log("You passed!")\n} else {\n  console.log("Keep practicing!")\n}',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'The condition goes inside the parentheses. The code to run goes inside the curly braces {}.',
        },
        {
          type: 'paragraph',
          text: 'The else block runs when the condition is false. It is optional — you do not always need one.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Think of it like a road sign: "If this road is open, go straight. Else, take a detour."',
        },
        { type: 'exercise', exerciseId: 'ex-6-2-1' },
      ],
    },
    {
      id: 'ch-6-3',
      title: 'And, Or, Not',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-6-3-1',
          prompt: 'Print true if age is at least 13 AND score is at least 50.',
          starterCode: 'let age = 15\nlet score = 60\n// Write your code below\n',
          expectedOutput: ['true'],
          hints: [
            'Use && to combine two conditions.',
            'Try: console.log(age >= 13 && score >= 50)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'And, Or, Not' },
        {
          type: 'paragraph',
          text: 'Sometimes a single condition is not enough. You need to check two things at once. That is where logical operators come in.',
        },
        {
          type: 'heading', level: 2, text: '&& — And',
        },
        {
          type: 'paragraph',
          text: '&& means both conditions must be true. If either one is false, the whole thing is false.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let age = 16\nlet hasTicket = true\n\nif (age >= 16 && hasTicket) {\n  console.log("You can enter!")\n}',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '|| — Or',
        },
        {
          type: 'paragraph',
          text: '|| means at least one condition must be true. If either one is true, the whole thing is true.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let isAdmin = false\nlet isOwner = true\n\nif (isAdmin || isOwner) {\n  console.log("Access granted!")\n}',
          runnable: false,
        },
        {
          type: 'heading', level: 2, text: '! — Not',
        },
        {
          type: 'paragraph',
          text: '! flips a boolean. true becomes false, false becomes true.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let isLoggedIn = false\nconsole.log(!isLoggedIn)   // true',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Remember: && is "both must be true", || is "at least one must be true", ! is "the opposite".',
        },
        { type: 'exercise', exerciseId: 'ex-6-3-1' },
      ],
    },
    {
      id: 'ch-6-4',
      title: 'else if — multiple conditions',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-6-4-1',
          prompt: 'Given score = 72, print "A" if >= 90, "B" if >= 80, "C" if >= 70, else "F".',
          starterCode: 'let score = 72\n// Write your if/else if/else below\n',
          expectedOutput: ['C'],
          hints: [
            'Use if, then else if, then else.',
            'Check the highest score first.',
            'The score is 72 so it should hit the >= 70 condition.',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'else if — multiple conditions' },
        {
          type: 'paragraph',
          text: 'Sometimes two choices are not enough. You need to check several possibilities in order. That is where else if comes in.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let temp = 25\n\nif (temp > 30) {\n  console.log("Hot")\n} else if (temp > 20) {\n  console.log("Warm")\n} else if (temp > 10) {\n  console.log("Cool")\n} else {\n  console.log("Cold")\n}',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'JavaScript checks each condition from top to bottom. As soon as one is true, it runs that block and skips the rest.',
        },
        {
          type: 'paragraph',
          text: 'The final else is a catch-all — it runs only if none of the above conditions were true.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Order matters! Put the most specific or most restrictive conditions first. Check for > 90 before > 80 when grading scores.',
        },
        { type: 'exercise', exerciseId: 'ex-6-4-1' },
      ],
    },
  ],
}
