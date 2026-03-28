import type { LabPack } from '../types'

export const recursion: LabPack = {
  id: 'lab-rec',
  name: 'Recursion',
  description: 'Master recursive thinking by breaking problems into smaller subproblems',
  icon: '🔄',
  color: '#f97316',
  exercises: [
    {
      id: 'lab-rec-1',
      title: 'Factorial',
      description:
        'Write a recursive function factorial(n) that returns n! (n factorial).\n\nfactorial(0) = 1\nfactorial(5) = 120\n\nPrint the result of factorial(6).',
      difficulty: 'beginner',
      expectedOutput: ['720'],
      starterCode: '// Recursive factorial\nfunction factorial(n) {\n  // base case: factorial(0) = 1\n  // recursive case: n * factorial(n - 1)\n}\n\nconsole.log(factorial(6));\n',
      hints: [
        'Base case: if n === 0 return 1',
        'Recursive case: return n * factorial(n - 1)',
        'factorial(6) = 6 * 5 * 4 * 3 * 2 * 1 = 720',
      ],
    },
    {
      id: 'lab-rec-2',
      title: 'Fibonacci',
      description:
        'Write a recursive function fib(n) that returns the nth Fibonacci number.\n\nfib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)\n\nPrint fib(7).',
      difficulty: 'beginner',
      expectedOutput: ['13'],
      starterCode: '// Recursive Fibonacci\nfunction fib(n) {\n  // base cases: fib(0) = 0, fib(1) = 1\n  // recursive case: fib(n-1) + fib(n-2)\n}\n\nconsole.log(fib(7));\n',
      hints: [
        'Base cases: if n === 0 return 0, if n === 1 return 1',
        'Recursive case: return fib(n - 1) + fib(n - 2)',
        'The sequence is 0,1,1,2,3,5,8,13 — the 7th (0-indexed) is 13',
      ],
    },
    {
      id: 'lab-rec-3',
      title: 'Sum of Digits',
      description:
        'Write a recursive function sumDigits(n) that returns the sum of all digits of n.\n\nsumDigits(123) = 1 + 2 + 3 = 6\nsumDigits(9875) = 29\n\nPrint sumDigits(9875).',
      difficulty: 'beginner',
      expectedOutput: ['29'],
      starterCode: '// Recursive sum of digits\nfunction sumDigits(n) {\n  // base case: single digit\n  // recursive case: last digit + sumDigits(rest)\n}\n\nconsole.log(sumDigits(9875));\n',
      hints: [
        'Base case: if n < 10, return n',
        'Last digit: n % 10. Remaining number: Math.floor(n / 10)',
        'Return (n % 10) + sumDigits(Math.floor(n / 10))',
      ],
    },
    {
      id: 'lab-rec-4',
      title: 'Power Function',
      description:
        'Write a recursive function power(base, exp) that computes base raised to exp.\n\npower(2, 10) = 1024\npower(3, 4) = 81\n\nPrint power(2, 10).',
      difficulty: 'intermediate',
      expectedOutput: ['1024'],
      starterCode: '// Recursive power\nfunction power(base, exp) {\n  // base case: anything to the 0 = 1\n  // recursive case: base * power(base, exp - 1)\n}\n\nconsole.log(power(2, 10));\n',
      hints: [
        'Base case: if exp === 0, return 1',
        'Recursive case: return base * power(base, exp - 1)',
        '2^10 = 2 * 2^9 = ... = 1024',
      ],
    },
    {
      id: 'lab-rec-5',
      title: 'Flatten Nested Array',
      description:
        'Write a recursive function flatten(arr) that flattens a deeply nested array.\n\nflatten([1, [2, [3, [4]], 5]]) = [1, 2, 3, 4, 5]\n\nPrint the flattened result of [[1, [2]], [3, [4, [5]]]] as comma-separated values.',
      difficulty: 'advanced',
      expectedOutput: ['1,2,3,4,5'],
      starterCode: '// Recursive flatten\nfunction flatten(arr) {\n  var result = [];\n  // iterate over each element\n  // if it\'s an array, recurse; otherwise push it\n  return result;\n}\n\nconsole.log(flatten([[1, [2]], [3, [4, [5]]]]).join(\',\'));\n',
      hints: [
        'Loop over each element of arr',
        'If the element is an Array (use Array.isArray), recursively flatten it and concat',
        'Otherwise push the element directly into result',
      ],
    },
  ],
}
