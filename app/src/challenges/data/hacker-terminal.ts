import type { ThemePack } from '../types'

export const hackerTerminal: ThemePack = {
  id: 'hacker-terminal',
  name: 'Hacker Terminal',
  description: 'Master logic gates and crack the code',
  icon: '💻',
  color: '#a6e3a1',
  challenges: [
    {
      id: 'ht-1',
      title: 'Flip the Switch',
      description:
        'NOT flips true to false and false to true! Check: is 1 equal to 2? That\'s false. Use NOT to flip it to true. Print "Different!" if true, "Same!" if false.',
      difficulty: 'beginner',
      theme: 'hacker-terminal',
      expectedOutput: ['Different!'],
      par: 6,
      hints: [
        'NOT takes a boolean and flips it. Equals checks if two values match.',
        'Print( If Then( NOT( Equals(1, 2) ), "Different!", "Same!" ) ). Equals is false, NOT makes it true.',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'ht-2',
      title: 'Password Check',
      description:
        'Security system! Store "abc123" in a variable called "password". Use Equals to compare it with "abc123". If they match, print "Access Granted" — otherwise print "Access Denied".',
      difficulty: 'beginner',
      theme: 'hacker-terminal',
      expectedOutput: ['Access Granted'],
      par: 7,
      hints: [
        'Set Global stores a value, Get Global reads it back.',
        'Set Global "password" to "abc123". Then Print( If Then( Equals( Get Global "password", "abc123" ), "Access Granted", "Access Denied" ) ).',
      ],
      allowedCategories: ['Basics', 'Text', 'Logic'],
    },
    {
      id: 'ht-3',
      title: 'Two-Factor Auth',
      description:
        'Both checks must pass! Use AND to verify: is 10 greater than 5 AND is 3 less than 8? If both are true, print "Verified" — otherwise print "Denied".',
      difficulty: 'intermediate',
      theme: 'hacker-terminal',
      expectedOutput: ['Verified'],
      par: 8,
      hints: [
        'AND returns true only when BOTH inputs are true.',
        'Print( If Then( AND( Greater Than(10, 5), Less Than(3, 8) ), "Verified", "Denied" ) ).',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'ht-4',
      title: 'Firewall Rule',
      description:
        'Only one check needs to pass! Use OR to check: is 1 greater than 10 OR is 5 greater than 3? If either is true, print "Allowed" — otherwise "Blocked".',
      difficulty: 'intermediate',
      theme: 'hacker-terminal',
      expectedOutput: ['Allowed'],
      par: 8,
      hints: [
        'OR returns true when at least ONE input is true.',
        'Print( If Then( OR( Greater Than(1, 10), Greater Than(5, 3) ), "Allowed", "Blocked" ) ). First is false, second is true, OR = true.',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'ht-5',
      title: 'Security Scan',
      description:
        'Full system check! Verify: 8 is greater than 5 AND it is NOT the case that 10 is less than 3. If both pass, print "System Secure" — otherwise "Breach Detected!".',
      difficulty: 'advanced',
      theme: 'hacker-terminal',
      expectedOutput: ['System Secure'],
      par: 10,
      hints: [
        'Nest the blocks: AND needs two booleans, one from Greater Than, one from NOT wrapping Less Than.',
        'AND( Greater Than(8, 5), NOT( Less Than(10, 3) ) ) — 8>5 is true, 10<3 is false, NOT(false) is true, AND(true, true) = true.',
      ],
      allowedCategories: ['Basics', 'Text', 'Math', 'Logic'],
    },
  ],
}
