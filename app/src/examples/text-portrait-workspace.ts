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

export function buildTextPortraitWorkspace(): Record<string, unknown> {
  resetIds()

  // --- Setup: global counter and text string ---
  const setCounter = block('cb_set_global', undefined, {
    name: textVal('charCounter'),
    value: numVal(0),
  }, 50, 50)

  const setText = block('cb_set_global', undefined, {
    name: textVal('portraitText'),
    value: textVal('CRYPTOBLOCKS '),
  })

  // --- Start the camera ---
  const startCamera = block('cb_start_camera')

  // --- Animation loop body ---

  // Capture current frame
  const captureFrame = block('cb_capture_frame')

  // Set canvas: 480x360 black background
  const setCanvas = block('cb_set_canvas', undefined, {
    width: numVal(480),
    height: numVal(360),
    color: colorVal('#000000'),
  })

  // Inner loop body (per column/cell):
  //   x = col * 15
  //   y = row * 15
  //   color = get_pixel_color(x, y)
  //   charIndex = charCounter % text_length
  //   char = get_from_list(split(portraitText, ""), charIndex)
  //   draw_text(x, y, char, color, 12)
  //   charCounter = charCounter + 1

  const calcX = block('cb_multiply', undefined, {
    a: block('cb_get_local', undefined, { name: textVal('col') }),
    b: numVal(15),
  })

  const calcY = block('cb_multiply', undefined, {
    a: block('cb_get_local', undefined, { name: textVal('row') }),
    b: numVal(15),
  })

  const setX = block('cb_set_local', undefined, {
    name: textVal('x'),
    value: calcX,
  })

  const setY = block('cb_set_local', undefined, {
    name: textVal('y'),
    value: calcY,
  })

  const getPixelColor = block('cb_get_pixel_color', undefined, {
    x: block('cb_get_local', undefined, { name: textVal('x') }),
    y: block('cb_get_local', undefined, { name: textVal('y') }),
  })

  const setPixelColor = block('cb_set_local', undefined, {
    name: textVal('pixelColor'),
    value: getPixelColor,
  })

  const textLength = block('cb_text_length', undefined, {
    text: block('cb_get_global', undefined, { name: textVal('portraitText') }),
  })

  const charIndex = block('cb_modulo', undefined, {
    a: block('cb_get_global', undefined, { name: textVal('charCounter') }),
    b: textLength,
  })

  const getChar = block('cb_get_from_list', undefined, {
    list: block('cb_split_text', undefined, {
      text: block('cb_get_global', undefined, { name: textVal('portraitText') }),
      separator: textVal(''),
    }),
    index: charIndex,
  })

  const setChar = block('cb_set_local', undefined, {
    name: textVal('char'),
    value: getChar,
  })

  const drawChar = block('cb_draw_text', undefined, {
    x: block('cb_get_local', undefined, { name: textVal('x') }),
    y: block('cb_get_local', undefined, { name: textVal('y') }),
    text: block('cb_get_local', undefined, { name: textVal('char') }),
    color: block('cb_get_local', undefined, { name: textVal('pixelColor') }),
    size: numVal(12),
  })

  const incrementCounter = block('cb_set_global', undefined, {
    name: textVal('charCounter'),
    value: block('cb_add', undefined, {
      a: block('cb_get_global', undefined, { name: textVal('charCounter') }),
      b: numVal(1),
    }),
  })

  // Inner cell body
  const cellBody = chain(setX, setY, setPixelColor, setChar, drawChar, incrementCounter)

  // Set col = loop index (0-based via cb_loop_index — using cb_set_local driven by repeat)
  // cb_repeat uses DO with cb_loop_index available inside
  // We need nested repeats: outer = rows (24), inner = cols (32)
  // Use cb_set_local to snapshot loop index into named vars at each level

  // Inner repeat: 32 columns
  // Inside: set col = cb_loop_index, then cell body
  const setCol = block('cb_set_local', undefined, {
    name: textVal('col'),
    value: block('cb_loop_index'),
  })

  const innerRepeat = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(32) },
    { DO: chain(setCol, cellBody) },
  )

  // Outer repeat: 24 rows
  // Inside: set row = cb_loop_index, then inner repeat
  const setRow = block('cb_set_local', undefined, {
    name: textVal('row'),
    value: block('cb_loop_index'),
  })

  const outerRepeat = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(24) },
    { DO: chain(setRow, innerRepeat) },
  )

  // Animation loop: capture -> canvas -> nested repeats
  const loopBody = chain(captureFrame, setCanvas, outerRepeat)

  const animLoop = blockWithStatements(
    'cb_animation_loop',
    undefined,
    {},
    { DO: loopBody },
  )

  // Top-level chain: set globals, start camera, then animation loop
  return workspace(chain(setCounter, setText, startCamera, animLoop))
}

export const textPortraitWorkspace = buildTextPortraitWorkspace()
