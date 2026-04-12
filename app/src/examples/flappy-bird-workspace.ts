/**
 * Flappy Bird — same physics primitives as the side scroller, different level.
 *
 * The bird stays horizontally fixed; gravity constantly pulls it down.
 * Pressing space gives it an instant upward velocity (a "flap"). Pipes
 * are static platforms in world space — we "scroll" them past the bird
 * by moving the camera to the right each frame.
 *
 * When the bird collides with a pipe or falls past the bottom, it
 * respawns at the start and the score resets.
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
    y: numVal(gapY + 140),
    width: numVal(60),
    height: numVal(400),
    color: textVal('#22c55e'),
  })
  return { top, bottom }
}

export function flappyBirdWorkspace(): Record<string, unknown> {
  resetIds()

  // Canvas + world
  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(480),
    height: numVal(480),
    color: textVal('#89b4fa'),
  }, 40, 40)

  const setGravity = block('cb_set_gravity', undefined, {
    value: numVal(0.6),
  })

  // The bird stays centered on screen horizontally (we move the camera,
  // not the bird). Initial spawn X matches the starting camera + half-width.
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

  // Ground strip so the bird can die by hitting the floor
  const ground = block('cb_add_platform', undefined, {
    x: numVal(0),
    y: numVal(460),
    width: numVal(5000),
    height: numVal(20),
    color: textVal('#a16207'),
  })

  // A handful of pipe pairs spread across the world
  const pipes = [
    pipePair(320, 120),
    pipePair(520, 200),
    pipePair(720, 80),
    pipePair(920, 180),
    pipePair(1120, 140),
    pipePair(1320, 220),
    pipePair(1520, 100),
    pipePair(1720, 160),
  ]
  const pipeBlocks = pipes.flatMap((p) => [p.top, p.bottom])

  // --- Keyboard: SPACE flaps (unconditional upward velocity) ---
  const flap = block('cb_set_sprite_velocity', undefined, {
    name: textVal('bird'),
    vx: numVal(0),
    vy: numVal(-9),
  })

  const spaceKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: ' ' },
    {},
    { DO: flap },
  )

  // --- Main game loop ---
  const step = block('cb_physics_step', undefined, undefined)

  // Scroll the world by nudging the bird right each frame. Camera follows.
  const scrollBird = block('cb_move_sprite', undefined, {
    name: textVal('bird'),
    dx: numVal(2.5),
    dy: numVal(0),
  })

  const follow = block('cb_camera_follow', undefined, {
    name: textVal('bird'),
  })

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const frameWait = block('cb_wait', undefined, {
    seconds: numVal(0.016),
  })

  // Score = distance traveled / 10 (approximate)
  const updateScore = block('cb_set_score', undefined, {
    value: block('cb_multiply', undefined, {
      a: block('cb_get_sprite_x', undefined, { name: textVal('bird') }),
      b: numVal(0.01),
    }),
  })

  // If bird falls too far, respawn at start
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

  const loopBody = chain(step, scrollBird, follow, updateScore, draw, ifFell, frameWait)

  const gameLoop = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(1200) },
    { DO: loopBody },
  )

  // Assemble: setup chain, then game loop, then key handler on a side chain
  spaceKey.x = 40
  spaceKey.y = 500

  return workspace(
    chain(
      setCanvas,
      setGravity,
      createBird,
      ground,
      ...pipeBlocks,
      gameLoop,
    ),
    spaceKey,
  )
}
