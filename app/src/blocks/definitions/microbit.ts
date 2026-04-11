/**
 * micro:bit hardware blocks.
 *
 * All block implementations call into `window.__microbit`, which is
 * installed by `ensureMicrobitGlobal()` in `src/hardware/microbit.ts`.
 * Code that uses these blocks is detected by the runner and routed
 * through direct execution (not the sandbox iframe) so it can touch
 * the BLE connection held in the parent window.
 */

import type { BlockDefinition } from '../../types/block'

const MICROBIT_COLOR = '#00c4aa'

export const microbitBlocks: BlockDefinition[] = [
  {
    name: 'microbit_show_text',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Scroll text across the micro:bit LED matrix',
    category: 'micro:bit',
    inputs: [
      { name: 'text', type: 'string', description: 'The message to show', default: 'Hi!' },
    ],
    outputs: [],
    implementations: {
      javascript: `async function microbit_show_text(text) {
  if (typeof window === 'undefined' || !window.__microbit) return;
  await window.__microbit.showText(String(text));
}`,
      python: `def microbit_show_text(text):
    print("[micro:bit blocks only work in JavaScript mode]")`,
    },
    tests: [
      { input: { text: 'Hi!' }, expected: {} },
    ],
    color: MICROBIT_COLOR,
    shape: 'statement',
  },

  {
    name: 'microbit_show_icon',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Show a built-in icon on the micro:bit LED matrix',
    category: 'micro:bit',
    inputs: [
      {
        name: 'icon',
        type: 'string',
        description: 'Which icon to show',
        default: 'heart',
        choices: [
          'heart', 'yes', 'no', 'happy', 'sad', 'surprised', 'asleep',
          'confused', 'angry', 'skull', 'triangle', 'diamond', 'square',
          'target', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
        ],
      },
    ],
    outputs: [],
    implementations: {
      javascript: `async function microbit_show_icon(icon) {
  if (typeof window === 'undefined' || !window.__microbit) return;
  await window.__microbit.showIcon(String(icon));
}`,
      python: `def microbit_show_icon(icon):
    print("[micro:bit blocks only work in JavaScript mode]")`,
    },
    tests: [
      { input: { icon: 'heart' }, expected: {} },
    ],
    color: MICROBIT_COLOR,
    shape: 'statement',
  },

  {
    name: 'microbit_clear',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Clear the micro:bit LED matrix',
    category: 'micro:bit',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `async function microbit_clear() {
  if (typeof window === 'undefined' || !window.__microbit) return;
  await window.__microbit.clearScreen();
}`,
      python: `def microbit_clear():
    print("[micro:bit blocks only work in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: MICROBIT_COLOR,
    shape: 'statement',
  },

  {
    name: 'microbit_play_tone',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Play a tone on the micro:bit speaker',
    category: 'micro:bit',
    inputs: [
      { name: 'hz', type: 'number', description: 'Frequency in hertz', default: 440 },
      { name: 'ms', type: 'number', description: 'Duration in milliseconds', default: 500 },
    ],
    outputs: [],
    implementations: {
      javascript: `async function microbit_play_tone(hz, ms) {
  if (typeof window === 'undefined' || !window.__microbit) return;
  await window.__microbit.playTone(Number(hz), Number(ms));
}`,
      python: `def microbit_play_tone(hz, ms):
    print("[micro:bit blocks only work in JavaScript mode]")`,
    },
    tests: [
      { input: { hz: 440, ms: 500 }, expected: {} },
    ],
    color: MICROBIT_COLOR,
    shape: 'statement',
  },

  {
    name: 'microbit_set_led',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Turn a single LED on the 5×5 matrix on or off',
    category: 'micro:bit',
    inputs: [
      { name: 'x', type: 'number', description: 'Column (0–4)', default: 2 },
      { name: 'y', type: 'number', description: 'Row (0–4)', default: 2 },
      { name: 'on', type: 'boolean', description: 'True to turn on, false to turn off', default: true },
    ],
    outputs: [],
    implementations: {
      javascript: `async function microbit_set_led(x, y, on) {
  if (typeof window === 'undefined' || !window.__microbit) return;
  await window.__microbit.setLed(Number(x), Number(y), Boolean(on));
}`,
      python: `def microbit_set_led(x, y, on):
    print("[micro:bit blocks only work in JavaScript mode]")`,
    },
    tests: [
      { input: { x: 2, y: 2, on: true }, expected: {} },
    ],
    color: MICROBIT_COLOR,
    shape: 'statement',
  },

  {
    name: 'microbit_is_connected',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check whether a micro:bit is currently connected',
    category: 'micro:bit',
    inputs: [],
    outputs: [{ name: 'connected', type: 'boolean' }],
    implementations: {
      javascript: `function microbit_is_connected() {
  return !!(typeof window !== 'undefined' && window.__microbit && window.__microbit.isConnected());
}`,
      python: `def microbit_is_connected():
    return False`,
    },
    tests: [
      { input: {}, expected: { connected: 'boolean' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },
]
