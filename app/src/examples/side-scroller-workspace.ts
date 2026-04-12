/**
 * Side Scroller — demonstrates the new sprite/physics/camera blocks.
 *
 * Plays like a tiny Mario:
 *   • Left/Right arrows move the player
 *   • Space jumps (only when on ground)
 *   • Camera follows the player
 *   • 6 platforms across a 1800-wide world
 *   • Gravity pulls the player down
 *   • A main loop runs physics, camera follow, and draw every frame
 *
 * The player is a 🦊 emoji so the example works without needing a
 * saved sprite. Kids can swap the create_sprite block for one pointing
 * at their own Sprite Editor PNG to replace the fox with their art.
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
  // 1. Set canvas size and gravity
  // ============================================================

  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(640),
    height: numVal(400),
    color: textVal('#1e1e2e'),
  }, 40, 40)

  const setGravity = block('cb_set_gravity', undefined, {
    value: numVal(0.6),
  })

  // ============================================================
  // 2. Create the player sprite
  // ============================================================

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

  // ============================================================
  // 3. Build the level — ground + 5 floating platforms
  // ============================================================

  const ground = block('cb_add_platform', undefined, {
    x: numVal(0),
    y: numVal(360),
    width: numVal(1800),
    height: numVal(40),
    color: textVal('#8b5cf6'),
  })

  const plat1 = block('cb_add_platform', undefined, {
    x: numVal(220),
    y: numVal(280),
    width: numVal(120),
    height: numVal(16),
    color: textVal('#a6e3a1'),
  })

  const plat2 = block('cb_add_platform', undefined, {
    x: numVal(420),
    y: numVal(220),
    width: numVal(120),
    height: numVal(16),
    color: textVal('#a6e3a1'),
  })

  const plat3 = block('cb_add_platform', undefined, {
    x: numVal(620),
    y: numVal(260),
    width: numVal(160),
    height: numVal(16),
    color: textVal('#a6e3a1'),
  })

  const plat4 = block('cb_add_platform', undefined, {
    x: numVal(900),
    y: numVal(200),
    width: numVal(140),
    height: numVal(16),
    color: textVal('#a6e3a1'),
  })

  const plat5 = block('cb_add_platform', undefined, {
    x: numVal(1200),
    y: numVal(280),
    width: numVal(180),
    height: numVal(16),
    color: textVal('#a6e3a1'),
  })

  // ============================================================
  // 4. Keyboard handlers — set velocity / jump
  // ============================================================

  const moveLeft = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(-4),
    vy: block('cb_get_sprite_y', undefined, { name: textVal('player') }),
    // Reuse the current vy via a quick trick: set vx, keep vy unchanged.
    // Because set_sprite_velocity writes vy too, we pull the current vy
    // from a read block. There's no "get velocity" block, but since the
    // physics step overwrites vy each frame it's fine to just pass 0.
  })
  // Simpler: re-do the block with vy=0 since physics adds gravity anyway
  moveLeft.inputs!.vy = { block: numVal(0) }

  const leftKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: 'ArrowLeft' },
    {},
    { DO: moveLeft },
  )

  const moveRight = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(4),
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
    power: numVal(11),
  })

  const spaceKey = blockWithStatements(
    'cb_when_key_pressed',
    { KEY: ' ' },
    {},
    { DO: jump },
  )

  // ============================================================
  // 5. Main game loop — runs 600 frames (~10 seconds at 60fps)
  // ============================================================

  const step = block('cb_physics_step', undefined, undefined)

  const follow = block('cb_camera_follow', undefined, {
    name: textVal('player'),
  })

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const frameWait = block('cb_wait', undefined, {
    seconds: numVal(0.016),
  })

  // If player falls off screen, respawn at start so demo doesn't end
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

  const loopBody = chain(step, follow, draw, ifFell, frameWait)

  const gameLoop = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(600) },
    { DO: loopBody },
  )

  // ============================================================
  // Assemble the workspace
  // ============================================================

  // The event handlers sit on a separate top-level chain so the main
  // execution chain isn't blocked by their attachment.
  leftKey.x = 40
  leftKey.y = 440

  return workspace(
    chain(
      setCanvas,
      setGravity,
      createPlayer,
      ground,
      plat1,
      plat2,
      plat3,
      plat4,
      plat5,
      gameLoop,
    ),
    chain(leftKey, rightKey, spaceKey),
  )
}
