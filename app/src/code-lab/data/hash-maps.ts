import type { LabPack } from '../types'

export const hashMaps: LabPack = {
  id: 'lab-hash-maps',
  name: 'Hash Maps',
  description: 'Build hash tables from scratch and handle collisions',
  icon: '#\uFE0F\u20E3',
  color: '#a855f7',
  exercises: [
    {
      id: 'lab-hm-1',
      title: 'Simple Hash',
      description:
        'Write a hash function that converts a string to a number.\n\nFor each character, add its char code to a running total. Then mod by 10 to get a bucket index (0-9).\n\nHash these keys and print each result: "cat", "dog", "fish"',
      difficulty: 'beginner',
      expectedOutput: ['2', '9', '6'],
      starterCode:
        '// Simple hash function: sum of char codes mod 10\nvar keys = ["cat", "dog", "fish"];\n',
      hints: [
        'Use charCodeAt(i) to get the numeric code of each character',
        'Sum all char codes, then use % 10 to get the bucket',
        '"cat" = 99+97+116 = 312, 312 % 10 = 2',
      ],
    },
    {
      id: 'lab-hm-2',
      title: 'Build a Hash Map',
      description:
        'Build a hash map with 10 buckets using an array of arrays (chaining).\n\nUse the hash function: sum of char codes % 10.\n\nInsert: ("name", "Alice"), ("age", "14"), ("city", "NYC")\n\nThen look up "name" and "city". Print each value.',
      difficulty: 'beginner',
      expectedOutput: ['Alice', 'NYC'],
      starterCode:
        '// Hash map with chaining (array of arrays)\nvar size = 10;\nvar buckets = [];\nfor (var i = 0; i < size; i++) {\n  buckets[i] = [];\n}\n\nfunction hash(key) {\n  var total = 0;\n  for (var i = 0; i < key.length; i++) {\n    total += key.charCodeAt(i);\n  }\n  return total % size;\n}\n',
      hints: [
        'set(key, value): compute hash(key), push [key, value] into that bucket',
        'get(key): compute hash(key), search that bucket for matching key',
        'Each bucket is an array of [key, value] pairs',
      ],
    },
    {
      id: 'lab-hm-3',
      title: 'Handle Collisions',
      description:
        'Two keys can hash to the same bucket — that\'s a collision!\n\n"act" and "cat" both hash to the same bucket (same letters, same sum).\n\nInsert ("cat", "meow") and ("act", "theater") into your hash map. Then retrieve both and print their values.\n\nThis proves your chaining handles collisions correctly.',
      difficulty: 'intermediate',
      expectedOutput: ['meow', 'theater'],
      starterCode:
        '// Collision handling with chaining\nvar size = 10;\nvar buckets = [];\nfor (var i = 0; i < size; i++) {\n  buckets[i] = [];\n}\n\nfunction hash(key) {\n  var total = 0;\n  for (var i = 0; i < key.length; i++) {\n    total += key.charCodeAt(i);\n  }\n  return total % size;\n}\n\n// Verify: hash("cat") === hash("act")\n',
      hints: [
        '"cat" = 99+97+116 = 312, "act" = 97+99+116 = 312. Same hash!',
        'Both pairs land in bucket 2. Your get() must scan the bucket to find the right key.',
        'Loop through the bucket entries and compare the key (entry[0]) to find the match.',
      ],
    },
    {
      id: 'lab-hm-4',
      title: 'Word Frequency',
      description:
        'Use a hash map to count word frequencies in this sentence:\n\n"the cat sat on the mat the cat ate the fish"\n\nPrint each unique word and its count in the format "word: count", sorted alphabetically.',
      difficulty: 'intermediate',
      expectedOutput: [
        'ate: 1',
        'cat: 2',
        'fish: 1',
        'mat: 1',
        'on: 1',
        'sat: 1',
        'the: 4',
      ],
      starterCode:
        '// Word frequency counter\nvar text = "the cat sat on the mat the cat ate the fish";\nvar words = text.split(" ");\n',
      hints: [
        'You can use a plain object {} as a hash map in JavaScript',
        'For each word: if it exists, increment. If not, set to 1.',
        'Use Object.keys() to get all keys, sort them, then print "key: value"',
      ],
    },
    {
      id: 'lab-hm-5',
      title: 'Two Sum',
      description:
        'Classic interview problem: find two numbers in [2, 7, 11, 15] that add up to 9.\n\nUse a hash map for O(n) solution: for each number, check if (target - number) exists in the map.\n\nPrint the two numbers that sum to 9 as "a + b = 9".',
      difficulty: 'advanced',
      expectedOutput: ['2 + 7 = 9'],
      starterCode:
        '// Two Sum using a hash map — O(n) solution\nvar nums = [2, 7, 11, 15];\nvar target = 9;\n',
      hints: [
        'Create an empty object (hash map). Key = number, value = true.',
        'For each number: compute complement = target - number',
        'If complement exists in the map, you found the pair! Otherwise, add current number to map.',
      ],
    },
  ],
}
