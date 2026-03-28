import type { LabPack } from '../types'

export const arrays: LabPack = {
  id: 'lab-arr',
  name: 'Array Challenges',
  description: 'Solve essential array problems from two-sum to merging sorted arrays',
  icon: '📦',
  color: '#eab308',
  exercises: [
    {
      id: 'lab-arr-1',
      title: 'Two Sum',
      description:
        'Given an array of numbers and a target, find the indices of the two numbers that add up to the target.\n\ntwoSum([2,7,11,15], 9) = [0,1]  (2+7=9)\ntwoSum([3,2,4], 6) = [1,2]  (2+4=6)\n\nPrint both results as "i,j".',
      difficulty: 'beginner',
      expectedOutput: ['0,1', '1,2'],
      starterCode: '// Two Sum\nfunction twoSum(arr, target) {\n  var map = {};\n  // store each value\'s index, look up target - current\n}\n\nconsole.log(twoSum([2,7,11,15], 9).join(","));\nconsole.log(twoSum([3,2,4], 6).join(","));\n',
      hints: [
        'For each element, compute complement = target - arr[i]',
        'If complement is already in map, return [map[complement], i]',
        'Otherwise store map[arr[i]] = i and continue',
      ],
    },
    {
      id: 'lab-arr-2',
      title: 'Rotate Array',
      description:
        'Rotate an array to the right by k steps.\n\nrotate([1,2,3,4,5,6,7], 3) = [5,6,7,1,2,3,4]\n\nPrint the rotated array as comma-separated values.',
      difficulty: 'beginner',
      expectedOutput: ['5,6,7,1,2,3,4'],
      starterCode: '// Rotate array right by k steps\nfunction rotate(arr, k) {\n  // slice and concat, or use reverse trick\n}\n\nconsole.log(rotate([1,2,3,4,5,6,7], 3).join(","));\n',
      hints: [
        'k = k % arr.length to handle k larger than array size',
        'slice approach: return arr.slice(-k).concat(arr.slice(0, arr.length - k))',
        'The last k elements move to the front',
      ],
    },
    {
      id: 'lab-arr-3',
      title: 'Find Duplicates',
      description:
        'Find all duplicate numbers in an array. Return them sorted.\n\nfindDuplicates([4,3,2,7,8,2,3,1]) = [2,3]\n\nPrint the duplicates as comma-separated values.',
      difficulty: 'intermediate',
      expectedOutput: ['2,3'],
      starterCode: '// Find duplicates\nfunction findDuplicates(arr) {\n  var count = {};\n  var result = [];\n  // count frequencies, collect those > 1\n}\n\nconsole.log(findDuplicates([4,3,2,7,8,2,3,1]).join(","));\n',
      hints: [
        'Build a frequency map: count[num] = (count[num] || 0) + 1',
        'Then iterate the map and collect keys where count > 1',
        'Sort the result before returning',
      ],
    },
    {
      id: 'lab-arr-4',
      title: 'Merge Sorted Arrays',
      description:
        'Merge two sorted arrays into one sorted array.\n\nmerge([1,3,5,7], [2,4,6,8]) = [1,2,3,4,5,6,7,8]\n\nPrint the merged array as comma-separated values.',
      difficulty: 'intermediate',
      expectedOutput: ['1,2,3,4,5,6,7,8'],
      starterCode: '// Merge sorted arrays\nfunction merge(a, b) {\n  var result = [];\n  var i = 0, j = 0;\n  // compare elements from both arrays\n}\n\nconsole.log(merge([1,3,5,7], [2,4,6,8]).join(","));\n',
      hints: [
        'Use two pointers i and j starting at 0 for each array',
        'Compare a[i] and b[j], push the smaller one and advance that pointer',
        'After the loop, push any remaining elements from either array',
      ],
    },
    {
      id: 'lab-arr-5',
      title: 'Missing Number',
      description:
        'Given an array containing n distinct numbers in the range [0, n], find the one missing number.\n\nmissingNumber([3,0,1]) = 2\nmissingNumber([9,6,4,2,3,5,7,0,1]) = 8\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['2', '8'],
      starterCode: '// Missing number\nfunction missingNumber(arr) {\n  var n = arr.length;\n  // expected sum = n*(n+1)/2, subtract actual sum\n}\n\nconsole.log(missingNumber([3,0,1]));\nconsole.log(missingNumber([9,6,4,2,3,5,7,0,1]));\n',
      hints: [
        'The sum of 0 to n is n*(n+1)/2',
        'Compute the actual sum of the array with reduce',
        'Return expectedSum - actualSum',
      ],
    },
  ],
}
