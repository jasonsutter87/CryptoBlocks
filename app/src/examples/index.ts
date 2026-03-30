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
import { ticTacToeWorkspace } from './tic-tac-toe-workspace'
import { weatherDashboardWorkspace } from './weather-dashboard-workspace'

export interface Example {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'pro'
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

// --- Example 9: Password Vault (Auth System) ---
function passwordVault(): Record<string, unknown> {
  resetIds()

  // --- Setup: create user object and users list ---
  const createUser = block('cb_create_object', undefined, {
    name: textVal('user'),
  }, 50, 50)

  const createUsersList = block('cb_create_list', undefined, {
    name: textVal('users'),
  })

  // --- Page UI ---
  const heading = block('cb_heading', { LEVEL: '1' }, {
    TEXT: textVal('Password Vault'),
  })

  const helpText = block('cb_paragraph', undefined, {
    TEXT: textVal('Register a user, then try to login. Wrong password = denied!'),
  })

  // --- REGISTER button + absorbed actions ---
  const registerBtn = block('cb_button', undefined, {
    TEXT: textVal('Register'),
  })

  const storeUsername = block('cb_set_global', undefined, {
    name: textVal('username'),
    value: block('cb_ask', undefined, {
      question: textVal('Choose a username'),
    }),
  })

  const storeHash = block('cb_set_global', undefined, {
    name: textVal('passhash'),
    value: block('cb_hash_text', undefined, {
      text: block('cb_ask', undefined, {
        question: textVal('Choose a password'),
      }),
    }),
  })

  const setUserName = block('cb_set_property', undefined, {
    object_name: textVal('user'),
    key: textVal('name'),
    value: block('cb_get_global', undefined, { name: textVal('username') }),
  })

  const setUserHash = block('cb_set_property', undefined, {
    object_name: textVal('user'),
    key: textVal('hash'),
    value: block('cb_get_global', undefined, { name: textVal('passhash') }),
  })

  const addUser = block('cb_add_to_list', undefined, {
    name: textVal('users'),
    item: block('cb_object_value', undefined, { name: textVal('user') }),
  })

  // --- LOGIN button + absorbed actions + if/else with HTML toasts ---
  const loginBtn = block('cb_button', undefined, {
    TEXT: textVal('login'),
  })

  const storeLoginHash = block('cb_set_global', undefined, {
    name: textVal('loginPass'),
    value: block('cb_hash_text', undefined, {
      text: block('cb_ask', undefined, {
        question: textVal('Enter Your password'),
      }),
    }),
  })

  // Success toast: Div > Row > Column > H4 + green background
  const successH4 = block('cb_heading', { LEVEL: '4' }, {
    TEXT: textVal('Login Worked!'),
  })

  const successCol = blockWithStatements('cb_column', undefined,
    { GAP: numVal(8) }, { CHILDREN: successH4 })

  const successRow = blockWithStatements('cb_row', undefined,
    { GAP: numVal(8) }, { CHILDREN: successCol })

  const successDiv = blockWithStatements('cb_div', undefined,
    { CLASS: textVal('my-class') }, { CHILDREN: successRow })

  const successBg = block('cb_set_background', undefined, {
    COLOR: colorVal('#22C55E'),
  })

  // Failure toast: Div > Row > Column > H4 + red background
  const failH4 = block('cb_heading', { LEVEL: '4' }, {
    TEXT: textVal('Login Failed!'),
  })

  const failCol = blockWithStatements('cb_column', undefined,
    { GAP: numVal(8) }, { CHILDREN: failH4 })

  const failRow = blockWithStatements('cb_row', undefined,
    { GAP: numVal(8) }, { CHILDREN: failCol })

  const failDiv = blockWithStatements('cb_div', undefined,
    { CLASS: textVal('my-class') }, { CHILDREN: failRow })

  const failBg = block('cb_set_background', undefined, {
    COLOR: colorVal('#EF4444'),
  })

  // If/else: compare stored hash with login hash
  const condition = block('cb_equals', undefined, {
    a: block('cb_get_global', undefined, { name: textVal('passhash') }),
    b: block('cb_get_global', undefined, { name: textVal('loginPass') }),
  })

  const ifElse = blockWithStatements(
    'cb_if_else',
    undefined,
    { CONDITION: condition },
    { DO: chain(successDiv, successBg), ELSE: chain(failDiv, failBg) },
  )

  // Build container with all children — buttons absorb subsequent action/control-flow blocks
  const container = blockWithStatements(
    'cb_container',
    undefined,
    { COLOR: colorVal('#3B82F6'), PADDING: numVal(24) },
    { CHILDREN: chain(
      heading, helpText,
      registerBtn, storeUsername, storeHash, setUserName, setUserHash, addUser,
      loginBtn, storeLoginHash, ifElse,
    ) },
  )

  // Setup as separate top-level chain so blocks don't stack too tall
  createUser.x = 50
  createUser.y = 30

  container.x = 50
  container.y = 130

  return workspace(chain(createUser, createUsersList), container)
}

// --- Example 10: Kitchen Sink (Max Complexity) ---
function kitchenSink(): Record<string, unknown> {
  resetIds()

  // Step 1: Fetch data from API
  const storeData = block('cb_set_global', undefined, {
    name: textVal('todo'),
    value: block('cb_get_json_field', undefined, {
      data: block('cb_http_get', undefined, {
        url: textVal('https://jsonplaceholder.typicode.com/todos/1'),
      }),
      key: textVal('title'),
    }),
  }, 50, 50)

  // Step 2: Hash the fetched title
  const storeHash = block('cb_set_global', undefined, {
    name: textVal('fingerprint'),
    value: block('cb_hash_text', undefined, {
      text: block('cb_get_global', undefined, {
        name: textVal('todo'),
      }),
    }),
  })

  // Step 3: Print the fetched data
  const printTitle = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Fetched: '),
      second: block('cb_uppercase', undefined, {
        text: block('cb_get_global', undefined, {
          name: textVal('todo'),
        }),
      }),
    }),
  })

  // Step 4: Print the hash
  const printHash = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('SHA-256: '),
      second: block('cb_get_global', undefined, {
        name: textVal('fingerprint'),
      }),
    }),
  })

  // Step 5: Check text length with if/else
  const condition = block('cb_greater_than', undefined, {
    a: block('cb_text_length', undefined, {
      text: block('cb_get_global', undefined, {
        name: textVal('todo'),
      }),
    }),
    b: numVal(10),
  })

  const printLong = block('cb_print', undefined, {
    message: textVal('That\'s a long title!'),
  })

  const printShort = block('cb_print', undefined, {
    message: textVal('Short and sweet.'),
  })

  const ifElse = blockWithStatements(
    'cb_if_else',
    undefined,
    { CONDITION: condition },
    { DO: printLong, ELSE: printShort },
  )

  // Step 6: Loop and play tones for each character count
  const loopPrint = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Beep #'),
      second: block('cb_get_global', undefined, {
        name: textVal('count'),
      }),
    }),
  })

  const playBeep = block('cb_play_tone', undefined, {
    frequency: block('cb_multiply', undefined, {
      a: block('cb_get_global', undefined, {
        name: textVal('count'),
      }),
      b: numVal(200),
    }),
    duration: numVal(200),
  })

  const incrementCount = block('cb_set_global', undefined, {
    name: textVal('count'),
    value: block('cb_add', undefined, {
      a: block('cb_get_global', undefined, {
        name: textVal('count'),
      }),
      b: numVal(1),
    }),
  })

  const setCount = block('cb_set_global', undefined, {
    name: textVal('count'),
    value: numVal(1),
  })

  const loopBody = chain(loopPrint, playBeep, incrementCount)

  const repeatBlock = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(3) },
    { DO: loopBody },
  )

  // Step 7: Base64 encode the result
  const printEncoded = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Base64: '),
      second: block('cb_base64_encode', undefined, {
        text: block('cb_get_global', undefined, {
          name: textVal('todo'),
        }),
      }),
    }),
  })

  // Step 8: Final summary
  const printDone = block('cb_print', undefined, {
    message: textVal('--- Kitchen Sink complete! Web → Crypto → Text → Logic → Sound → Math ---'),
  })

  return workspace(chain(storeData, storeHash, printTitle, printHash, ifElse, setCount, repeatBlock, printEncoded, printDone))
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
  {
    id: 'password-vault',
    name: 'Password Vault',
    description: 'Build a mini auth system — register with a hashed password, then login to verify.',
    difficulty: 'pro',
    tags: ['HTML', 'Crypto', 'Basics', 'Text'],
    workspace: passwordVault(),
  },
  {
    id: 'kitchen-sink',
    name: 'Kitchen Sink',
    description: 'The ultimate stress test: fetch API data, hash it, loop with sound, encode in Base64, and more.',
    difficulty: 'pro',
    tags: ['Web', 'Crypto', 'Text', 'Logic', 'Sound', 'Math', 'Basics'],
    workspace: kitchenSink(),
  },
  {
    id: 'weather-dashboard',
    name: 'Weather Dashboard',
    description: 'Fetch live weather from wttr.in using your timezone, display icon and conditions.',
    difficulty: 'advanced',
    tags: ['Web', 'HTML', 'Text', 'Basics'],
    workspace: weatherDashboardWorkspace,
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'A playable two-player game with a 3×3 grid, turn switching (❌/⭕), occupied cell detection, and a reset button.',
    difficulty: 'pro',
    tags: ['HTML', 'Logic', 'Basics', 'Math', 'Text'],
    workspace: ticTacToeWorkspace,
  },
]
