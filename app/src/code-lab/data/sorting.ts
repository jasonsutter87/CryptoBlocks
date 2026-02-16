import type { LabPack } from '../types'

export const sorting: LabPack = {
  id: 'lab-sorting',
  name: 'Sorting Algorithms',
  description: 'Implement bubble, selection, and merge sort from scratch',
  icon: '🔀',
  color: '#06b6d4',
  exercises: [
    {
      id: 'lab-s-1',
      title: 'Bubble Sort',
      description:
        'Implement bubble sort on [5, 3, 8, 1, 2].\n\nBubble sort compares adjacent elements and swaps them if they\'re in the wrong order. Repeat until no swaps are needed.\n\nPrint the array after EACH complete pass through the array (not each swap).',
      difficulty: 'beginner',
      expectedOutput: ['3,5,1,2,8', '3,1,2,5,8', '1,2,3,5,8'],
      starterCode:
        '// Bubble Sort — print array after each pass\nvar arr = [5, 3, 8, 1, 2];\n',
      hints: [
        'Outer loop: repeat until no swaps occur in a pass',
        'Inner loop: compare arr[j] with arr[j+1], swap if arr[j] > arr[j+1]',
        'Track whether any swap happened. Print the array at the end of each pass that had a swap.',
      ],
    },
    {
      id: 'lab-s-2',
      title: 'Selection Sort',
      description:
        'Implement selection sort on [64, 25, 12, 22, 11].\n\nSelection sort finds the minimum element from the unsorted part and puts it at the beginning.\n\nPrint the array after each selection (each time you place a minimum in its final position).',
      difficulty: 'beginner',
      expectedOutput: [
        '11,25,12,22,64',
        '11,12,25,22,64',
        '11,12,22,25,64',
        '11,12,22,25,64',
      ],
      starterCode:
        '// Selection Sort — print after each selection\nvar arr = [64, 25, 12, 22, 11];\n',
      hints: [
        'Outer loop i from 0 to length-1: position i will get the i-th smallest element',
        'Inner loop j from i+1: find the index of the minimum element in the unsorted portion',
        'Swap arr[i] with arr[minIndex], then print the array',
      ],
    },
    {
      id: 'lab-s-3',
      title: 'Merge Sort',
      description:
        'Implement merge sort on [38, 27, 43, 3, 9, 82, 10].\n\nMerge sort divides the array in half, sorts each half, then merges them back together.\n\nPrint the final sorted array as comma-separated values.',
      difficulty: 'intermediate',
      expectedOutput: ['3,9,10,27,38,43,82'],
      starterCode:
        '// Merge Sort\nvar arr = [38, 27, 43, 3, 9, 82, 10];\n\n// Hint: write a merge(left, right) function\n// and a mergeSort(arr) function\n',
      hints: [
        'Base case: if array length <= 1, return it',
        'Split: find mid = Math.floor(arr.length / 2), split into left and right',
        'Merge: compare elements from left and right arrays, push the smaller one to result',
      ],
    },
    {
      id: 'lab-s-4',
      title: 'Sort Showdown',
      description:
        'Sort [9, 5, 2, 7, 1, 8, 3] using ALL THREE algorithms. Count the total number of comparisons each one makes.\n\nPrint:\n"Bubble: X"\n"Selection: Y"\n"Merge: Z"\n\nWhere X, Y, Z are the comparison counts.',
      difficulty: 'intermediate',
      expectedOutput: ['Bubble: 21', 'Selection: 21', 'Merge: 13'],
      starterCode:
        '// Sort Showdown: count comparisons for each algorithm\nvar original = [9, 5, 2, 7, 1, 8, 3];\n',
      hints: [
        'Copy the array before each sort so they all start with the same input',
        'Add a counter variable for each algorithm, increment it every time you compare two elements',
        'Bubble and Selection are both O(n\u00B2) — they should have similar counts. Merge is O(n log n) — fewer comparisons!',
      ],
    },
    {
      id: 'lab-s-5',
      title: 'Stability Test',
      description:
        'A stable sort preserves the original order of equal elements.\n\nSort these students by grade (ascending number). Students with the same grade should stay in their original order.\n\n[{name:"Alice",grade:3}, {name:"Bob",grade:1}, {name:"Charlie",grade:2}, {name:"Diana",grade:1}, {name:"Eve",grade:3}]\n\nPrint each name in the sorted order, one per line.\n\nHint: Merge sort is stable. Bubble sort (with <= instead of <) is stable. Selection sort is NOT stable.',
      difficulty: 'advanced',
      expectedOutput: ['Bob', 'Diana', 'Charlie', 'Alice', 'Eve'],
      starterCode:
        '// Stable sort: preserve order of equal elements\nvar students = [\n  {name: "Alice", grade: 3},\n  {name: "Bob", grade: 1},\n  {name: "Charlie", grade: 2},\n  {name: "Diana", grade: 1},\n  {name: "Eve", grade: 3}\n];\n',
      hints: [
        'Use merge sort or a stable bubble sort (swap only if left > right, NOT >=)',
        'Bob and Diana both have grade 1 — Bob must come first (original order)',
        'Alice and Eve both have grade 3 — Alice must come first (original order)',
      ],
    },
  ],
}
