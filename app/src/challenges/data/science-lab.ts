import type { ThemePack } from '../types'

export const scienceLab: ThemePack = {
  id: 'science-lab',
  name: 'Science Lab',
  description: 'Explore advanced math with experiments and formulas',
  icon: '🔬',
  color: '#b4befe',
  challenges: [
    {
      id: 'sl-1',
      title: 'Cell Division',
      description:
        '1 cell doubles every hour. After 4 hours, how many cells? Use the Power block to calculate 2 to the power of 4.',
      difficulty: 'beginner',
      theme: 'science-lab',
      expectedOutput: ['16'],
      par: 3,
      hints: [
        'Doubling = multiplying by 2 each time. That\'s 2^4.',
        'Print( Power( 2, 4 ) ) — 2 * 2 * 2 * 2 = 16 cells.',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
    {
      id: 'sl-2',
      title: 'Lab Measurement',
      description:
        'Your measurement reads 3.7 mL. Round it to the nearest whole number and print the result.',
      difficulty: 'beginner',
      theme: 'science-lab',
      expectedOutput: ['4'],
      par: 3,
      hints: [
        'The Round block rounds a decimal to the nearest whole number.',
        'Print( Round( 3.7 ) ) — rounds up to 4.',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
    {
      id: 'sl-3',
      title: 'Growth Pattern',
      description:
        'Nature follows the Fibonacci sequence! Use the Fibonacci block to generate the first 6 numbers and print them.',
      difficulty: 'intermediate',
      theme: 'science-lab',
      expectedOutput: ['0,1,1,2,3,5'],
      par: 3,
      hints: [
        'The Fibonacci block takes a count and returns the sequence as a list.',
        'Print( Fibonacci( 6 ) ) — gives you [0, 1, 1, 2, 3, 5].',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
    {
      id: 'sl-4',
      title: 'Chemical Ratio',
      description:
        'Water needs 2 hydrogen atoms for every 1 oxygen. You have 18 hydrogen atoms. How many water molecules can you make? Divide and print.',
      difficulty: 'intermediate',
      theme: 'science-lab',
      expectedOutput: ['9'],
      par: 4,
      hints: [
        'Each molecule uses 2 hydrogen, so divide total hydrogen by 2.',
        'Print( Divide( 18, 2 ) ) — that\'s 9 molecules.',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
    {
      id: 'sl-5',
      title: 'Energy Formula',
      description:
        'Einstein\'s famous formula: E = m * c^2. Using mass = 2 and speed = 3 (simplified), calculate the energy. First compute 3 squared, then multiply by 2.',
      difficulty: 'advanced',
      theme: 'science-lab',
      expectedOutput: ['18'],
      par: 5,
      hints: [
        'You need Power for c^2, then Multiply for m * result.',
        'Print( Multiply( 2, Power( 3, 2 ) ) ) — 3^2 = 9, 2 * 9 = 18.',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
  ],
}
