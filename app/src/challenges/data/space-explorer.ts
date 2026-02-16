import type { ThemePack } from '../types'

export const spaceExplorer: ThemePack = {
  id: 'space-explorer',
  name: 'Space Explorer',
  description: 'Navigate the cosmos with IF blocks and loops',
  icon: '🚀',
  color: '#cba6f7',
  challenges: [
    {
      id: 'se-1',
      title: 'Asteroid Alert',
      description:
        'Your scanner detected something! Use an IF block to check: if 10 is greater than 5, print "Asteroid detected!" — Drag the IF block from Logic, plug in a Greater Than comparison, and put a Print inside.',
      difficulty: 'beginner',
      theme: 'space-explorer',
      expectedOutput: ['Asteroid detected!'],
      par: 6,
      hints: [
        'Drag the green IF block from Logic — it has a "do" slot where you stack blocks inside',
        'Plug Greater Than into the IF condition, then put a Print block with your text inside the "do" body',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'se-2',
      title: 'Signal Boost',
      description:
        'The antenna needs 3 signal boosts! Use a REPEAT block to print "Boosting..." exactly 3 times.',
      difficulty: 'beginner',
      theme: 'space-explorer',
      expectedOutput: ['Boosting...', 'Boosting...', 'Boosting...'],
      par: 4,
      hints: [
        'The REPEAT block is in Logic — set the number to 3',
        'Put a Print block inside the "do" slot with the text "Boosting..."',
      ],
      allowedCategories: ['Basics', 'Text', 'Logic'],
    },
    {
      id: 'se-3',
      title: 'Shield or Dodge',
      description:
        'Incoming attack! If the threat level (8) is greater than 5, raise shields — otherwise dodge! Use an IF-ELSE block to print "Shields up!" or "Dodge!"',
      difficulty: 'intermediate',
      theme: 'space-explorer',
      expectedOutput: ['Shields up!'],
      par: 8,
      hints: [
        'Use the IF-ELSE block (it has both "do" and "else" slots)',
        'Greater Than with 8 and 5 for the condition, Print in each body',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'se-4',
      title: 'Warp Speed',
      description:
        'Time to go to warp! If sensors are clear (5 > 3), engage the warp drive 3 times then announce "WARP!" — you\'ll need an IF with a REPEAT inside it.',
      difficulty: 'advanced',
      theme: 'space-explorer',
      expectedOutput: ['Engaging...', 'Engaging...', 'Engaging...', 'WARP!'],
      par: 10,
      hints: [
        'Put a REPEAT block INSIDE the IF block\'s "do" slot — blocks can nest!',
        'After the REPEAT (still inside the IF), chain another Print with "WARP!"',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'se-5',
      title: 'Fuel Calculator',
      description:
        'Calculate fuel needed for the mission. You need 50 units per light-year and the destination is 8 light-years away. Print the total fuel needed.',
      difficulty: 'intermediate',
      theme: 'space-explorer',
      expectedOutput: ['400'],
      par: 4,
      hints: [
        'Use a Multiply block to calculate 50 times 8.',
        'Wrap the Multiply block in a Print block.',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
  ],
}
