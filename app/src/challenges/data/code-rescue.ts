import type { ThemePack } from '../types'
import { resetIds, block, workspace } from '../../examples/workspaces'

function theReversal(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 60, 60),
    block('cb_uppercase', undefined, undefined, 350, 40),
    block('cb_reverse_text', undefined, undefined, 180, 230),
    block('text', { TEXT: 'edoc' }, undefined, 420, 250),
  )
}

function fixTheGreeting(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 50, 50),
    block('cb_join_text', undefined, undefined, 330, 30),
    block('cb_join_text', undefined, undefined, 120, 230),
    block('text', { TEXT: 'Hello, ' }, undefined, 400, 200),
    block('text', { TEXT: 'World' }, undefined, 200, 350),
  )
}

function patternMaker(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_repeat', undefined, undefined, 60, 50),
    block('math_number', { NUM: 3 }, undefined, 370, 30),
    block('cb_print', undefined, undefined, 280, 200),
    block('cb_join_text', undefined, undefined, 100, 300),
    block('text', { TEXT: '*' }, undefined, 400, 290),
    block('text', { TEXT: '**' }, undefined, 220, 400),
  )
}

function cryptoDecode(): Record<string, unknown> {
  resetIds()
  // XOR("IENO", 10) = "CODE"
  // I=73^10=67=C, E=69^10=79=O, N=78^10=68=D, O=79^10=69=E
  return workspace(
    block('cb_print', undefined, undefined, 60, 60),
    block('cb_xor_cipher', undefined, undefined, 350, 40),
    block('text', { TEXT: 'IENO' }, undefined, 180, 230),
    block('math_number', { NUM: 10 }, undefined, 430, 230),
  )
}

function decodeTheSecret(): Record<string, unknown> {
  resetIds()
  // base64("Hello!") = "SGVsbG8h"
  return workspace(
    block('cb_print', undefined, undefined, 60, 50),
    block('cb_join_text', undefined, undefined, 330, 40),
    block('text', { TEXT: 'Secret: ' }, undefined, 120, 230),
    block('cb_base64_decode', undefined, undefined, 400, 220),
    block('text', { TEXT: 'SGVsbG8h' }, undefined, 220, 360),
  )
}

export const codeRescue: ThemePack = {
  id: 'code-rescue',
  name: 'Code Rescue',
  description: 'A broken program needs repair — use the scattered pieces to fix it!',
  icon: '🔧',
  color: '#f38ba8',
  challenges: [
    {
      id: 'cr-1',
      title: 'The Reversal',
      description: 'A word got scrambled! Reverse the text and convert it to uppercase to reveal the hidden word.',
      difficulty: 'advanced',
      theme: 'code-rescue',
      expectedOutput: ['CODE'],
      par: 4,
      hints: [
        'Reverse Text turns "edoc" backwards into "code".',
        'Uppercase converts "code" to "CODE". Chain them together and print.',
      ],
      solution: 'Print → Uppercase → Reverse Text("edoc") = "CODE".',
      allowedCategories: ['Basics', 'Text'],
      starterBlocks: theReversal(),
    },
    {
      id: 'cr-2',
      title: 'Fix the Greeting',
      description: 'The greeting is almost complete but missing its "!" — grab one from the toolbox and connect everything to print "Hello, World!".',
      difficulty: 'advanced',
      theme: 'code-rescue',
      expectedOutput: ['Hello, World!'],
      par: 7,
      hints: [
        'You need a Text block with "!" from the toolbox.',
        'Use two Join Text blocks: one to join "World" + "!", another to join "Hello, " + that result.',
      ],
      solution: 'Print → Join("Hello, ", Join("World", "!")).',
      allowedCategories: ['Basics', 'Text'],
      starterBlocks: fixTheGreeting(),
    },
    {
      id: 'cr-3',
      title: 'Pattern Maker',
      description: 'Build a 3×3 pattern of asterisks! Join the text pieces and repeat the print.',
      difficulty: 'advanced',
      theme: 'code-rescue',
      expectedOutput: ['***', '***', '***'],
      par: 6,
      hints: [
        'Join "*" and "**" to make "***".',
        'Put Print(Join(...)) inside the Repeat(3) loop.',
      ],
      solution: 'Repeat(3) → Print → Join Text("*", "**") = "***".',
      allowedCategories: ['Basics', 'Text', 'Logic'],
      starterBlocks: patternMaker(),
    },
    {
      id: 'cr-4',
      title: 'Crypto Decode',
      description: 'An encrypted message was intercepted! Use XOR Cipher with the right key to decode "IENO" into a readable word.',
      difficulty: 'advanced',
      theme: 'code-rescue',
      expectedOutput: ['CODE'],
      par: 4,
      hints: [
        'XOR Cipher encrypts and decrypts — apply it once to decode.',
        'Connect the text "IENO" and key 10 to XOR Cipher, then Print the result.',
      ],
      solution: 'Print → XOR Cipher("IENO", 10) = "CODE".',
      allowedCategories: ['Basics', 'Crypto'],
      starterBlocks: cryptoDecode(),
    },
    {
      id: 'cr-5',
      title: 'Decode the Secret',
      description: 'A Base64-encoded message is hiding in the blocks. Decode it, join it with a label, and print the secret.',
      difficulty: 'advanced',
      theme: 'code-rescue',
      expectedOutput: ['Secret: Hello!'],
      par: 5,
      hints: [
        'Base64 Decode turns "SGVsbG8h" into "Hello!".',
        'Use Join Text to combine "Secret: " with the decoded text.',
      ],
      solution: 'Print → Join Text("Secret: ", Base64 Decode("SGVsbG8h")).',
      allowedCategories: ['Basics', 'Text', 'Crypto'],
      starterBlocks: decodeTheSecret(),
    },
  ],
}
