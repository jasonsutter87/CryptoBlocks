import type { LabPack } from '../types'

export const twoPointers: LabPack = {
  id: 'lab-2ptr',
  name: 'Two Pointers',
  description: 'Use left and right pointers to solve array problems in linear time',
  icon: '👆',
  color: '#14b8a6',
  exercises: [
    {
      id: 'lab-2ptr-1',
      title: 'Pair With Target Sum',
      description:
        'Given a sorted array and a target, find a pair that sums to the target.\n\npairSum([1,2,3,4,6], 6) = [1,3]  (indices)\npairSum([2,5,9,11], 11) = [0,2]\n\nPrint the indices as "i,j" for each.',
      difficulty: 'beginner',
      expectedOutput: ['1,3', '0,2'],
      starterCode: '// Pair with target sum — two pointers\nfunction pairSum(arr, target) {\n  var left = 0, right = arr.length - 1;\n  while (left < right) {\n    // compare sum with target and move pointers\n  }\n  return [-1, -1];\n}\n\nconsole.log(pairSum([1,2,3,4,6], 6).join(","));\nconsole.log(pairSum([2,5,9,11], 11).join(","));\n',
      hints: [
        'Sum = arr[left] + arr[right]',
        'If sum === target, return [left, right]',
        'If sum < target, move left++; if sum > target, move right--',
      ],
    },
    {
      id: 'lab-2ptr-2',
      title: 'Remove Duplicates (Sorted)',
      description:
        'Remove duplicates from a sorted array in-place and return the count of unique elements.\n\nremoveDups([1,1,2,3,3,4]) = 4  (array becomes [1,2,3,4,...])\n\nPrint the count of unique elements.',
      difficulty: 'beginner',
      expectedOutput: ['4'],
      starterCode: '// Remove duplicates from sorted array in-place\nfunction removeDups(arr) {\n  if (arr.length === 0) return 0;\n  var slow = 0;\n  // fast pointer scans ahead, slow tracks unique position\n}\n\nconsole.log(removeDups([1,1,2,3,3,4]));\n',
      hints: [
        'slow pointer marks the last unique position; fast pointer iterates',
        'If arr[fast] !== arr[slow], increment slow and copy arr[fast] to arr[slow]',
        'Return slow + 1',
      ],
    },
    {
      id: 'lab-2ptr-3',
      title: 'Container With Most Water',
      description:
        'Given heights [1,8,6,2,5,4,8,3,7], find two lines that together with the x-axis form a container holding the most water.\n\nmaxWater([1,8,6,2,5,4,8,3,7]) = 49  (lines at index 1 and 8: min(8,7)*7=49)\n\nPrint the maximum water.',
      difficulty: 'intermediate',
      expectedOutput: ['49'],
      starterCode: '// Container with most water — two pointers\nfunction maxWater(heights) {\n  var left = 0, right = heights.length - 1;\n  var maxArea = 0;\n  while (left < right) {\n    // area = min height * width\n    // move the shorter pointer inward\n  }\n  return maxArea;\n}\n\nconsole.log(maxWater([1,8,6,2,5,4,8,3,7]));\n',
      hints: [
        'Area = Math.min(heights[left], heights[right]) * (right - left)',
        'Update maxArea if current area is larger',
        'Move the pointer with the shorter height inward to potentially find a larger area',
      ],
    },
    {
      id: 'lab-2ptr-4',
      title: 'Three Sum to Zero',
      description:
        'Find all unique triplets in [-4,-1,-1,0,1,2] that sum to zero.\n\nPrint each triplet as "a,b,c" sorted, one per line.\n\nExpected output:\n-1,-1,2\n-1,0,1',
      difficulty: 'advanced',
      expectedOutput: ['-1,-1,2', '-1,0,1'],
      starterCode: '// Three sum to zero\nfunction threeSum(arr) {\n  arr.sort((a, b) => a - b);\n  var result = [];\n  for (var i = 0; i < arr.length - 2; i++) {\n    if (i > 0 && arr[i] === arr[i-1]) continue; // skip duplicates\n    var left = i + 1, right = arr.length - 1;\n    // two-pointer search for pairs summing to -arr[i]\n  }\n  return result;\n}\n\nvar triplets = threeSum([-4,-1,-1,0,1,2]);\ntriplets.forEach(t => console.log(t.join(",")));\n',
      hints: [
        'Sort the array. For each i, use two pointers left=i+1, right=end',
        'Target = -arr[i]; if arr[left]+arr[right] === target, record and skip duplicates',
        'Move left++ if sum too small, right-- if sum too large',
      ],
    },
    {
      id: 'lab-2ptr-5',
      title: 'Reverse Words in String',
      description:
        'Reverse the order of words in a string. Multiple spaces between words should become a single space.\n\nreverseWords("the sky is blue") = "blue is sky the"\nreverseWords("  hello world  ") = "world hello"\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['blue is sky the', 'world hello'],
      starterCode: '// Reverse words\nfunction reverseWords(s) {\n  // split, filter, reverse, join\n}\n\nconsole.log(reverseWords("the sky is blue"));\nconsole.log(reverseWords("  hello world  "));\n',
      hints: [
        'Split on whitespace: s.split(/\\s+/)',
        'Filter out empty strings from leading/trailing spaces',
        'Reverse the array and join with a single space',
      ],
    },
  ],
}
