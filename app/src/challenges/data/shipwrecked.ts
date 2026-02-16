import type { ThemePack } from '../types'
import { resetIds, block, blockWithStatements, textVal, numVal, workspace } from '../../examples/workspaces'

function messageInABottle(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 80, 60),
    block('text', { TEXT: 'Hello World' }, undefined, 350, 160),
  )
}

function driftwoodNumbers(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 60, 50),
    block('cb_print', undefined, undefined, 60, 200),
    block('cb_print', undefined, undefined, 60, 350),
    block('math_number', { NUM: 3 }, undefined, 380, 80),
    block('math_number', { NUM: 2 }, undefined, 320, 230),
    block('math_number', { NUM: 1 }, undefined, 400, 370),
  )
}

function sosSignal(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 50, 50),
    block('cb_join_text', undefined, undefined, 350, 60),
    block('text', { TEXT: 'S' }, undefined, 200, 230),
    block('text', { TEXT: 'OS' }, undefined, 420, 220),
  )
}

function islandInventory(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 60, 60),
    block('cb_add', undefined, undefined, 330, 50),
    block('math_number', { NUM: 5 }, undefined, 200, 220),
    block('math_number', { NUM: 3 }, undefined, 450, 200),
  )
}

function campfireCountdown(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_repeat', undefined, undefined, 60, 50),
    block('math_number', { NUM: 3 }, undefined, 350, 40),
    block('cb_print', undefined, undefined, 300, 220),
    block('text', { TEXT: 'fire!' }, undefined, 150, 300),
  )
}

export const shipwrecked: ThemePack = {
  id: 'shipwrecked',
  name: 'Shipwrecked',
  description: 'Your code blocks washed ashore — reconnect them!',
  icon: '🏝️',
  color: '#89dceb',
  challenges: [
    {
      id: 'sw-1',
      title: 'Message in a Bottle',
      description: 'A Print block and a text block washed up on different parts of the beach. Connect them to send your message!',
      difficulty: 'beginner',
      theme: 'shipwrecked',
      expectedOutput: ['Hello World'],
      par: 2,
      hints: [
        'Drag the text block into the Print block\'s "message" slot.',
        'The text block says "Hello World" — plug it into Print.',
      ],
      solution: 'Connect Text "Hello World" to Print\'s message input.',
      allowedCategories: ['Basics', 'Text'],
      starterBlocks: messageInABottle(),
    },
    {
      id: 'sw-2',
      title: 'Driftwood Numbers',
      description: 'Three Print blocks and three numbers drifted apart. Chain the prints and attach the right numbers to count down: 3, 2, 1.',
      difficulty: 'beginner',
      theme: 'shipwrecked',
      expectedOutput: ['3', '2', '1'],
      par: 6,
      hints: [
        'Stack the Print blocks on top of each other (chain them).',
        'Attach 3 to the first Print, 2 to the second, 1 to the third.',
      ],
      solution: 'Chain Print(3) → Print(2) → Print(1).',
      allowedCategories: ['Basics', 'Math'],
      starterBlocks: driftwoodNumbers(),
    },
    {
      id: 'sw-3',
      title: 'SOS Signal',
      description: 'Build an SOS signal by joining text pieces and printing the result.',
      difficulty: 'beginner',
      theme: 'shipwrecked',
      expectedOutput: ['SOS'],
      par: 4,
      hints: [
        'Use Join Text to combine the two text pieces.',
        'Join "S" and "OS" together, then print the result.',
      ],
      solution: 'Print → Join Text("S", "OS") = "SOS".',
      allowedCategories: ['Basics', 'Text'],
      starterBlocks: sosSignal(),
    },
    {
      id: 'sw-4',
      title: 'Island Inventory',
      description: 'You found 5 coconuts and 3 fish. Use the Add block to count your supplies and print the total.',
      difficulty: 'beginner',
      theme: 'shipwrecked',
      expectedOutput: ['8'],
      par: 4,
      hints: [
        'Plug the two numbers into the Add block.',
        'Connect the Add result to Print to show the total.',
      ],
      solution: 'Print → Add(5, 3) = 8.',
      allowedCategories: ['Basics', 'Math'],
      starterBlocks: islandInventory(),
    },
    {
      id: 'sw-5',
      title: 'Campfire Countdown',
      description: 'Build a campfire signal! Connect the blocks to print "fire!" three times using a Repeat loop.',
      difficulty: 'beginner',
      theme: 'shipwrecked',
      expectedOutput: ['fire!', 'fire!', 'fire!'],
      par: 4,
      hints: [
        'Put the number 3 into the Repeat block\'s "repeat" slot.',
        'Put Print inside the Repeat loop, then connect the text to Print.',
      ],
      solution: 'Repeat(3) → Print → Text "fire!".',
      allowedCategories: ['Basics', 'Text', 'Logic'],
      starterBlocks: campfireCountdown(),
    },
  ],
}
