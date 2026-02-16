import type { ThemePack } from '../types'

export const robotFactory: ThemePack = {
  id: 'robot-factory',
  name: 'Robot Factory',
  description: 'Program robots with text, math, and logic',
  icon: '🤖',
  color: '#f9e2af',
  challenges: [
    {
      id: 'rf-1',
      title: 'Name Tag',
      description:
        'Every robot needs a name tag! Use Join Text to combine "Robot-" with "X1" and print the result. Your output should be "Robot-X1".',
      difficulty: 'beginner',
      theme: 'robot-factory',
      expectedOutput: ['Robot-X1'],
      par: 4,
      hints: [
        'Find Join Text in the Text category — it sticks two pieces of text together',
        'Put "Robot-" as the first input, "X1" as the second, then wrap it in a Print block',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
    {
      id: 'rf-2',
      title: 'Assembly Line',
      description:
        'The factory assembles 4 parts per robot and has 3 robots to build. Use Multiply to calculate the total parts needed (4 × 3) and print the answer.',
      difficulty: 'beginner',
      theme: 'robot-factory',
      expectedOutput: ['12'],
      par: 4,
      hints: [
        'Drag the Multiply block from Math — plug in 4 and 3',
        'Wrap the Multiply block inside a Print block to show the result',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
    {
      id: 'rf-3',
      title: 'Quality Control',
      description:
        'Test each robot before shipping! If the robot\'s score (9) is greater than 7, print "PASS" — otherwise print "FAIL". Use an IF-ELSE block with Greater Than.',
      difficulty: 'intermediate',
      theme: 'robot-factory',
      expectedOutput: ['PASS'],
      par: 8,
      hints: [
        'Use IF-ELSE from Logic — it has a "do" and an "else" slot',
        'Greater Than with 9 and 7 for the condition, Print "PASS" in do, Print "FAIL" in else',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
  ],
}
