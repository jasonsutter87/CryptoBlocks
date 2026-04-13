/**
 * Pro Showcase examples — demonstrate Sprite Editor + Level Editor + Gamepad
 * in playable games. Free to play on Shareplace, but creating your own
 * requires Pro tools.
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

/**
 * "Draw Your Hero" — a platformer that uses sprite_editor_image("hero").
 * Falls back to a colored rectangle if no sprite is saved.
 * The description tells kids to draw their character first.
 */
export function drawYourHeroWorkspace(): Record<string, unknown> {
  resetIds()

  // Keyboard
  const kbLeft = blockWithStatements('cb_when_key_pressed', { KEY: 'ArrowLeft' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('hero'), vx: numVal(-4), vy: numVal(0) }) })
  kbLeft.x = 40; kbLeft.y = 40

  const kbRight = blockWithStatements('cb_when_key_pressed', { KEY: 'ArrowRight' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('hero'), vx: numVal(4), vy: numVal(0) }) })

  const kbJump = blockWithStatements('cb_when_key_pressed', { KEY: ' ' }, {},
    { DO: block('cb_sprite_jump', undefined, { name: textVal('hero'), power: numVal(10) }) })

  // Setup
  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(640), height: numVal(400), color: textVal('#0f0f23'),
  }, 40, 240)

  const setGravity = block('cb_set_gravity', undefined, { value: numVal(0.4) })

  // Player uses sprite_editor_image — THE showcase moment
  const createHero = block('cb_create_sprite', undefined, {
    name: textVal('hero'),
    x: numVal(80), y: numVal(200),
    width: numVal(32), height: numVal(32),
    color: textVal('#f9e2af'),
    emoji: textVal(''),
    image: block('cb_sprite_editor_image', undefined, { name: textVal('hero') }),
  })

  // Platforms
  const ground = block('cb_add_platform', undefined, {
    x: numVal(0), y: numVal(360), width: numVal(1200), height: numVal(40), color: textVal('#4a5568'),
  })
  const p1 = block('cb_add_platform', undefined, {
    x: numVal(150), y: numVal(280), width: numVal(100), height: numVal(12), color: textVal('#667eea'),
  })
  const p2 = block('cb_add_platform', undefined, {
    x: numVal(350), y: numVal(220), width: numVal(120), height: numVal(12), color: textVal('#667eea'),
  })
  const p3 = block('cb_add_platform', undefined, {
    x: numVal(550), y: numVal(280), width: numVal(100), height: numVal(12), color: textVal('#667eea'),
  })
  const p4 = block('cb_add_platform', undefined, {
    x: numVal(750), y: numVal(180), width: numVal(140), height: numVal(12), color: textVal('#667eea'),
  })

  // Gems to collect
  const gems = ['gem1', 'gem2', 'gem3', 'gem4', 'gem5'].map((name, i) =>
    block('cb_create_sprite', undefined, {
      name: textVal(name),
      x: numVal(180 + i * 160), y: numVal(140 + (i % 3) * 60),
      width: numVal(16), height: numVal(16),
      color: textVal('#a78bfa'), emoji: textVal('💎'), image: textVal(''),
    })
  )

  // Trophy at the end
  const trophy = block('cb_create_sprite', undefined, {
    name: textVal('trophy'),
    x: numVal(850), y: numVal(320),
    width: numVal(32), height: numVal(40),
    color: textVal('#f9e2af'), emoji: textVal('🏆'), image: textVal(''),
  })

  // Game loop
  const physics = block('cb_physics_step', undefined, undefined)
  const camera = block('cb_camera_follow', undefined, { name: textVal('hero') })
  const draw = block('cb_draw_all_sprites', undefined, undefined)

  // Gem collection
  const collectGems = ['gem1', 'gem2', 'gem3', 'gem4', 'gem5'].map((name) =>
    blockWithStatements('cb_if', undefined,
      { CONDITION: block('cb_sprites_touching', undefined, { name_a: textVal('hero'), name_b: textVal(name) }) },
      { DO: chain(
        block('cb_remove_sprite', undefined, { name: textVal(name) }),
        block('cb_set_score', undefined, { value: block('cb_add', undefined, { a: block('cb_get_score', undefined, undefined), b: numVal(20) }) }),
        block('cb_play_tone', undefined, { frequency: numVal(1047), duration: numVal(80) }),
      ) },
    )
  )

  const loopBody = chain(physics, camera, draw, ...collectGems)
  const gameLoop = blockWithStatements('cb_game_loop', undefined, {}, { DO: loopBody })

  return workspace(
    chain(kbLeft, kbRight, kbJump),
    chain(setCanvas, setGravity, createHero, ground, p1, p2, p3, p4, ...gems, trophy, gameLoop),
  )
}

/**
 * "Design Your World" — empty platformer template that expects the kid
 * to use the Level Editor to design the level, then play it.
 */
export function designYourWorldWorkspace(): Record<string, unknown> {
  resetIds()

  const kbLeft = blockWithStatements('cb_when_key_pressed', { KEY: 'ArrowLeft' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('player'), vx: numVal(-3), vy: numVal(0) }) })
  kbLeft.x = 40; kbLeft.y = 40

  const kbRight = blockWithStatements('cb_when_key_pressed', { KEY: 'ArrowRight' }, {},
    { DO: block('cb_set_sprite_velocity', undefined, { name: textVal('player'), vx: numVal(3), vy: numVal(0) }) })

  const kbJump = blockWithStatements('cb_when_key_pressed', { KEY: ' ' }, {},
    { DO: block('cb_sprite_jump', undefined, { name: textVal('player'), power: numVal(9) }) })

  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(640), height: numVal(400), color: textVal('#1a1a2e'),
  }, 40, 240)

  const setGravity = block('cb_set_gravity', undefined, { value: numVal(0.4) })

  const createPlayer = block('cb_create_sprite', undefined, {
    name: textVal('player'),
    x: numVal(80), y: numVal(200),
    width: numVal(32), height: numVal(32),
    color: textVal('#e0e7ff'),
    emoji: textVal('🧑'),
    image: block('cb_sprite_editor_image', undefined, { name: textVal('hero') }),
  })

  const instructions = block('cb_print', undefined, {
    message: textVal('🗺️ Open Build → Level Editor to design your level! Then add platforms here.'),
  })

  // Just a ground — the kid adds platforms from Level Editor
  const ground = block('cb_add_platform', undefined, {
    x: numVal(0), y: numVal(360), width: numVal(640), height: numVal(40), color: textVal('#4a5568'),
  })

  const physics = block('cb_physics_step', undefined, undefined)
  const draw = block('cb_draw_all_sprites', undefined, undefined)
  const loopBody = chain(physics, draw)
  const gameLoop = blockWithStatements('cb_game_loop', undefined, {}, { DO: loopBody })

  return workspace(
    chain(kbLeft, kbRight, kbJump),
    chain(setCanvas, setGravity, instructions, createPlayer, ground, gameLoop),
  )
}

/**
 * "Controller Party" — gamepad + sprite editor + platforms.
 * Full showcase of Pro tools working together.
 */
export function controllerPartyWorkspace(): Record<string, unknown> {
  resetIds()

  // Keyboard fallback
  const kbJump = blockWithStatements('cb_when_key_pressed', { KEY: ' ' }, {},
    { DO: block('cb_sprite_jump', undefined, { name: textVal('player'), power: numVal(10) }) })
  kbJump.x = 40; kbJump.y = 40

  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(480), height: numVal(480), color: textVal('#0a0a1a'),
  }, 40, 160)

  const setGravity = block('cb_set_gravity', undefined, { value: numVal(0.35) })

  const createPlayer = block('cb_create_sprite', undefined, {
    name: textVal('player'),
    x: numVal(220), y: numVal(100),
    width: numVal(36), height: numVal(36),
    color: textVal('#c4b5fd'),
    emoji: textVal(''),
    image: block('cb_sprite_editor_image', undefined, { name: textVal('hero') }),
  })

  // Arena platforms
  const ground = block('cb_add_platform', undefined, {
    x: numVal(0), y: numVal(440), width: numVal(480), height: numVal(40), color: textVal('#334155'),
  })
  const left = block('cb_add_platform', undefined, {
    x: numVal(40), y: numVal(320), width: numVal(120), height: numVal(12), color: textVal('#6366f1'),
  })
  const right = block('cb_add_platform', undefined, {
    x: numVal(320), y: numVal(320), width: numVal(120), height: numVal(12), color: textVal('#6366f1'),
  })
  const mid = block('cb_add_platform', undefined, {
    x: numVal(160), y: numVal(220), width: numVal(160), height: numVal(12), color: textVal('#6366f1'),
  })
  const top = block('cb_add_platform', undefined, {
    x: numVal(100), y: numVal(120), width: numVal(280), height: numVal(12), color: textVal('#6366f1'),
  })

  // Game loop with gamepad + keyboard
  const physics = block('cb_physics_step', undefined, undefined)

  // Gamepad stick movement
  const stickLeft = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_gamepad_dpad_left', undefined, undefined) },
    { DO: block('cb_move_sprite', undefined, { name: textVal('player'), dx: numVal(-4), dy: numVal(0) }) })
  const stickRight = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_gamepad_dpad_right', undefined, undefined) },
    { DO: block('cb_move_sprite', undefined, { name: textVal('player'), dx: numVal(4), dy: numVal(0) }) })
  const btnJump = blockWithStatements('cb_if', undefined,
    { CONDITION: block('cb_gamepad_button_a', undefined, undefined) },
    { DO: block('cb_sprite_jump', undefined, { name: textVal('player'), power: numVal(10) }) })

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const loopBody = chain(physics, stickLeft, stickRight, btnJump, draw)
  const gameLoop = blockWithStatements('cb_game_loop', undefined, {}, { DO: loopBody })

  return workspace(
    kbJump,
    chain(setCanvas, setGravity, createPlayer, ground, left, right, mid, top, gameLoop),
  )
}
