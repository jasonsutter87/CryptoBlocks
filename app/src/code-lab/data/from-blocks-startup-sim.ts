import type { LabPack } from '../types'

export const fromBlocksStartupSim: LabPack = {
  id: 'from-blocks-startup-sim',
  name: 'From Blocks: Startup Sim',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '📈',
  color: '#eba0ac',
  exercises: [
    {
      id: 'lab-fb-ss-1',
      title: 'Company Name',
      description:
        'You already solved this with blocks — Join Text then Uppercase + Join Text. Now do the same in JavaScript.\n\nJoin "Crypto" and "Blocks" and print "CryptoBlocks". Then print the name in all caps on a second line.',
      difficulty: 'beginner',
      expectedOutput: ['CryptoBlocks', 'CRYPTOBLOCKS'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Print "CryptoBlocks" then "CRYPTOBLOCKS" on separate lines\n',
      hints: [
        'Concatenate with +: "Crypto" + "Blocks"',
        'Store in a variable, then call .toUpperCase() for the second line.',
        'var name = "Crypto" + "Blocks"; console.log(name); console.log(name.toUpperCase());',
      ],
    },
    {
      id: 'lab-fb-ss-2',
      title: 'Revenue Report',
      description:
        'You already solved this with blocks — Multiply then Greater Than feeding an If Then. Now do the same in JavaScript.\n\n250 users paying $10 each per month. If revenue is greater than $2000, print "Profitable!" — otherwise "Keep growing".',
      difficulty: 'intermediate',
      expectedOutput: ['Profitable!'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Calculate revenue (250 * 10), check if > 2000, print the right message\n',
      hints: [
        'Calculate: var revenue = 250 * 10;',
        'Use an if/else: if (revenue > 2000) { console.log("Profitable!"); }',
      ],
    },
    {
      id: 'lab-fb-ss-3',
      title: 'Team Roster',
      description:
        'You already solved this with blocks — Create List, add 3 names, List Length, Get From List. Now do the same in JavaScript.\n\nCreate a "team" array with "Alice", "Bob", "Carol". Print the team size, then print the first member\'s name.',
      difficulty: 'intermediate',
      expectedOutput: ['3', 'Alice'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create a team array with 3 names, print the count, then the first member\n',
      hints: [
        'var team = ["Alice", "Bob", "Carol"];',
        'console.log(team.length) for the count.',
        'console.log(team[0]) for the first member.',
      ],
    },
    {
      id: 'lab-fb-ss-4',
      title: 'Product Launch',
      description:
        'You already solved this with blocks — Create Object, Set Property, Get Property inside Join Text blocks. Now do the same in JavaScript.\n\nCreate an object "product" with name "Widget", price 29, and stock 100. Print "Widget: $29 (100 in stock)".',
      difficulty: 'advanced',
      expectedOutput: ['Widget: $29 (100 in stock)'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create a product object and print a formatted description\n',
      hints: [
        'var product = { name: "Widget", price: 29, stock: 100 };',
        'Build the string with concatenation: product.name + ": $" + product.price + " (" + product.stock + " in stock)"',
        'Pass the full expression to console.log().',
      ],
    },
    {
      id: 'lab-fb-ss-5',
      title: 'Growth Forecast',
      description:
        'You already solved this with blocks — Power(2, 3) * 100 inside Join Text. Now do the same in JavaScript.\n\nYour startup doubles users every month! Start with 100 users. After 3 months of doubling, calculate the result and print "Month 3: 800 users".',
      difficulty: 'advanced',
      expectedOutput: ['Month 3: 800 users'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Calculate 100 * 2^3 and print "Month 3: {result} users"\n',
      hints: [
        'Compute: var users = 100 * Math.pow(2, 3); or 100 * (2 ** 3)',
        'Build the output string: "Month 3: " + users + " users"',
        'console.log("Month 3: " + (100 * Math.pow(2, 3)) + " users")',
      ],
    },
  ],
}
