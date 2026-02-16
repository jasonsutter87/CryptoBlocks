import type { ThemePack } from '../types'
import { resetIds, block, blockWithStatements, textVal, numVal, boolVal, workspace } from '../../examples/workspaces'

function trueOrFalse(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 60, 60),
    block('cb_if_then', undefined, undefined, 350, 40),
    block('logic_boolean', { BOOL: 'TRUE' }, undefined, 200, 230),
    block('text', { TEXT: 'yes' }, undefined, 450, 200),
    block('text', { TEXT: 'no' }, undefined, 120, 340),
  )
}

function doubleTrouble(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 70, 70),
    block('cb_multiply', undefined, undefined, 380, 50),
    block('math_number', { NUM: 6 }, undefined, 200, 240),
    block('math_number', { NUM: 7 }, undefined, 450, 230),
  )
}

function pickTheBigger(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_print', undefined, undefined, 50, 50),
    block('cb_if_then', undefined, undefined, 320, 30),
    block('cb_greater_than', undefined, undefined, 100, 220),
    block('math_number', { NUM: 7 }, undefined, 400, 200),
    block('math_number', { NUM: 3 }, undefined, 200, 340),
    block('text', { TEXT: '7 wins' }, undefined, 450, 330),
    block('text', { TEXT: '3 wins' }, undefined, 60, 420),
  )
}

function hipHipHooray(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_repeat', undefined, undefined, 60, 50),
    block('math_number', { NUM: 2 }, undefined, 370, 30),
    block('cb_print', undefined, undefined, 300, 200),
    block('cb_join_text', undefined, undefined, 120, 280),
    block('text', { TEXT: 'hip ' }, undefined, 420, 300),
    block('text', { TEXT: 'hooray!' }, undefined, 200, 400),
  )
}

function variableVault(): Record<string, unknown> {
  resetIds()
  return workspace(
    block('cb_set_global', undefined, undefined, 60, 50),
    block('text', { TEXT: 'secret' }, undefined, 350, 40),
    block('math_number', { NUM: 42 }, undefined, 200, 200),
    block('cb_print', undefined, undefined, 400, 220),
    block('cb_get_global', undefined, undefined, 100, 340),
    block('text', { TEXT: 'secret' }, undefined, 420, 360),
  )
}

export const blockPuzzles: ThemePack = {
  id: 'block-puzzles',
  name: 'Block Puzzles',
  description: 'Scattered puzzle pieces — can you solve the logic?',
  icon: '🧩',
  color: '#cba6f7',
  challenges: [
    {
      id: 'bp-1',
      title: 'True or False',
      description: 'Use the If Then block to pick between "yes" and "no" based on a boolean value. Print the result!',
      difficulty: 'intermediate',
      theme: 'block-puzzles',
      expectedOutput: ['yes'],
      par: 5,
      hints: [
        'If Then takes a condition, a "then" value, and an "else" value.',
        'Plug Boolean TRUE into the condition, "yes" into then, "no" into else.',
      ],
      solution: 'Print → If Then(TRUE, "yes", "no") = "yes".',
      allowedCategories: ['Basics', 'Logic', 'Text'],
      starterBlocks: trueOrFalse(),
    },
    {
      id: 'bp-2',
      title: 'Double Trouble',
      description: 'Two numbers need multiplying. Connect them to the Multiply block and print the answer.',
      difficulty: 'intermediate',
      theme: 'block-puzzles',
      expectedOutput: ['42'],
      par: 4,
      hints: [
        'Plug 6 and 7 into the Multiply block.',
        'Connect Multiply\'s result to Print.',
      ],
      solution: 'Print → Multiply(6, 7) = 42.',
      allowedCategories: ['Basics', 'Math'],
      starterBlocks: doubleTrouble(),
    },
    {
      id: 'bp-3',
      title: 'Pick the Bigger',
      description: 'Which number is bigger — 7 or 3? Use Greater Than and If Then to print the winner.',
      difficulty: 'intermediate',
      theme: 'block-puzzles',
      expectedOutput: ['7 wins'],
      par: 7,
      hints: [
        'Greater Than compares two numbers and returns true/false.',
        'Use Greater Than(7, 3) as the condition for If Then.',
        'The "then" value should be "7 wins", the "else" should be "3 wins".',
      ],
      solution: 'Print → If Then(Greater Than(7, 3), "7 wins", "3 wins").',
      allowedCategories: ['Basics', 'Logic', 'Math', 'Text'],
      starterBlocks: pickTheBigger(),
    },
    {
      id: 'bp-4',
      title: 'Hip Hip Hooray',
      description: 'Join two text pieces and print the result twice using a Repeat loop.',
      difficulty: 'intermediate',
      theme: 'block-puzzles',
      expectedOutput: ['hip hooray!', 'hip hooray!'],
      par: 6,
      hints: [
        'First, join "hip " and "hooray!" using Join Text.',
        'Put Print inside the Repeat loop, set repeat to 2.',
      ],
      solution: 'Repeat(2) → Print → Join Text("hip ", "hooray!").',
      allowedCategories: ['Basics', 'Text', 'Logic'],
      starterBlocks: hipHipHooray(),
    },
    {
      id: 'bp-5',
      title: 'Variable Vault',
      description: 'Store the number 42 in a variable called "secret", then retrieve and print it.',
      difficulty: 'intermediate',
      theme: 'block-puzzles',
      expectedOutput: ['42'],
      par: 6,
      hints: [
        'Use Set Global to store the value. The name input needs the text "secret".',
        'Chain Set Global before Print, and use Get Global to retrieve the value.',
      ],
      solution: 'Set Global("secret", 42) → Print → Get Global("secret").',
      allowedCategories: ['Basics', 'Math', 'Text'],
      starterBlocks: variableVault(),
    },
  ],
}
