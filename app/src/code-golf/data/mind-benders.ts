import type { GolfPack } from '../types'

export const mindBenders: GolfPack = {
  id: 'mind-benders',
  name: 'Mind Benders',
  description: 'Hard puzzles for expert block golfers',
  icon: '🤯',
  color: '#f38ba8',
  problems: [
    {
      id: 'golf-13',
      title: 'Fibonacci Ten',
      description: 'Print the first 10 Fibonacci numbers: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34.',
      difficulty: 'hard',
      expectedOutput: ['0', '1', '1', '2', '3', '5', '8', '13', '21', '34'],
      par: 10,
    },
    {
      id: 'golf-14',
      title: 'Collatz',
      description: 'Print the Collatz sequence starting at 7 until you reach 1: 7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1.',
      difficulty: 'hard',
      expectedOutput: ['7', '22', '11', '34', '17', '52', '26', '13', '40', '20', '10', '5', '16', '8', '4', '2', '1'],
      par: 13,
    },
    {
      id: 'golf-15',
      title: 'Triangle',
      description: 'Print a right triangle with *:\n*\n**\n***\n****\n*****',
      difficulty: 'hard',
      expectedOutput: ['*', '**', '***', '****', '*****'],
      par: 8,
    },
    {
      id: 'golf-16',
      title: 'Diamond',
      description: 'Print a diamond shape with * (width 5):\n  *\n ***\n*****\n ***\n  *',
      difficulty: 'hard',
      expectedOutput: ['  *', ' ***', '*****', ' ***', '  *'],
      par: 14,
    },
    {
      id: 'golf-17',
      title: 'Digital Root',
      description: 'Sum the digits of 987 repeatedly until you get a single digit. Print each step: 987, 24, 6.',
      difficulty: 'hard',
      expectedOutput: ['987', '24', '6'],
      par: 10,
    },
    {
      id: 'golf-18',
      title: 'Caesar Cipher',
      description: 'Shift each letter of "HELLO" forward by 3 positions to print "KHOOR".',
      difficulty: 'hard',
      expectedOutput: ['KHOOR'],
      par: 16,
    },
  ],
}
