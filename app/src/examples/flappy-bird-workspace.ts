/**
 * Flappy Bird — same physics primitives as the side scroller, different level.
 *
 * Gravity constantly pulls the bird down, Space gives a fixed upward
 * velocity (a "flap"). The bird drifts right through a world of pipe
 * pairs; the camera follows it, so visually the bird stays centered
 * while the pipes come at it — same effect as the real game.
 *
 * Uses cb_game_loop (requestAnimationFrame) for smooth browser-native
 * pacing. Keyboard handler registered BEFORE the loop so Space is
 * responsive from frame 1.
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

function pipePair(x: number, gapY: number): {
  top: ReturnType<typeof block>
  bottom: ReturnType<typeof block>
} {
  const top = block('cb_add_platform', undefined, {
    x: numVal(x),
    y: numVal(0),
    width: numVal(60),
    height: numVal(gapY),
    color: textVal('#22c55e'),
  })
  const bottom = block('cb_add_platform', undefined, {
    x: numVal(x),
    y: numVal(gapY + 160),
    width: numVal(60),
    height: numVal(400),
    color: textVal('#22c55e'),
  })
  return { top, bottom }
}

export function flappyBirdWorkspace(): Record<string, unknown> {
  resetIds()

  // ============================================================
  // Keyboard handler FIRST — Space flaps (upward impulse)
  // ============================================================

  const flap = block('cb_set_sprite_velocity', undefined, {
    name: textVal('bird'),
    vx: numVal(0),
    vy: numVal(-6),
  })

  const spaceKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: ' ' },
    {},
    { DO: flap },
  )
  spaceKey.x = 40
  spaceKey.y = 40

  // ============================================================
  // Setup
  // ============================================================

  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(480),
    height: numVal(480),
    color: textVal('#89b4fa'),
  }, 40, 160)

  const setGravity = block('cb_set_gravity', undefined, {
    value: numVal(0.35),
  })

  const createBird = block('cb_create_sprite', undefined, {
    name: textVal('bird'),
    x: numVal(120),
    y: numVal(200),
    width: numVal(36),
    height: numVal(36),
    color: textVal('#f9e2af'),
    emoji: textVal('🐤'),
    image: textVal(''),
  })

  // Ground — deadly floor
  const ground = block('cb_add_platform', undefined, {
    x: numVal(0),
    y: numVal(460),
    width: numVal(5000),
    height: numVal(20),
    color: textVal('#a16207'),
  })

  // Pipe pairs: [worldX, topGapBottomY]
  const pipes = [
    pipePair(320, 140),
    pipePair(520, 220),
    pipePair(720, 100),
    pipePair(920, 200),
    pipePair(1120, 160),
    pipePair(1320, 240),
    pipePair(1520, 120),
    pipePair(1720, 180),
  ]
  const pipeBlocks = pipes.flatMap((p) => [p.top, p.bottom])

  // ============================================================
  // Game loop body: physics → drift right → camera → score → draw
  // ============================================================

  const step = block('cb_physics_step', undefined, undefined)

  const drift = block('cb_move_sprite', undefined, {
    name: textVal('bird'),
    dx: numVal(1.6),
    dy: numVal(0),
  })

  const follow = block('cb_camera_follow', undefined, {
    name: textVal('bird'),
  })

  const updateScore = block('cb_set_score', undefined, {
    value: block('cb_multiply', undefined, {
      a: block('cb_get_sprite_x', undefined, { name: textVal('bird') }),
      b: numVal(0.01),
    }),
  })

  const fellCondition = block('cb_greater_than', undefined, {
    a: block('cb_get_sprite_y', undefined, { name: textVal('bird') }),
    b: numVal(500),
  })

  const respawnBird = block('cb_set_sprite_position', undefined, {
    name: textVal('bird'),
    x: numVal(120),
    y: numVal(200),
  })

  const ifFell = blockWithStatements(
    'cb_if',
    undefined,
    { CONDITION: fellCondition },
    { DO: respawnBird },
  )

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const loopBody = chain(step, drift, follow, updateScore, ifFell, draw)

  const gameLoop = blockWithStatements(
    'cb_game_loop',
    undefined,
    {},
    { DO: loopBody },
  )

  // ============================================================
  // Assemble
  // ============================================================

  return workspace(
    spaceKey,
    chain(setCanvas, setGravity, createBird, ground, ...pipeBlocks, gameLoop),
  )
}
