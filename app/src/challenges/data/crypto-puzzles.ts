import type { ThemePack } from '../types'

export const cryptoPuzzles: ThemePack = {
  id: 'crypto-puzzles',
  name: 'Crypto Puzzles',
  description: 'Encode, hash, and protect messages with cryptography',
  icon: '🔐',
  color: '#4F46E5',
  challenges: [
    {
      id: 'cp-1',
      title: 'Secret Encoding',
      description:
        'Encode the message "Hello World" into Base64 and print the result.',
      difficulty: 'beginner',
      theme: 'crypto-puzzles',
      expectedOutput: ['SGVsbG8gV29ybGQ='],
      par: 3,
      hints: [
        'Use the Base64 Encode block from the Crypto category.',
        'Put the text "Hello World" into Base64 Encode, then wrap it in a Print block.',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cp-2',
      title: 'Decode the Drop',
      description:
        'An agent left an encoded message: "Q3J5cHRvQmxvY2tz". Decode it from Base64 and print the secret word.',
      difficulty: 'beginner',
      theme: 'crypto-puzzles',
      expectedOutput: ['CryptoBlocks'],
      par: 3,
      hints: [
        'Use Base64 Decode on the encoded string.',
        'Base64 Decode "Q3J5cHRvQmxvY2tz" → Print the result.',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cp-3',
      title: 'Hex Translator',
      description:
        'Convert the word "OK" to hexadecimal, then print the hex value. Then decode it back and print the original text.',
      difficulty: 'intermediate',
      theme: 'crypto-puzzles',
      expectedOutput: ['4f4b', 'OK'],
      par: 5,
      hints: [
        'Use Hex Encode on "OK" and Print the result. Then use Hex Decode on the hex string.',
        'Hex Encode "OK" gives "4f4b". Hex Decode "4f4b" gives "OK".',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cp-4',
      title: 'Fingerprint Match',
      description:
        'Hash the text "CryptoBlocks" using the Hash Text block. Store the result in a variable. Then hash "CryptoBlocks" again and compare the two hashes. Print "Match!" if they\'re equal, "Mismatch!" if not.',
      difficulty: 'intermediate',
      theme: 'crypto-puzzles',
      expectedOutput: ['Match!'],
      par: 8,
      hints: [
        'Hash the same text twice — identical input always gives identical output.',
        'Set Global "hash1" to Hash Text "CryptoBlocks". Then compare it with another Hash Text "CryptoBlocks" using Equals.',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text', 'Logic'],
    },
    {
      id: 'cp-5',
      title: 'Round Trip',
      description:
        'Take the message "Top Secret". First URL-encode it, then print the encoded version. Then decode the encoded version back and print the original. Both lines should appear.',
      difficulty: 'advanced',
      theme: 'crypto-puzzles',
      expectedOutput: ['Top%20Secret', 'Top Secret'],
      par: 6,
      hints: [
        'URL Encode replaces spaces with %20. Store the encoded result to reuse it.',
        'Set Global "encoded" to URL Encode "Top Secret". Print it. Then Print URL Decode of Get Global "encoded".',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
  ],
}
