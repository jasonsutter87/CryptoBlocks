import type { BlockDefinition } from '../../types/block'

export const basicsBlocks: BlockDefinition[] = [
  {
    name: 'print',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Print a message to the output',
    category: 'Basics',
    inputs: [{ name: 'message', type: 'any', description: 'The message to print' }],
    outputs: [],
    implementations: {
      javascript: `function print(message) {\n  console.log(message);\n}`,
      python: `def print_message(message):\n    print(message)`,
    },
    tests: [
      { input: { message: 'Hello!' }, expected: {} },
    ],
    color: '#4C97AF',
  },
  {
    name: 'do',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Run a value without printing it',
    category: 'Basics',
    inputs: [{ name: 'value', type: 'any', description: 'The value to evaluate' }],
    outputs: [],
    implementations: {
      javascript: `function doValue(value) {\n  return value;\n}`,
      python: `def do_value(value):\n    return value`,
    },
    tests: [
      { input: { value: 42 }, expected: {} },
    ],
    color: '#4C97AF',
  },
  {
    name: 'ask',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Ask the user a question and get their answer',
    category: 'Basics',
    inputs: [{ name: 'question', type: 'string', description: 'The question to ask' }],
    outputs: [{ name: 'answer', type: 'string' }],
    implementations: {
      javascript: `function ask(question) {\n  return prompt(question) || "";\n}`,
      python: `def ask(question):\n    return input(question)`,
    },
    tests: [
      { input: { question: 'What is your name?' }, expected: { answer: 'string' } },
    ],
    color: '#4C97AF',
  },
  {
    name: 'set_global',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Store a value that all blocks can access',
    category: 'Basics',
    inputs: [
      { name: 'name', type: 'string', description: 'Variable name' },
      { name: 'value', type: 'any', description: 'Value to store' },
    ],
    outputs: [{ name: 'value', type: 'any' }],
    implementations: {
      javascript: `function setGlobal(name, value) {\n  window.__vars = window.__vars || {};\n  window.__vars[name] = value;\n  return value;\n}`,
      python: `def set_global(name, value):\n    globals()[name] = value\n    return value`,
    },
    tests: [
      { input: { name: 'x', value: 42 }, expected: { value: 42 } },
    ],
    color: '#4C97AF',
    shape: 'statement',
  },
  {
    name: 'get_global',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get a value that was stored with Set Global',
    category: 'Basics',
    inputs: [{ name: 'name', type: 'string', description: 'Variable name' }],
    outputs: [{ name: 'value', type: 'any' }],
    implementations: {
      javascript: `function getGlobal(name) {\n  return (window.__vars || {})[name];\n}`,
      python: `def get_global(name):\n    return globals().get(name)`,
    },
    tests: [
      { input: { name: 'x' }, expected: { value: 'any' } },
    ],
    color: '#4C97AF',
  },
  {
    name: 'wait',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Wait for a number of seconds',
    category: 'Basics',
    inputs: [{ name: 'seconds', type: 'number', description: 'How many seconds to wait', default: 1 }],
    outputs: [],
    implementations: {
      javascript: `async function wait(seconds) {\n  await new Promise(r => setTimeout(r, seconds * 1000));\n}`,
      python: `import time\ndef wait(seconds):\n    time.sleep(seconds)`,
    },
    tests: [
      { input: { seconds: 1 }, expected: {} },
    ],
    color: '#4C97AF',
  },
]
