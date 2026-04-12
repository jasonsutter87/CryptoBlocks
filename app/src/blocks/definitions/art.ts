import type { BlockDefinition } from '../../types/block'

export const artBlocks: BlockDefinition[] = [
  {
    name: 'set_canvas',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the canvas size and background color',
    category: 'Art',
    inputs: [
      { name: 'width', type: 'number', description: 'Canvas width in pixels', default: 400 },
      { name: 'height', type: 'number', description: 'Canvas height in pixels', default: 400 },
      { name: 'color', type: 'string', description: 'Background color (e.g. "white", "#ff0000")', default: 'white' },
    ],
    outputs: [],
    implementations: {
      javascript: `function setCanvas(width, height, color) {
  var c = document.getElementById('cb-canvas');
  if (!c) {
    c = document.createElement('canvas');
    c.id = 'cb-canvas';
    var parent = document.body || document.documentElement;
    if (parent) parent.appendChild(c);
  }
  c.width = width;
  c.height = height;
  c.style.display = 'block';
  var ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  if (!window.__cbCanvasLogged) { window.__cbCanvasLogged = true; console.log('Canvas set: ' + width + 'x' + height); }
}`,
      python: `def set_canvas(width, height, color):
    print("[Canvas is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { width: 400, height: 400, color: 'white' }, expected: {} },
    ],
    color: '#9333EA',
  },
  {
    name: 'draw_rect',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Draw a filled rectangle on the canvas',
    category: 'Art',
    inputs: [
      { name: 'x', type: 'number', description: 'Left edge position', default: 0 },
      { name: 'y', type: 'number', description: 'Top edge position', default: 0 },
      { name: 'width', type: 'number', description: 'Rectangle width', default: 100 },
      { name: 'height', type: 'number', description: 'Rectangle height', default: 100 },
      { name: 'color', type: 'string', description: 'Fill color', default: 'blue' },
    ],
    outputs: [],
    implementations: {
      javascript: `function drawRect(x, y, width, height, color) {
  var c = document.getElementById('cb-canvas');
  var ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}`,
      python: `def draw_rect(x, y, width, height, color):
    print("[Canvas is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { x: 10, y: 10, width: 50, height: 50, color: 'red' }, expected: {} },
    ],
    color: '#9333EA',
  },
  {
    name: 'draw_circle',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Draw a filled circle on the canvas',
    category: 'Art',
    inputs: [
      { name: 'x', type: 'number', description: 'Center X position', default: 200 },
      { name: 'y', type: 'number', description: 'Center Y position', default: 200 },
      { name: 'radius', type: 'number', description: 'Circle radius', default: 50 },
      { name: 'color', type: 'string', description: 'Fill color', default: 'red' },
    ],
    outputs: [],
    implementations: {
      javascript: `function drawCircle(x, y, radius, color) {
  var c = document.getElementById('cb-canvas');
  var ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}`,
      python: `def draw_circle(x, y, radius, color):
    print("[Canvas is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { x: 100, y: 100, radius: 50, color: 'green' }, expected: {} },
    ],
    color: '#9333EA',
  },
  {
    name: 'draw_line',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Draw a line on the canvas',
    category: 'Art',
    inputs: [
      { name: 'x1', type: 'number', description: 'Start X', default: 0 },
      { name: 'y1', type: 'number', description: 'Start Y', default: 0 },
      { name: 'x2', type: 'number', description: 'End X', default: 100 },
      { name: 'y2', type: 'number', description: 'End Y', default: 100 },
      { name: 'color', type: 'string', description: 'Line color', default: 'black' },
    ],
    outputs: [],
    implementations: {
      javascript: `function drawLine(x1, y1, x2, y2, color) {
  var c = document.getElementById('cb-canvas');
  var ctx = c.getContext('2d');
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}`,
      python: `def draw_line(x1, y1, x2, y2, color):
    print("[Canvas is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { x1: 0, y1: 0, x2: 100, y2: 100, color: 'black' }, expected: {} },
    ],
    color: '#9333EA',
  },
  {
    name: 'draw_text',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Draw text on the canvas',
    category: 'Art',
    inputs: [
      { name: 'text', type: 'string', description: 'The text to draw', default: 'Hello!' },
      { name: 'x', type: 'number', description: 'X position', default: 50 },
      { name: 'y', type: 'number', description: 'Y position', default: 50 },
      { name: 'color', type: 'string', description: 'Text color', default: 'black' },
      { name: 'size', type: 'number', description: 'Font size in pixels', default: 24 },
    ],
    outputs: [],
    implementations: {
      javascript: `function drawText(text, x, y, color, size) {
  if (!window.__cbDrawLogged) { window.__cbDrawLogged = true; console.log('drawText called: ' + text + ' at ' + x + ',' + y + ' color=' + color); }
  var c = document.getElementById('cb-canvas');
  var ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.font = size + 'px sans-serif';
  ctx.fillText(text, x, y);
}`,
      python: `def draw_text(text, x, y, color, size):
    print("[Canvas is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { text: 'Hi', x: 10, y: 30, color: 'black', size: 24 }, expected: {} },
    ],
    color: '#9333EA',
  },
]
