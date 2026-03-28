import type { LabPack } from '../types'

export const patternMatching: LabPack = {
  id: 'lab-pattern',
  name: 'Pattern Matching',
  description: 'Use string methods and regular expressions to search, validate, and extract',
  icon: '🎯',
  color: '#ef4444',
  exercises: [
    {
      id: 'lab-pattern-1',
      title: 'Contains Substring',
      description:
        'Check if a string contains a given substring (without using includes()).\n\ncontains("hello world", "world") = true\ncontains("hello world", "xyz") = false\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['true', 'false'],
      starterCode: '// Contains substring — without includes()\nfunction contains(str, sub) {\n  // slide a window of sub.length across str\n}\n\nconsole.log(contains("hello world", "world"));\nconsole.log(contains("hello world", "xyz"));\n',
      hints: [
        'Loop i from 0 to str.length - sub.length',
        'Check if str.substring(i, i + sub.length) === sub',
        'Return true if found, false after the loop',
      ],
    },
    {
      id: 'lab-pattern-2',
      title: 'Count Occurrences',
      description:
        'Count how many times a substring appears in a string (overlapping counts).\n\ncountOccurrences("aaaa", "aa") = 3  (positions 0,1,2)\ncountOccurrences("hello world hello", "hello") = 2\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['3', '2'],
      starterCode: '// Count occurrences (overlapping)\nfunction countOccurrences(str, sub) {\n  var count = 0;\n  var idx = 0;\n  // search from current position, advance by 1 each time\n}\n\nconsole.log(countOccurrences("aaaa", "aa"));\nconsole.log(countOccurrences("hello world hello", "hello"));\n',
      hints: [
        'Use indexOf with a start position: str.indexOf(sub, idx)',
        'Each time found, increment count and move idx by 1 (not sub.length) to allow overlaps',
        'Loop until indexOf returns -1',
      ],
    },
    {
      id: 'lab-pattern-3',
      title: 'Replace All',
      description:
        'Replace all occurrences of a substring with another string (without using replaceAll()).\n\nreplaceAll("aabbcc", "bb", "XX") = "aaXXcc"\nreplaceAll("go go go", "go", "stop") = "stop stop stop"\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['aaXXcc', 'stop stop stop'],
      starterCode: '// Replace all occurrences\nfunction replaceAll(str, find, replace) {\n  var result = "";\n  var i = 0;\n  while (i < str.length) {\n    // check if str starting at i matches find\n  }\n  return result;\n}\n\nconsole.log(replaceAll("aabbcc", "bb", "XX"));\nconsole.log(replaceAll("go go go", "go", "stop"));\n',
      hints: [
        'At each position, check if str.substring(i, i + find.length) === find',
        'If it matches, append replace to result and advance i by find.length',
        'Otherwise, append str[i] and advance i by 1',
      ],
    },
    {
      id: 'lab-pattern-4',
      title: 'Is Valid Email (Simple)',
      description:
        'Validate that a string is a simple email: contains exactly one "@", at least one "." after the "@", and no spaces.\n\nisEmail("user@example.com") = true\nisEmail("bad@") = false\nisEmail("no-at-sign.com") = false\n\nPrint all three results.',
      difficulty: 'intermediate',
      expectedOutput: ['true', 'false', 'false'],
      starterCode: '// Simple email validation\nfunction isEmail(str) {\n  // check: no spaces, exactly one @, dot after @\n}\n\nconsole.log(isEmail("user@example.com"));\nconsole.log(isEmail("bad@"));\nconsole.log(isEmail("no-at-sign.com"));\n',
      hints: [
        'Check str.includes(" ") — return false if it has a space',
        'Split by "@": parts = str.split("@"), must have exactly 2 parts and both non-empty',
        'The part after "@" must contain at least one "." with characters after it',
      ],
    },
    {
      id: 'lab-pattern-5',
      title: 'Extract Numbers From String',
      description:
        'Extract all numbers from a string and return them as an array.\n\nextractNumbers("abc 12 def 34.5 xyz 6") = [12, 34.5, 6]\n\nPrint the numbers from "Price: $19.99, Tax: $1.50, Total: $21.49" as comma-separated values.',
      difficulty: 'advanced',
      expectedOutput: ['19.99,1.5,21.49'],
      starterCode: '// Extract numbers from string\nfunction extractNumbers(str) {\n  var matches = str.match(/\\d+\\.?\\d*/g);\n  return matches ? matches.map(Number) : [];\n}\n\nvar nums = extractNumbers("Price: $19.99, Tax: $1.50, Total: $21.49");\nconsole.log(nums.join(","));\n',
      hints: [
        'Use a regex: /\\d+\\.?\\d*/g to match integers and decimals',
        'str.match(regex) returns an array of matched strings (or null)',
        'Map each match to Number() to convert from string to number',
      ],
    },
  ],
}
