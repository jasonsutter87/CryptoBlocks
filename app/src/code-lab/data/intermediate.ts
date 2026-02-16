import type { LabPack } from '../types'

export const intermediate: LabPack = {
  id: 'lab-intermediate',
  name: 'Intermediate',
  description: 'Level up with algorithms and data processing',
  icon: '🔧',
  color: '#f9e2af',
  exercises: [
    {
      id: 'lab-i-1',
      title: 'Sentiment Scorer',
      description: 'Score each word as positive (+1), negative (-1), or neutral (0). Print the total score.\n\nPositive words: good, great, love, happy, amazing\nNegative words: bad, terrible, hate, sad, awful\n\nText: "I love this great day but hate the bad weather"\n\nCount: love(+1) great(+1) bad(-1) hate(-1) = 0',
      difficulty: 'intermediate',
      expectedOutput: ['0'],
      starterCode: '// Score the sentiment of this text\nvar positive = ["good", "great", "love", "happy", "amazing"];\nvar negative = ["bad", "terrible", "hate", "sad", "awful"];\nvar text = "I love this great day but hate the bad weather";\n',
      hints: [
        'Split the text into words with .split(" ")',
        'Convert each word to lowercase',
        'Check if each word is in the positive or negative list',
      ],
    },
    {
      id: 'lab-i-2',
      title: 'Caesar Cipher',
      description: 'Encrypt the message "hello world" by shifting each letter 3 positions forward in the alphabet. Non-letter characters stay the same. Print the encrypted text.\n\nExpected: "khoor zruog"',
      difficulty: 'intermediate',
      expectedOutput: ['khoor zruog'],
      starterCode: '// Encrypt with Caesar cipher (shift 3)\nvar message = "hello world";\nvar shift = 3;\n',
      hints: [
        'Use charCodeAt() to get character codes and String.fromCharCode() to convert back',
        'Lowercase letters are codes 97-122 (a-z)',
        'Use modulo (%) to wrap around: ((code - 97 + shift) % 26) + 97',
      ],
    },
    {
      id: 'lab-i-3',
      title: 'Fibonacci Generator',
      description: 'Print the first 10 Fibonacci numbers, one per line.\n\nThe sequence starts: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34',
      difficulty: 'intermediate',
      expectedOutput: ['0', '1', '1', '2', '3', '5', '8', '13', '21', '34'],
      starterCode: '// Print the first 10 Fibonacci numbers\n',
      hints: [
        'Start with two variables: a = 0, b = 1',
        'Each new number is the sum of the previous two',
        'Print the current number, then update: temp = b, b = a + b, a = temp',
      ],
    },
    {
      id: 'lab-i-4',
      title: 'Word Frequency',
      description: 'Count how many times each word appears in: "the cat sat on the mat the cat"\n\nPrint each word and its count in the format "word: count", sorted alphabetically.',
      difficulty: 'intermediate',
      expectedOutput: ['cat: 2', 'mat: 1', 'on: 1', 'sat: 1', 'the: 3'],
      starterCode: '// Count word frequencies\nvar text = "the cat sat on the mat the cat";\n',
      hints: [
        'Split the text into words and use an object to count occurrences',
        'Object.keys() gives you all the keys to sort',
        'Sort the keys alphabetically with .sort()',
      ],
    },
    {
      id: 'lab-i-5',
      title: 'Binary Search',
      description: 'Implement binary search to find the number 23 in the sorted array [2, 5, 8, 12, 16, 23, 38, 56, 72, 91].\n\nPrint the index where 23 is found.',
      difficulty: 'intermediate',
      expectedOutput: ['5'],
      starterCode: '// Find 23 using binary search\nvar arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\nvar target = 23;\n',
      hints: [
        'Set low = 0 and high = arr.length - 1',
        'While low <= high, check the middle element',
        'If middle element < target, search right half. If >, search left half.',
      ],
    },
  ],
}
