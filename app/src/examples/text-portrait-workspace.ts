import {
  resetIds,
  block,
  blockWithStatements,
  textVal,
  numVal,
  colorVal,
  chain,
  workspace,
} from './workspaces'

function buildTextPortraitWorkspace(): Record<string, unknown> {
  resetIds()

  // --- Setup: counter and the matrix character pool ---
  const setCounter = block('cb_set_global', undefined, {
    name: textVal('charCounter'),
    value: numVal(0),
  }, 50, 50)

  // Create a list of matrix-style characters
  const createCharList = block('cb_create_list', undefined, {
    name: textVal('matrixChars'),
  })

  // Add a bunch of characters to the matrix pool
  const matrixChars = ['0', '1', 'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', '@', '#', '$', '%', '&', '*', '+']
  const addCharBlocks = matrixChars.map(c =>
    block('cb_add_to_list', undefined, {
      name: textVal('matrixChars'),
      item: textVal(c),
    })
  )

  // --- Start the camera ---
  const startCamera = block('cb_start_camera')

  // --- Animation loop body ---

  const captureFrame = block('cb_capture_frame')

  // Set canvas: 480x360 black
  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(480),
    height: numVal(360),
    color: colorVal('#000000'),
  })

  // Inner cell body
  // x = col * 12
  const setX = block('cb_set_local', undefined, {
    name: textVal('x'),
    value: block('cb_multiply', undefined, {
      a: block('cb_get_local', undefined, { name: textVal('col') }),
      b: numVal(12),
    }),
  })

  // y = row * 14
  const setY = block('cb_set_local', undefined, {
    name: textVal('y'),
    value: block('cb_multiply', undefined, {
      a: block('cb_get_local', undefined, { name: textVal('row') }),
      b: numVal(14),
    }),
  })

  // brightness = get_pixel_brightness(x, y)
  const setBrightness = block('cb_set_local', undefined, {
    name: textVal('brightness'),
    value: block('cb_get_pixel_brightness', undefined, {
      x: block('cb_get_local', undefined, { name: textVal('x') }),
      y: block('cb_get_local', undefined, { name: textVal('y') }),
    }),
  })

  // Pick a random matrix character: get_from_list("matrixChars", random(0, 23))
  const setChar = block('cb_set_local', undefined, {
    name: textVal('char'),
    value: block('cb_get_from_list', undefined, {
      name: textVal('matrixChars'),
      index: block('cb_random_number', undefined, {
        min: numVal(0),
        max: numVal(23),
      }),
    }),
  })

  // Use brightness as the green intensity — matrix vibes
  // Only draw if brightness > threshold (skip dark areas for sparser look)
  const drawChar = block('cb_draw_text', undefined, {
    text: block('cb_get_local', undefined, { name: textVal('char') }),
    x: block('cb_get_local', undefined, { name: textVal('x') }),
    y: block('cb_get_local', undefined, { name: textVal('y') }),
    color: colorVal('#00ff41'),
    size: numVal(12),
  })

  // Wrap drawChar in an if to skip dark pixels
  const drawIf = blockWithStatements(
    'cb_if',
    undefined,
    {
      CONDITION: block('cb_greater_than', undefined, {
        a: block('cb_get_local', undefined, { name: textVal('brightness') }),
        b: numVal(80),
      }),
    },
    { DO: drawChar },
  )

  const cellBody = chain(setX, setY, setBrightness, setChar, drawIf)

  // Inner repeat: 40 columns
  const setCol = block('cb_set_local', undefined, {
    name: textVal('col'),
    value: block('cb_loop_index'),
  })

  const innerRepeat = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(40) },
    { DO: chain(setCol, cellBody) },
  )

  // Outer repeat: 26 rows
  const setRow = block('cb_set_local', undefined, {
    name: textVal('row'),
    value: block('cb_loop_index'),
  })

  const outerRepeat = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(26) },
    { DO: chain(setRow, innerRepeat) },
  )

  // Animation loop body: capture → canvas → nested grid
  const loopBody = chain(captureFrame, setCanvas, outerRepeat)

  const animLoop = blockWithStatements(
    'cb_animation_loop',
    undefined,
    {},
    { DO: loopBody },
  )

  // Top-level chain: setup → camera → loop
  return workspace(
    chain(setCounter, createCharList, ...addCharBlocks, startCamera, animLoop)
  )
}

export const textPortraitWorkspace = buildTextPortraitWorkspace()
