import type { LabPack } from '../types'

export const slidingWindow: LabPack = {
  id: 'lab-slide',
  name: 'Sliding Window',
  description: 'Efficiently process subarrays and substrings with a moving window',
  icon: '🪟',
  color: '#a855f7',
  exercises: [
    {
      id: 'lab-slide-1',
      title: 'Max Sum Subarray of Size K',
      description:
        'Find the maximum sum of any contiguous subarray of size K.\n\nmaxSumK([2,1,5,1,3,2], 3) = 9  (subarray [5,1,3])\nmaxSumK([2,3,4,1,5], 2) = 7  ([3,4])\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['9', '7'],
      starterCode: '// Max sum subarray of size K\nfunction maxSumK(arr, k) {\n  var windowSum = 0;\n  for (var i = 0; i < k; i++) windowSum += arr[i];\n  var maxSum = windowSum;\n  // slide the window: add next, remove first\n}\n\nconsole.log(maxSumK([2,1,5,1,3,2], 3));\nconsole.log(maxSumK([2,3,4,1,5], 2));\n',
      hints: [
        'Calculate the sum of the first window of size k',
        'Slide: add arr[i], subtract arr[i - k], update maxSum',
        'Loop from i = k to arr.length - 1',
      ],
    },
    {
      id: 'lab-slide-2',
      title: 'Longest Substring Without Repeating',
      description:
        'Find the length of the longest substring without repeating characters.\n\nlongestUnique("abcabcbb") = 3  ("abc")\nlongestUnique("pwwkew") = 3  ("wke")\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['3', '3'],
      starterCode: '// Longest substring without repeating characters\nfunction longestUnique(s) {\n  var map = {};\n  var left = 0, maxLen = 0;\n  for (var right = 0; right < s.length; right++) {\n    // if char is in window, shrink from left\n  }\n  return maxLen;\n}\n\nconsole.log(longestUnique("abcabcbb"));\nconsole.log(longestUnique("pwwkew"));\n',
      hints: [
        'Use a map to store the last seen index of each character',
        'If s[right] is in the window, move left to max(left, map[s[right]] + 1)',
        'Update map[s[right]] = right; maxLen = Math.max(maxLen, right - left + 1)',
      ],
    },
    {
      id: 'lab-slide-3',
      title: 'Smallest Subarray With Sum >= S',
      description:
        'Find the length of the smallest contiguous subarray whose sum is >= S.\n\nsmallestSubarray([2,1,5,2,3,2], 7) = 2  ([5,2])\nsmallestSubarray([2,1,5,2,8], 7) = 1  ([8])\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['2', '1'],
      starterCode: '// Smallest subarray with sum >= S\nfunction smallestSubarray(arr, s) {\n  var minLen = Infinity, windowSum = 0, left = 0;\n  for (var right = 0; right < arr.length; right++) {\n    windowSum += arr[right];\n    while (windowSum >= s) {\n      // shrink window from left while condition holds\n    }\n  }\n  return minLen === Infinity ? 0 : minLen;\n}\n\nconsole.log(smallestSubarray([2,1,5,2,3,2], 7));\nconsole.log(smallestSubarray([2,1,5,2,8], 7));\n',
      hints: [
        'Expand right pointer, adding to windowSum',
        'While windowSum >= s, record length (right - left + 1), subtract arr[left] and increment left',
        'Update minLen = Math.min(minLen, right - left + 1) before shrinking',
      ],
    },
    {
      id: 'lab-slide-4',
      title: 'Fruits Into Baskets',
      description:
        'You have two baskets, each holding only one type of fruit. Given a row of trees [1,2,1,2,3], find the longest subarray with at most 2 distinct values.\n\nfruitsInBaskets([1,2,1,2,3]) = 4  ([1,2,1,2])\nfruitsInBaskets([3,3,3,1,2,1,1,2,3,3,4]) = 5\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['4', '5'],
      starterCode: '// Fruits into baskets — at most 2 distinct in window\nfunction fruitsInBaskets(arr) {\n  var basket = {};\n  var left = 0, maxLen = 0;\n  for (var right = 0; right < arr.length; right++) {\n    basket[arr[right]] = (basket[arr[right]] || 0) + 1;\n    while (Object.keys(basket).length > 2) {\n      // shrink window\n    }\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}\n\nconsole.log(fruitsInBaskets([1,2,1,2,3]));\nconsole.log(fruitsInBaskets([3,3,3,1,2,1,1,2,3,3,4]));\n',
      hints: [
        'Use a frequency map for the current window',
        'When the map has more than 2 keys, decrement basket[arr[left]] and if 0 delete the key, then left++',
        'Track maxLen after each right expansion',
      ],
    },
    {
      id: 'lab-slide-5',
      title: 'Max Consecutive Ones With K Flips',
      description:
        'Given a binary array, you can flip at most K zeros to ones. Find the maximum number of consecutive ones.\n\nmaxOnes([1,1,1,0,0,0,1,1,1,1,0], 2) = 6\nmaxOnes([0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1,0], 3) = 10\n\nPrint both results.',
      difficulty: 'advanced',
      expectedOutput: ['6', '10'],
      starterCode: '// Max consecutive ones with K flips\nfunction maxOnes(arr, k) {\n  var left = 0, zeroCount = 0, maxLen = 0;\n  for (var right = 0; right < arr.length; right++) {\n    if (arr[right] === 0) zeroCount++;\n    while (zeroCount > k) {\n      // shrink window from left\n    }\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}\n\nconsole.log(maxOnes([1,1,1,0,0,0,1,1,1,1,0], 2));\nconsole.log(maxOnes([0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1,0], 3));\n',
      hints: [
        'Track zeroCount in the current window',
        'When zeroCount > k, move left forward; if arr[left] was 0, decrement zeroCount',
        'maxLen = Math.max(maxLen, right - left + 1)',
      ],
    },
  ],
}
