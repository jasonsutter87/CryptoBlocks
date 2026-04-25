/**
 * Pac-Man — sprite-driven renderer.
 *
 * The game engine (maze gen, ghost AI, scatter/chase modes, tunnel wrap,
 * power-pellet logic, etc.) is unchanged from the reference. Only the
 * rendering layer was rewritten to consume PNG sprites loaded from disk.
 *
 *  /sprites/wall.png         /sprites/blinky.png
 *  /sprites/dot.png          /sprites/pinky.png
 *  /sprites/pellet.png       /sprites/inky.png
 *  /sprites/tunnel.png       /sprites/clyde.png
 *  /sprites/ghost-house.png  /sprites/frightened.png
 *  /sprites/pac-open.png     /sprites/frightened-flash.png
 *  /sprites/pac-closed.png
 *
 * Anything missing falls back to a colored shape so you can load the page
 * and play with one sprite at a time as you make them.
 *
 * Quick start:  startGame()  — auto-builds a maze and drops a canvas in.
 */

// ─── Maze constants ──────────────────────────────────────────────────────
const WALL   = 0;
const DOT    = 1;
const PELLET = 2;
const GHOST  = 3;
const TUNNEL = 4;
const EMPTY  = 5;   // eaten dot — passable, no sprite

// ─── Engine constants ────────────────────────────────────────────────────
const TILE_SIZE = 24;          // bumped from 20 → 24 so sprites have room
const PAC_SPEED = 0.08;
const GHOST_SPEED = 0.06;
const GHOST_SCARED_SPEED = 0.03;
const GHOST_RELEASE_INTERVAL = 3000;
const POWER_DURATION = 8000;
const DOT_SCORE = 10;
const PELLET_SCORE = 50;
const GHOST_EAT_SCORE = 200;

// Ghost AI modes
const SCATTER = 0;
const CHASE = 1;
const FRIGHTENED = 2;
const EATEN = 3;

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE LOADING
// ═══════════════════════════════════════════════════════════════════════════

const SPRITE_PATHS = {
  wall:             'sprites/wall.png',
  dot:              'sprites/dot.png',
  pellet:           'sprites/pellet.png',
  tunnel:           'sprites/tunnel.png',
  ghostHouse:       'sprites/ghost-house.png',
  pacOpen:          'sprites/pac-open.png',
  pacClosed:        'sprites/pac-closed.png',
  blinky:           'sprites/blinky.png',
  pinky:            'sprites/pinky.png',
  inky:             'sprites/inky.png',
  clyde:            'sprites/clyde.png',
  frightened:       'sprites/frightened.png',
  frightenedFlash:  'sprites/frightened-flash.png',
};

const SPRITES = {};  // populated by loadSprites — null if file missing

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);   // missing files → null, fallback kicks in
    img.src = src;
  });
}

async function loadSprites(paths = SPRITE_PATHS) {
  const entries = await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await loadImage(path)])
  );
  for (const [k, v] of entries) SPRITES[k] = v;
  const missing = entries.filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) console.info('[pacman] missing sprites (using fallbacks):', missing.join(', '));
  return SPRITES;
}

// Fallback drawing — runs only when a sprite is missing.
function drawFallback(ctx, kind, px, py, size, ghostColor) {
  const half = size / 2;
  switch (kind) {
    case 'wall':       ctx.fillStyle = '#1a1aff'; ctx.fillRect(px + 1, py + 1, size - 2, size - 2); break;
    case 'dot':        ctx.fillStyle = '#ffb8ae'; ctx.beginPath(); ctx.arc(px + half, py + half, 2, 0, Math.PI * 2); ctx.fill(); break;
    case 'pellet':     ctx.fillStyle = '#ffb8ae'; ctx.beginPath(); ctx.arc(px + half, py + half, 5, 0, Math.PI * 2); ctx.fill(); break;
    case 'tunnel':     ctx.fillStyle = '#333';    ctx.fillRect(px, py, size, size); break;
    case 'ghostHouse': ctx.fillStyle = '#111';    ctx.fillRect(px, py, size, size); break;
    case 'pac':        ctx.fillStyle = '#FFFF00'; ctx.beginPath(); ctx.arc(px + half, py + half, half - 1, 0, Math.PI * 2); ctx.fill(); break;
    case 'ghost':      ctx.fillStyle = ghostColor || '#fff'; ctx.beginPath(); ctx.arc(px + half, py + half, half - 1, 0, Math.PI * 2); ctx.fill(); break;
    case 'frightened': ctx.fillStyle = '#2121ff'; ctx.beginPath(); ctx.arc(px + half, py + half, half - 1, 0, Math.PI * 2); ctx.fill(); break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAZE GENERATION (unchanged)
// ═══════════════════════════════════════════════════════════════════════════

function makeGrid(rows, cols) {
  const grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) grid[y][x] = WALL;
  }
  return grid;
}

function shuffleDirs() {
  const dirs = [[0,-2],[0,2],[-2,0],[2,0]];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = dirs[i]; dirs[i] = dirs[j]; dirs[j] = tmp;
  }
  return dirs;
}

function isRoom(x, y, halfCols, rows) {
  return x > 0 && x < halfCols && y > 0 && y < rows - 1;
}

function carveLeftHalf(grid, halfCols, rows) {
  grid[1][1] = DOT;
  const stack = [[1, 1]];
  while (stack.length > 0) {
    const cur = stack[stack.length - 1];
    const cx = cur[0], cy = cur[1];
    const dirs = shuffleDirs();
    let moved = false;
    for (let i = 0; i < dirs.length; i++) {
      const dx = dirs[i][0], dy = dirs[i][1];
      const nx = cx + dx, ny = cy + dy;
      if (isRoom(nx, ny, halfCols, rows) && grid[ny][nx] === WALL) {
        grid[cy + dy/2][cx + dx/2] = DOT;
        grid[ny][nx] = DOT;
        stack.push([nx, ny]);
        moved = true;
        break;
      }
    }
    if (!moved) stack.pop();
  }
}

function mirrorHalf(grid, halfCols, rows) {
  const cols = halfCols * 2 + 1;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < halfCols; x++)
      grid[y][cols - 1 - x] = grid[y][x];
}

function punchCenterPassages(grid, halfCols, rows, count) {
  const cols = halfCols * 2 + 1;
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  const candidates = [];
  for (let y = 1; y < rows - 1; y += 2)
    if (y < cy - 1 || y > cy + 1) candidates.push(y);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = candidates[i]; candidates[i] = candidates[j]; candidates[j] = tmp;
  }
  let actual = Math.min(count, candidates.length);
  if (actual < 1 && candidates.length > 0) actual = 1;
  for (let i = 0; i < actual; i++) {
    const py = candidates[i];
    grid[py][cx] = DOT;
    if (grid[py][cx - 1] === WALL) grid[py][cx - 1] = DOT;
    if (grid[py][cx + 1] === WALL) grid[py][cx + 1] = DOT;
  }
  return actual;
}

function placeSpecials(grid, halfCols, rows) {
  const cols = halfCols * 2 + 1;
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  grid[cy][0] = TUNNEL;
  grid[cy][cols - 1] = TUNNEL;
  grid[0][cx] = TUNNEL;
  grid[rows - 1][cx] = TUNNEL;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      grid[cy + dy][cx + dx] = GHOST;

  // Carve a ring of dots immediately around the ghost house so pac can walk
  // past it and released ghosts always have a clear tile to emerge into.
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dy) <= 1 && Math.abs(dx) <= 1) continue;       // skip the house itself
      if (Math.abs(dy) !== 2 && Math.abs(dx) !== 2) continue;     // only the ring
      const y = cy + dy, x = cx + dx;
      if (y < 0 || y >= rows || x < 0 || x >= cols) continue;
      if (grid[y][x] === WALL) grid[y][x] = DOT;
    }
  }
}

function clearTunnelApproaches(grid, halfCols, rows) {
  const cols = halfCols * 2 + 1;
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  for (let x = 1; x <= 3; x++) {
    if (grid[cy][x] === WALL) grid[cy][x] = DOT;
    if (grid[cy][cols-1-x] === WALL) grid[cy][cols-1-x] = DOT;
  }
  for (const dy of [-1, 1]) {
    if (grid[cy+dy]?.[1] === WALL) grid[cy+dy][1] = DOT;
    if (grid[cy+dy]?.[cols-2] === WALL) grid[cy+dy][cols-2] = DOT;
  }
  for (let y = 1; y <= 3; y++) {
    if (grid[y][cx] === WALL) grid[y][cx] = DOT;
    if (grid[rows-1-y][cx] === WALL) grid[rows-1-y][cx] = DOT;
  }
  for (const dx of [-1, 1]) {
    if (grid[1]?.[cx+dx] === WALL) grid[1][cx+dx] = DOT;
    if (grid[rows-2]?.[cx+dx] === WALL) grid[rows-2][cx+dx] = DOT;
  }
}

function placePellets(grid, halfCols, rows) {
  const cols = halfCols * 2 + 1;
  const corners = [[1,1],[1,cols-2],[rows-2,1],[rows-2,cols-2]];
  for (let c = 0; c < corners.length; c++) {
    const py = corners[c][0], px = corners[c][1];
    const dirY = py < rows / 2 ? 1 : -1;
    const dirX = px < cols / 2 ? 1 : -1;
    let found = false;
    for (let r = 0; r < 5 && !found; r++)
      for (let dy = 0; dy <= r && !found; dy++)
        for (let dx = 0; dx <= r && !found; dx++) {
          const y1 = py + dy * dirY;
          const x1 = px + dx * dirX;
          const x2 = px - dx * dirX;
          if (grid[y1]?.[x1] === DOT) { grid[y1][x1] = PELLET; found = true; }
          else if (grid[y1]?.[x2] === DOT) { grid[y1][x2] = PELLET; found = true; }
        }
  }
}

function findSpawn(grid, halfCols, rows) {
  const cols = halfCols * 2 + 1;
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  const prefY = Math.floor(rows * 0.72);
  const MIN_GHOST_DIST = 3;

  // A "valid" spawn is on a passable tile AND has at least one passable
  // neighbor — guarantees Pac-Man can actually move from spawn.
  const passable = (x, y) =>
    y >= 0 && y < rows && x >= 0 && x < cols &&
    (grid[y][x] === DOT || grid[y][x] === PELLET);
  const hasOpenNeighbor = (x, y) =>
    passable(x + 1, y) || passable(x - 1, y) ||
    passable(x, y + 1) || passable(x, y - 1);
  const isOpenSpawn = (x, y) => passable(x, y) && hasOpenNeighbor(x, y);

  // Preferred: rings expanding from (cx, prefY), keeping distance from ghost house
  for (let r = 0; r < rows; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dy) !== r && Math.abs(dx) !== r) continue;
        const x = cx + dx, y = prefY + dy;
        const ghostDist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
        if (ghostDist < MIN_GHOST_DIST) continue;
        if (isOpenSpawn(x, y)) return [x, y];
      }

  // Brute-force fallback: any passable tile with an open neighbor
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      if (isOpenSpawn(x, y)) return [x, y];

  return [1, 1];
}

function buildMaze(halfCols, rows, passages) {
  const cols = halfCols * 2 + 1;
  const grid = makeGrid(rows, cols);
  carveLeftHalf(grid, halfCols, rows);
  mirrorHalf(grid, halfCols, rows);
  punchCenterPassages(grid, halfCols, rows, passages);
  placeSpecials(grid, halfCols, rows);
  clearTunnelApproaches(grid, halfCols, rows);
  placePellets(grid, halfCols, rows);
  const spawn = findSpawn(grid, halfCols, rows);
  return { grid, cols, rows, spawnX: spawn[0], spawnY: spawn[1] };
}

// ═══════════════════════════════════════════════════════════════════════════
// GHOST AI (unchanged)
// ═══════════════════════════════════════════════════════════════════════════

function ghostTargets(ghostIndex, ghostX, ghostY, pacX, pacY, pacDirX, pacDirY, blinkyX, blinkyY, cols, rows) {
  switch (ghostIndex) {
    case 0: return { x: pacX, y: pacY };
    case 1: return { x: pacX + pacDirX * 4, y: pacY + pacDirY * 4 };
    case 2: {
      const aheadX = pacX + pacDirX * 2;
      const aheadY = pacY + pacDirY * 2;
      return { x: aheadX + (aheadX - blinkyX), y: aheadY + (aheadY - blinkyY) };
    }
    case 3: {
      const dist = Math.abs(ghostX - pacX) + Math.abs(ghostY - pacY);
      if (dist > 8) return { x: pacX, y: pacY };
      return { x: 0, y: rows - 1 };
    }
    default: return { x: pacX, y: pacY };
  }
}

function getScatterTarget(ghostIndex, cols, rows) {
  switch (ghostIndex) {
    case 0: return { x: cols - 2, y: 1 };
    case 1: return { x: 1, y: 1 };
    case 2: return { x: cols - 2, y: rows - 2 };
    case 3: return { x: 1, y: rows - 2 };
    default: return { x: 1, y: 1 };
  }
}

function canMove(grid, x, y, cols, rows) {
  const wx = ((x % cols) + cols) % cols;
  const wy = ((y % rows) + rows) % rows;
  if (wx < 0 || wx >= cols || wy < 0 || wy >= rows) return false;
  const cell = grid[wy][wx];
  return cell !== WALL && cell !== GHOST;
}

function canMoveGhost(grid, x, y, cols, rows) {
  const wx = ((x % cols) + cols) % cols;
  const wy = ((y % rows) + rows) % rows;
  if (wx < 0 || wx >= cols || wy < 0 || wy >= rows) return false;
  return grid[wy][wx] !== WALL;
}

function chooseDirection(grid, gx, gy, targetX, targetY, currentDirX, currentDirY, cols, rows, isEaten) {
  const dirs = [
    { dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 },
  ];
  let bestDir = null;
  let bestDist = Infinity;
  for (const dir of dirs) {
    if (dir.dx === -currentDirX && dir.dy === -currentDirY) continue;
    const nx = Math.round(gx) + dir.dx;
    const ny = Math.round(gy) + dir.dy;
    if (!canMoveGhost(grid, nx, ny, cols, rows, isEaten)) continue;
    const dist = (nx - targetX) ** 2 + (ny - targetY) ** 2;
    if (dist < bestDist) { bestDist = dist; bestDir = dir; }
  }
  if (!bestDir) {
    for (const dir of dirs) {
      const nx = Math.round(gx) + dir.dx;
      const ny = Math.round(gy) + dir.dy;
      if (canMoveGhost(grid, nx, ny, cols, rows, isEaten)) { bestDir = dir; break; }
    }
  }
  return bestDir || { dx: 0, dy: 0 };
}

function wrapPosition(x, y, cols, rows) {
  return { x: ((x % cols) + cols) % cols, y: ((y % rows) + rows) % rows };
}

// ═══════════════════════════════════════════════════════════════════════════
// GAME STATE (unchanged)
// ═══════════════════════════════════════════════════════════════════════════

const GHOST_DEFS = [
  { name: 'blinky', color: '#FF0000' },
  { name: 'pinky',  color: '#FFB8FF' },
  { name: 'inky',   color: '#00FFFF' },
  { name: 'clyde',  color: '#FFB852' },
];

function createGameState(maze) {
  const { grid, cols, rows, spawnX, spawnY } = maze;
  const gameGrid = grid.map(row => [...row]);
  let totalDots = 0;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      if (gameGrid[y][x] === DOT || gameGrid[y][x] === PELLET) totalDots++;
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  const ghosts = GHOST_DEFS.map((def, i) => ({
    x: cx + [0, -1, 0, 1][i],
    y: [cy - 1, cy, cy, cy][i],
    dirX: 0, dirY: 0,
    mode: SCATTER,
    name: def.name,
    color: def.color,
    released: i === 0,
  }));
  return {
    grid: gameGrid, cols, rows,
    spawnX, spawnY,
    pac: { x: spawnX, y: spawnY, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 },
    ghosts,
    score: 0, lives: 3, dotsEaten: 0, totalDots, level: 1,
    powerTimer: 0, ghostsEatenThisPower: 0,
    ghostReleaseTimer: 0, nextGhostToRelease: 1,
    modeTimer: 0, globalMode: SCATTER, scatterChaseCycle: 0,
    gameOver: false, won: false, paused: false,
  };
}

const MODE_DURATIONS = [
  { mode: SCATTER, duration: 7000 },
  { mode: CHASE,   duration: 20000 },
  { mode: SCATTER, duration: 7000 },
  { mode: CHASE,   duration: 20000 },
  { mode: SCATTER, duration: 5000 },
  { mode: CHASE,   duration: 20000 },
  { mode: SCATTER, duration: 5000 },
  { mode: CHASE,   duration: Infinity },
];

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE (unchanged)
// ═══════════════════════════════════════════════════════════════════════════

function updateGame(state, dt) {
  if (state.gameOver || state.won || state.paused) return;
  const { pac, ghosts, grid, cols, rows } = state;

  state.ghostReleaseTimer += dt;
  if (state.ghostReleaseTimer >= GHOST_RELEASE_INTERVAL && state.nextGhostToRelease < ghosts.length) {
    ghosts[state.nextGhostToRelease].released = true;
    const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    ghosts[state.nextGhostToRelease].x = cx;
    ghosts[state.nextGhostToRelease].y = cy - 2;
    state.nextGhostToRelease++;
    state.ghostReleaseTimer = 0;
  }

  if (state.powerTimer <= 0) {
    state.modeTimer += dt;
    const cycle = MODE_DURATIONS[Math.min(state.scatterChaseCycle, MODE_DURATIONS.length - 1)];
    if (state.modeTimer >= cycle.duration && cycle.duration !== Infinity) {
      state.scatterChaseCycle++;
      state.modeTimer = 0;
      state.globalMode = MODE_DURATIONS[Math.min(state.scatterChaseCycle, MODE_DURATIONS.length - 1)].mode;
    }
  }

  if (state.powerTimer > 0) {
    state.powerTimer -= dt;
    if (state.powerTimer <= 0) {
      state.powerTimer = 0;
      state.ghostsEatenThisPower = 0;
      for (const g of ghosts) if (g.mode === FRIGHTENED) g.mode = state.globalMode;
    }
  }

  if (pac.nextDirX !== 0 || pac.nextDirY !== 0) {
    const tryX = Math.round(pac.x) + pac.nextDirX;
    const tryY = Math.round(pac.y) + pac.nextDirY;
    if (canMove(grid, tryX, tryY, cols, rows)) {
      pac.dirX = pac.nextDirX; pac.dirY = pac.nextDirY;
      pac.nextDirX = 0; pac.nextDirY = 0;
    }
  }

  if (pac.dirX !== 0 || pac.dirY !== 0) {
    const newX = pac.x + pac.dirX * PAC_SPEED;
    const newY = pac.y + pac.dirY * PAC_SPEED;
    const checkX = Math.round(newX + pac.dirX * 0.4);
    const checkY = Math.round(newY + pac.dirY * 0.4);
    if (canMove(grid, checkX, checkY, cols, rows)) { pac.x = newX; pac.y = newY; }
    else { pac.x = Math.round(pac.x); pac.y = Math.round(pac.y); pac.dirX = 0; pac.dirY = 0; }
    const wrapped = wrapPosition(pac.x, pac.y, cols, rows);
    pac.x = wrapped.x; pac.y = wrapped.y;
  }

  const tileX = Math.round(pac.x);
  const tileY = Math.round(pac.y);
  if (tileX >= 0 && tileX < cols && tileY >= 0 && tileY < rows) {
    const cell = grid[tileY][tileX];
    if (cell === DOT) {
      grid[tileY][tileX] = EMPTY;
      state.score += DOT_SCORE;
      state.dotsEaten++;
    } else if (cell === PELLET) {
      grid[tileY][tileX] = EMPTY;
      state.score += PELLET_SCORE;
      state.dotsEaten++;
      state.powerTimer = POWER_DURATION;
      state.ghostsEatenThisPower = 0;
      for (const g of ghosts) {
        if (g.mode !== EATEN) { g.mode = FRIGHTENED; g.dirX = -g.dirX; g.dirY = -g.dirY; }
      }
    }
  }

  if (state.dotsEaten >= state.totalDots) { state.won = true; return; }

  for (let i = 0; i < ghosts.length; i++) {
    const g = ghosts[i];
    if (!g.released) continue;
    const speed = g.mode === FRIGHTENED ? GHOST_SCARED_SPEED
                : g.mode === EATEN ? PAC_SPEED * 1.5
                : GHOST_SPEED;
    let target;
    if (g.mode === FRIGHTENED) {
      target = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } else if (g.mode === EATEN) {
      const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
      target = { x: cx, y: cy };
      if (Math.abs(g.x - cx) < 0.5 && Math.abs(g.y - cy) < 0.5) {
        g.mode = state.globalMode; g.x = cx; g.y = cy - 1;
      }
    } else if (state.globalMode === SCATTER) {
      target = getScatterTarget(i, cols, rows);
    } else {
      const blinky = ghosts[0];
      target = ghostTargets(i, g.x, g.y, pac.x, pac.y, pac.dirX || 0, pac.dirY || -1, blinky.x, blinky.y, cols, rows);
    }
    const atTile = Math.abs(g.x - Math.round(g.x)) < 0.05 && Math.abs(g.y - Math.round(g.y)) < 0.05;
    const tileKey = Math.round(g.x) + ',' + Math.round(g.y);
    if (atTile && g._lastDirTile !== tileKey) {
      g._lastDirTile = tileKey;
      g.x = Math.round(g.x); g.y = Math.round(g.y);
      const dir = chooseDirection(grid, g.x, g.y, target.x, target.y, g.dirX, g.dirY, cols, rows, g.mode === EATEN);
      g.dirX = dir.dx; g.dirY = dir.dy;
    }
    g.x += g.dirX * speed;
    g.y += g.dirY * speed;
    const gw = wrapPosition(g.x, g.y, cols, rows);
    g.x = gw.x; g.y = gw.y;

    if (Math.abs(g.x - pac.x) < 0.6 && Math.abs(g.y - pac.y) < 0.6) {
      if (g.mode === FRIGHTENED) {
        g.mode = EATEN;
        state.ghostsEatenThisPower++;
        state.score += GHOST_EAT_SCORE * Math.pow(2, state.ghostsEatenThisPower - 1);
      } else if (g.mode !== EATEN) {
        state.lives--;
        if (state.lives <= 0) { state.gameOver = true; }
        else {
          pac.x = state.spawnX; pac.y = state.spawnY;
          pac.dirX = 0; pac.dirY = 0; pac.nextDirX = 0; pac.nextDirY = 0;
          const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
          for (let gi = 0; gi < ghosts.length; gi++) {
            ghosts[gi].x = cx + (gi - 1); ghosts[gi].y = cy;
            ghosts[gi].dirX = 0; ghosts[gi].dirY = 0;
            ghosts[gi].mode = SCATTER;
            ghosts[gi].released = gi === 0;
          }
          state.nextGhostToRelease = 1;
          state.ghostReleaseTimer = 0;
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERER (sprite-driven, with fallbacks)
// ═══════════════════════════════════════════════════════════════════════════

const TILE_SPRITE_KEY = { 0: 'wall', 1: 'dot', 2: 'pellet', 3: 'ghostHouse', 4: 'tunnel' };
const TILE_FALLBACK_KIND = { 0: 'wall', 1: 'dot', 2: 'pellet', 3: 'ghostHouse', 4: 'tunnel' };

function dirToAngle(dx, dy) {
  if (dx === 1)  return 0;
  if (dx === -1) return Math.PI;
  if (dy === -1) return -Math.PI / 2;
  if (dy === 1)  return  Math.PI / 2;
  return 0;
}

function drawSpriteOrFallback(ctx, sprite, fallbackKind, px, py, size, ghostColor) {
  if (sprite) ctx.drawImage(sprite, px, py, size, size);
  else        drawFallback(ctx, fallbackKind, px, py, size, ghostColor);
}

function drawPac(ctx, pac, px, py, size) {
  const frame = Math.floor(Date.now() / 100) % 2 === 0 ? SPRITES.pacOpen : SPRITES.pacClosed;
  if (frame) {
    const angle = dirToAngle(pac.dirX, pac.dirY);
    ctx.save();
    ctx.translate(px + size / 2, py + size / 2);
    ctx.rotate(angle);
    ctx.drawImage(frame, -size / 2, -size / 2, size, size);
    ctx.restore();
  } else {
    drawFallback(ctx, 'pac', px, py, size);
  }
}

function drawGhost(ctx, g, state, px, py, size) {
  let sprite = null;
  if (g.mode === FRIGHTENED) {
    const flash = state.powerTimer < 2000 && Math.floor(Date.now() / 200) % 2 === 0;
    sprite = flash ? (SPRITES.frightenedFlash || SPRITES.frightened) : SPRITES.frightened;
  } else if (g.mode === EATEN) {
    sprite = null;  // eyes only — no body
  } else {
    sprite = SPRITES[g.name];
  }

  if (g.mode !== EATEN) {
    drawSpriteOrFallback(ctx, sprite, sprite ? null : 'ghost', px, py, size, g.color);
  }

  // Eyes always drawn programmatically so pupils can track movement direction.
  // Skip if a sprite has its own eyes — let the user opt out by adding a transparent
  // eye region in their sprite, or use the no-eye-overlay variant via window.__pacmanNoEyes.
  if (window.__pacmanNoEyes) return;
  const cx = px + size / 2, cy = py + size / 2;
  const eyeR = Math.max(2, size / 8);
  const eyeOff = size / 6;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - eyeOff, cy - 2, eyeR, 0, Math.PI * 2);
  ctx.arc(cx + eyeOff, cy - 2, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#00f';
  ctx.beginPath();
  ctx.arc(cx - eyeOff + g.dirX * 1.5, cy - 2 + g.dirY * 1.5, eyeR / 2, 0, Math.PI * 2);
  ctx.arc(cx + eyeOff + g.dirX * 1.5, cy - 2 + g.dirY * 1.5, eyeR / 2, 0, Math.PI * 2);
  ctx.fill();
}

function renderGame(ctx, state, canvasWidth, canvasHeight) {
  const { grid, cols, rows, pac, ghosts, score, lives, dotsEaten, totalDots } = state;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const offsetX = Math.floor((canvasWidth - cols * TILE_SIZE) / 2);
  const offsetY = 30;

  // Tiles
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const key = TILE_SPRITE_KEY[cell];
      if (!key) continue; // empty / eaten dot
      drawSpriteOrFallback(ctx, SPRITES[key], TILE_FALLBACK_KIND[cell],
        offsetX + x * TILE_SIZE, offsetY + y * TILE_SIZE, TILE_SIZE);
    }
  }

  // Pac-Man
  drawPac(ctx, pac,
    offsetX + pac.x * TILE_SIZE, offsetY + pac.y * TILE_SIZE, TILE_SIZE);

  // Ghosts — caged ghosts render dimmed inside the ghost house so it's
  // visually obvious they're queued, not missing.
  for (const g of ghosts) {
    const caged = !g.released && g.mode !== EATEN;
    if (caged) ctx.globalAlpha = 0.45;
    drawGhost(ctx, g, state,
      offsetX + g.x * TILE_SIZE, offsetY + g.y * TILE_SIZE, TILE_SIZE);
    ctx.globalAlpha = 1;
  }

  // HUD
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 20);
  ctx.textAlign = 'center';
  ctx.fillText(`DOTS: ${dotsEaten}/${totalDots}`, canvasWidth / 2, 20);
  ctx.textAlign = 'right';
  for (let i = 0; i < lives; i++) {
    if (SPRITES.pacOpen) {
      ctx.drawImage(SPRITES.pacOpen, canvasWidth - 28 - i * (TILE_SIZE + 4), 4, TILE_SIZE, TILE_SIZE);
    } else {
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(canvasWidth - 20 - i * 25, 14, 8, 0.25 * Math.PI, 1.75 * Math.PI);
      ctx.lineTo(canvasWidth - 20 - i * 25, 14); ctx.fill();
    }
  }

  // Overlays
  if (state.gameOver) drawOverlay(ctx, canvasWidth, canvasHeight, '#f00', 'GAME OVER', `Final Score: ${score}`);
  else if (state.won) drawOverlay(ctx, canvasWidth, canvasHeight, '#0f0', 'YOU WIN!', `Score: ${score}`);
  else if (state.paused) drawOverlay(ctx, canvasWidth, canvasHeight, '#ff0', 'PAUSED', 'Press P to resume');
}

function drawOverlay(ctx, w, h, color, title, sub) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, w / 2, h / 2 - 10);
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText(sub, w / 2, h / 2 + 25);
  ctx.fillText('Press R to restart', w / 2, h / 2 + 50);
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT (unchanged)
// ═══════════════════════════════════════════════════════════════════════════

function handleInput(state, key) {
  if (key === 'p' || key === 'P') { state.paused = !state.paused; return; }
  if (key === 'r' || key === 'R') return 'restart';
  if (state.paused || state.gameOver || state.won) return;
  switch (key) {
    case 'ArrowUp':    case 'w': case 'W': state.pac.nextDirX = 0;  state.pac.nextDirY = -1; break;
    case 'ArrowDown':  case 's': case 'S': state.pac.nextDirX = 0;  state.pac.nextDirY = 1;  break;
    case 'ArrowLeft':  case 'a': case 'A': state.pac.nextDirX = -1; state.pac.nextDirY = 0;  break;
    case 'ArrowRight': case 'd': case 'D': state.pac.nextDirX = 1;  state.pac.nextDirY = 0;  break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LAUNCHER
// ═══════════════════════════════════════════════════════════════════════════

async function startGame(mazeConfig) {
  await loadSprites();   // wait so first frame uses sprites if present
  mazeConfig = mazeConfig || { halfCols: 10, rows: 21, passages: 3 };
  const maze = mazeConfig.grid
    ? mazeConfig
    : buildMaze(mazeConfig.halfCols || 10, mazeConfig.rows || 21, mazeConfig.passages || 3);
  const canvasWidth  = maze.cols * TILE_SIZE + 40;
  const canvasHeight = maze.rows * TILE_SIZE + 60;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.cssText = 'display:block;margin:20px auto;background:#000;border:2px solid #333;border-radius:8px;image-rendering:pixelated;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  let state = createGameState(maze);
  if (typeof window !== 'undefined') window.__pacman = { get state() { return state; } };
  let lastTime = performance.now();
  function onKey(e) {
    const result = handleInput(state, e.key);
    if (result === 'restart') {
      const newMaze = buildMaze(Math.floor(maze.cols / 2), maze.rows, Math.min(3 + state.level, 6));
      state = createGameState(newMaze);
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) e.preventDefault();
  }
  document.addEventListener('keydown', onKey);
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;
    updateGame(state, dt);
    renderGame(ctx, state, canvasWidth, canvasHeight);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return function cleanup() {
    document.removeEventListener('keydown', onKey);
    canvas.remove();
  };
}

// ─── Exports ─────────────────────────────────────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = {
    buildMaze, startGame, createGameState, updateGame, renderGame, handleInput,
    loadSprites, SPRITES, SPRITE_PATHS,
    WALL, DOT, PELLET, GHOST, TUNNEL,
  };
}
