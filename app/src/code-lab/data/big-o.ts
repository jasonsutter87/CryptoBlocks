import type { LabPack } from '../types'

export const bigO: LabPack = {
  id: 'lab-big-o',
  name: 'Big O',
  description: 'Learn algorithm complexity by building and measuring real code',
  icon: '📐',
  color: '#f97316',
  exercises: [
    {
      id: 'lab-o-1',
      title: 'O(1) — Instant Lookup',
      description:
        'Constant time means the operation takes the same time no matter how big the input is.\n\nGiven an array and an index, return the element at that index. No loops needed!\n\nArray: [10, 20, 30, 40, 50]\nIndex: 3\n\nPrint the value at index 3.',
      difficulty: 'beginner',
      expectedOutput: ['40'],
      starterCode:
        '// O(1) — Array index lookup is constant time\nvar arr = [10, 20, 30, 40, 50];\nvar index = 3;\n',
      hints: [
        'Array access by index is O(1) — just use arr[index]',
        'No loops needed! That\'s the beauty of constant time.',
        'console.log(arr[index])',
      ],
    },
    {
      id: 'lab-o-2',
      title: 'O(n) — Linear Search',
      description:
        'Linear time means you check each element once. The time grows proportionally with input size.\n\nFind the maximum value in [3, 7, 2, 9, 1, 5] by scanning every element. Print the max, then print how many comparisons you made.',
      difficulty: 'beginner',
      expectedOutput: ['9', '5'],
      starterCode:
        '// O(n) — Find the max by scanning every element\nvar arr = [3, 7, 2, 9, 1, 5];\nvar comparisons = 0;\n',
      hints: [
        'Start with max = arr[0], then loop from index 1',
        'Each time you compare, increment the comparisons counter',
        'For n elements, you make n-1 comparisons — that\'s O(n)',
      ],
    },
    {
      id: 'lab-o-3',
      title: 'O(log n) — Binary Search',
      description:
        'Logarithmic time means you cut the problem in half each step. Much faster than linear!\n\nBinary search for the value 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91].\n\nPrint the index where you found it, then print how many steps it took.',
      difficulty: 'intermediate',
      expectedOutput: ['5', '2'],
      starterCode:
        '// O(log n) — Binary search: cut the search space in half each step\nvar arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\nvar target = 23;\nvar steps = 0;\n',
      hints: [
        'Start with low = 0 and high = arr.length - 1',
        'Calculate mid = Math.floor((low + high) / 2)',
        'If arr[mid] === target, done. If arr[mid] < target, search right half. Otherwise search left half.',
      ],
    },
    {
      id: 'lab-o-4',
      title: 'O(n\u00B2) — Nested Loops',
      description:
        'Quadratic time means nested loops — for each element, you check every other element.\n\nFind ALL pairs of numbers in [1, 2, 3, 4] that sum to 5. Print each pair as "a+b=5".\n\nOnly count pairs where the first number\'s index is less than the second\'s (no duplicates).',
      difficulty: 'intermediate',
      expectedOutput: ['1+4=5', '2+3=5'],
      starterCode:
        '// O(n²) — Find all pairs that sum to target\nvar arr = [1, 2, 3, 4];\nvar target = 5;\n',
      hints: [
        'Use two nested loops: i from 0 to length, j from i+1 to length',
        'Check if arr[i] + arr[j] === target',
        'This checks every possible pair — that\'s n*(n-1)/2 which is O(n²)',
      ],
    },
    {
      id: 'lab-o-5',
      title: 'O(n) vs O(n\u00B2) — Race!',
      description:
        'Compare two approaches to check if an array has duplicates.\n\nArray: [4, 2, 7, 1, 9, 3, 8, 5, 6, 2]\n\n1. O(n) approach: Use an object/set to track seen values. Print "O(n): " + number of checks.\n2. O(n²) approach: Use nested loops. Print "O(n²): " + number of checks.\n3. Print "Duplicate: " + the duplicate value found.',
      difficulty: 'advanced',
      expectedOutput: ['O(n): 10', 'O(n²): 45', 'Duplicate: 2'],
      starterCode:
        '// Race: O(n) vs O(n²) to find duplicates\nvar arr = [4, 2, 7, 1, 9, 3, 8, 5, 6, 2];\n',
      hints: [
        'O(n): Loop once, use an object to store seen values. If already seen, it\'s a duplicate.',
        'O(n²): Two nested loops comparing every pair. Count each comparison.',
        'The O(n) approach checks n times. The O(n²) approach checks n*(n-1)/2 = 45 times.',
      ],
    },
  ],
}
