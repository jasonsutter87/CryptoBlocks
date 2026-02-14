import type { BlockDefinition } from '../../types/block'

export const textBlocks: BlockDefinition[] = [
  {
    name: 'uppercase',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Convert text to UPPERCASE',
    category: 'Text',
    inputs: [{ name: 'text', type: 'string', description: 'The text to convert' }],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: `function uppercase(text) {\n  return text.toUpperCase();\n}`,
      python: `def uppercase(text):\n    return text.upper()`,
    },
    tests: [
      { input: { text: 'hello' }, expected: { result: 'HELLO' } },
      { input: { text: 'CryptoBlocks' }, expected: { result: 'CRYPTOBLOCKS' } },
    ],
    color: '#8B5CF6',
  },
  {
    name: 'lowercase',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Convert text to lowercase',
    category: 'Text',
    inputs: [{ name: 'text', type: 'string', description: 'The text to convert' }],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: `function lowercase(text) {\n  return text.toLowerCase();\n}`,
      python: `def lowercase(text):\n    return text.lower()`,
    },
    tests: [
      { input: { text: 'HELLO' }, expected: { result: 'hello' } },
    ],
    color: '#8B5CF6',
  },
  {
    name: 'join_text',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Join two pieces of text together',
    category: 'Text',
    inputs: [
      { name: 'first', type: 'string', description: 'First text' },
      { name: 'second', type: 'string', description: 'Second text' },
    ],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: `function joinText(first, second) {\n  return first + second;\n}`,
      python: `def join_text(first, second):\n    return first + second`,
    },
    tests: [
      { input: { first: 'Hello, ', second: 'world!' }, expected: { result: 'Hello, world!' } },
    ],
    color: '#8B5CF6',
  },
  {
    name: 'reverse_text',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Reverse any text string',
    category: 'Text',
    inputs: [{ name: 'text', type: 'string', description: 'The text to reverse' }],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: `function reverseText(text) {\n  return text.split('').reverse().join('');\n}`,
      python: `def reverse_text(text):\n    return text[::-1]`,
    },
    tests: [
      { input: { text: 'hello' }, expected: { result: 'olleh' } },
      { input: { text: '12345' }, expected: { result: '54321' } },
      { input: { text: '' }, expected: { result: '' } },
    ],
    color: '#8B5CF6',
  },
  {
    name: 'text_length',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Count the number of characters in text',
    category: 'Text',
    inputs: [{ name: 'text', type: 'string', description: 'The text to measure' }],
    outputs: [{ name: 'length', type: 'number' }],
    implementations: {
      javascript: `function textLength(text) {\n  return text.length;\n}`,
      python: `def text_length(text):\n    return len(text)`,
    },
    tests: [
      { input: { text: 'hello' }, expected: { length: 5 } },
      { input: { text: '' }, expected: { length: 0 } },
    ],
    color: '#8B5CF6',
  },
  {
    name: 'contains',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if text contains a word or phrase',
    category: 'Text',
    inputs: [
      { name: 'text', type: 'string', description: 'The text to search in' },
      { name: 'search', type: 'string', description: 'What to search for' },
    ],
    outputs: [{ name: 'found', type: 'boolean' }],
    implementations: {
      javascript: `function contains(text, search) {\n  return text.includes(search);\n}`,
      python: `def contains(text, search):\n    return search in text`,
    },
    tests: [
      { input: { text: 'Hello world', search: 'world' }, expected: { found: true } },
      { input: { text: 'Hello world', search: 'xyz' }, expected: { found: false } },
    ],
    color: '#8B5CF6',
  },
  {
    name: 'replace_text',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Replace part of a text with something else',
    category: 'Text',
    inputs: [
      { name: 'text', type: 'string', description: 'The original text' },
      { name: 'find', type: 'string', description: 'What to find' },
      { name: 'replacement', type: 'string', description: 'What to replace it with' },
    ],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: `function replaceText(text, find, replacement) {\n  return text.replaceAll(find, replacement);\n}`,
      python: `def replace_text(text, find, replacement):\n    return text.replace(find, replacement)`,
    },
    tests: [
      { input: { text: 'Hello world', find: 'world', replacement: 'there' }, expected: { result: 'Hello there' } },
    ],
    color: '#8B5CF6',
  },
]
