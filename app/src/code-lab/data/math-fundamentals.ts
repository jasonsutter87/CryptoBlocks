import type { LabPack } from '../types'

export const mathFundamentals: LabPack = {
  id: 'lab-math',
  name: 'Math Fundamentals',
  description: 'Primes, GCD, LCM, and classic number theory in code',
  icon: '🔢',
  color: '#22c55e',
  exercises: [
    {
      id: 'lab-math-1',
      title: 'Is Prime',
      description:
        'Write a function isPrime(n) that returns true if n is a prime number, false otherwise.\n\nisPrime(7) = true\nisPrime(10) = false\nisPrime(1) = false\n\nPrint all three results.',
      difficulty: 'beginner',
      expectedOutput: ['true', 'false', 'false'],
      starterCode: '// Is Prime\nfunction isPrime(n) {\n  if (n < 2) return false;\n  // check divisors from 2 up to sqrt(n)\n}\n\nconsole.log(isPrime(7));\nconsole.log(isPrime(10));\nconsole.log(isPrime(1));\n',
      hints: [
        'Numbers less than 2 are not prime',
        'Loop i from 2 while i * i <= n; if n % i === 0, return false',
        'If no divisor is found, return true',
      ],
    },
    {
      id: 'lab-math-2',
      title: 'Greatest Common Divisor',
      description:
        'Implement the Euclidean algorithm to find the GCD of two numbers.\n\ngcd(48, 18) = 6\ngcd(100, 75) = 25\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['6', '25'],
      starterCode: '// GCD — Euclidean algorithm\nfunction gcd(a, b) {\n  // while b != 0: temp = b, b = a % b, a = temp\n  // return a\n}\n\nconsole.log(gcd(48, 18));\nconsole.log(gcd(100, 75));\n',
      hints: [
        'The Euclidean algorithm: gcd(a, b) = gcd(b, a % b)',
        'Base case: gcd(a, 0) = a',
        'Recursive version: if b === 0 return a; else return gcd(b, a % b)',
      ],
    },
    {
      id: 'lab-math-3',
      title: 'Least Common Multiple',
      description:
        'Find the LCM of two numbers using the GCD.\n\nlcm(4, 6) = 12\nlcm(12, 15) = 60\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['12', '60'],
      starterCode: '// LCM using GCD\nfunction gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }\n\nfunction lcm(a, b) {\n  // lcm(a, b) = (a * b) / gcd(a, b)\n}\n\nconsole.log(lcm(4, 6));\nconsole.log(lcm(12, 15));\n',
      hints: [
        'LCM formula: lcm(a, b) = (a * b) / gcd(a, b)',
        'Use the provided gcd function',
        'Divide before multiplying to avoid overflow: (a / gcd(a, b)) * b',
      ],
    },
    {
      id: 'lab-math-4',
      title: 'Sum of Primes Up to N',
      description:
        'Use the Sieve of Eratosthenes to find all primes up to N, then sum them.\n\nsumPrimes(10) = 17  (2+3+5+7)\nsumPrimes(30) = 129\n\nPrint sumPrimes(30).',
      difficulty: 'intermediate',
      expectedOutput: ['129'],
      starterCode: '// Sum of primes using Sieve of Eratosthenes\nfunction sumPrimes(n) {\n  var sieve = new Array(n + 1).fill(true);\n  sieve[0] = false;\n  sieve[1] = false;\n  // mark multiples of each prime as false\n  // sum all indices where sieve[i] is true\n}\n\nconsole.log(sumPrimes(30));\n',
      hints: [
        'Start with i = 2; while i * i <= n, mark all multiples of i as not prime',
        'for (var j = i * i; j <= n; j += i) sieve[j] = false',
        'After the sieve, sum all i where sieve[i] === true',
      ],
    },
    {
      id: 'lab-math-5',
      title: "Pascal's Triangle Row",
      description:
        "Return the nth row of Pascal's triangle (0-indexed).\n\npascalRow(0) = [1]\npascalRow(4) = [1,4,6,4,1]\n\nPrint pascalRow(5) as comma-separated values.",
      difficulty: 'intermediate',
      expectedOutput: ['1,5,10,10,5,1'],
      starterCode: "// Pascal's triangle row\nfunction pascalRow(n) {\n  var row = [1];\n  // each element: row[k] = row[k-1] * (n - k + 1) / k\n}\n\nconsole.log(pascalRow(5).join(','));\n",
      hints: [
        'Start with row = [1]',
        'For k from 1 to n: row[k] = row[k-1] * (n - k + 1) / k',
        'This uses the binomial coefficient formula C(n,k) = C(n,k-1) * (n-k+1) / k',
      ],
    },
  ],
}
