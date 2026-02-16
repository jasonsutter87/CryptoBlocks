import type { BlockDefinition } from '../../types/block'

const COLOR = '#14B8A6'

function pyMsg(name: string, params: string = ''): string {
  return `def ${name}(${params}):\n    print("[Turtle is only available in JavaScript mode]")`
}

export const turtleBlocks: BlockDefinition[] = [
  {
    name: 'turtle_start',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create a canvas and place the turtle at the center facing up',
    category: 'Turtle',
    inputs: [
      { name: 'size', type: 'number', description: 'Canvas width and height in pixels', default: 400 },
      { name: 'color', type: 'string', description: 'Background color', default: 'white' },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_start(size, color) {
  var canvas = document.getElementById('cb-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cb-canvas';
    document.body.appendChild(canvas);
  }
  canvas.width = size;
  canvas.height = size;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  window.__turtle = { x: size / 2, y: size / 2, heading: 0, penDown: true, penColor: '#000000', penWidth: 2 };
}`,
      python: pyMsg('turtle_start', 'size, color'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_forward',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Move the turtle forward by a number of pixels, drawing a line if the pen is down',
    category: 'Turtle',
    inputs: [
      { name: 'steps', type: 'number', description: 'Distance in pixels', default: 50 },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_forward(steps) {
  var t = window.__turtle;
  if (!t) return;
  var rad = t.heading * Math.PI / 180;
  var nx = t.x + steps * Math.sin(rad);
  var ny = t.y - steps * Math.cos(rad);
  if (t.penDown) {
    var c = document.getElementById('cb-canvas');
    if (c) {
      var ctx = c.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = t.penColor;
      ctx.lineWidth = t.penWidth;
      ctx.stroke();
    }
  }
  t.x = nx;
  t.y = ny;
}`,
      python: pyMsg('turtle_forward', 'steps'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_backward',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Move the turtle backward by a number of pixels',
    category: 'Turtle',
    inputs: [
      { name: 'steps', type: 'number', description: 'Distance in pixels', default: 50 },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_backward(steps) {
  var t = window.__turtle;
  if (!t) return;
  var rad = t.heading * Math.PI / 180;
  var nx = t.x - steps * Math.sin(rad);
  var ny = t.y + steps * Math.cos(rad);
  if (t.penDown) {
    var c = document.getElementById('cb-canvas');
    if (c) {
      var ctx = c.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = t.penColor;
      ctx.lineWidth = t.penWidth;
      ctx.stroke();
    }
  }
  t.x = nx;
  t.y = ny;
}`,
      python: pyMsg('turtle_backward', 'steps'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_right',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Turn the turtle right (clockwise) by a number of degrees',
    category: 'Turtle',
    inputs: [
      { name: 'degrees', type: 'number', description: 'Angle in degrees', default: 90 },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_right(degrees) {
  var t = window.__turtle;
  if (t) t.heading = (t.heading + degrees) % 360;
}`,
      python: pyMsg('turtle_right', 'degrees'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_left',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Turn the turtle left (counter-clockwise) by a number of degrees',
    category: 'Turtle',
    inputs: [
      { name: 'degrees', type: 'number', description: 'Angle in degrees', default: 90 },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_left(degrees) {
  var t = window.__turtle;
  if (t) t.heading = (t.heading - degrees + 360) % 360;
}`,
      python: pyMsg('turtle_left', 'degrees'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_pen_up',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Lift the pen so the turtle moves without drawing',
    category: 'Turtle',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function turtle_pen_up() {
  var t = window.__turtle;
  if (t) t.penDown = false;
}`,
      python: pyMsg('turtle_pen_up'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_pen_down',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Lower the pen so the turtle draws as it moves',
    category: 'Turtle',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function turtle_pen_down() {
  var t = window.__turtle;
  if (t) t.penDown = true;
}`,
      python: pyMsg('turtle_pen_down'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_set_color',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the pen color for drawing',
    category: 'Turtle',
    inputs: [
      { name: 'color', type: 'string', description: 'CSS color value', default: 'red' },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_set_color(color) {
  var t = window.__turtle;
  if (t) t.penColor = color;
}`,
      python: pyMsg('turtle_set_color', 'color'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_set_width',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the pen line width in pixels',
    category: 'Turtle',
    inputs: [
      { name: 'width', type: 'number', description: 'Line width in pixels', default: 2 },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_set_width(width) {
  var t = window.__turtle;
  if (t) t.penWidth = width;
}`,
      python: pyMsg('turtle_set_width', 'width'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
  {
    name: 'turtle_go_to',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Move the turtle to an absolute x,y position (draws line if pen is down)',
    category: 'Turtle',
    inputs: [
      { name: 'x', type: 'number', description: 'X coordinate', default: 200 },
      { name: 'y', type: 'number', description: 'Y coordinate', default: 200 },
    ],
    outputs: [],
    implementations: {
      javascript: `function turtle_go_to(x, y) {
  var t = window.__turtle;
  if (!t) return;
  if (t.penDown) {
    var c = document.getElementById('cb-canvas');
    if (c) {
      var ctx = c.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = t.penColor;
      ctx.lineWidth = t.penWidth;
      ctx.stroke();
    }
  }
  t.x = x;
  t.y = y;
}`,
      python: pyMsg('turtle_go_to', 'x, y'),
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
]
