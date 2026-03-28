import type { LabPack } from '../types'

export const greedy: LabPack = {
  id: 'lab-greedy',
  name: 'Greedy Algorithms',
  description: 'Make locally optimal choices at each step to reach a global optimum',
  icon: '🏃',
  color: '#f59e0b',
  exercises: [
    {
      id: 'lab-greedy-1',
      title: 'Coin Change (Greedy)',
      description:
        'Given coins [25, 10, 5, 1] (unlimited supply), find the minimum number of coins to make 41 cents.\n\nGreedy: always pick the largest coin that fits.\n\n41 = 25 + 10 + 5 + 1 = 4 coins\n\nPrint the number of coins.',
      difficulty: 'beginner',
      expectedOutput: ['4'],
      starterCode: '// Greedy coin change\nfunction coinChangeGreedy(coins, amount) {\n  var count = 0;\n  // sort coins descending\n  // keep taking the largest coin that fits\n}\n\nconsole.log(coinChangeGreedy([25, 10, 5, 1], 41));\n',
      hints: [
        'Sort coins in descending order',
        'For each coin (largest first), take as many as possible: Math.floor(amount / coin)',
        'Reduce amount by coin * taken, increase count by taken',
      ],
    },
    {
      id: 'lab-greedy-2',
      title: 'Activity Selection',
      description:
        'Select the maximum number of non-overlapping activities.\n\nActivities: start=[1,3,0,5,8,5], end=[2,4,6,7,9,9]\n\nGreedy: always pick the activity with the earliest finish time.\n\nPrint the count of selected activities.',
      difficulty: 'beginner',
      expectedOutput: ['4'],
      starterCode: '// Activity selection\nfunction activitySelection(start, end) {\n  // pair up start/end, sort by end time\n  var activities = start.map((s, i) => [s, end[i]]);\n  activities.sort((a, b) => a[1] - b[1]);\n  var count = 0, lastEnd = -1;\n  // pick activity if its start >= lastEnd\n}\n\nconsole.log(activitySelection([1,3,0,5,8,5], [2,4,6,7,9,9]));\n',
      hints: [
        'Sort activities by their end time',
        'Pick the first activity, set lastEnd = its end time',
        'For each subsequent activity, if start >= lastEnd, select it and update lastEnd',
      ],
    },
    {
      id: 'lab-greedy-3',
      title: 'Maximum Meetings',
      description:
        'A conference room can hold one meeting at a time. Given meetings with start=[0,1,3,5,8] and end=[2,3,4,7,9], find the maximum number of meetings that can be scheduled without overlap.\n\nPrint the count.',
      difficulty: 'intermediate',
      expectedOutput: ['4'],
      starterCode: '// Maximum meetings in one room\nfunction maxMeetings(start, end) {\n  var meetings = start.map((s, i) => ({s, e: end[i]}));\n  meetings.sort((a, b) => a.e - b.e);\n  var count = 0, lastEnd = -1;\n  // greedily pick meetings\n}\n\nconsole.log(maxMeetings([0,1,3,5,8], [2,3,4,7,9]));\n',
      hints: [
        'This is the same as activity selection — sort by end time',
        'Select a meeting if its start time > lastEnd (strict: no overlap)',
        'Count each selected meeting',
      ],
    },
    {
      id: 'lab-greedy-4',
      title: 'Fractional Knapsack',
      description:
        'Items: weights=[10,20,30], values=[60,100,120], capacity=50.\n\nYou can take fractions of items. Fill the knapsack greedily by value/weight ratio.\n\nPrint the maximum value (rounded to 2 decimal places).',
      difficulty: 'intermediate',
      expectedOutput: ['240.00'],
      starterCode: '// Fractional knapsack\nfunction fractionalKnapsack(weights, values, capacity) {\n  var items = weights.map((w, i) => ({w, v: values[i], ratio: values[i] / w}));\n  items.sort((a, b) => b.ratio - a.ratio);\n  var totalValue = 0;\n  // take items greedily; take fractions if needed\n}\n\nconsole.log(fractionalKnapsack([10,20,30], [60,100,120], 50));\n',
      hints: [
        'Sort items by value/weight ratio descending',
        'Take as much of the best item as possible (min of item weight and remaining capacity)',
        'totalValue += taken * item.ratio; capacity -= taken',
      ],
    },
    {
      id: 'lab-greedy-5',
      title: 'Jump Game',
      description:
        'Given an array where each element is the max jump length from that position, determine if you can reach the last index.\n\njumpGame([2,3,1,1,4]) = true\njumpGame([3,2,1,0,4]) = false\n\nPrint both results.',
      difficulty: 'advanced',
      expectedOutput: ['true', 'false'],
      starterCode: '// Jump game — greedy\nfunction jumpGame(nums) {\n  var maxReach = 0;\n  // track the farthest index reachable\n  // if current index exceeds maxReach, return false\n}\n\nconsole.log(jumpGame([2,3,1,1,4]));\nconsole.log(jumpGame([3,2,1,0,4]));\n',
      hints: [
        'Track maxReach = 0 (farthest index reachable so far)',
        'For each index i, if i > maxReach return false (stuck)',
        'Update maxReach = Math.max(maxReach, i + nums[i]); if maxReach >= last index return true',
      ],
    },
  ],
}
