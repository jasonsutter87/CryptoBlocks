import type { BlockDefinition } from '../../types/block'

export const listsBlocks: BlockDefinition[] = [
  {
    name: 'create_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create an empty list and store it globally',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name for the list' },
    ],
    outputs: [],
    implementations: {
      javascript: `function createList(name) {\n  window.__vars = window.__vars || {};\n  window.__vars[name] = [];\n}`,
      python: `def create_list(name):\n    globals()[name] = []`,
    },
    tests: [
      { input: { name: 'myList' }, expected: {} },
    ],
    color: '#D97706',
  },
  {
    name: 'list_value',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get a list as a value to plug into other blocks',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
    ],
    outputs: [{ name: 'list', type: 'any' }],
    implementations: {
      javascript: `function listValue(name) {\n  window.__vars = window.__vars || {};\n  if (!window.__vars[name]) window.__vars[name] = [];\n  return window.__vars[name];\n}`,
      python: `def list_value(name):\n    if name not in globals():\n        globals()[name] = []\n    return globals()[name]`,
    },
    tests: [
      { input: { name: 'myList' }, expected: { list: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'add_to_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add an item to the end of a list',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'item', type: 'any', description: 'Item to add' },
    ],
    outputs: [],
    implementations: {
      javascript: `function addToList(name, item) {\n  window.__vars = window.__vars || {};\n  if (!window.__vars[name]) window.__vars[name] = [];\n  window.__vars[name].push(item);\n}`,
      python: `def add_to_list(name, item):\n    if name not in globals():\n        globals()[name] = []\n    globals()[name].append(item)`,
    },
    tests: [
      { input: { name: 'myList', item: 'hello' }, expected: {} },
    ],
    color: '#D97706',
  },
  {
    name: 'get_from_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get an item from a list by position (starts at 0)',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'index', type: 'number', description: 'Position (0 = first)', default: 0 },
    ],
    outputs: [{ name: 'item', type: 'any' }],
    implementations: {
      javascript: `function getFromList(name, index) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  return list[index];\n}`,
      python: `def get_from_list(name, index):\n    lst = globals().get(name, [])\n    return lst[index] if index < len(lst) else None`,
    },
    tests: [
      { input: { name: 'myList', index: 0 }, expected: { item: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'list_length',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the number of items in a list',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
    ],
    outputs: [{ name: 'length', type: 'number' }],
    implementations: {
      javascript: `function listLength(name) {\n  window.__vars = window.__vars || {};\n  return (window.__vars[name] || []).length;\n}`,
      python: `def list_length(name):\n    return len(globals().get(name, []))`,
    },
    tests: [
      { input: { name: 'myList' }, expected: { length: 0 } },
    ],
    color: '#D97706',
  },
  {
    name: 'remove_from_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove an item from a list by position',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'index', type: 'number', description: 'Position to remove (0 = first)', default: 0 },
    ],
    outputs: [{ name: 'removed', type: 'any' }],
    implementations: {
      javascript: `function removeFromList(name, index) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  return list.splice(index, 1)[0];\n}`,
      python: `def remove_from_list(name, index):\n    lst = globals().get(name, [])\n    return lst.pop(index) if index < len(lst) else None`,
    },
    tests: [
      { input: { name: 'myList', index: 0 }, expected: { removed: 'any' } },
    ],
    color: '#D97706',
    shape: 'statement',
  },
  {
    name: 'print_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Print all items in a list',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
    ],
    outputs: [],
    implementations: {
      javascript: `function printList(name) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  console.log(name + ": [" + list.join(", ") + "]");\n}`,
      python: `def print_list(name):\n    lst = globals().get(name, [])\n    print(f"{name}: {lst}")`,
    },
    tests: [
      { input: { name: 'myList' }, expected: {} },
    ],
    color: '#D97706',
  },
  {
    name: 'slice_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get a portion of a list by start and end index',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'start', type: 'number', description: 'Start index (inclusive)', default: 0 },
      { name: 'end', type: 'number', description: 'End index (exclusive)', default: 4 },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function sliceList(name, start, end) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  return list.slice(start, end);\n}`,
      python: `def slice_list(name, start, end):\n    lst = globals().get(name, [])\n    return lst[int(start):int(end)]`,
    },
    tests: [
      { input: { name: 'myList', start: 0, end: 2 }, expected: { result: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'get_item',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get an item from an array value by index',
    category: 'Lists',
    inputs: [
      { name: 'array', type: 'any', description: 'An array value' },
      { name: 'index', type: 'number', description: 'Index to get', default: 0 },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function getItem(array, index) {\n  return Array.isArray(array) ? array[index] : undefined;\n}`,
      python: `def get_item(array, index):\n    if isinstance(array, list):\n        return array[int(index)] if int(index) < len(array) else None\n    return None`,
    },
    tests: [
      { input: { array: [1, 2, 3], index: 1 }, expected: { result: 2 } },
    ],
    color: '#D97706',
  },
  {
    name: 'remove_item',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove an item from a list at a specific index',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'index', type: 'number', description: 'Index to remove', default: 0 },
    ],
    outputs: [{ name: 'removed', type: 'any' }],
    implementations: {
      javascript: `function removeItem(name, index) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  if (index < 0 || index >= list.length) return undefined;\n  return list.splice(index, 1)[0];\n}`,
      python: `def remove_item(name, index):\n    lst = globals().get(name, [])\n    if 0 <= int(index) < len(lst):\n        return lst.pop(int(index))\n    return None`,
    },
    tests: [
      { input: { name: 'myList', index: 1 }, expected: { removed: 'any' } },
    ],
    color: '#D97706',
  },
]
