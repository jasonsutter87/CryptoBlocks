import type { BlockDefinition } from '../../types/block'

export const dataBlocks: BlockDefinition[] = [
  {
    name: 'create_object',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create an empty object/collection and store it globally',
    category: 'Data',
    inputs: [
      { name: 'name', type: 'string', description: 'Name for the object' },
    ],
    outputs: [],
    implementations: {
      javascript: `function createObject(name) {\n  window.__vars = window.__vars || {};\n  window.__vars[name] = {};\n}`,
      python: `def create_object(name):\n    globals()[name] = {}`,
    },
    tests: [
      { input: { name: 'player' }, expected: {} },
    ],
    color: '#0891B2',
  },
  {
    name: 'object_value',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get an object as a value to plug into other blocks',
    category: 'Data',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the object' },
    ],
    outputs: [{ name: 'object', type: 'any' }],
    implementations: {
      javascript: `function objectValue(name) {\n  window.__vars = window.__vars || {};\n  if (!window.__vars[name]) window.__vars[name] = {};\n  return window.__vars[name];\n}`,
      python: `def object_value(name):\n    if name not in globals():\n        globals()[name] = {}\n    return globals()[name]`,
    },
    tests: [
      { input: { name: 'player' }, expected: { object: 'any' } },
    ],
    color: '#0891B2',
  },
  {
    name: 'set_property',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set a property on an object',
    category: 'Data',
    inputs: [
      { name: 'object_name', type: 'string', description: 'Name of the object' },
      { name: 'key', type: 'string', description: 'Property name' },
      { name: 'value', type: 'any', description: 'Value to set' },
    ],
    outputs: [],
    implementations: {
      javascript: `function setProperty(objectName, key, value) {\n  if (key === '__proto__' || key === 'constructor' || key === 'prototype') throw new Error('Invalid property name: ' + key);\n  window.__vars = window.__vars || {};\n  if (!window.__vars[objectName]) window.__vars[objectName] = {};\n  window.__vars[objectName][key] = value;\n}`,
      python: `def set_property(object_name, key, value):\n    if key in ('__proto__', 'constructor', 'prototype', '__class__'):\n        raise ValueError('Invalid property name: ' + key)\n    if object_name not in globals():\n        globals()[object_name] = {}\n    globals()[object_name][key] = value`,
    },
    tests: [
      { input: { object_name: 'player', key: 'name', value: 'Jason' }, expected: {} },
    ],
    color: '#0891B2',
  },
  {
    name: 'get_property',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get a property from an object',
    category: 'Data',
    inputs: [
      { name: 'object_name', type: 'string', description: 'Name of the object' },
      { name: 'key', type: 'string', description: 'Property name' },
    ],
    outputs: [{ name: 'value', type: 'any' }],
    implementations: {
      javascript: `function getProperty(objectName, key) {\n  if (key === '__proto__' || key === 'constructor' || key === 'prototype') return undefined;\n  window.__vars = window.__vars || {};\n  const obj = window.__vars[objectName] || {};\n  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;\n}`,
      python: `def get_property(object_name, key):\n    if key in ('__proto__', 'constructor', 'prototype', '__class__'):\n        return None\n    obj = globals().get(object_name, {})\n    return obj.get(key)`,
    },
    tests: [
      { input: { object_name: 'player', key: 'name' }, expected: { value: 'any' } },
    ],
    color: '#0891B2',
  },
  {
    name: 'print_object',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Print all properties of an object',
    category: 'Data',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the object' },
    ],
    outputs: [],
    implementations: {
      javascript: `function printObject(name) {\n  window.__vars = window.__vars || {};\n  const obj = window.__vars[name] || {};\n  console.log(name + ": " + JSON.stringify(obj, null, 2));\n}`,
      python: `def print_object(name):\n    obj = globals().get(name, {})\n    print(f"{name}: {obj}")`,
    },
    tests: [
      { input: { name: 'player' }, expected: {} },
    ],
    color: '#0891B2',
  },
  {
    name: 'has_property',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if an object has a property',
    category: 'Data',
    inputs: [
      { name: 'object_name', type: 'string', description: 'Name of the object' },
      { name: 'key', type: 'string', description: 'Property to check' },
    ],
    outputs: [{ name: 'exists', type: 'boolean' }],
    implementations: {
      javascript: `function hasProperty(objectName, key) {\n  if (key === '__proto__' || key === 'constructor' || key === 'prototype') return false;\n  window.__vars = window.__vars || {};\n  const obj = window.__vars[objectName] || {};\n  return Object.prototype.hasOwnProperty.call(obj, key);\n}`,
      python: `def has_property(object_name, key):\n    if key in ('__proto__', 'constructor', 'prototype', '__class__'):\n        return False\n    obj = globals().get(object_name, {})\n    return key in obj`,
    },
    tests: [
      { input: { object_name: 'player', key: 'name' }, expected: { exists: true } },
    ],
    color: '#0891B2',
  },
  {
    name: 'delete_property',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove a property from an object',
    category: 'Data',
    inputs: [
      { name: 'object_name', type: 'string', description: 'Name of the object' },
      { name: 'key', type: 'string', description: 'Property to remove' },
    ],
    outputs: [],
    implementations: {
      javascript: `function deleteProperty(objectName, key) {\n  if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;\n  window.__vars = window.__vars || {};\n  const obj = window.__vars[objectName] || {};\n  delete obj[key];\n}`,
      python: `def delete_property(object_name, key):\n    if key in ('__proto__', 'constructor', 'prototype', '__class__'):\n        return\n    obj = globals().get(object_name, {})\n    obj.pop(key, None)`,
    },
    tests: [
      { input: { object_name: 'player', key: 'name' }, expected: {} },
    ],
    color: '#0891B2',
  },
]
