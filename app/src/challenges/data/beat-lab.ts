import type { ThemePack } from '../types'

export const beatLab: ThemePack = {
  id: 'beat-lab',
  name: 'Beat Lab',
  description: 'Make music with synthesizers and beat patterns',
  icon: '🎵',
  color: '#DB2777',
  challenges: [
    {
      id: 'bl-1',
      title: 'First Sound',
      description:
        'Play a kick drum sound and print "Boom!" to confirm it played.',
      difficulty: 'beginner',
      theme: 'beat-lab',
      expectedOutput: ['Boom!'],
      par: 3,
      hints: [
        'Use the Play Drum block with drum_type "kick".',
        'After the drum block, add a Print block with "Boom!".',
      ],
      allowedCategories: ['Basics', 'Sound', 'Text'],
    },
    {
      id: 'bl-2',
      title: 'Drum Kit',
      description:
        'Play three drums in order: kick, snare, hi-hat. After each one, print its name.',
      difficulty: 'beginner',
      theme: 'beat-lab',
      expectedOutput: ['kick', 'snare', 'hi-hat'],
      par: 7,
      hints: [
        'Use three Play Drum blocks, each followed by a Print block.',
        'Play Drum "kick" → Print "kick", Play Drum "snare" → Print "snare", Play Drum "hi-hat" → Print "hi-hat".',
      ],
      allowedCategories: ['Basics', 'Sound', 'Text'],
    },
    {
      id: 'bl-3',
      title: 'Tone Ladder',
      description:
        'Play three tones climbing in pitch: 200 Hz, 400 Hz, 600 Hz. After each tone, print the frequency number.',
      difficulty: 'intermediate',
      theme: 'beat-lab',
      expectedOutput: ['200', '400', '600'],
      par: 7,
      hints: [
        'Use Play Tone for each frequency, followed by a Print of the number.',
        'Play Tone 200 → Print 200, Play Tone 400 → Print 400, Play Tone 600 → Print 600.',
      ],
      allowedCategories: ['Basics', 'Sound', 'Math', 'Text'],
    },
    {
      id: 'bl-4',
      title: 'Instrument Swap',
      description:
        'Set the instrument to "square", play note C4, then set instrument to "sawtooth", play note E4. Print "square" and "sawtooth" after each change.',
      difficulty: 'intermediate',
      theme: 'beat-lab',
      expectedOutput: ['square', 'sawtooth'],
      par: 7,
      hints: [
        'Use Set Instrument before each Play Note to change the sound.',
        'Set Instrument "square" → Play Note C4 → Print "square" → Set Instrument "sawtooth" → Play Note E4 → Print "sawtooth".',
      ],
      allowedCategories: ['Basics', 'Sound', 'Text'],
    },
    {
      id: 'bl-5',
      title: 'Build a Beat',
      description:
        'Create a pattern called "groove" with 4 beats. Add a kick on beat 1, snare on beat 3. Set tempo to 120 BPM. Print "Pattern ready!" then print the tempo.',
      difficulty: 'advanced',
      theme: 'beat-lab',
      expectedOutput: ['Pattern ready!', '120'],
      par: 8,
      hints: [
        'Create Pattern "groove" with 4 beats. Use Add Beat for positions 1 and 3.',
        'Set Tempo to 120. Print the messages. You can use Play Pattern to hear it too!',
      ],
      allowedCategories: ['Basics', 'Sound', 'Math', 'Text'],
    },
  ],
}
