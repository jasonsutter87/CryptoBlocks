import type { ThemePack } from '../types'

export const pixelArt: ThemePack = {
  id: 'pixel-art',
  name: 'Pixel Art',
  description: 'Draw shapes, patterns, and pictures on the canvas',
  icon: '🎨',
  color: '#9333EA',
  challenges: [
    {
      id: 'pa-1',
      title: 'Blank Canvas',
      description:
        'Set up a 400x400 white canvas. Print "Canvas ready!" to confirm.',
      difficulty: 'beginner',
      theme: 'pixel-art',
      expectedOutput: ['Canvas ready!'],
      par: 3,
      hints: [
        'Use the Set Canvas block with width=400, height=400, color="white".',
        'After setting up the canvas, use Print "Canvas ready!".',
      ],
      allowedCategories: ['Basics', 'Art', 'Text'],
    },
    {
      id: 'pa-2',
      title: 'Red Square',
      description:
        'Set up a 400x400 white canvas, then draw a red rectangle at position (50, 50) that is 100x100 pixels. Print "Drawn!".',
      difficulty: 'beginner',
      theme: 'pixel-art',
      expectedOutput: ['Drawn!'],
      par: 4,
      hints: [
        'Use Set Canvas first, then Draw Rect with x=50, y=50, width=100, height=100, color="red".',
        'End with a Print block to confirm.',
      ],
      allowedCategories: ['Basics', 'Art', 'Text'],
    },
    {
      id: 'pa-3',
      title: 'Traffic Light',
      description:
        'Draw a traffic light: set up a 100x300 canvas with a black background. Draw three circles stacked vertically — red at (50,50), yellow at (50,150), green at (50,250) — each with radius 30. Print "Stop!".',
      difficulty: 'intermediate',
      theme: 'pixel-art',
      expectedOutput: ['Stop!'],
      par: 7,
      hints: [
        'Set Canvas 100x300 "black". Then draw 3 circles at different Y positions.',
        'Draw Circle at (50,50) red, (50,150) yellow, (50,250) green. Each radius 30.',
      ],
      allowedCategories: ['Basics', 'Art', 'Text', 'Math'],
    },
    {
      id: 'pa-4',
      title: 'Stripe Flag',
      description:
        'Create a 300x200 canvas. Draw three horizontal stripes: red at top (0,0 size 300x67), white in middle (0,67 size 300x66), blue at bottom (0,133 size 300x67). Print "Flag done!".',
      difficulty: 'intermediate',
      theme: 'pixel-art',
      expectedOutput: ['Flag done!'],
      par: 6,
      hints: [
        'Use Set Canvas 300x200, then three Draw Rect blocks stacked vertically.',
        'Red rect at (0,0) 300x67, white rect at (0,67) 300x66, blue rect at (0,133) 300x67.',
      ],
      allowedCategories: ['Basics', 'Art', 'Text', 'Math'],
    },
    {
      id: 'pa-5',
      title: 'Art Gallery',
      description:
        'Create a 400x400 "white" canvas. Use a repeat loop to draw 5 circles in a row, spaced 80 pixels apart starting at x=40. All circles have y=200, radius 30, and color "blue". Print "Gallery open!" when done.',
      difficulty: 'advanced',
      theme: 'pixel-art',
      expectedOutput: ['Gallery open!'],
      par: 8,
      hints: [
        'Use a counter variable: Set Global "i" to 0, then repeat 5 times.',
        'Inside the loop: Draw Circle at x = 40 + Get Global "i" * 80, y = 200. Increment i by 1 each time.',
      ],
      allowedCategories: ['Basics', 'Art', 'Text', 'Math'],
    },
  ],
}
