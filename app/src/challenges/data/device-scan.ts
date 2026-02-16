import type { ThemePack } from '../types'

export const deviceScan: ThemePack = {
  id: 'device-scan',
  name: 'Device Scan',
  description: 'Discover your device\'s specs with Hardware blocks',
  icon: '📱',
  color: '#65A30D',
  challenges: [
    {
      id: 'ds-1',
      title: 'Screen Size',
      description:
        'Read the screen width and height using Hardware blocks. Print them on separate lines using the format: "Width: " followed by the value, then "Height: " followed by the value.',
      difficulty: 'beginner',
      theme: 'device-scan',
      expectedOutput: ['screen-dependent'],
      par: 5,
      hints: [
        'Use Get Screen Width and Get Screen Height from the Hardware category.',
        'Use Join Text to combine "Width: " with the width value. Same for height.',
      ],
      allowedCategories: ['Basics', 'Hardware', 'Text'],
    },
    {
      id: 'ds-2',
      title: 'Language Check',
      description:
        'Get the browser language and print it. Then get the timezone and print it on the next line.',
      difficulty: 'beginner',
      theme: 'device-scan',
      expectedOutput: ['device-dependent'],
      par: 5,
      hints: [
        'Use Get Language and Get Timezone from Hardware.',
        'Print each one on its own line.',
      ],
      allowedCategories: ['Basics', 'Hardware', 'Text'],
    },
    {
      id: 'ds-3',
      title: 'CPU Report',
      description:
        'Get the number of CPU cores. If it\'s greater than or equal to 4, print "Powerful machine!". Otherwise print "Basic setup".',
      difficulty: 'intermediate',
      theme: 'device-scan',
      expectedOutput: ['device-dependent'],
      par: 6,
      hints: [
        'Use Get Device Cores and compare with Greater Than or Equals.',
        'Most modern devices have 4+ cores, so you\'ll likely see "Powerful machine!".',
      ],
      allowedCategories: ['Basics', 'Hardware', 'Text', 'Math', 'Logic'],
    },
    {
      id: 'ds-4',
      title: 'Touch Test',
      description:
        'Check if the device is a touch device. Print "Touch screen!" if yes, "No touch" if no. Then print the pixel ratio.',
      difficulty: 'intermediate',
      theme: 'device-scan',
      expectedOutput: ['device-dependent'],
      par: 7,
      hints: [
        'Use Is Touch Device for the boolean check, then If Then for the message.',
        'Get Pixel Ratio returns the display density (1 for standard, 2 for Retina).',
      ],
      allowedCategories: ['Basics', 'Hardware', 'Text', 'Logic'],
    },
    {
      id: 'ds-5',
      title: 'Full System Scan',
      description:
        'Print a full system report: platform, color depth, memory, and number of cores — each on its own line with a label like "Platform: " and the value.',
      difficulty: 'advanced',
      theme: 'device-scan',
      expectedOutput: ['device-dependent'],
      par: 13,
      hints: [
        'Use Join Text to combine a label string with each Hardware block\'s value.',
        'Print four lines: Platform, Color Depth, Memory, and Cores.',
      ],
      allowedCategories: ['Basics', 'Hardware', 'Text'],
    },
  ],
}
