import type { BlockDefinition } from '../../types/block'

export const logicBlocks: BlockDefinition[] = [
  {
    name: 'if_then',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Pick between two values based on a condition',
    category: 'Logic',
    inputs: [
      { name: 'condition', type: 'boolean', description: 'The condition to check' },
      { name: 'then_value', type: 'any', description: 'Value if true' },
      { name: 'else_value', type: 'any', description: 'Value if false' },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function ifThen(condition, thenValue, elseValue) {\n  return condition ? thenValue : elseValue;\n}`,
      python: `def if_then(condition, then_value, else_value):\n    return then_value if condition else else_value`,
    },
    tests: [
      { input: { condition: true, then_value: 'yes', else_value: 'no' }, expected: { result: 'yes' } },
      { input: { condition: false, then_value: 'yes', else_value: 'no' }, expected: { result: 'no' } },
    ],
    color: '#059669',
  },
  {
    name: 'equals',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if two values are equal',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'any', description: 'First value' },
      { name: 'b', type: 'any', description: 'Second value' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function equals(a, b) {\n  return a === b;\n}`,
      python: `def equals(a, b):\n    return a == b`,
    },
    tests: [
      { input: { a: 5, b: 5 }, expected: { result: true } },
      { input: { a: 'hello', b: 'world' }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'greater_than',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if first number is bigger than second',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function greaterThan(a, b) {\n  return a > b;\n}`,
      python: `def greater_than(a, b):\n    return a > b`,
    },
    tests: [
      { input: { a: 10, b: 5 }, expected: { result: true } },
      { input: { a: 3, b: 7 }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'less_than',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if first number is smaller than second',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function lessThan(a, b) {\n  return a < b;\n}`,
      python: `def less_than(a, b):\n    return a < b`,
    },
    tests: [
      { input: { a: 3, b: 7 }, expected: { result: true } },
      { input: { a: 10, b: 5 }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'and',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'True only if BOTH conditions are true',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'boolean', description: 'First condition' },
      { name: 'b', type: 'boolean', description: 'Second condition' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function and(a, b) {\n  return a && b;\n}`,
      python: `def and_gate(a, b):\n    return a and b`,
    },
    tests: [
      { input: { a: true, b: true }, expected: { result: true } },
      { input: { a: true, b: false }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'or',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'True if EITHER condition is true',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'boolean', description: 'First condition' },
      { name: 'b', type: 'boolean', description: 'Second condition' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function or(a, b) {\n  return a || b;\n}`,
      python: `def or_gate(a, b):\n    return a or b`,
    },
    tests: [
      { input: { a: false, b: true }, expected: { result: true } },
      { input: { a: false, b: false }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'not',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Flip true to false, and false to true',
    category: 'Logic',
    inputs: [{ name: 'value', type: 'boolean', description: 'The value to flip' }],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function not(value) {\n  return !value;\n}`,
      python: `def not_gate(value):\n    return not value`,
    },
    tests: [
      { input: { value: true }, expected: { result: false } },
      { input: { value: false }, expected: { result: true } },
    ],
    color: '#059669',
  },
  {
    name: 'not_equals',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if two values are not equal',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'any', description: 'First value' },
      { name: 'b', type: 'any', description: 'Second value' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function notEquals(a, b) {\n  return a !== b;\n}`,
      python: `def not_equals(a, b):\n    return a != b`,
    },
    tests: [
      { input: { a: 1, b: 2 }, expected: { result: true } },
      { input: { a: 1, b: 1 }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'greater_or_equal',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if first number is greater than or equal to second',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function greaterOrEqual(a, b) {\n  return a >= b;\n}`,
      python: `def greater_or_equal(a, b):\n    return a >= b`,
    },
    tests: [
      { input: { a: 5, b: 5 }, expected: { result: true } },
      { input: { a: 3, b: 5 }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'less_or_equal',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if first number is less than or equal to second',
    category: 'Logic',
    inputs: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function lessOrEqual(a, b) {\n  return a <= b;\n}`,
      python: `def less_or_equal(a, b):\n    return a <= b`,
    },
    tests: [
      { input: { a: 5, b: 5 }, expected: { result: true } },
      { input: { a: 6, b: 5 }, expected: { result: false } },
    ],
    color: '#059669',
  },
  {
    name: 'typeof_value',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the type of a value (number, string, boolean, object, etc)',
    category: 'Logic',
    inputs: [
      { name: 'value', type: 'any', description: 'Value to check the type of' },
    ],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: `function typeofValue(value) {\n  if (Array.isArray(value)) return "array";\n  return typeof value;\n}`,
      python: `def typeof_value(value):\n    if isinstance(value, list):\n        return "array"\n    if isinstance(value, dict):\n        return "object"\n    if isinstance(value, bool):\n        return "boolean"\n    if isinstance(value, (int, float)):\n        return "number"\n    if isinstance(value, str):\n        return "string"\n    return type(value).__name__`,
    },
    tests: [
      { input: { value: 42 }, expected: { result: 'number' } },
      { input: { value: 'hello' }, expected: { result: 'string' } },
      { input: { value: true }, expected: { result: 'boolean' } },
    ],
    color: '#059669',
  },
  {
    name: 'is_null',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if a value is null, undefined, or empty',
    category: 'Logic',
    inputs: [
      { name: 'value', type: 'any', description: 'Value to check' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function isNull(value) {\n  return value === null || value === undefined;\n}`,
      python: `def is_null(value):\n    return value is None`,
    },
    tests: [
      { input: { value: null }, expected: { result: true } },
      { input: { value: 0 }, expected: { result: false } },
      { input: { value: '' }, expected: { result: false } },
    ],
    color: '#059669',
  },
]
