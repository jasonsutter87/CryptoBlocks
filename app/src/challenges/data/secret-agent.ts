import type { ThemePack } from '../types'

export const secretAgent: ThemePack = {
  id: 'secret-agent',
  name: 'Secret Agent',
  description: 'Decode secret messages with text manipulation',
  icon: '🕵️',
  color: '#fab387',
  challenges: [
    {
      id: 'sa-1',
      title: 'Encode the Message',
      description:
        'HQ needs your message in all caps! Use the Uppercase block on "attack at dawn" and print the result.',
      difficulty: 'beginner',
      theme: 'secret-agent',
      expectedOutput: ['ATTACK AT DAWN'],
      par: 3,
      hints: [
        'Find the Uppercase block in the Text category.',
        'Put a text value "attack at dawn" into Uppercase, then wrap it all in a Print block.',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
    {
      id: 'sa-2',
      title: 'Whisper Mode',
      description:
        'Go undercover! Convert "DANGER ZONE" to lowercase and print the result.',
      difficulty: 'beginner',
      theme: 'secret-agent',
      expectedOutput: ['danger zone'],
      par: 3,
      hints: [
        'The Lowercase block is the opposite of Uppercase.',
        'Put "DANGER ZONE" into Lowercase, then Print the result.',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
    {
      id: 'sa-3',
      title: 'Cipher Swap',
      description:
        'The enemy intercepted our message! Use Replace Text to change "hello" to "goodbye" in the text "Say hello to my friend" and print it.',
      difficulty: 'intermediate',
      theme: 'secret-agent',
      expectedOutput: ['Say goodbye to my friend'],
      par: 4,
      hints: [
        'Replace Text takes 3 inputs: the original text, what to find, and the replacement.',
        'Text: "Say hello to my friend", Find: "hello", Replace with: "goodbye". Wrap in Print.',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
    {
      id: 'sa-4',
      title: 'Mirror Code',
      description:
        'Agents write backwards to hide messages! Reverse the text "desserts" and print the result. What word do you get?',
      difficulty: 'intermediate',
      theme: 'secret-agent',
      expectedOutput: ['stressed'],
      par: 3,
      hints: [
        'The Reverse Text block flips text backwards.',
        'Put "desserts" into Reverse Text, then Print it. "desserts" backwards is "stressed"!',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
    {
      id: 'sa-5',
      title: 'Full Decode',
      description:
        'The ultimate decode mission! Take the coded message "olleh", reverse it to decode, then uppercase it for the report. Print the final result.',
      difficulty: 'advanced',
      theme: 'secret-agent',
      expectedOutput: ['HELLO'],
      par: 4,
      hints: [
        'You need to nest two operations: Reverse Text inside Uppercase.',
        'Print( Uppercase( Reverse Text( "olleh" ) ) ) — reverse first gets "hello", then uppercase makes "HELLO".',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
  ],
}
