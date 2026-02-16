import type { BlockDefinition } from '../../types/block'

export const hardwareBlocks: BlockDefinition[] = [
  {
    name: 'get_screen_width',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the screen width in pixels',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'width', type: 'number' }],
    implementations: {
      javascript: `function getScreenWidth() {
  return screen.width;
}`,
      python: `def get_screen_width():
    print("[Hardware is only available in JavaScript mode]")
    return 0`,
    },
    tests: [
      { input: {}, expected: { width: 'number' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_screen_height',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the screen height in pixels',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'height', type: 'number' }],
    implementations: {
      javascript: `function getScreenHeight() {
  return screen.height;
}`,
      python: `def get_screen_height():
    print("[Hardware is only available in JavaScript mode]")
    return 0`,
    },
    tests: [
      { input: {}, expected: { height: 'number' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_device_cores',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the number of CPU cores available',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'cores', type: 'number' }],
    implementations: {
      javascript: `function getDeviceCores() {
  return navigator.hardwareConcurrency || 1;
}`,
      python: `def get_device_cores():
    print("[Hardware is only available in JavaScript mode]")
    return 0`,
    },
    tests: [
      { input: {}, expected: { cores: 'number' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_platform',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the operating system platform',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'platform', type: 'string' }],
    implementations: {
      javascript: `function getPlatform() {
  return navigator.platform || "unknown";
}`,
      python: `def get_platform():
    print("[Hardware is only available in JavaScript mode]")
    return "unknown"`,
    },
    tests: [
      { input: {}, expected: { platform: 'string' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_language',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the browser language',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'language', type: 'string' }],
    implementations: {
      javascript: `function getLanguage() {
  return navigator.language || "unknown";
}`,
      python: `def get_language():
    print("[Hardware is only available in JavaScript mode]")
    return "unknown"`,
    },
    tests: [
      { input: {}, expected: { language: 'string' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_timezone',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the user timezone',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'timezone', type: 'string' }],
    implementations: {
      javascript: `function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
}`,
      python: `def get_timezone():
    print("[Hardware is only available in JavaScript mode]")
    return "unknown"`,
    },
    tests: [
      { input: {}, expected: { timezone: 'string' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_color_depth',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the screen color depth in bits',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'depth', type: 'number' }],
    implementations: {
      javascript: `function getColorDepth() {
  return screen.colorDepth || 0;
}`,
      python: `def get_color_depth():
    print("[Hardware is only available in JavaScript mode]")
    return 0`,
    },
    tests: [
      { input: {}, expected: { depth: 'number' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'is_touch_device',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if the device has a touchscreen',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'isTouch', type: 'boolean' }],
    implementations: {
      javascript: `function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}`,
      python: `def is_touch_device():
    print("[Hardware is only available in JavaScript mode]")
    return False`,
    },
    tests: [
      { input: {}, expected: { isTouch: 'boolean' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_pixel_ratio',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the device pixel ratio (e.g. 2 for Retina displays)',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'ratio', type: 'number' }],
    implementations: {
      javascript: `function getPixelRatio() {
  return window.devicePixelRatio || 1;
}`,
      python: `def get_pixel_ratio():
    print("[Hardware is only available in JavaScript mode]")
    return 1`,
    },
    tests: [
      { input: {}, expected: { ratio: 'number' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
  {
    name: 'get_memory',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get approximate device memory in GB (or "unknown")',
    category: 'Hardware',
    inputs: [],
    outputs: [{ name: 'memory', type: 'any' }],
    implementations: {
      javascript: `function getMemory() {
  return navigator.deviceMemory || "unknown";
}`,
      python: `def get_memory():
    print("[Hardware is only available in JavaScript mode]")
    return "unknown"`,
    },
    tests: [
      { input: {}, expected: { memory: 'any' } },
    ],
    color: '#65A30D',
    shape: 'value',
  },
]
