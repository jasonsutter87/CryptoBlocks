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
    name: 'set_variable',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Store a value in a named variable',
    category: 'Basics',
    inputs: [
      { name: 'name', type: 'string', description: 'Variable name' },
      { name: 'value', type: 'any', description: 'Value to store' },
    ],
    outputs: [{ name: 'value', type: 'any' }],
    implementations: {
      javascript: `function setVariable(name, value) {\n  window.__vars = window.__vars || {};\n  window.__vars[name] = value;\n  return value;\n}`,
      python: `def set_variable(name, value):\n    globals()[name] = value\n    return value`,
    },
    tests: [
      { input: { name: 'x', value: 42 }, expected: { value: 42 } },
    ],
    color: '#4C97AF',
  },
  {
    name: 'get_variable',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the value of a named variable',
    category: 'Basics',
    inputs: [{ name: 'name', type: 'string', description: 'Variable name' }],
    outputs: [{ name: 'value', type: 'any' }],
    implementations: {
      javascript: `function getVariable(name) {\n  return (window.__vars || {})[name];\n}`,
      python: `def get_variable(name):\n    return globals().get(name)`,
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
  {
    name: 'repeat',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Repeat something a number of times',
    category: 'Basics',
    inputs: [{ name: 'times', type: 'number', description: 'How many times to repeat', default: 3 }],
    outputs: [{ name: 'count', type: 'number' }],
    implementations: {
      javascript: `function repeat(times, callback) {\n  for (let i = 0; i < times; i++) {\n    callback(i);\n  }\n  return times;\n}`,
      python: `def repeat(times, callback):\n    for i in range(times):\n        callback(i)\n    return times`,
    },
    tests: [
      { input: { times: 3 }, expected: { count: 3 } },
    ],
    color: '#4C97AF',
  },
]
