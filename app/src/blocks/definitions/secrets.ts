import type { BlockDefinition } from '../../types/block'

const COLOR = '#00ff41' // Matrix green

export const secretBlocks: BlockDefinition[] = [
  // 1. The Answer — Douglas Adams
  {
    name: 'the_answer',
    author: 'Deep Thought',
    version: '7500000.0.0',
    description: 'The Answer to the Ultimate Question of Life, the Universe, and Everything.',
    category: '???',
    inputs: [],
    outputs: [{ name: 'answer', type: 'number' }],
    implementations: {
      javascript: 'return 42;',
      python: 'return 42',
    },
    tests: [{ input: {}, expected: { answer: 42 } }],
    color: COLOR,
    shape: 'value',
  },

  // 2. Vogon Poetry — Douglas Adams
  {
    name: 'vogon_poetry',
    author: 'Prostetnic Vogon Jeltz',
    version: '0.0.1',
    description: 'Generate exquisitely terrible poetry. Third worst in the Universe.',
    category: '???',
    inputs: [],
    outputs: [{ name: 'poem', type: 'string' }],
    implementations: {
      javascript: `(function() {
  var adj = ["putrid","fetid","moist","ghastly","oozing","wretched","curdled","squelchy","lumpy","throbbing"];
  var noun = ["earwax","toenail","nostril","armpit","bellybutton","gizzard","spleen","appendix","gallbladder","blister"];
  var verb = ["squelch","ooze","wobble","gurgle","splatter","dribble","throttle","marinate","dissolve","ferment"];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  return "Oh " + pick(adj) + " " + pick(noun) + "!\\nYou " + pick(verb) + " like a " + pick(adj) + " " + pick(noun) + ".\\nI shall " + pick(verb) + " upon your " + pick(noun) + "!";
})()`,
      python: `import random
adj = ["putrid","fetid","moist","ghastly","oozing","wretched","curdled","squelchy","lumpy","throbbing"]
noun = ["earwax","toenail","nostril","armpit","bellybutton","gizzard","spleen","appendix","gallbladder","blister"]
verb = ["squelch","ooze","wobble","gurgle","splatter","dribble","throttle","marinate","dissolve","ferment"]
pick = lambda a: random.choice(a)
return f"Oh {pick(adj)} {pick(noun)}!\\nYou {pick(verb)} like a {pick(adj)} {pick(noun)}.\\nI shall {pick(verb)} upon your {pick(noun)}!"`,
    },
    tests: [],
    color: COLOR,
    shape: 'value',
  },

  // 3. Golden Ticket — Willy Wonka
  {
    name: 'golden_ticket',
    author: 'Charlie Bucket',
    version: '1.0.0',
    description: "I've got a golden ticket!",
    category: '???',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: 'console.log("\\u{1F3AB} I\'ve got a golden ticket! I\'ve got a golden chance to make my way...");',
      python: 'print("\\U0001F3AB I\'ve got a golden ticket! I\'ve got a golden chance to make my way...")',
    },
    tests: [],
    color: '#FFD700',
    shape: 'statement',
  },

  // 4. Don't Panic — Douglas Adams (the Guide's cover)
  {
    name: 'dont_panic',
    author: 'The Hitchhiker\'s Guide',
    version: '42.0.0',
    description: 'The cover of the Guide has these words inscribed in large, friendly letters.',
    category: '???',
    inputs: [],
    outputs: [{ name: 'message', type: 'string' }],
    implementations: {
      javascript: 'return "DON\'T PANIC";',
      python: 'return "DON\'T PANIC"',
    },
    tests: [{ input: {}, expected: { message: "DON'T PANIC" } }],
    color: COLOR,
    shape: 'value',
  },

  // 5. Beware of the Leopard — Douglas Adams
  {
    name: 'beware_leopard',
    author: 'Arthur Dent',
    version: '1.0.0',
    description: 'The plans were on display... somewhere.',
    category: '???',
    inputs: [],
    outputs: [{ name: 'quote', type: 'string' }],
    implementations: {
      javascript: 'return "It was on display in the bottom of a locked filing cabinet stuck in a disused lavatory with a sign on the door saying \'Beware of the Leopard.\'";',
      python: 'return "It was on display in the bottom of a locked filing cabinet stuck in a disused lavatory with a sign on the door saying \'Beware of the Leopard.\'"',
    },
    tests: [],
    color: COLOR,
    shape: 'value',
  },

  // 6. xyzzy — Colossal Cave Adventure (1976)
  {
    name: 'xyzzy',
    author: 'Will Crowther',
    version: '1976.0.0',
    description: 'A hollow voice says "Plugh."',
    category: '???',
    inputs: [],
    outputs: [{ name: 'result', type: 'string' }],
    implementations: {
      javascript: 'return "Nothing happens.";',
      python: 'return "Nothing happens."',
    },
    tests: [{ input: {}, expected: { result: 'Nothing happens.' } }],
    color: COLOR,
    shape: 'value',
  },

  // 7. Taxicab Number — Hardy-Ramanujan
  {
    name: 'taxicab',
    author: 'Srinivasa Ramanujan',
    version: '1729.0.0',
    description: 'The smallest number expressible as the sum of two cubes in two different ways: 1\u00B3+12\u00B3 = 9\u00B3+10\u00B3',
    category: '???',
    inputs: [],
    outputs: [{ name: 'number', type: 'number' }],
    implementations: {
      javascript: 'return 1729;',
      python: 'return 1729',
    },
    tests: [{ input: {}, expected: { number: 1729 } }],
    color: COLOR,
    shape: 'value',
  },

  // 8. Towel — Douglas Adams
  {
    name: 'towel',
    author: 'Ford Prefect',
    version: '1.0.0',
    description: 'The most massively useful thing an interstellar hitchhiker can have.',
    category: '???',
    inputs: [],
    outputs: [{ name: 'wisdom', type: 'string' }],
    implementations: {
      javascript: 'return "A towel is about the most massively useful thing an interstellar hitchhiker can have.";',
      python: 'return "A towel is about the most massively useful thing an interstellar hitchhiker can have."',
    },
    tests: [],
    color: COLOR,
    shape: 'value',
  },

  // 9. So Long — Douglas Adams (final farewell)
  {
    name: 'so_long_fish',
    author: 'The Dolphins',
    version: '4.0.0',
    description: 'The last message from the dolphins before leaving Earth.',
    category: '???',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: 'console.log("\\u{1F42C} So long, and thanks for all the fish!");',
      python: 'print("\\U0001F42C So long, and thanks for all the fish!")',
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },

  // 10. Infinite Improbability — Douglas Adams
  {
    name: 'improbability_drive',
    author: 'Zaphod Beeblebrox',
    version: '0.0.1',
    description: 'Generate an Infinite Improbability factor. Anything could happen.',
    category: '???',
    inputs: [],
    outputs: [{ name: 'factor', type: 'string' }],
    implementations: {
      javascript: `(function() {
  var things = ["a sperm whale","a bowl of petunias","a sofa","a penguin","a cup of tea","42 penguins","a fjord","a mattress","a babel fish","a lemon"];
  var places = ["above Magrathea","in the Horsehead Nebula","at Milliways","on the bridge","in hyperspace","above Betelgeuse","near Barnard's Star","in sector ZZ9 Plural Z Alpha","at the Restaurant at the End of the Universe","inside a black hole"];
  var t = things[Math.floor(Math.random() * things.length)];
  var p = places[Math.floor(Math.random() * places.length)];
  var odds = Math.floor(Math.random() * 999999) + 1;
  return odds + ":1 against — " + t + " materialized " + p;
})()`,
      python: `import random
things = ["a sperm whale","a bowl of petunias","a sofa","a penguin","a cup of tea","42 penguins","a fjord","a mattress","a babel fish","a lemon"]
places = ["above Magrathea","in the Horsehead Nebula","at Milliways","on the bridge","in hyperspace","above Betelgeuse","near Barnard's Star","in sector ZZ9 Plural Z Alpha","at the Restaurant at the End of the Universe","inside a black hole"]
t = random.choice(things)
p = random.choice(places)
odds = random.randint(1, 999999)
return f"{odds}:1 against — {t} materialized {p}"`,
    },
    tests: [],
    color: COLOR,
    shape: 'value',
  },

  // 11. Rick Roll — Internet Culture
  {
    name: 'rick_roll',
    author: 'Rick Astley',
    version: '1987.0.0',
    description: 'You know the rules and so do I.',
    category: '???',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function rick_roll() {
  console.log("\\u{1F3B5} Never gonna give you up");
  console.log("\\u{1F3B5} Never gonna let you down");
  console.log("\\u{1F3B5} Never gonna run around and desert you");
  console.log("\\u{1F3B5} Never gonna make you cry");
  console.log("\\u{1F3B5} Never gonna say goodbye");
  console.log("\\u{1F3B5} Never gonna tell a lie and hurt you");
}`,
      python: `def rick_roll():
    print("\\U0001F3B5 Never gonna give you up")
    print("\\U0001F3B5 Never gonna let you down")
    print("\\U0001F3B5 Never gonna run around and desert you")
    print("\\U0001F3B5 Never gonna make you cry")
    print("\\U0001F3B5 Never gonna say goodbye")
    print("\\U0001F3B5 Never gonna tell a lie and hurt you")`,
    },
    tests: [],
    color: '#FF0000',
    shape: 'statement',
  },

  // 12. Matrix Rain — The Matrix (1999)
  {
    name: 'matrix_rain',
    author: 'Neo',
    version: '1999.0.0',
    description: 'See the Matrix. Green falling characters on canvas.',
    category: '???',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `async function matrix_rain() {
  var canvas = document.getElementById('cb-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cb-canvas';
    document.body.appendChild(canvas);
  }
  canvas.width = 400;
  canvas.height = 400;
  var ctx = canvas.getContext('2d');
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
  var fontSize = 14;
  var columns = Math.floor(canvas.width / fontSize);
  var drops = [];
  for (var i = 0; i < columns; i++) drops[i] = Math.floor(Math.random() * -20);
  var frames = 0;
  return new Promise(function(resolve) {
    var interval = setInterval(function() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = fontSize + "px monospace";
      for (var i = 0; i < columns; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      frames++;
      if (frames > 120) { clearInterval(interval); console.log("Wake up, Neo..."); resolve(); }
    }, 33);
  });
}`,
      python: 'def matrix_rain():\n    print("[Matrix Rain is only available in JavaScript mode]")',
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },

  // 13. Sudo Sandwich — xkcd #149
  {
    name: 'sudo_sandwich',
    author: 'Randall Munroe',
    version: '149.0.0',
    description: 'sudo make me a sandwich. Okay.',
    category: '???',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: 'function sudo_sandwich() {\n  console.log("\\u{1F96A} Okay.");\n}',
      python: 'def sudo_sandwich():\n    print("\\U0001F96A Okay.")',
    },
    tests: [],
    color: COLOR,
    shape: 'statement',
  },
]
