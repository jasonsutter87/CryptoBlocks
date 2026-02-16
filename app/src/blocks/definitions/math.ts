import type { BlockDefinition } from '../../types/block'

export const mathBlocks: BlockDefinition[] = [
  {
    name: 'add',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add two numbers together',
    category: 'Math',
    inputs: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function add(a, b) {\n  return a + b;\n}`,
      python: `def add(a, b):\n    return a + b`,
    },
    tests: [
      { input: { a: 2, b: 3 }, expected: { result: 5 } },
      { input: { a: -1, b: 1 }, expected: { result: 0 } },
    ],
    color: '#5B80A5',
  },
  {
    name: 'subtract',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Subtract one number from another',
    category: 'Math',
    inputs: [
      { name: 'a', type: 'number', description: 'Number to subtract from' },
      { name: 'b', type: 'number', description: 'Number to subtract' },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function subtract(a, b) {\n  return a - b;\n}`,
      python: `def subtract(a, b):\n    return a - b`,
    },
    tests: [
      { input: { a: 5, b: 3 }, expected: { result: 2 } },
      { input: { a: 0, b: 5 }, expected: { result: -5 } },
    ],
    color: '#5B80A5',
  },
  {
    name: 'multiply',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Multiply two numbers',
    category: 'Math',
    inputs: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function multiply(a, b) {\n  return a * b;\n}`,
      python: `def multiply(a, b):\n    return a * b`,
    },
    tests: [
      { input: { a: 4, b: 5 }, expected: { result: 20 } },
      { input: { a: 0, b: 100 }, expected: { result: 0 } },
    ],
    color: '#5B80A5',
  },
  {
    name: 'divide',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Divide one number by another',
    category: 'Math',
    inputs: [
      { name: 'a', type: 'number', description: 'Number to divide' },
      { name: 'b', type: 'number', description: 'Number to divide by' },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function divide(a, b) {\n  if (b === 0) return "Can't divide by zero!";\n  return a / b;\n}`,
      python: `def divide(a, b):\n    if b == 0:\n        return "Can't divide by zero!"\n    return a / b`,
    },
    tests: [
      { input: { a: 10, b: 2 }, expected: { result: 5 } },
      { input: { a: 7, b: 0 }, expected: { result: "Can't divide by zero!" } },
    ],
    color: '#5B80A5',
  },
  {
    name: 'random_number',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Pick a random number between min and max',
    category: 'Math',
    inputs: [
      { name: 'min', type: 'number', description: 'Lowest possible number', default: 1 },
      { name: 'max', type: 'number', description: 'Highest possible number', default: 100 },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function randomNumber(min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min;\n}`,
      python: `import random\ndef random_number(min_val, max_val):\n    return random.randint(min_val, max_val)`,
    },
    tests: [
      { input: { min: 1, max: 10 }, expected: { result: 'number' } },
    ],
    color: '#5B80A5',
  },
  {
    name: 'round',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Round a number to the nearest whole number',
    category: 'Math',
    inputs: [{ name: 'value', type: 'number', description: 'Number to round' }],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function roundNumber(value) {\n  return Math.round(value);\n}`,
      python: `def round_number(value):\n    return round(value)`,
    },
    tests: [
      { input: { value: 3.7 }, expected: { result: 4 } },
      { input: { value: 3.2 }, expected: { result: 3 } },
    ],
    color: '#5B80A5',
  },
  {
    name: 'power',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Raise a number to a power (like 2^3 = 8)',
    category: 'Math',
    inputs: [
      { name: 'base', type: 'number', description: 'The base number' },
      { name: 'exponent', type: 'number', description: 'The power to raise to', default: 2 },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function power(base, exponent) {\n  return Math.pow(base, exponent);\n}`,
      python: `def power(base, exponent):\n    return base ** exponent`,
    },
    tests: [
      { input: { base: 2, exponent: 3 }, expected: { result: 8 } },
      { input: { base: 5, exponent: 2 }, expected: { result: 25 } },
    ],
    color: '#5B80A5',
  },
  {
    name: 'fibonacci',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Generate the first N Fibonacci numbers',
    category: 'Math',
    inputs: [
      { name: 'n', type: 'number', description: 'How many Fibonacci numbers to generate', default: 7 },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function fibonacci(n) {\n  if (n <= 0) return [];\n  if (n === 1) return [0];\n  const result = [0, 1];\n  for (let i = 2; i < n; i++) {\n    result.push(result[i - 1] + result[i - 2]);\n  }\n  return result;\n}`,
      python: `def fibonacci(n):\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    result = [0, 1]\n    for i in range(2, n):\n        result.append(result[i - 1] + result[i - 2])\n    return result`,
    },
    tests: [
      { input: { n: 7 }, expected: { result: [0, 1, 1, 2, 3, 5, 8] } },
      { input: { n: 1 }, expected: { result: [0] } },
      { input: { n: 0 }, expected: { result: [] } },
    ],
    color: '#5B80A5',
  },
]
