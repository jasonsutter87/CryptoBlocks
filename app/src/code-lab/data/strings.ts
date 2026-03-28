import type { LabPack } from '../types'

export const strings: LabPack = {
  id: 'lab-str',
  name: 'String Manipulation',
  description: 'Tackle classic string challenges from anagrams to ciphers',
  icon: '📝',
  color: '#f43f5e',
  exercises: [
    {
      id: 'lab-str-1',
      title: 'Anagram Check',
      description:
        'Two strings are anagrams if they contain the same characters in the same frequencies.\n\nisAnagram("listen", "silent") = true\nisAnagram("hello", "world") = false\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['true', 'false'],
      starterCode: '// Anagram check\nfunction isAnagram(a, b) {\n  // sort both strings and compare, or use a frequency map\n}\n\nconsole.log(isAnagram("listen", "silent"));\nconsole.log(isAnagram("hello", "world"));\n',
      hints: [
        'Quick approach: split each string into chars, sort, join, compare',
        '"listen".split("").sort().join("") === "silent".split("").sort().join("")',
        'Make sure lengths match first — different lengths cannot be anagrams',
      ],
    },
    {
      id: 'lab-str-2',
      title: 'Caesar Cipher',
      description:
        'Shift each letter in the string by a given number of positions in the alphabet. Non-letters stay unchanged. Wrap around: z + 1 = a.\n\ncaesar("hello", 3) = "khoor"\ncaesar("xyz", 3) = "abc"\n\nPrint caesar("hello world", 13).',
      difficulty: 'beginner',
      expectedOutput: ['uryyb jbeyq'],
      starterCode: '// Caesar cipher\nfunction caesar(str, shift) {\n  var result = "";\n  for (var i = 0; i < str.length; i++) {\n    var c = str[i];\n    // shift letters, leave non-letters alone\n  }\n  return result;\n}\n\nconsole.log(caesar("hello world", 13));\n',
      hints: [
        'Check if a character is a letter with /[a-z]/i',
        'For lowercase: charCode = ((str.charCodeAt(i) - 97 + shift) % 26) + 97',
        'Use String.fromCharCode() to convert back to a character; handle uppercase similarly',
      ],
    },
    {
      id: 'lab-str-3',
      title: 'Count Words',
      description:
        'Count the number of words in a string. Words are separated by spaces.\n\ncountWords("hello world") = 2\ncountWords("  the quick  brown  fox  ") = 4\n\nPrint countWords("  the quick  brown  fox  ").',
      difficulty: 'beginner',
      expectedOutput: ['4'],
      starterCode: '// Count words\nfunction countWords(str) {\n  // split on whitespace and filter out empty strings\n}\n\nconsole.log(countWords("  the quick  brown  fox  "));\n',
      hints: [
        'str.trim() removes leading/trailing spaces',
        'str.split(/\\s+/) splits on one or more whitespace characters',
        'Filter the resulting array to remove empty strings, then return the length',
      ],
    },
    {
      id: 'lab-str-4',
      title: 'Longest Word',
      description:
        'Find the longest word in a sentence. If there is a tie, return the first one.\n\nlongestWord("The quick brown fox") = "quick"\nlongestWord("I love JavaScript programming") = "programming"\n\nPrint longestWord("I love JavaScript programming").',
      difficulty: 'intermediate',
      expectedOutput: ['programming'],
      starterCode: '// Longest word\nfunction longestWord(sentence) {\n  var words = sentence.split(" ");\n  // find the word with maximum length\n}\n\nconsole.log(longestWord("I love JavaScript programming"));\n',
      hints: [
        'Split by space to get an array of words',
        'Use reduce: words.reduce((longest, word) => word.length > longest.length ? word : longest)',
        'Or loop and track the longest seen so far',
      ],
    },
    {
      id: 'lab-str-5',
      title: 'Remove Duplicates',
      description:
        'Remove duplicate characters from a string, keeping the first occurrence of each.\n\nremoveDupes("programming") = "progamin"\nremoveDupes("aabbcc") = "abc"\n\nPrint removeDupes("programming").',
      difficulty: 'intermediate',
      expectedOutput: ['progamin'],
      starterCode: '// Remove duplicate characters\nfunction removeDupes(str) {\n  var seen = {};\n  var result = "";\n  // iterate and only add characters not yet seen\n}\n\nconsole.log(removeDupes("programming"));\n',
      hints: [
        'Loop through each character in str',
        'If seen[char] is falsy, add char to result and set seen[char] = true',
        'Return result',
      ],
    },
  ],
}
