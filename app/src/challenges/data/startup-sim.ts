import type { ThemePack } from '../types'

export const startupSim: ThemePack = {
  id: 'startup-sim',
  name: 'Startup Sim',
  description: 'Build a tech empire using every skill you have learned',
  icon: '📈',
  color: '#eba0ac',
  challenges: [
    {
      id: 'ss-1',
      title: 'Company Name',
      description:
        'Every startup needs a name! Join "Crypto" and "Blocks" together and print it. Then print the name in all caps on a second line.',
      difficulty: 'beginner',
      theme: 'startup-sim',
      expectedOutput: ['CryptoBlocks', 'CRYPTOBLOCKS'],
      par: 5,
      hints: [
        'Use Join Text for the first line, then Uppercase + Join Text for the second.',
        'Print( Join Text("Crypto", "Blocks") ) then Print( Uppercase( Join Text("Crypto", "Blocks") ) ).',
      ],
      allowedCategories: ['Basics', 'Text'],
    },
    {
      id: 'ss-2',
      title: 'Revenue Report',
      description:
        '250 users paying $10 each per month. If revenue is greater than $2000, print "Profitable!" — otherwise "Keep growing".',
      difficulty: 'intermediate',
      theme: 'startup-sim',
      expectedOutput: ['Profitable!'],
      par: 7,
      hints: [
        'First calculate 250 * 10, then compare with Greater Than.',
        'Print( If Then( Greater Than( Multiply(250, 10), 2000 ), "Profitable!", "Keep growing" ) ).',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'ss-3',
      title: 'Team Roster',
      description:
        'Build your team! Create a list called "team", add "Alice", "Bob", "Carol". Print how many people are on the team, then print the first team member\'s name.',
      difficulty: 'intermediate',
      theme: 'startup-sim',
      expectedOutput: ['3', 'Alice'],
      par: 8,
      hints: [
        'Use List Length for the count, Get From List at index 0 for the first member.',
        'Create "team", add 3 names. Print( List Length("team") ) then Print( Get From List("team", 0) ).',
      ],
      allowedCategories: ['Basics', 'Lists'],
    },
    {
      id: 'ss-4',
      title: 'Product Launch',
      description:
        'Launch day! Create an object "product" with name "Widget", price 29, and stock 100. Print "Widget: $29 (100 in stock)" using Get Property and Join Text.',
      difficulty: 'advanced',
      theme: 'startup-sim',
      expectedOutput: ['Widget: $29 (100 in stock)'],
      par: 12,
      hints: [
        'You need multiple Join Text blocks to build the full string with Get Property values.',
        'Create "product", set all 3 properties. Join the pieces: name + ": $" + price + " (" + stock + " in stock)".',
      ],
      allowedCategories: ['Basics', 'Text', 'Data'],
    },
    {
      id: 'ss-5',
      title: 'Growth Forecast',
      description:
        'Your startup doubles users every month! Start with 100 users. After 3 months of doubling, how many? Calculate 100 * 2^3 and print "Month 3: 800 users".',
      difficulty: 'advanced',
      theme: 'startup-sim',
      expectedOutput: ['Month 3: 800 users'],
      par: 8,
      hints: [
        'Use Power(2, 3) for the doubling, then Multiply by 100.',
        'Print( Join Text( "Month 3: ", Join Text( Multiply( 100, Power(2, 3) ), " users" ) ) ).',
      ],
      allowedCategories: ['Basics', 'Text', 'Math'],
    },
  ],
}
