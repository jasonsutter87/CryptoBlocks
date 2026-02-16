import type { ThemePack } from '../types'

export const musicFestival: ThemePack = {
  id: 'music-festival',
  name: 'Music Festival',
  description: 'Drop beats with loops and math patterns',
  icon: '🎵',
  color: '#f38ba8',
  challenges: [
    {
      id: 'mf-1',
      title: 'Sound Check',
      description:
        'Test the speakers! Print "Testing" then "1" then "2" then "3" — each on its own line.',
      difficulty: 'beginner',
      theme: 'music-festival',
      expectedOutput: ['Testing', '1', '2', '3'],
      par: 5,
      hints: [
        'Use four Print blocks — one for text, three for numbers.',
        'Print "Testing", Print 1, Print 2, Print 3. Simple sequence!',
      ],
      allowedCategories: ['Basics', 'Text', 'Math'],
    },
    {
      id: 'mf-2',
      title: 'Beat Drop',
      description:
        'The DJ needs a beat! Use a Repeat block to print "BOOM" exactly 4 times.',
      difficulty: 'beginner',
      theme: 'music-festival',
      expectedOutput: ['BOOM', 'BOOM', 'BOOM', 'BOOM'],
      par: 4,
      hints: [
        'The Repeat block runs whatever is inside it multiple times.',
        'Repeat 4 times → Print "BOOM". That\'s only 3 blocks total!',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
    {
      id: 'mf-3',
      title: 'Ticket Sales',
      description:
        'The show is selling out! 8 tickets at $25 each — how much money is that? Calculate and print the total.',
      difficulty: 'intermediate',
      theme: 'music-festival',
      expectedOutput: ['200'],
      par: 4,
      hints: [
        'Multiply the number of tickets by the price.',
        'Print( Multiply( 8, 25 ) ) — that gives you 200.',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
    {
      id: 'mf-4',
      title: 'Power Chord',
      description:
        'Crank it up! The amplifier doubles in volume each level. What\'s 2 to the power of 8? Use the Power block to find out.',
      difficulty: 'intermediate',
      theme: 'music-festival',
      expectedOutput: ['256'],
      par: 3,
      hints: [
        'The Power block raises a number to an exponent — like 2^8.',
        'Print( Power( 2, 8 ) ) — that\'s 256!',
      ],
      allowedCategories: ['Basics', 'Math'],
    },
    {
      id: 'mf-5',
      title: 'Concert Math',
      description:
        'The venue holds 500 seats. 3 sections of 150 tickets sold. How many are left? Calculate and print with a message like "50 tickets left".',
      difficulty: 'advanced',
      theme: 'music-festival',
      expectedOutput: ['50 tickets left'],
      par: 7,
      hints: [
        'First multiply 3 * 150, then subtract from 500, then join with text.',
        'Print( Join Text( Subtract( 500, Multiply(3, 150) ), " tickets left" ) ).',
      ],
      allowedCategories: ['Basics', 'Text', 'Math'],
    },
  ],
}
