/**
 * Maze Runner — built entirely from blocks kids can read and modify.
 *
 * Uses the game engine blocks: platforms as walls, a player sprite,
 * a goal sprite, collision detection, keyboard movement, and camera.
 * Kids can open the Level Editor to redesign the maze layout.
 *
 * ~20 blocks total. Every one is understandable.
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

export function mazeWorkspace(): Record<string, unknown> {
  resetIds()

  // === Keyboard handlers FIRST ===

  const moveUp = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(0),
    vy: numVal(-3),
  })

  const upKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: 'ArrowUp' },
    {},
    { DO: moveUp },
  )
  upKey.x = 40
  upKey.y = 40

  const moveDown = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(0),
    vy: numVal(3),
  })

  const downKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: 'ArrowDown' },
    {},
    { DO: moveDown },
  )

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

  // === Setup ===

  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(480),
    height: numVal(480),
    color: textVal('#1e1e2e'),
  }, 40, 340)

  // Player sprite
  const createPlayer = block('cb_create_sprite', undefined, {
    name: textVal('player'),
    x: numVal(40),
    y: numVal(40),
    width: numVal(24),
    height: numVal(24),
    color: textVal('#f9e2af'),
    emoji: textVal('🦊'),
    image: textVal(''),
  })

  // Goal sprite
  const createGoal = block('cb_create_sprite', undefined, {
    name: textVal('goal'),
    x: numVal(420),
    y: numVal(420),
    width: numVal(28),
    height: numVal(28),
    color: textVal('#a6e3a1'),
    emoji: textVal('🏁'),
    image: textVal(''),
  })

  // === Maze walls (platforms) ===
  // Outer walls
  const wallTop = block('cb_add_platform', undefined, {
    x: numVal(0), y: numVal(0), width: numVal(480), height: numVal(16), color: textVal('#89b4fa'),
  })
  const wallBottom = block('cb_add_platform', undefined, {
    x: numVal(0), y: numVal(464), width: numVal(480), height: numVal(16), color: textVal('#89b4fa'),
  })
  const wallLeft = block('cb_add_platform', undefined, {
    x: numVal(0), y: numVal(0), width: numVal(16), height: numVal(480), color: textVal('#89b4fa'),
  })
  const wallRight = block('cb_add_platform', undefined, {
    x: numVal(464), y: numVal(0), width: numVal(16), height: numVal(480), color: textVal('#89b4fa'),
  })

  // Inner maze walls
  const w1 = block('cb_add_platform', undefined, {
    x: numVal(80), y: numVal(0), width: numVal(16), height: numVal(160), color: textVal('#89b4fa'),
  })
  const w2 = block('cb_add_platform', undefined, {
    x: numVal(80), y: numVal(220), width: numVal(16), height: numVal(180), color: textVal('#89b4fa'),
  })
  const w3 = block('cb_add_platform', undefined, {
    x: numVal(160), y: numVal(80), width: numVal(16), height: numVal(240), color: textVal('#89b4fa'),
  })
  const w4 = block('cb_add_platform', undefined, {
    x: numVal(160), y: numVal(380), width: numVal(240), height: numVal(16), color: textVal('#89b4fa'),
  })
  const w5 = block('cb_add_platform', undefined, {
    x: numVal(240), y: numVal(0), width: numVal(16), height: numVal(100), color: textVal('#89b4fa'),
  })
  const w6 = block('cb_add_platform', undefined, {
    x: numVal(240), y: numVal(160), width: numVal(16), height: numVal(160), color: textVal('#89b4fa'),
  })
  const w7 = block('cb_add_platform', undefined, {
    x: numVal(320), y: numVal(80), width: numVal(16), height: numVal(160), color: textVal('#89b4fa'),
  })
  const w8 = block('cb_add_platform', undefined, {
    x: numVal(320), y: numVal(300), width: numVal(16), height: numVal(100), color: textVal('#89b4fa'),
  })
  const w9 = block('cb_add_platform', undefined, {
    x: numVal(400), y: numVal(160), width: numVal(16), height: numVal(240), color: textVal('#89b4fa'),
  })
  const w10 = block('cb_add_platform', undefined, {
    x: numVal(160), y: numVal(160), width: numVal(100), height: numVal(16), color: textVal('#89b4fa'),
  })

  // === Game loop ===

  const physicsStep = block('cb_physics_step', undefined, undefined)

  // Win condition: player touches goal
  const winCondition = block('cb_sprites_touching', undefined, {
    name_a: textVal('player'),
    name_b: textVal('goal'),
  })

  const winMessage = block('cb_print', undefined, {
    message: textVal('🎉 You escaped the maze!'),
  })

  const winSound = block('cb_play_tone', undefined, {
    frequency: numVal(880),
    duration: numVal(500),
  })

  const ifWin = blockWithStatements(
    'cb_if',
    undefined,
    { CONDITION: winCondition },
    { DO: chain(winMessage, winSound) },
  )

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const loopBody = chain(physicsStep, ifWin, draw)

  const gameLoop = blockWithStatements(
    'cb_game_loop',
    undefined,
    {},
    { DO: loopBody },
  )

  // === Assemble ===

  return workspace(
    chain(upKey, downKey, leftKey, rightKey),
    chain(
      setCanvas,
      createPlayer,
      createGoal,
      wallTop, wallBottom, wallLeft, wallRight,
      w1, w2, w3, w4, w5, w6, w7, w8, w9, w10,
      gameLoop,
    ),
  )
}
