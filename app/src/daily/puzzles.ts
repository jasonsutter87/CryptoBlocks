/**
 * Daily Challenge puzzle pool.
 *
 * Each day, one puzzle is selected deterministically from this list based on
 * the date. When we run out, the list cycles — so add more over time.
 *
 * A puzzle is considered solved when the run output (joined by newlines, trimmed)
 * exactly matches `targetOutput` (also joined + trimmed).
 */

export interface DailyPuzzle {
  /** Stable id — never reuse across puzzles */
  id: string
  title: string
  /** Short, kid-friendly description of the goal */
  description: string
  /** The expected output lines — compared as `lines.join('\n').trim()` */
  targetOutput: string[]
  /** "Par" block count — solve in this many blocks or fewer for 3 stars */
  parBlocks: number
  difficulty: 'easy' | 'medium' | 'hard'
  /** Optional hint shown after 1 failed attempt */
  hint?: string
}

export const PUZZLES: DailyPuzzle[] = [
  {
    id: 'hello-world',
    title: 'Hello, World!',
    description: 'Make the output print exactly: Hello, World!',
    targetOutput: ['Hello, World!'],
    parBlocks: 1,
    difficulty: 'easy',
    hint: 'Drag a "print" block and type the text inside.',
  },
  {
    id: 'count-to-5',
    title: 'Count to Five',
    description: 'Print the numbers 1 through 5, each on its own line.',
    targetOutput: ['1', '2', '3', '4', '5'],
    parBlocks: 3,
    difficulty: 'easy',
    hint: 'Try a repeat block with a counter variable.',
  },
  {
    id: 'even-numbers',
    title: 'Even Numbers',
    description: 'Print every even number from 2 to 10, each on its own line.',
    targetOutput: ['2', '4', '6', '8', '10'],
    parBlocks: 3,
    difficulty: 'easy',
    hint: 'Multiply your counter by 2, or step by 2 each time.',
  },
  {
    id: 'greeting',
    title: 'Warm Welcome',
    description: 'Print: Hello, friend!',
    targetOutput: ['Hello, friend!'],
    parBlocks: 1,
    difficulty: 'easy',
  },
  {
    id: 'countdown',
    title: 'Countdown',
    description: 'Print 5 down to 1, each on its own line.',
    targetOutput: ['5', '4', '3', '2', '1'],
    parBlocks: 3,
    difficulty: 'easy',
    hint: 'A repeat block and subtraction can do this.',
  },
  {
    id: 'sum-ten',
    title: 'Sum of Ten',
    description: 'Add the numbers 1 through 10 and print the result. (Hint: it\'s 55!)',
    targetOutput: ['55'],
    parBlocks: 5,
    difficulty: 'medium',
    hint: 'Use a variable that starts at 0 and adds each number.',
  },
  {
    id: 'fizz',
    title: 'Fizz',
    description: 'Print 1 through 10, but replace any multiple of 3 with the word "Fizz".',
    targetOutput: ['1', '2', 'Fizz', '4', '5', 'Fizz', '7', '8', 'Fizz', '10'],
    parBlocks: 6,
    difficulty: 'medium',
    hint: 'Use "if" with "remainder of" (modulo) to detect multiples of 3.',
  },
  {
    id: 'times-table',
    title: 'Times Five',
    description: 'Print the 5 times table from 5 up to 25 (5, 10, 15, 20, 25).',
    targetOutput: ['5', '10', '15', '20', '25'],
    parBlocks: 4,
    difficulty: 'medium',
    hint: 'Multiply your counter by 5.',
  },
  {
    id: 'stars',
    title: 'Star Staircase',
    description: 'Print a staircase of stars — 1 on the first line, 5 on the last.',
    targetOutput: ['*', '**', '***', '****', '*****'],
    parBlocks: 6,
    difficulty: 'hard',
    hint: 'A loop inside a loop. Build up a string with stars each round.',
  },
  {
    id: 'reverse',
    title: 'Backwards',
    description: 'Print the letters "OLLEH" — that\'s "HELLO" backwards!',
    targetOutput: ['OLLEH'],
    parBlocks: 1,
    difficulty: 'easy',
  },
]

/** Normalize output for comparison: join + trim trailing whitespace */
export function normalizeOutput(lines: string[]): string {
  return lines.join('\n').trimEnd()
}

/** Check whether a run's output matches the puzzle target. */
export function matchesTarget(output: string[], puzzle: DailyPuzzle): boolean {
  return normalizeOutput(output) === normalizeOutput(puzzle.targetOutput)
}
