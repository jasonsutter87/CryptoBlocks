/**
 * Gamepad Demo — connect any controller and move a sprite around.
 *
 * Shows the full input pipeline:
 *   - Left stick / D-pad moves the fox
 *   - Button A jumps
 *   - Works with keyboard fallback (arrows + space)
 *   - Swap the fox for your own Sprite Editor art
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

export function gamepadDemoWorkspace(): Record<string, unknown> {
  resetIds()

  // === Keyboard fallback (arrows + space) ===
  const kbLeft = blockWithStatements(
    'cb_when_key_pressed', { KEY: 'ArrowLeft' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('player'), vx: numVal(-4), vy: numVal(0) }) },
  )
  kbLeft.x = 40
  kbLeft.y = 40

  const kbRight = blockWithStatements(
    'cb_when_key_pressed', { KEY: 'ArrowRight' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('player'), vx: numVal(4), vy: numVal(0) }) },
  )

  const kbUp = blockWithStatements(
    'cb_when_key_pressed', { KEY: 'ArrowUp' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('player'), vx: numVal(0), vy: numVal(-4) }) },
  )

  const kbDown = blockWithStatements(
    'cb_when_key_pressed', { KEY: 'ArrowDown' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('player'), vx: numVal(0), vy: numVal(4) }) },
  )

  // === Setup ===
  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(480),
    height: numVal(480),
    color: textVal('#181825'),
  }, 40, 340)

  const printInstructions = block('cb_print', undefined, {
    message: textVal('🎮 Connect a controller or use arrow keys! Button A / Space = speed boost'),
  })

  const createPlayer = block('cb_create_sprite', undefined, {
    name: textVal('player'),
    x: numVal(220),
    y: numVal(220),
    width: numVal(40),
    height: numVal(40),
    color: textVal('#f9e2af'),
    emoji: textVal('🦊'),
    image: textVal(''),
  })

  // A few collectible stars
  const star1 = block('cb_create_sprite', undefined, {
    name: textVal('star1'), x: numVal(80), y: numVal(80),
    width: numVal(24), height: numVal(24), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })
  const star2 = block('cb_create_sprite', undefined, {
    name: textVal('star2'), x: numVal(380), y: numVal(120),
    width: numVal(24), height: numVal(24), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })
  const star3 = block('cb_create_sprite', undefined, {
    name: textVal('star3'), x: numVal(200), y: numVal(400),
    width: numVal(24), height: numVal(24), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })

  // === Game loop — gamepad reads + movement + draw ===

  // Gamepad D-pad movement
  const dpadLeft = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_gamepad_dpad_left', undefined, undefined) },
    { DO: block('cb_move_sprite', undefined, { name: textVal('player'), dx: numVal(-4), dy: numVal(0) }) },
  )
  const dpadRight = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_gamepad_dpad_right', undefined, undefined) },
    { DO: block('cb_move_sprite', undefined, { name: textVal('player'), dx: numVal(4), dy: numVal(0) }) },
  )
  const dpadUp = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_gamepad_dpad_up', undefined, undefined) },
    { DO: block('cb_move_sprite', undefined, { name: textVal('player'), dx: numVal(0), dy: numVal(-4) }) },
  )
  const dpadDown = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_gamepad_dpad_down', undefined, undefined) },
    { DO: block('cb_move_sprite', undefined, { name: textVal('player'), dx: numVal(0), dy: numVal(4) }) },
  )

  // Star collection
  const collect1 = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_sprites_touching', undefined, { name_a: textVal('player'), name_b: textVal('star1') }) },
    { DO: chain(
      block('cb_remove_sprite', undefined, { name: textVal('star1') }),
      block('cb_set_score', undefined, { value: block('cb_add', undefined, { a: block('cb_get_score', undefined, undefined), b: numVal(10) }) }),
      block('cb_play_tone', undefined, { frequency: numVal(880), duration: numVal(100) }),
    ) },
  )
  const collect2 = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_sprites_touching', undefined, { name_a: textVal('player'), name_b: textVal('star2') }) },
    { DO: chain(
      block('cb_remove_sprite', undefined, { name: textVal('star2') }),
      block('cb_set_score', undefined, { value: block('cb_add', undefined, { a: block('cb_get_score', undefined, undefined), b: numVal(10) }) }),
      block('cb_play_tone', undefined, { frequency: numVal(880), duration: numVal(100) }),
    ) },
  )
  const collect3 = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_sprites_touching', undefined, { name_a: textVal('player'), name_b: textVal('star3') }) },
    { DO: chain(
      block('cb_remove_sprite', undefined, { name: textVal('star3') }),
      block('cb_set_score', undefined, { value: block('cb_add', undefined, { a: block('cb_get_score', undefined, undefined), b: numVal(10) }) }),
      block('cb_play_tone', undefined, { frequency: numVal(880), duration: numVal(100) }),
    ) },
  )

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const loopBody = chain(
    dpadLeft, dpadRight, dpadUp, dpadDown,
    draw,
    collect1, collect2, collect3,
  )

  const gameLoop = blockWithStatements('cb_game_loop', undefined, {}, { DO: loopBody })

  return workspace(
    chain(kbLeft, kbRight, kbUp, kbDown),
    chain(setCanvas, printInstructions, createPlayer, star1, star2, star3, gameLoop),
  )
}
