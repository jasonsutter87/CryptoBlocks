import type { BlockDefinition } from '../../types/block'

export const gamesBlocks: BlockDefinition[] = [
  {
    name: 'create_sprite',
    author: 'CryptoBlocks',
    version: '1.1.0',
    description: 'Create a named sprite — use an emoji, a color, or a PNG image URL (from the Sprite Editor)',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
      { name: 'x', type: 'number', description: 'X position', default: 0 },
      { name: 'y', type: 'number', description: 'Y position', default: 0 },
      { name: 'width', type: 'number', description: 'Size in pixels', default: 32 },
      { name: 'height', type: 'number', description: 'Height in pixels', default: 32 },
      { name: 'color', type: 'string', description: 'Fill color (ignored if emoji or image is set)', default: '#ff0000' },
      { name: 'emoji', type: 'string', description: 'Emoji character (e.g. 🚀 👾 ⭐)', default: '' },
      { name: 'image', type: 'string', description: 'PNG image URL (from Sprite Editor) — takes priority over emoji/color', default: '' },
    ],
    outputs: [],
    implementations: {
      javascript: `function createSprite(name, x, y, width, height, color, emoji, image) {
  window.__game = window.__game || { sprites: {}, platforms: [], backgrounds: [], camera: { x: 0, y: 0 }, gravity: 0, score: 0 };
  if (!window.__game.platforms) window.__game.platforms = [];
  if (!window.__game.backgrounds) window.__game.backgrounds = [];
  if (!window.__game.camera) window.__game.camera = { x: 0, y: 0 };
  if (window.__game.gravity === undefined) window.__game.gravity = 0;

  var sprite = {
    x: Number(x), y: Number(y),
    w: Number(width), h: Number(height),
    color: String(color),
    emoji: emoji || '',
    imageUrl: image || '',
    imageEl: null,
    vx: 0, vy: 0,
    onGround: false,
  };

  if (image) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = String(image);
    sprite.imageEl = img;
  }

  window.__game.sprites[name] = sprite;
}`,
      python: `def create_sprite(name, x, y, width, height, color, emoji="", image=""):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'player', x: 100, y: 200, width: 32, height: 32, color: '#ff0000', emoji: '', image: '' }, expected: {} },
    ],
    color: '#EA580C',
  },
  {
    name: 'move_sprite',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Move a sprite by a delta amount',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
      { name: 'dx', type: 'number', description: 'Horizontal delta', default: 0 },
      { name: 'dy', type: 'number', description: 'Vertical delta', default: 0 },
    ],
    outputs: [],
    implementations: {
      javascript: `function moveSprite(name, dx, dy) {
  window.__game = window.__game || { sprites: {}, score: 0 };
  if (!window.__game.sprites[name]) { console.log("Error: Sprite '" + name + "' does not exist"); return; }
  window.__game.sprites[name].x += Number(dx);
  window.__game.sprites[name].y += Number(dy);
}`,
      python: `def move_sprite(name, dx, dy):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'player', dx: 5, dy: 0 }, expected: {} },
    ],
    color: '#EA580C',
  },
  {
    name: 'set_sprite_position',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set a sprite to an absolute position',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
      { name: 'x', type: 'number', description: 'X position' },
      { name: 'y', type: 'number', description: 'Y position' },
    ],
    outputs: [],
    implementations: {
      javascript: `function setSpritePosition(name, x, y) {
  window.__game = window.__game || { sprites: {}, score: 0 };
  if (!window.__game.sprites[name]) { console.log("Error: Sprite '" + name + "' does not exist"); return; }
  window.__game.sprites[name].x = Number(x);
  window.__game.sprites[name].y = Number(y);
}`,
      python: `def set_sprite_position(name, x, y):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'player', x: 50, y: 50 }, expected: {} },
    ],
    color: '#EA580C',
  },
  {
    name: 'get_sprite_x',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the X position of a sprite',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
    ],
    outputs: [{ name: 'x', type: 'number' }],
    implementations: {
      javascript: `function getSpriteX(name) {
  window.__game = window.__game || { sprites: {}, score: 0 };
  if (!window.__game.sprites[name]) return 0;
  return window.__game.sprites[name].x;
}`,
      python: `def get_sprite_x(name):
    print("[Games are only available in JavaScript mode]")
    return 0`,
    },
    tests: [
      { input: { name: 'player' }, expected: { x: 'number' } },
    ],
    color: '#EA580C',
    shape: 'value',
  },
  {
    name: 'get_sprite_y',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the Y position of a sprite',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
    ],
    outputs: [{ name: 'y', type: 'number' }],
    implementations: {
      javascript: `function getSpriteY(name) {
  window.__game = window.__game || { sprites: {}, score: 0 };
  if (!window.__game.sprites[name]) return 0;
  return window.__game.sprites[name].y;
}`,
      python: `def get_sprite_y(name):
    print("[Games are only available in JavaScript mode]")
    return 0`,
    },
    tests: [
      { input: { name: 'player' }, expected: { y: 'number' } },
    ],
    color: '#EA580C',
    shape: 'value',
  },
  {
    name: 'sprites_touching',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if two sprites are overlapping (AABB collision)',
    category: 'Games',
    inputs: [
      { name: 'name_a', type: 'string', description: 'First sprite name' },
      { name: 'name_b', type: 'string', description: 'Second sprite name' },
    ],
    outputs: [{ name: 'touching', type: 'boolean' }],
    implementations: {
      javascript: `function spritesTouching(nameA, nameB) {
  window.__game = window.__game || { sprites: {}, score: 0 };
  var a = window.__game.sprites[nameA];
  var b = window.__game.sprites[nameB];
  if (!a || !b) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}`,
      python: `def sprites_touching(name_a, name_b):
    print("[Games are only available in JavaScript mode]")
    return False`,
    },
    tests: [
      { input: { name_a: 'player', name_b: 'enemy' }, expected: { touching: false } },
    ],
    color: '#EA580C',
    shape: 'value',
  },
  {
    name: 'remove_sprite',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove a sprite from the game',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
    ],
    outputs: [],
    implementations: {
      javascript: `function removeSprite(name) {
  window.__game = window.__game || { sprites: {}, score: 0 };
  delete window.__game.sprites[name];
}`,
      python: `def remove_sprite(name):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'enemy' }, expected: {} },
    ],
    color: '#EA580C',
  },
  {
    name: 'draw_all_sprites',
    author: 'CryptoBlocks',
    version: '1.1.0',
    description: 'Clear the canvas and draw backgrounds, platforms, and sprites — now with camera offset and image support',
    category: 'Games',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function drawAllSprites() {
  window.__game = window.__game || { sprites: {}, platforms: [], backgrounds: [], camera: { x: 0, y: 0 }, gravity: 0, score: 0 };
  var game = window.__game;
  if (!game.platforms) game.platforms = [];
  if (!game.backgrounds) game.backgrounds = [];
  if (!game.camera) game.camera = { x: 0, y: 0 };

  var c = document.getElementById('cb-canvas');
  c.style.display = 'block';
  var ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(0, 0, c.width, c.height);

  var camX = game.camera.x || 0;
  var camY = game.camera.y || 0;

  // --- Parallax backgrounds (drawn behind everything) ---
  for (var bi = 0; bi < game.backgrounds.length; bi++) {
    var bg = game.backgrounds[bi];
    if (!bg.imageEl) continue;
    var img = bg.imageEl;
    if (!img.complete || img.naturalWidth === 0) continue;
    var px = -((camX * (bg.parallax || 0)) % img.naturalWidth);
    if (px > 0) px -= img.naturalWidth;
    for (var x = px; x < c.width; x += img.naturalWidth) {
      ctx.drawImage(img, x, 0);
    }
  }

  // --- Platforms ---
  for (var pi = 0; pi < game.platforms.length; pi++) {
    var p = game.platforms[pi];
    ctx.fillStyle = p.color || '#6c7086';
    ctx.fillRect(p.x - camX, p.y - camY, p.w, p.h);
  }

  // --- Sprites ---
  var sprites = game.sprites;
  for (var name in sprites) {
    var s = sprites[name];
    var sx = s.x - camX;
    var sy = s.y - camY;
    if (s.imageEl && s.imageEl.complete && s.imageEl.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(s.imageEl, sx, sy, s.w, s.h);
    } else if (s.emoji) {
      ctx.font = s.w + 'px serif';
      ctx.textBaseline = 'top';
      ctx.fillText(s.emoji, sx, sy);
    } else {
      ctx.fillStyle = s.color;
      ctx.fillRect(sx, sy, s.w, s.h);
    }
  }

  // --- Score (UI, no camera offset) ---
  if (game.score !== undefined) {
    ctx.fillStyle = '#cdd6f4';
    ctx.font = '16px sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Score: ' + game.score, 10, 24);
  }
}`,
      python: `def draw_all_sprites():
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: '#EA580C',
  },
  {
    name: 'set_score',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the game score',
    category: 'Games',
    inputs: [
      { name: 'value', type: 'number', description: 'Score value', default: 0 },
    ],
    outputs: [],
    implementations: {
      javascript: `function setScore(value) {
  window.__game = window.__game || { sprites: {}, score: 0 };
  window.__game.score = Number(value);
}`,
      python: `def set_score(value):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { value: 100 }, expected: {} },
    ],
    color: '#EA580C',
  },
  {
    name: 'get_score',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the current game score',
    category: 'Games',
    inputs: [],
    outputs: [{ name: 'score', type: 'number' }],
    implementations: {
      javascript: `function getScore() {
  window.__game = window.__game || { sprites: {}, score: 0 };
  return window.__game.score;
}`,
      python: `def get_score():
    print("[Games are only available in JavaScript mode]")
    return 0`,
    },
    tests: [
      { input: {}, expected: { score: 0 } },
    ],
    color: '#EA580C',
    shape: 'value',
  },

  {
    name: 'sprite_editor_image',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Look up a sprite you saved in the Sprite Editor by name. Returns an image URL you can pass to create_sprite.',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the sprite you saved in the Sprite Editor', default: 'my-sprite' },
    ],
    outputs: [{ name: 'image', type: 'string' }],
    implementations: {
      javascript: `function spriteEditorImage(name) {
  try {
    var all = JSON.parse(localStorage.getItem('cryptoblocks-sprites') || '{}');
    var entry = all[String(name)];
    return entry && entry.dataUrl ? entry.dataUrl : '';
  } catch (e) {
    return '';
  }
}`,
      python: `def sprite_editor_image(name):
    return ''`,
    },
    tests: [
      { input: { name: 'my-sprite' }, expected: { image: 'string' } },
    ],
    color: '#EA580C',
    shape: 'value',
  },

  // ---------------------------------------------------------------------------
  // Side-scroller additions: gravity, platforms, physics, camera, backgrounds
  // ---------------------------------------------------------------------------

  {
    name: 'set_gravity',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set how fast sprites fall each frame. 0.5 is a good starting value.',
    category: 'Games',
    inputs: [
      { name: 'value', type: 'number', description: 'Pixels per frame squared', default: 0.5 },
    ],
    outputs: [],
    implementations: {
      javascript: `function setGravity(value) {
  window.__game = window.__game || { sprites: {}, platforms: [], backgrounds: [], camera: { x: 0, y: 0 }, gravity: 0, score: 0 };
  window.__game.gravity = Number(value);
}`,
      python: `def set_gravity(value):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { value: 0.5 }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'add_platform',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add a rectangular platform that sprites can stand on and collide with',
    category: 'Games',
    inputs: [
      { name: 'x', type: 'number', description: 'Left edge', default: 0 },
      { name: 'y', type: 'number', description: 'Top edge', default: 300 },
      { name: 'width', type: 'number', description: 'Width in pixels', default: 100 },
      { name: 'height', type: 'number', description: 'Height in pixels', default: 20 },
      { name: 'color', type: 'string', description: 'Platform color', default: '#6c7086' },
    ],
    outputs: [],
    implementations: {
      javascript: `function addPlatform(x, y, width, height, color) {
  window.__game = window.__game || { sprites: {}, platforms: [], backgrounds: [], camera: { x: 0, y: 0 }, gravity: 0, score: 0 };
  if (!window.__game.platforms) window.__game.platforms = [];
  window.__game.platforms.push({ x: Number(x), y: Number(y), w: Number(width), h: Number(height), color: String(color) });
}`,
      python: `def add_platform(x, y, width, height, color):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { x: 0, y: 300, width: 100, height: 20, color: '#6c7086' }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'set_sprite_velocity',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set how fast a sprite is moving horizontally and vertically (used by physics step)',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
      { name: 'vx', type: 'number', description: 'Horizontal speed (+ right, − left)', default: 0 },
      { name: 'vy', type: 'number', description: 'Vertical speed (+ down, − up)', default: 0 },
    ],
    outputs: [],
    implementations: {
      javascript: `function setSpriteVelocity(name, vx, vy) {
  window.__game = window.__game || { sprites: {} };
  var s = window.__game.sprites[name];
  if (!s) { console.log("Error: Sprite '" + name + "' does not exist"); return; }
  s.vx = Number(vx);
  s.vy = Number(vy);
}`,
      python: `def set_sprite_velocity(name, vx, vy):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'player', vx: 3, vy: 0 }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'sprite_jump',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Make a sprite jump by giving it upward velocity. Only works when standing on ground.',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
      { name: 'power', type: 'number', description: 'Jump strength (try 10–15)', default: 12 },
    ],
    outputs: [],
    implementations: {
      javascript: `function spriteJump(name, power) {
  window.__game = window.__game || { sprites: {} };
  var s = window.__game.sprites[name];
  if (!s) { console.log("Error: Sprite '" + name + "' does not exist"); return; }
  if (s.onGround) {
    s.vy = -Number(power);
    s.onGround = false;
  }
}`,
      python: `def sprite_jump(name, power):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'player', power: 12 }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'is_sprite_on_ground',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Is the sprite currently standing on a platform?',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite name' },
    ],
    outputs: [{ name: 'onGround', type: 'boolean' }],
    implementations: {
      javascript: `function isSpriteOnGround(name) {
  window.__game = window.__game || { sprites: {} };
  var s = window.__game.sprites[name];
  return !!(s && s.onGround);
}`,
      python: `def is_sprite_on_ground(name):
    return False`,
    },
    tests: [
      { input: { name: 'player' }, expected: { onGround: 'boolean' } },
    ],
    color: '#EA580C',
    shape: 'value',
  },

  {
    name: 'physics_step',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Apply gravity and platform collision to all sprites. Call once per frame in your game loop.',
    category: 'Games',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function physicsStep() {
  window.__game = window.__game || { sprites: {}, platforms: [], gravity: 0 };
  var game = window.__game;
  if (!game.platforms) game.platforms = [];
  var g = game.gravity || 0;
  var sprites = game.sprites;
  var platforms = game.platforms;

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  for (var name in sprites) {
    var s = sprites[name];

    // Apply gravity to vertical velocity
    s.vy = (s.vy || 0) + g;

    // --- Horizontal move with collision resolution ---
    s.x += (s.vx || 0);
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (overlaps(s, p)) {
        if (s.vx > 0) s.x = p.x - s.w;
        else if (s.vx < 0) s.x = p.x + p.w;
        s.vx = 0;
      }
    }

    // --- Vertical move with collision resolution ---
    s.y += s.vy;
    s.onGround = false;
    for (var j = 0; j < platforms.length; j++) {
      var q = platforms[j];
      if (overlaps(s, q)) {
        if (s.vy > 0) {
          s.y = q.y - s.h;
          s.onGround = true;
        } else if (s.vy < 0) {
          s.y = q.y + q.h;
        }
        s.vy = 0;
      }
    }
  }
}`,
      python: `def physics_step():
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'set_camera',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Move the camera to a specific position — the world scrolls so the camera is the top-left of the view',
    category: 'Games',
    inputs: [
      { name: 'x', type: 'number', description: 'Camera X', default: 0 },
      { name: 'y', type: 'number', description: 'Camera Y', default: 0 },
    ],
    outputs: [],
    implementations: {
      javascript: `function setCamera(x, y) {
  window.__game = window.__game || { sprites: {}, camera: { x: 0, y: 0 } };
  if (!window.__game.camera) window.__game.camera = { x: 0, y: 0 };
  window.__game.camera.x = Number(x);
  window.__game.camera.y = Number(y);
}`,
      python: `def set_camera(x, y):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { x: 0, y: 0 }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'camera_follow',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Center the camera on a sprite (great for side-scrollers — camera follows your hero)',
    category: 'Games',
    inputs: [
      { name: 'name', type: 'string', description: 'Sprite to follow' },
    ],
    outputs: [],
    implementations: {
      javascript: `function cameraFollow(name) {
  window.__game = window.__game || { sprites: {}, camera: { x: 0, y: 0 } };
  if (!window.__game.camera) window.__game.camera = { x: 0, y: 0 };
  var s = window.__game.sprites[name];
  if (!s) return;
  var c = document.getElementById('cb-canvas');
  var cw = (c && c.width) || 640;
  var ch = (c && c.height) || 400;
  window.__game.camera.x = Math.max(0, Math.floor(s.x + s.w / 2 - cw / 2));
  window.__game.camera.y = Math.max(0, Math.floor(s.y + s.h / 2 - ch / 2));
}`,
      python: `def camera_follow(name):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'player' }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'spawn_random_platform',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Spawn a random platform at a given X position. Great for infinite runners and procedural levels.',
    category: 'Games',
    inputs: [
      { name: 'x', type: 'number', description: 'X position for the platform', default: 800 },
      { name: 'min_y', type: 'number', description: 'Minimum Y for random placement', default: 150 },
      { name: 'max_y', type: 'number', description: 'Maximum Y for random placement', default: 350 },
      { name: 'width', type: 'number', description: 'Platform width', default: 100 },
      { name: 'height', type: 'number', description: 'Platform height', default: 16 },
      { name: 'color', type: 'string', description: 'Platform color', default: '#a6e3a1' },
    ],
    outputs: [],
    implementations: {
      javascript: `function spawnRandomPlatform(x, minY, maxY, width, height, color) {
  window.__game = window.__game || { sprites: {}, platforms: [], backgrounds: [], camera: { x: 0, y: 0 }, gravity: 0, score: 0 };
  if (!window.__game.platforms) window.__game.platforms = [];
  var y = Math.floor(Math.random() * (Number(maxY) - Number(minY))) + Number(minY);
  window.__game.platforms.push({ x: Number(x), y: y, w: Number(width), h: Number(height), color: String(color) });
}`,
      python: `def spawn_random_platform(x, min_y, max_y, width, height, color):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { x: 800, min_y: 150, max_y: 350, width: 100, height: 16, color: '#a6e3a1' }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'spawn_pipe_pair',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Spawn a Flappy Bird-style pipe pair (top + bottom with a gap) at the given X. Gap position is random.',
    category: 'Games',
    inputs: [
      { name: 'x', type: 'number', description: 'X position', default: 800 },
      { name: 'gap_size', type: 'number', description: 'Size of the gap between pipes', default: 180 },
      { name: 'min_gap_y', type: 'number', description: 'Minimum gap top position', default: 80 },
      { name: 'max_gap_y', type: 'number', description: 'Maximum gap top position', default: 280 },
      { name: 'pipe_width', type: 'number', description: 'Width of each pipe', default: 60 },
      { name: 'color', type: 'string', description: 'Pipe color', default: '#22c55e' },
    ],
    outputs: [],
    implementations: {
      javascript: `function spawnPipePair(x, gapSize, minGapY, maxGapY, pipeWidth, color) {
  window.__game = window.__game || { sprites: {}, platforms: [], backgrounds: [], camera: { x: 0, y: 0 }, gravity: 0, score: 0 };
  if (!window.__game.platforms) window.__game.platforms = [];
  var gapY = Math.floor(Math.random() * (Number(maxGapY) - Number(minGapY))) + Number(minGapY);
  var pw = Number(pipeWidth);
  var gs = Number(gapSize);
  var px = Number(x);
  window.__game.platforms.push({ x: px, y: 0, w: pw, h: gapY, color: String(color) });
  window.__game.platforms.push({ x: px, y: gapY + gs, w: pw, h: 600, color: String(color) });
}`,
      python: `def spawn_pipe_pair(x, gap_size, min_gap_y, max_gap_y, pipe_width, color):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { x: 800, gap_size: 180, min_gap_y: 80, max_gap_y: 280, pipe_width: 60, color: '#22c55e' }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'remove_offscreen_platforms',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove platforms that have scrolled past the left edge of the camera. Keeps the game from slowing down.',
    category: 'Games',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function removeOffscreenPlatforms() {
  window.__game = window.__game || { sprites: {}, platforms: [] };
  if (!window.__game.platforms || !window.__game.camera) return;
  var camX = window.__game.camera.x || 0;
  window.__game.platforms = window.__game.platforms.filter(function(p) {
    return p.x + p.w > camX - 200;
  });
}`,
      python: `def remove_offscreen_platforms():
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'add_background',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add a repeating background image layer that scrolls at a parallax rate (0 = fixed, 1 = matches camera)',
    category: 'Games',
    inputs: [
      { name: 'image', type: 'string', description: 'Image URL', default: '' },
      { name: 'parallax', type: 'number', description: 'Scroll rate (0 to 1)', default: 0.5 },
    ],
    outputs: [],
    implementations: {
      javascript: `function addBackground(image, parallax) {
  window.__game = window.__game || { sprites: {}, backgrounds: [] };
  if (!window.__game.backgrounds) window.__game.backgrounds = [];
  var bg = { parallax: Number(parallax) || 0, imageEl: null };
  if (image) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = String(image);
    bg.imageEl = img;
  }
  window.__game.backgrounds.push(bg);
}`,
      python: `def add_background(image, parallax):
    print("[Games are only available in JavaScript mode]")`,
    },
    tests: [
      { input: { image: '', parallax: 0.5 }, expected: {} },
    ],
    color: '#EA580C',
  },

  {
    name: 'start_tetris',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Launch a full Tetris game on the canvas — with Korobeiniki background music! ← → move, ↑ rotate, ↓ soft drop, Space hard drop.',
    category: 'Games',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function start_tetris() {
  window.__game = window.__game || {};
  (function() {
    var W = 10, H = 20, SZ = 30;
    var c = document.getElementById('cb-canvas');
    c.width = W * SZ; c.height = H * SZ; c.style.display = 'block';
    var ctx = c.getContext('2d');
    var grid = []; for (var y = 0; y < H; y++) { grid[y] = []; for (var x = 0; x < W; x++) grid[y][x] = 0; }
    var PIECES = [
      {s:[[1,1,1,1]],c:'#89b4fa'},{s:[[1,1],[1,1]],c:'#f9e2af'},
      {s:[[0,1,0],[1,1,1]],c:'#cba6f7'},{s:[[1,0,0],[1,1,1]],c:'#89b4fa'},
      {s:[[0,0,1],[1,1,1]],c:'#fab387'},{s:[[0,1,1],[1,1,0]],c:'#a6e3a1'},
      {s:[[1,1,0],[0,1,1]],c:'#f38ba8'}
    ];
    var score=0,lines=0,level=1,over=false,piece,px,py,pc,di=500,ld=0;
    function rot(s){var r=s.length,cl=s[0].length,n=[];for(var c2=0;c2<cl;c2++){n[c2]=[];for(var r2=r-1;r2>=0;r2--)n[c2].push(s[r2][c2])}return n}
    function fits(s,tx,ty){for(var y=0;y<s.length;y++)for(var x=0;x<s[y].length;x++)if(s[y][x]){var gx=tx+x,gy=ty+y;if(gx<0||gx>=W||gy>=H)return false;if(gy>=0&&grid[gy][gx])return false}return true}
    function lock(){for(var y=0;y<piece.length;y++)for(var x=0;x<piece[y].length;x++)if(piece[y][x]){var gy=py+y;if(gy<0){over=true;return}grid[gy][px+x]=pc}
      var cl=0;for(var y=H-1;y>=0;y--){if(grid[y].every(function(v){return v!==0})){grid.splice(y,1);grid.unshift(Array(W).fill(0));cl++;y++}}
      if(cl>0){lines+=cl;score+=[0,100,300,500,800][cl]*level;level=Math.floor(lines/10)+1;di=Math.max(100,500-(level-1)*40);
        try{var a=window.__audio||new(window.AudioContext||window.webkitAudioContext)();window.__audio=a;var o=a.createOscillator();var g=a.createGain();o.frequency.value=600+cl*200;g.gain.setValueAtTime(0.3,a.currentTime);g.gain.exponentialRampToValueAtTime(0.01,a.currentTime+0.2);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.2)}catch(e){}}
      spawn()}
    function spawn(){var p=PIECES[Math.floor(Math.random()*PIECES.length)];piece=p.s.map(function(r){return r.slice()});pc=p.c;px=Math.floor((W-piece[0].length)/2);py=-1;if(!fits(piece,px,py))over=true}
    function draw(){ctx.fillStyle='#11111b';ctx.fillRect(0,0,c.width,c.height);
      ctx.strokeStyle='#1e1e2e';ctx.lineWidth=0.5;
      for(var x=0;x<=W;x++){ctx.beginPath();ctx.moveTo(x*SZ,0);ctx.lineTo(x*SZ,H*SZ);ctx.stroke()}
      for(var y=0;y<=H;y++){ctx.beginPath();ctx.moveTo(0,y*SZ);ctx.lineTo(W*SZ,y*SZ);ctx.stroke()}
      for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(grid[y][x]){ctx.fillStyle=grid[y][x];ctx.fillRect(x*SZ+1,y*SZ+1,SZ-2,SZ-2);ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(x*SZ+1,y*SZ+1,SZ-2,3)}
      if(piece&&!over)for(var y=0;y<piece.length;y++)for(var x=0;x<piece[y].length;x++)if(piece[y][x]){var dy=py+y;if(dy>=0){ctx.fillStyle=pc;ctx.fillRect((px+x)*SZ+1,dy*SZ+1,SZ-2,SZ-2);ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect((px+x)*SZ+1,dy*SZ+1,SZ-2,3)}}
      ctx.fillStyle='#cdd6f4';ctx.font='bold 14px sans-serif';ctx.textAlign='left';ctx.fillText('Score: '+score,5,18);ctx.textAlign='right';ctx.fillText('Lvl '+level,c.width-5,18);ctx.textAlign='left';
      if(over){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,c.height/2-40,c.width,80);ctx.fillStyle='#f38ba8';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',c.width/2,c.height/2);ctx.fillStyle='#6c7086';ctx.font='14px sans-serif';ctx.fillText('Score: '+score+' | Lines: '+lines,c.width/2,c.height/2+25);ctx.textAlign='left'}}
    document.addEventListener('keydown',function(e){if(over)return;
      if(e.key==='ArrowLeft'){if(fits(piece,px-1,py))px--;e.preventDefault()}
      else if(e.key==='ArrowRight'){if(fits(piece,px+1,py))px++;e.preventDefault()}
      else if(e.key==='ArrowUp'){var r=rot(piece);if(fits(r,px,py))piece=r;else if(fits(r,px-1,py)){piece=r;px--}else if(fits(r,px+1,py)){piece=r;px++};e.preventDefault()}
      else if(e.key==='ArrowDown'){if(fits(piece,px,py+1)){py++;score+=1}e.preventDefault()}
      else if(e.key===' '){while(fits(piece,px,py+1)){py++;score+=2}lock();e.preventDefault()}});
    var mel=[[659,400],[494,200],[523,200],[587,400],[523,200],[494,200],[440,400],[440,200],[523,200],[659,400],[587,200],[523,200],[494,400],[494,200],[523,200],[587,400],[659,400],[523,400],[440,400],[440,400],[0,400],[587,400],[698,200],[880,400],[784,200],[698,200],[659,400],[523,200],[659,400],[587,200],[523,200],[494,400],[494,200],[523,200],[587,400],[659,400],[523,400],[440,400],[440,400],[0,400]];
    var mi=0;function playN(){if(over)return;try{var a=window.__audio||new(window.AudioContext||window.webkitAudioContext)();window.__audio=a;var n=mel[mi%mel.length];mi++;if(n[0]>0){var o=a.createOscillator();var g=a.createGain();o.type='square';o.frequency.value=n[0];g.gain.setValueAtTime(0.06,a.currentTime);g.gain.exponentialRampToValueAtTime(0.01,a.currentTime+n[1]/1000*0.9);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+n[1]/1000)}setTimeout(playN,n[1])}catch(e){setTimeout(playN,500)}}
    setTimeout(playN,300);
    spawn();
    function tick(t){if(!t)t=0;if(over){draw();return}if(t-ld>di){if(fits(piece,px,py+1))py++;else lock();ld=t}draw();window.__cbGameLoopId=requestAnimationFrame(tick)}
    window.__cbGameLoopId=requestAnimationFrame(tick);
    console.log('🧱 Tetris! ← → move, ↑ rotate, ↓ soft drop, Space hard drop');
  })();
}`,
      python: `def start_tetris():
    print("[Tetris only works in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: '#EA580C',
    shape: 'statement',
  },
]
