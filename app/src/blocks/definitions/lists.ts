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
    name: 'list_contains',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if a list contains a specific value',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'value', type: 'any', description: 'Value to search for' },
    ],
    outputs: [{ name: 'found', type: 'boolean' }],
    implementations: {
      javascript: `function listContains(name, value) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  return list.includes(value);\n}`,
      python: `def list_contains(name, value):\n    lst = globals().get(name, [])\n    return value in lst`,
    },
    tests: [
      { input: { name: 'myList', value: 'hello' }, expected: { found: false } },
    ],
    color: '#D97706',
  },
  {
    name: 'reverse_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Reverse a list in place',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list to reverse' },
    ],
    outputs: [],
    implementations: {
      javascript: `function reverseList(name) {\n  window.__vars = window.__vars || {};\n  if (window.__vars[name]) window.__vars[name].reverse();\n}`,
      python: `def reverse_list(name):\n    lst = globals().get(name, [])\n    lst.reverse()`,
    },
    tests: [
      { input: { name: 'myList' }, expected: {} },
    ],
    color: '#D97706',
    shape: 'statement',
  },
  {
    name: 'reverse_array',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Return a reversed copy of an array value',
    category: 'Lists',
    inputs: [
      { name: 'array', type: 'any', description: 'An array value to reverse' },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function reverseArray(array) {\n  return Array.isArray(array) ? [...array].reverse() : array;\n}`,
      python: `def reverse_array(array):\n    return list(reversed(array)) if isinstance(array, list) else array`,
    },
    tests: [
      { input: { array: [1, 2, 3] }, expected: { result: [3, 2, 1] } },
    ],
    color: '#D97706',
  },
  {
    name: 'transpose_matrix',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Transpose a matrix (swap rows and columns)',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the matrix list to transpose' },
    ],
    outputs: [],
    implementations: {
      javascript: `function transposeMatrix(name) {\n  window.__vars = window.__vars || {};\n  const m = window.__vars[name];\n  if (!Array.isArray(m) || !Array.isArray(m[0])) return;\n  window.__vars[name] = m[0].map(function(_, i) { return m.map(function(row) { return row[i]; }); });\n}`,
      python: `def transpose_matrix(name):\n    m = globals().get(name, [])\n    if m and isinstance(m[0], list):\n        globals()[name] = [list(row) for row in zip(*m)]`,
    },
    tests: [
      { input: { name: 'matrix' }, expected: {} },
    ],
    color: '#D97706',
    shape: 'statement',
  },
  {
    name: 'sort_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Sort a list in ascending or descending order',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list to sort' },
      { name: 'order', type: 'string', description: 'Sort order: asc or desc', default: 'asc' },
    ],
    outputs: [],
    implementations: {
      javascript: `function sortList(name, order) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name];\n  if (!Array.isArray(list)) return;\n  list.sort(function(a, b) { return order === 'desc' ? b - a : a - b; });\n}`,
      python: `def sort_list(name, order='asc'):\n    lst = globals().get(name, [])\n    lst.sort(reverse=(order == 'desc'))`,
    },
    tests: [
      { input: { name: 'myList', order: 'asc' }, expected: {} },
    ],
    color: '#D97706',
    shape: 'statement',
  },
  {
    name: 'index_of',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Find the position of a value in a list (-1 if not found)',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'value', type: 'any', description: 'Value to find' },
    ],
    outputs: [{ name: 'index', type: 'number' }],
    implementations: {
      javascript: `function indexOf(name, value) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  return list.indexOf(value);\n}`,
      python: `def index_of(name, value):\n    lst = globals().get(name, [])\n    try:\n        return lst.index(value)\n    except ValueError:\n        return -1`,
    },
    tests: [
      { input: { name: 'myList', value: 'hello' }, expected: { index: -1 } },
    ],
    color: '#D97706',
  },
  {
    name: 'map_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Apply a function to every item in a list and return a new list',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'fn_name', type: 'string', description: 'Name of the function to call on each item', default: 'myFunction' },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function mapList(name, fnName) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  const fn = window[fnName];\n  if (typeof fn !== 'function') return list;\n  return list.map(function(item) { return fn(item); });\n}`,
      python: `def map_list(name, fn_name):\n    lst = globals().get(name, [])\n    fn = globals().get(fn_name)\n    if callable(fn):\n        return [fn(item) for item in lst]\n    return lst`,
    },
    tests: [
      { input: { name: 'myList', fn_name: 'myFunction' }, expected: { result: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'for_each',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Run a function on every item in a list',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'fn_name', type: 'string', description: 'Function to call on each item', default: 'myFunction' },
    ],
    outputs: [],
    implementations: {
      javascript: `function forEach(name, fnName) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  const fn = window[fnName];\n  if (typeof fn === 'function') list.forEach(function(item, i) { fn(item, i); });\n}`,
      python: `def for_each(name, fn_name):\n    lst = globals().get(name, [])\n    fn = globals().get(fn_name)\n    if callable(fn):\n        for i, item in enumerate(lst):\n            fn(item, i)`,
    },
    tests: [
      { input: { name: 'myList', fn_name: 'myFunction' }, expected: {} },
    ],
    color: '#D97706',
  },
  {
    name: 'filter_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Keep only items that pass a test function',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'fn_name', type: 'string', description: 'Function that returns true to keep an item', default: 'myFunction' },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function filterList(name, fnName) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  const fn = window[fnName];\n  if (typeof fn !== 'function') return list;\n  return list.filter(function(item) { return fn(item); });\n}`,
      python: `def filter_list(name, fn_name):\n    lst = globals().get(name, [])\n    fn = globals().get(fn_name)\n    if callable(fn):\n        return [item for item in lst if fn(item)]\n    return lst`,
    },
    tests: [
      { input: { name: 'myList', fn_name: 'myFunction' }, expected: { result: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'find_in_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Find the first item that passes a test function',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'fn_name', type: 'string', description: 'Function that returns true for a match', default: 'myFunction' },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function findInList(name, fnName) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  const fn = window[fnName];\n  if (typeof fn !== 'function') return undefined;\n  return list.find(function(item) { return fn(item); });\n}`,
      python: `def find_in_list(name, fn_name):\n    lst = globals().get(name, [])\n    fn = globals().get(fn_name)\n    if callable(fn):\n        for item in lst:\n            if fn(item):\n                return item\n    return None`,
    },
    tests: [
      { input: { name: 'myList', fn_name: 'myFunction' }, expected: { result: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'push',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add an item to the end of a list (push)',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'item', type: 'any', description: 'Item to push' },
    ],
    outputs: [],
    implementations: {
      javascript: `function push(name, item) {\n  window.__vars = window.__vars || {};\n  if (!window.__vars[name]) window.__vars[name] = [];\n  window.__vars[name].push(item);\n}`,
      python: `def push(name, item):\n    if name not in globals():\n        globals()[name] = []\n    globals()[name].append(item)`,
    },
    tests: [
      { input: { name: 'myList', item: 42 }, expected: {} },
    ],
    color: '#D97706',
  },
  {
    name: 'pop',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove and return the last item from a list (pop)',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function pop(name) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  return list.pop();\n}`,
      python: `def pop(name):\n    lst = globals().get(name, [])\n    return lst.pop() if lst else None`,
    },
    tests: [
      { input: { name: 'myList' }, expected: { result: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'join_list',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Join all list items into a single text string',
    category: 'Lists',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the list' },
      { name: 'separator', type: 'string', description: 'Text between items', default: ', ' },
    ],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: `function joinList(name, separator) {\n  window.__vars = window.__vars || {};\n  const list = window.__vars[name] || [];\n  return list.join(separator);\n}`,
      python: `def join_list(name, separator):\n    lst = globals().get(name, [])\n    return separator.join(str(item) for item in lst)`,
    },
    tests: [
      { input: { name: 'myList', separator: ', ' }, expected: { result: '' } },
    ],
    color: '#D97706',
  },
]
