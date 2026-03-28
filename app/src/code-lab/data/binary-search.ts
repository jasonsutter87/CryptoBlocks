import type { LabPack } from '../types'

export const binarySearch: LabPack = {
  id: 'lab-bsearch',
  name: 'Binary Search',
  description: 'Use divide-and-conquer to search sorted arrays in O(log n) time',
  icon: '🔍',
  color: '#06b6d4',
  exercises: [
    {
      id: 'lab-bsearch-1',
      title: 'Basic Binary Search',
      description:
        'Implement binary search on a sorted array.\n\nSearch for target 7 in [1, 3, 5, 7, 9, 11, 13].\n\nReturn the index (0-based) if found, or -1 if not found.\n\nPrint the index of 7, then the result for target 6.',
      difficulty: 'beginner',
      expectedOutput: ['3', '-1'],
      starterCode: '// Binary Search\nfunction binarySearch(arr, target) {\n  var left = 0;\n  var right = arr.length - 1;\n  // while left <= right, check the mid\n}\n\nvar arr = [1, 3, 5, 7, 9, 11, 13];\nconsole.log(binarySearch(arr, 7));\nconsole.log(binarySearch(arr, 6));\n',
      hints: [
        'Calculate mid = Math.floor((left + right) / 2)',
        'If arr[mid] === target return mid; if arr[mid] < target, move left = mid + 1; else right = mid - 1',
        'If the loop ends without finding target, return -1',
      ],
    },
    {
      id: 'lab-bsearch-2',
      title: 'First Occurrence',
      description:
        'Find the index of the FIRST occurrence of a target in a sorted array with duplicates.\n\nfirstOccurrence([1, 2, 2, 2, 3, 4], 2) = 1\n\nPrint the first occurrence of 2 in [1, 2, 2, 2, 3, 4].',
      difficulty: 'beginner',
      expectedOutput: ['1'],
      starterCode: '// First occurrence binary search\nfunction firstOccurrence(arr, target) {\n  var left = 0, right = arr.length - 1, result = -1;\n  // when you find target, record it and keep searching left\n}\n\nconsole.log(firstOccurrence([1, 2, 2, 2, 3, 4], 2));\n',
      hints: [
        'Standard binary search, but when arr[mid] === target, save result = mid and set right = mid - 1',
        'This forces the search to continue in the left half to find earlier occurrences',
        'Return result at the end (it will be the first index found)',
      ],
    },
    {
      id: 'lab-bsearch-3',
      title: 'Last Occurrence',
      description:
        'Find the index of the LAST occurrence of a target in a sorted array with duplicates.\n\nlastOccurrence([1, 2, 2, 2, 3, 4], 2) = 3\n\nPrint the last occurrence of 2 in [1, 2, 2, 2, 3, 4].',
      difficulty: 'intermediate',
      expectedOutput: ['3'],
      starterCode: '// Last occurrence binary search\nfunction lastOccurrence(arr, target) {\n  var left = 0, right = arr.length - 1, result = -1;\n  // when you find target, record it and keep searching right\n}\n\nconsole.log(lastOccurrence([1, 2, 2, 2, 3, 4], 2));\n',
      hints: [
        'Same as first occurrence, but when arr[mid] === target, save result = mid and set left = mid + 1',
        'This forces the search to continue in the right half to find later occurrences',
        'Return result at the end',
      ],
    },
    {
      id: 'lab-bsearch-4',
      title: 'Search Insert Position',
      description:
        'Given a sorted array and a target, return the index where the target is found OR where it would be inserted to keep the array sorted.\n\nsearchInsert([1, 3, 5, 6], 5) = 2\nsearchInsert([1, 3, 5, 6], 2) = 1\nsearchInsert([1, 3, 5, 6], 7) = 4\n\nPrint all three results.',
      difficulty: 'intermediate',
      expectedOutput: ['2', '1', '4'],
      starterCode: '// Search Insert Position\nfunction searchInsert(arr, target) {\n  var left = 0, right = arr.length - 1;\n  // binary search — return mid if found, or left when loop ends\n}\n\nvar arr = [1, 3, 5, 6];\nconsole.log(searchInsert(arr, 5));\nconsole.log(searchInsert(arr, 2));\nconsole.log(searchInsert(arr, 7));\n',
      hints: [
        'Run standard binary search; if arr[mid] === target, return mid immediately',
        'When the loop ends (left > right), "left" is exactly where the target should be inserted',
        'Return left after the while loop',
      ],
    },
    {
      id: 'lab-bsearch-5',
      title: 'Peak Element',
      description:
        'A peak element is greater than its neighbors. Find the index of any peak in the array.\n\nFor [1, 3, 5, 3, 1], the peak is at index 2 (value 5).\nFor [1, 2, 3, 1], the peak is at index 2 (value 3).\n\nPrint the peak index for each array.',
      difficulty: 'advanced',
      expectedOutput: ['2', '2'],
      starterCode: '// Peak element using binary search\nfunction findPeak(arr) {\n  var left = 0, right = arr.length - 1;\n  // if mid > mid+1, peak is on the left (including mid)\n  // otherwise peak is on the right\n}\n\nconsole.log(findPeak([1, 3, 5, 3, 1]));\nconsole.log(findPeak([1, 2, 3, 1]));\n',
      hints: [
        'Calculate mid; compare arr[mid] with arr[mid + 1]',
        'If arr[mid] > arr[mid + 1], the peak is at mid or to its left — set right = mid',
        'Otherwise set left = mid + 1. When left === right, that is the peak index',
      ],
    },
  ],
}
