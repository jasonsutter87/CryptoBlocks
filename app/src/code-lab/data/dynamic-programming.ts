import type { LabPack } from '../types'

export const dynamicProgramming: LabPack = {
  id: 'lab-dp',
  name: 'Dynamic Programming',
  description: 'Solve optimization problems by breaking them into overlapping subproblems',
  icon: '📊',
  color: '#d946ef',
  exercises: [
    {
      id: 'lab-dp-1',
      title: 'Climbing Stairs',
      description:
        'You can climb 1 or 2 steps at a time. How many distinct ways can you reach the top of an n-step staircase?\n\nclimbStairs(3) = 3  (1+1+1, 1+2, 2+1)\nclimbStairs(5) = 8\n\nPrint climbStairs(10).',
      difficulty: 'beginner',
      expectedOutput: ['89'],
      starterCode: '// Climbing stairs — DP\nfunction climbStairs(n) {\n  var dp = new Array(n + 1);\n  dp[0] = 1;\n  dp[1] = 1;\n  // dp[i] = dp[i-1] + dp[i-2]\n}\n\nconsole.log(climbStairs(10));\n',
      hints: [
        'dp[0] = 1 (one way to stay at bottom), dp[1] = 1',
        'For i from 2 to n: dp[i] = dp[i-1] + dp[i-2]',
        'This is exactly the Fibonacci sequence — climbStairs(10) = fib(11) = 89',
      ],
    },
    {
      id: 'lab-dp-2',
      title: 'Coin Change',
      description:
        'Given coins [1, 5, 6, 9] and amount 11, find the minimum number of coins needed.\n\ncoinChange([1,5,6,9], 11) = 2  (5+6)\ncoinChange([1,5,6,9], 3) = 3  (1+1+1)\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['2', '3'],
      starterCode: '// Coin Change — DP\nfunction coinChange(coins, amount) {\n  var dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  // for each amount i, try each coin\n}\n\nconsole.log(coinChange([1,5,6,9], 11));\nconsole.log(coinChange([1,5,6,9], 3));\n',
      hints: [
        'dp[0] = 0; all others start as Infinity',
        'For i from 1 to amount, for each coin: if coin <= i, dp[i] = Math.min(dp[i], dp[i - coin] + 1)',
        'Return dp[amount]',
      ],
    },
    {
      id: 'lab-dp-3',
      title: 'Longest Common Subsequence',
      description:
        'Find the length of the longest common subsequence (LCS) of two strings.\n\nLCS("abcde", "ace") = 3  (a, c, e)\nLCS("abc", "abc") = 3\nLCS("abc", "def") = 0\n\nPrint lcs("abcde", "ace").',
      difficulty: 'intermediate',
      expectedOutput: ['3'],
      starterCode: '// Longest Common Subsequence\nfunction lcs(s1, s2) {\n  var m = s1.length, n = s2.length;\n  var dp = [];\n  for (var i = 0; i <= m; i++) dp[i] = new Array(n + 1).fill(0);\n  // fill dp bottom-up\n}\n\nconsole.log(lcs("abcde", "ace"));\n',
      hints: [
        'dp[i][j] = LCS length for s1[0..i-1] and s2[0..j-1]',
        'If s1[i-1] === s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1',
        'Otherwise: dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])',
      ],
    },
    {
      id: 'lab-dp-4',
      title: "Max Subarray (Kadane's)",
      description:
        "Find the contiguous subarray with the largest sum.\n\nmaxSubarray([-2,1,-3,4,-1,2,1,-5,4]) = 6  (subarray [4,-1,2,1])\n\nPrint the maximum sum.",
      difficulty: 'intermediate',
      expectedOutput: ['6'],
      starterCode: "// Kadane's Algorithm\nfunction maxSubarray(arr) {\n  var maxSoFar = arr[0];\n  var maxEndingHere = arr[0];\n  // iterate from index 1\n}\n\nconsole.log(maxSubarray([-2,1,-3,4,-1,2,1,-5,4]));\n",
      hints: [
        'At each index, decide: extend the current subarray or start fresh',
        'maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i])',
        'maxSoFar = Math.max(maxSoFar, maxEndingHere); return maxSoFar',
      ],
    },
    {
      id: 'lab-dp-5',
      title: '0/1 Knapsack',
      description:
        'Given items with weights [2,3,4,5] and values [3,4,5,6], and a bag capacity of 5, find the maximum value you can carry. Each item can only be used once.\n\nknapsack([2,3,4,5], [3,4,5,6], 5) = 7  (items with weight 2 and 3)\n\nPrint the maximum value.',
      difficulty: 'advanced',
      expectedOutput: ['7'],
      starterCode: '// 0/1 Knapsack\nfunction knapsack(weights, values, capacity) {\n  var n = weights.length;\n  var dp = [];\n  for (var i = 0; i <= n; i++) dp[i] = new Array(capacity + 1).fill(0);\n  // dp[i][w] = max value using first i items with capacity w\n}\n\nconsole.log(knapsack([2,3,4,5], [3,4,5,6], 5));\n',
      hints: [
        'dp[i][w] = best value using the first i items with weight limit w',
        'If weights[i-1] > w: dp[i][w] = dp[i-1][w] (cannot include item i)',
        'Otherwise: dp[i][w] = Math.max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]])',
      ],
    },
  ],
}
