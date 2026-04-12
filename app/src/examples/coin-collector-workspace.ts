/**
 * Coin Collector — demonstrates the full CryptoBlocks pipeline:
 *   Sprite Editor → Level Editor → Blocks → Play → Share
 *
 * A platformer where the player collects coins and avoids spikes.
 * Every piece is visible, editable, and remixable:
 *   - Swap the player sprite for your own Sprite Editor art
 *   - Rearrange platforms in the Level Editor
 *   - Add more coins, enemies, or levels
 *
 * Teaches: sprites, collision, score, remove_sprite, physics, camera
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

export function coinCollectorWorkspace(): Record<string, unknown> {
  resetIds()

  // ============================================================
  // KEYBOARD HANDLERS (first so they're live immediately)
  // ============================================================

  const moveLeft = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(-3),
    vy: numVal(0),
  })
  const leftKey = blockWithStatements(
    'cb_when_key_pressed', { KEY: 'ArrowLeft' }, {}, { DO: moveLeft },
  )
  leftKey.x = 40
  leftKey.y = 40

  const moveRight = block('cb_set_sprite_velocity', undefined, {
    name: textVal('player'),
    vx: numVal(3),
    vy: numVal(0),
  })
  const rightKey = blockWithStatements(
    'cb_when_key_pressed', { KEY: 'ArrowRight' }, {}, { DO: moveRight },
  )

  const jump = block('cb_sprite_jump', undefined, {
    name: textVal('player'),
    power: numVal(9),
  })
  const spaceKey = blockWithStatements(
    'cb_when_key_pressed', { KEY: ' ' }, {}, { DO: jump },
  )

  // ============================================================
  // SETUP — canvas, gravity, player, platforms, coins, spikes
  // ============================================================

  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(640),
    height: numVal(400),
    color: textVal('#181825'),
  }, 40, 260)

  const setGravity = block('cb_set_gravity', undefined, {
    value: numVal(0.4),
  })

  // Player — uses sprite_editor_image so kids can swap in their own art!
  // Falls back to 🦊 emoji if no sprite named "hero" is saved.
  const createPlayer = block('cb_create_sprite', undefined, {
    name: textVal('player'),
    x: numVal(60),
    y: numVal(200),
    width: numVal(32),
    height: numVal(32),
    color: textVal('#f9e2af'),
    emoji: textVal('🦊'),
    image: block('cb_sprite_editor_image', undefined, {
      name: textVal('hero'),
    }),
  })

  // === PLATFORMS (from Level Editor export) ===
  const ground = block('cb_add_platform', undefined, {
    x: numVal(0), y: numVal(360), width: numVal(1600), height: numVal(40), color: textVal('#6c7086'),
  })

  const plat1 = block('cb_add_platform', undefined, {
    x: numVal(120), y: numVal(280), width: numVal(100), height: numVal(16), color: textVal('#89b4fa'),
  })
  const plat2 = block('cb_add_platform', undefined, {
    x: numVal(300), y: numVal(220), width: numVal(120), height: numVal(16), color: textVal('#89b4fa'),
  })
  const plat3 = block('cb_add_platform', undefined, {
    x: numVal(500), y: numVal(260), width: numVal(140), height: numVal(16), color: textVal('#89b4fa'),
  })
  const plat4 = block('cb_add_platform', undefined, {
    x: numVal(720), y: numVal(200), width: numVal(100), height: numVal(16), color: textVal('#89b4fa'),
  })
  const plat5 = block('cb_add_platform', undefined, {
    x: numVal(920), y: numVal(280), width: numVal(120), height: numVal(16), color: textVal('#89b4fa'),
  })

  // === COINS (collectible sprites) ===
  const coin1 = block('cb_create_sprite', undefined, {
    name: textVal('coin1'), x: numVal(150), y: numVal(250),
    width: numVal(20), height: numVal(20), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })
  const coin2 = block('cb_create_sprite', undefined, {
    name: textVal('coin2'), x: numVal(340), y: numVal(190),
    width: numVal(20), height: numVal(20), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })
  const coin3 = block('cb_create_sprite', undefined, {
    name: textVal('coin3'), x: numVal(540), y: numVal(230),
    width: numVal(20), height: numVal(20), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })
  const coin4 = block('cb_create_sprite', undefined, {
    name: textVal('coin4'), x: numVal(740), y: numVal(170),
    width: numVal(20), height: numVal(20), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })
  const coin5 = block('cb_create_sprite', undefined, {
    name: textVal('coin5'), x: numVal(950), y: numVal(250),
    width: numVal(20), height: numVal(20), color: textVal('#f9e2af'), emoji: textVal('⭐'), image: textVal(''),
  })

  // === SPIKES (danger sprites) ===
  const spike1 = block('cb_create_sprite', undefined, {
    name: textVal('spike1'), x: numVal(250), y: numVal(340),
    width: numVal(40), height: numVal(20), color: textVal('#f38ba8'), emoji: textVal('🔺'), image: textVal(''),
  })
  const spike2 = block('cb_create_sprite', undefined, {
    name: textVal('spike2'), x: numVal(600), y: numVal(340),
    width: numVal(40), height: numVal(20), color: textVal('#f38ba8'), emoji: textVal('🔺'), image: textVal(''),
  })

  // === GOAL ===
  const goal = block('cb_create_sprite', undefined, {
    name: textVal('goal'), x: numVal(1050), y: numVal(320),
    width: numVal(32), height: numVal(40), color: textVal('#a6e3a1'), emoji: textVal('🏆'), image: textVal(''),
  })

  // ============================================================
  // GAME LOOP — physics, coin collection, spike death, win check
  // ============================================================

  const physicsStep = block('cb_physics_step', undefined, undefined)
  const cameraFollow = block('cb_camera_follow', undefined, {
    name: textVal('player'),
  })

  // Coin collection — check each coin
  const collectCoin = (coinName: string) => {
    const touching = block('cb_sprites_touching', undefined, {
      name_a: textVal('player'),
      name_b: textVal(coinName),
    })
    const remove = block('cb_remove_sprite', undefined, {
      name: textVal(coinName),
    })
    const addScore = block('cb_set_score', undefined, {
      value: block('cb_add', undefined, {
        a: block('cb_get_score', undefined, undefined),
        b: numVal(10),
      }),
    })
    const sound = block('cb_play_tone', undefined, {
      frequency: numVal(880),
      duration: numVal(100),
    })
    return blockWithStatements(
      'cb_if', undefined,
      { CONDITION: touching },
      { DO: chain(remove, addScore, sound) },
    )
  }

  // Spike collision — respawn at start
  const spikeCheck = (spikeName: string) => {
    const touching = block('cb_sprites_touching', undefined, {
      name_a: textVal('player'),
      name_b: textVal(spikeName),
    })
    const respawn = block('cb_set_sprite_position', undefined, {
      name: textVal('player'),
      x: numVal(60),
      y: numVal(200),
    })
    const ouch = block('cb_play_tone', undefined, {
      frequency: numVal(200),
      duration: numVal(300),
    })
    return blockWithStatements(
      'cb_if', undefined,
      { CONDITION: touching },
      { DO: chain(respawn, ouch) },
    )
  }

  // Win check — player touches goal
  const winCheck = (() => {
    const touching = block('cb_sprites_touching', undefined, {
      name_a: textVal('player'),
      name_b: textVal('goal'),
    })
    const winPrint = block('cb_print', undefined, {
      message: block('cb_join_text', undefined, {
        first: textVal('🏆 You won! Score: '),
        second: block('cb_get_score', undefined, undefined),
      }),
    })
    const winSound = block('cb_play_tone', undefined, {
      frequency: numVal(1200),
      duration: numVal(500),
    })
    return blockWithStatements(
      'cb_if', undefined,
      { CONDITION: touching },
      { DO: chain(winPrint, winSound) },
    )
  })()

  // Fall off screen — respawn
  const fellCheck = (() => {
    const fell = block('cb_greater_than', undefined, {
      a: block('cb_get_sprite_y', undefined, { name: textVal('player') }),
      b: numVal(500),
    })
    const respawn = block('cb_set_sprite_position', undefined, {
      name: textVal('player'),
      x: numVal(60),
      y: numVal(200),
    })
    return blockWithStatements(
      'cb_if', undefined,
      { CONDITION: fell },
      { DO: respawn },
    )
  })()

  const draw = block('cb_draw_all_sprites', undefined, undefined)

  const loopBody = chain(
    physicsStep,
    cameraFollow,
    collectCoin('coin1'),
    collectCoin('coin2'),
    collectCoin('coin3'),
    collectCoin('coin4'),
    collectCoin('coin5'),
    spikeCheck('spike1'),
    spikeCheck('spike2'),
    winCheck,
    fellCheck,
    draw,
  )

  const gameLoop = blockWithStatements(
    'cb_game_loop', undefined, {}, { DO: loopBody },
  )

  // ============================================================
  // ASSEMBLE
  // ============================================================

  return workspace(
    chain(leftKey, rightKey, spaceKey),
    chain(
      setCanvas, setGravity,
      createPlayer,
      ground, plat1, plat2, plat3, plat4, plat5,
      coin1, coin2, coin3, coin4, coin5,
      spike1, spike2,
      goal,
      gameLoop,
    ),
  )
}
