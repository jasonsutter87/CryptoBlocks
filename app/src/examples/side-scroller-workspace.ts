/**
 * Side Scroller — demonstrates the sprite/physics/camera blocks.
 *
 * Plays like a tiny Mario:
 *   • Left/Right arrows run
 *   • Space jumps (when standing on ground)
 *   • Camera follows the player
 *   • Runs on cb_game_loop (requestAnimationFrame) so frame pacing is
 *     browser-native — no rough cb_wait estimates
 *
 * Keyboard handlers are registered FIRST so they're live before the
 * game loop starts. Otherwise the player would feel unresponsive
 * until the setup finished.
 */

import {
  resetIds,
  block,
  blockWithStatements,
  textVal,
  numVal,
  chain,
  workspace,
} from './workspaces'

export function sideScrollerWorkspace(): Record<string, unknown> {
  resetIds()

  // ============================================================
  // Keyboard handlers — registered FIRST so they're live before
  // the setup chain and game loop start executing.
  // ============================================================

  const moveLeft = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(-3),
    vy: numVal(0),
  })

  const leftKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: 'ArrowLeft' },
    {},
    { DO: moveLeft },
  )
  leftKey.x = 40
  leftKey.y = 40

  const moveRight = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(3),
    vy: numVal(0),
  })

  const rightKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: 'ArrowRight' },
    {},
    { DO: moveRight },
  )

  const jump = block('cb_sprite_jump', undefined, {
    name: textVal('player'),
    power: numVal(9),
  })

  const spaceKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: ' ' },
    {},
    { DO: jump },
  )

  // ============================================================
  // Setup chain: canvas → gravity → player → platforms → game loop
  // ============================================================

  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(640),
    height: numVal(400),
    color: textVal('#1e1e2e'),
  }, 40, 260)

  const setGravity = block('cb_set_gravity', undefined, {
    value: numVal(0.4),
  })

  const createPlayer = block('cb_create_sprite', undefined, {
    name: textVal('player'),
    x: numVal(80),
    y: numVal(200),
    width: numVal(40),
    height: numVal(40),
    color: textVal('#f9e2af'),
    emoji: textVal('🦊'),
    image: textVal(''),
  })

  const ground = block('cb_add_platform', undefined, {
    x: numVal(0),
    y: numVal(360),
    width: numVal(1800),
    height: numVal(40),
    color: textVal('#8b5cf6'),
  })

  const platforms = [
    [220, 280, 120],
    [420, 220, 120],
    [620, 260, 160],
    [900, 200, 140],
    [1200, 280, 180],
  ].map(([x, y, w]) =>
    block('cb_add_platform', undefined, {
      x: numVal(x),
      y: numVal(y),
      width: numVal(w),
      height: numVal(16),
      color: textVal('#a6e3a1'),
    }),
  )

  // ============================================================
  // Game loop body: physics → camera → respawn if fell → draw
  // ============================================================

  const physicsStep = block('cb_physics_step', undefined, undefined)

  const follow = block('cb_camera_follow', undefined, {
    name: textVal('player'),
  })

  const fellCondition = block('cb_greater_than', undefined, {
    a: block('cb_get_sprite_y', undefined, { name: textVal('player') }),
    b: numVal(500),
  })

  const respawn = block('cb_set_sprite_position', undefined, {
    name: textVal('player'),
    x: numVal(80),
    y: numVal(100),
  })

  const ifFell = blockWithStatements(
    'cb_if',
    undefined,
    { CONDITION: fellCondition },
    { DO: respawn },
  )

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const loopBody = chain(physicsStep, follow, ifFell, draw)

  const gameLoop = blockWithStatements(
    'cb_game_loop',
    undefined,
    {},
    { DO: loopBody },
  )

  // ============================================================
  // Assemble: key handlers first (top-left), then setup + loop
  // ============================================================

  return workspace(
    chain(leftKey, rightKey, spaceKey),
    chain(setCanvas, setGravity, createPlayer, ground, ...platforms, gameLoop),
  )
}
