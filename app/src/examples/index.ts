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

export interface Example {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  workspace: Record<string, unknown>
}

// --- Example 1: Hello World ---
function helloWorld(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, {
      message: textVal('Hello, World!'),
    }, 50, 50),
  )
}

// --- Example 2: Quick Math ---
function quickMath(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, {
      message: block('cb_add', undefined, {
        a: numVal(3),
        b: numVal(5),
      }),
    }, 50, 50),
  )
}

// --- Example 3: Personal Greeting ---
function personalGreeting(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, {
      message: block('cb_join_text', undefined, {
        first: textVal('Hello, '),
        second: textVal('CryptoBlocks!'),
      }),
    }, 50, 50),
  )
}

// --- Example 4: Countdown ---
function countdown(): Record<string, unknown> {
  resetIds()
  const setCount = block('cb_set_global', undefined, {
    name: textVal('count'),
    value: numVal(5),
  }, 50, 50)

  const printCount = block('cb_print', undefined, {
    message: block('cb_get_global', undefined, {
      name: textVal('count'),
    }),
  })

  const decrementCount = block('cb_set_global', undefined, {
    name: textVal('count'),
    value: block('cb_subtract', undefined, {
      a: block('cb_get_global', undefined, {
        name: textVal('count'),
      }),
      b: numVal(1),
    }),
  })

  const loopBody = chain(printCount, decrementCount)

  const repeatBlock = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(5) },
    { DO: loopBody },
  )

  return workspace(chain(setCount, repeatBlock))
}

// --- Example 5: Coin Flip ---
function coinFlip(): Record<string, unknown> {
  resetIds()
  const condition = block('cb_greater_than', undefined, {
    a: block('cb_random_number', undefined, {
      min: numVal(1),
      max: numVal(2),
    }),
    b: numVal(1),
  })

  const printHeads = block('cb_print', undefined, {
    message: textVal('Heads!'),
  })

  const printTails = block('cb_print', undefined, {
    message: textVal('Tails!'),
  })

  const ifElse = blockWithStatements(
    'cb_if_else',
    undefined,
    { CONDITION: condition },
    { DO: printHeads, ELSE: printTails },
    50, 50,
  )

  return workspace(ifElse)
}

// --- Example 6: Rainbow Art ---
function rainbowArt(): Record<string, unknown> {
  resetIds()
  const canvas = block('cb_set_canvas', undefined, {
    width: numVal(420),
    height: numVal(60),
    color: colorVal('#FFFFFF'),
  }, 50, 50)

  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7']
  const rects = colors.map((hex, i) =>
    block('cb_draw_rect', undefined, {
      x: numVal(i * 70),
      y: numVal(0),
      width: numVal(70),
      height: numVal(60),
      color: colorVal(hex),
    }),
  )

  return workspace(chain(canvas, ...rects))
}

// --- Example 7: My First Page ---
function myFirstPage(): Record<string, unknown> {
  resetIds()
  const heading = block('cb_heading', { LEVEL: '1' }, {
    TEXT: textVal('My First Page'),
  })

  const paragraph = block('cb_paragraph', undefined, {
    TEXT: textVal('Welcome to my website built with CryptoBlocks!'),
  })

  const button = block('cb_button', undefined, {
    TEXT: textVal('Click Me!'),
  })

  const container = blockWithStatements(
    'cb_container',
    undefined,
    { COLOR: colorVal('#FFFFFF'), PADDING: numVal(24) },
    { CHILDREN: chain(heading, paragraph, button) },
    50, 50,
  )

  return workspace(container)
}

// --- Example 8: API Explorer ---
function apiExplorer(): Record<string, unknown> {
  resetIds()
  const fetchData = block('cb_print', undefined, {
    message: block('cb_get_json_field', undefined, {
      data: block('cb_http_get', undefined, {
        url: textVal('https://jsonplaceholder.typicode.com/todos/1'),
      }),
      key: textVal('title'),
    }),
  }, 50, 50)

  return workspace(fetchData)
}

export const EXAMPLES: Example[] = [
  {
    id: 'hello-world',
    name: 'Hello World',
    description: 'Print a message to the screen — the classic first program!',
    difficulty: 'beginner',
    tags: ['Basics', 'Text'],
    workspace: helloWorld(),
  },
  {
    id: 'quick-math',
    name: 'Quick Math',
    description: 'Add two numbers together and see the result.',
    difficulty: 'beginner',
    tags: ['Math', 'Basics'],
    workspace: quickMath(),
  },
  {
    id: 'personal-greeting',
    name: 'Personal Greeting',
    description: 'Join two pieces of text to make a custom greeting.',
    difficulty: 'beginner',
    tags: ['Text', 'Basics'],
    workspace: personalGreeting(),
  },
  {
    id: 'countdown',
    name: 'Countdown',
    description: 'Use a loop and variables to count down from 5 to 1.',
    difficulty: 'intermediate',
    tags: ['Logic', 'Basics', 'Math'],
    workspace: countdown(),
  },
  {
    id: 'coin-flip',
    name: 'Coin Flip',
    description: 'Flip a virtual coin using random numbers and if-else logic.',
    difficulty: 'intermediate',
    tags: ['Logic', 'Math', 'Basics'],
    workspace: coinFlip(),
  },
  {
    id: 'rainbow-art',
    name: 'Rainbow Art',
    description: 'Draw a colorful rainbow bar using the canvas.',
    difficulty: 'intermediate',
    tags: ['Art'],
    workspace: rainbowArt(),
  },
  {
    id: 'my-first-page',
    name: 'My First Page',
    description: 'Build a simple web page with headings, text, and a button.',
    difficulty: 'intermediate',
    tags: ['HTML'],
    workspace: myFirstPage(),
  },
  {
    id: 'api-explorer',
    name: 'API Explorer',
    description: 'Fetch real data from the internet and display it.',
    difficulty: 'advanced',
    tags: ['Web', 'Basics'],
    workspace: apiExplorer(),
  },
]
