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

  // -------------------------------------------------------------------------
  // Motion / servo control — primarily for the Parallax cyber:bot
  // -------------------------------------------------------------------------

  {
    name: 'microbit_set_servo',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set a servo to an angle (0–180). 90 is stop for continuous-rotation servos.',
    category: 'micro:bit',
    inputs: [
      { name: 'pin', type: 'number', description: 'Pin number (e.g. 12, 13 for cyber:bot wheels)', default: 13 },
      { name: 'angle', type: 'number', description: 'Angle in degrees (0–180)', default: 90 },
    ],
    outputs: [],
    implementations: {
      javascript: `async function microbit_set_servo(pin, angle) {
  if (typeof window === 'undefined' || !window.__microbit) return;
  await window.__microbit.setServo(Number(pin), Number(angle));
}`,
      python: `def microbit_set_servo(pin, angle):
    print("[micro:bit blocks only work in JavaScript mode]")`,
    },
    tests: [
      { input: { pin: 13, angle: 90 }, expected: {} },
    ],
    color: MICROBIT_COLOR,
    shape: 'statement',
  },

  {
    name: 'microbit_drive',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Drive the cyber:bot in a direction for N seconds, then stop.',
    category: 'micro:bit',
    inputs: [
      {
        name: 'direction',
        type: 'string',
        description: 'Direction to drive',
        default: 'forward',
        choices: ['forward', 'back', 'left', 'right', 'stop'],
      },
      { name: 'seconds', type: 'number', description: 'Duration in seconds', default: 1 },
    ],
    outputs: [],
    implementations: {
      javascript: `async function microbit_drive(direction, seconds) {
  if (typeof window === 'undefined' || !window.__microbit) return;
  await window.__microbit.drive(String(direction), Number(seconds));
}`,
      python: `def microbit_drive(direction, seconds):
    print("[micro:bit blocks only work in JavaScript mode]")`,
    },
    tests: [
      { input: { direction: 'forward', seconds: 1 }, expected: {} },
    ],
    color: MICROBIT_COLOR,
    shape: 'statement',
  },

  // -------------------------------------------------------------------------
  // Sensor read blocks — synchronous, return the latest streamed value
  // -------------------------------------------------------------------------

  {
    name: 'microbit_temperature',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Current temperature reading from the micro:bit in °C',
    category: 'micro:bit',
    inputs: [],
    outputs: [{ name: 'celsius', type: 'number' }],
    implementations: {
      javascript: `function microbit_temperature() {
  if (typeof window === 'undefined' || !window.__microbit) return 0;
  return window.__microbit.getTemperature();
}`,
      python: `def microbit_temperature():
    return 0`,
    },
    tests: [
      { input: {}, expected: { celsius: 'number' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },

  {
    name: 'microbit_light_level',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Ambient light level measured by the LED matrix (0–255)',
    category: 'micro:bit',
    inputs: [],
    outputs: [{ name: 'level', type: 'number' }],
    implementations: {
      javascript: `function microbit_light_level() {
  if (typeof window === 'undefined' || !window.__microbit) return 0;
  return window.__microbit.getLightLevel();
}`,
      python: `def microbit_light_level():
    return 0`,
    },
    tests: [
      { input: {}, expected: { level: 'number' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },

  {
    name: 'microbit_accel_x',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Accelerometer X axis reading (milli-g). Positive = right.',
    category: 'micro:bit',
    inputs: [],
    outputs: [{ name: 'x', type: 'number' }],
    implementations: {
      javascript: `function microbit_accel_x() {
  if (typeof window === 'undefined' || !window.__microbit) return 0;
  return window.__microbit.getAccelX();
}`,
      python: `def microbit_accel_x():
    return 0`,
    },
    tests: [
      { input: {}, expected: { x: 'number' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },

  {
    name: 'microbit_accel_y',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Accelerometer Y axis reading (milli-g). Positive = forward.',
    category: 'micro:bit',
    inputs: [],
    outputs: [{ name: 'y', type: 'number' }],
    implementations: {
      javascript: `function microbit_accel_y() {
  if (typeof window === 'undefined' || !window.__microbit) return 0;
  return window.__microbit.getAccelY();
}`,
      python: `def microbit_accel_y():
    return 0`,
    },
    tests: [
      { input: {}, expected: { y: 'number' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },

  {
    name: 'microbit_accel_z',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Accelerometer Z axis reading (milli-g). Negative = face up.',
    category: 'micro:bit',
    inputs: [],
    outputs: [{ name: 'z', type: 'number' }],
    implementations: {
      javascript: `function microbit_accel_z() {
  if (typeof window === 'undefined' || !window.__microbit) return 0;
  return window.__microbit.getAccelZ();
}`,
      python: `def microbit_accel_z():
    return 0`,
    },
    tests: [
      { input: {}, expected: { z: 'number' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },

  {
    name: 'microbit_compass_heading',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Compass heading in degrees (0–359). 0 is north.',
    category: 'micro:bit',
    inputs: [],
    outputs: [{ name: 'heading', type: 'number' }],
    implementations: {
      javascript: `function microbit_compass_heading() {
  if (typeof window === 'undefined' || !window.__microbit) return 0;
  return window.__microbit.getCompassHeading();
}`,
      python: `def microbit_compass_heading():
    return 0`,
    },
    tests: [
      { input: {}, expected: { heading: 'number' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },

  {
    name: 'microbit_button_pressed',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Is a button currently pressed on the micro:bit?',
    category: 'micro:bit',
    inputs: [
      {
        name: 'button',
        type: 'string',
        description: 'Which button to check',
        default: 'A',
        choices: ['A', 'B'],
      },
    ],
    outputs: [{ name: 'pressed', type: 'boolean' }],
    implementations: {
      javascript: `function microbit_button_pressed(button) {
  if (typeof window === 'undefined' || !window.__microbit) return false;
  return window.__microbit.isButtonPressed(button === 'B' ? 'B' : 'A');
}`,
      python: `def microbit_button_pressed(button):
    return False`,
    },
    tests: [
      { input: { button: 'A' }, expected: { pressed: 'boolean' } },
    ],
    color: MICROBIT_COLOR,
    shape: 'value',
  },
]
