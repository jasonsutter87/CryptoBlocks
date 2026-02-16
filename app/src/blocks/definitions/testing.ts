import type { BlockDefinition } from '../../types/block'

export const testingBlocks: BlockDefinition[] = [
  {
    name: 'seed_random',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set a seed for deterministic random numbers (Mulberry32). Same seed = same results every time.',
    category: 'Testing',
    inputs: [
      { name: 'seed', type: 'number', description: 'The seed value', default: 42 },
    ],
    outputs: [],
    implementations: {
      javascript: `function seedRandom(seed) {
  var s = seed | 0;
  globalThis.__cbRng = function() {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}`,
      python: `import random as _rng_mod
def seed_random(seed):
    _rng_mod.seed(seed)`,
    },
    tests: [
      { input: { seed: 42 }, expected: {} },
    ],
    color: '#06B6D4',
    shape: 'statement',
  },
  {
    name: 'random_int',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Random integer between min and max (inclusive). Uses seeded RNG if seed_random was called.',
    category: 'Testing',
    inputs: [
      { name: 'min', type: 'number', description: 'Lowest value', default: 1 },
      { name: 'max', type: 'number', description: 'Highest value', default: 100 },
    ],
    outputs: [{ name: 'result', type: 'number' }],
    implementations: {
      javascript: `function randomInt(min, max) {
  var rng = globalThis.__cbRng || Math.random;
  return Math.floor(rng() * (max - min + 1)) + min;
}`,
      python: `def random_int(min_val, max_val):
    return _rng_mod.randint(min_val, max_val)`,
    },
    tests: [
      { input: { min: 1, max: 10 }, expected: { result: 'number' } },
    ],
    color: '#06B6D4',
  },
  {
    name: 'random_array',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Generate an array of random integers. Great for creating test data.',
    category: 'Testing',
    inputs: [
      { name: 'length', type: 'number', description: 'How many numbers', default: 10 },
      { name: 'min', type: 'number', description: 'Lowest value', default: 1 },
      { name: 'max', type: 'number', description: 'Highest value', default: 100 },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function randomArray(length, min, max) {
  var rng = globalThis.__cbRng || Math.random;
  var arr = [];
  for (var i = 0; i < length; i++) {
    arr.push(Math.floor(rng() * (max - min + 1)) + min);
  }
  return arr;
}`,
      python: `def random_array(length, min_val, max_val):
    return [_rng_mod.randint(min_val, max_val) for _ in range(length)]`,
    },
    tests: [
      { input: { length: 5, min: 1, max: 10 }, expected: { result: 'any' } },
    ],
    color: '#06B6D4',
  },
  {
    name: 'shuffle',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Fisher-Yates shuffle — randomly reorder an array in a single pass. Does not modify the original.',
    category: 'Testing',
    inputs: [
      { name: 'list', type: 'any', description: 'The array to shuffle' },
    ],
    outputs: [{ name: 'result', type: 'any' }],
    implementations: {
      javascript: `function shuffle(list) {
  var arr = Array.isArray(list) ? list.slice() : [];
  var rng = globalThis.__cbRng || Math.random;
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}`,
      python: `def shuffle(lst):
    result = list(lst)
    _rng_mod.shuffle(result)
    return result`,
    },
    tests: [
      { input: { list: [1, 2, 3, 4, 5] }, expected: { result: 'any' } },
    ],
    color: '#06B6D4',
  },
  {
    name: 'assert_equal',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Test that two values are equal. Prints PASS or FAIL with details.',
    category: 'Testing',
    inputs: [
      { name: 'label', type: 'string', description: 'Name of the test' },
      { name: 'actual', type: 'any', description: 'The value you got' },
      { name: 'expected', type: 'any', description: 'The value you want' },
    ],
    outputs: [],
    implementations: {
      javascript: `function assertEqual(label, actual, expected) {
  var a = JSON.stringify(actual);
  var e = JSON.stringify(expected);
  if (a === e) {
    console.log("[PASS] " + label);
  } else {
    console.log("[FAIL] " + label);
    console.log("  Expected: " + e);
    console.log("  Got:      " + a);
  }
}`,
      python: `import json
def assert_equal(label, actual, expected):
    if json.dumps(actual, sort_keys=True) == json.dumps(expected, sort_keys=True):
        print("[PASS] " + label)
    else:
        print("[FAIL] " + label)
        print("  Expected: " + json.dumps(expected))
        print("  Got:      " + json.dumps(actual))`,
    },
    tests: [
      { input: { label: 'test', actual: 5, expected: 5 }, expected: {} },
    ],
    color: '#06B6D4',
    shape: 'statement',
  },
  {
    name: 'assert_true',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Test that a condition is true. Prints PASS or FAIL.',
    category: 'Testing',
    inputs: [
      { name: 'label', type: 'string', description: 'Name of the test' },
      { name: 'condition', type: 'boolean', description: 'The condition to check' },
    ],
    outputs: [],
    implementations: {
      javascript: `function assertTrue(label, condition) {
  if (condition) {
    console.log("[PASS] " + label);
  } else {
    console.log("[FAIL] " + label);
  }
}`,
      python: `def assert_true(label, condition):
    if condition:
        print("[PASS] " + label)
    else:
        print("[FAIL] " + label)`,
    },
    tests: [
      { input: { label: 'test', condition: true }, expected: {} },
    ],
    color: '#06B6D4',
    shape: 'statement',
  },
  {
    name: 'is_sorted',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if an array is sorted in ascending order. Returns true or false.',
    category: 'Testing',
    inputs: [
      { name: 'list', type: 'any', description: 'The array to check' },
    ],
    outputs: [{ name: 'result', type: 'boolean' }],
    implementations: {
      javascript: `function isSorted(list) {
  if (!Array.isArray(list)) return false;
  for (var i = 1; i < list.length; i++) {
    if (list[i] < list[i - 1]) return false;
  }
  return true;
}`,
      python: `def is_sorted(lst):
    if not isinstance(lst, list):
        return False
    for i in range(1, len(lst)):
        if lst[i] < lst[i - 1]:
            return False
    return True`,
    },
    tests: [
      { input: { list: [1, 2, 3] }, expected: { result: true } },
      { input: { list: [3, 1, 2] }, expected: { result: false } },
      { input: { list: [] }, expected: { result: true } },
    ],
    color: '#06B6D4',
  },
]
