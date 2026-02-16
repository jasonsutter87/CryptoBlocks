import type { ThemePack } from '../types'

export const arcadeMode: ThemePack = {
  id: 'arcade-mode',
  name: 'Arcade Mode',
  description: 'Build games with sprites, collisions, and scoring',
  icon: '🕹️',
  color: '#EA580C',
  challenges: [
    {
      id: 'am-1',
      title: 'Spawn a Hero',
      description:
        'Create a sprite called "hero" at position (50, 50) with size 30x30 and color "#89b4fa". Then draw all sprites and print "Hero ready!".',
      difficulty: 'beginner',
      theme: 'arcade-mode',
      expectedOutput: ['Hero ready!'],
      par: 4,
      hints: [
        'Use Create Sprite with name "hero", x=50, y=50, width=30, height=30, color="#89b4fa".',
        'After creating the sprite, use Draw All Sprites, then Print "Hero ready!".',
      ],
      allowedCategories: ['Basics', 'Games', 'Text'],
    },
    {
      id: 'am-2',
      title: 'Move It!',
      description:
        'Create a sprite "player" at (10, 10), size 20x20, color "#a6e3a1". Move it right by 100 pixels. Print the new X position.',
      difficulty: 'beginner',
      theme: 'arcade-mode',
      expectedOutput: ['110'],
      par: 5,
      hints: [
        'Use Move Sprite with dx=100 and dy=0 to move right.',
        'After moving, use Get Sprite X to read the new position and Print it.',
      ],
      allowedCategories: ['Basics', 'Games', 'Text', 'Math'],
    },
    {
      id: 'am-3',
      title: 'Score Keeper',
      description:
        'Set the score to 0. Then add 10 to the score three times using a repeat loop. Print the final score.',
      difficulty: 'intermediate',
      theme: 'arcade-mode',
      expectedOutput: ['30'],
      par: 6,
      hints: [
        'Use Set Score to initialize to 0, then inside a Repeat(3) loop, set score to Get Score + 10.',
        'After the loop, Print the result of Get Score.',
      ],
      allowedCategories: ['Basics', 'Games', 'Math'],
    },
    {
      id: 'am-4',
      title: 'Collision Course',
      description:
        'Create sprite "a" at (0, 0) size 50x50 color "#f38ba8". Create sprite "b" at (25, 25) size 50x50 color "#89b4fa". Check if they\'re touching. Print "CRASH!" if yes, "Safe" if no.',
      difficulty: 'intermediate',
      theme: 'arcade-mode',
      expectedOutput: ['CRASH!'],
      par: 8,
      hints: [
        'Two sprites overlap if their bounding boxes intersect. These two start overlapping.',
        'Use Sprites Touching with "a" and "b", then If Then to print the right message.',
      ],
      allowedCategories: ['Basics', 'Games', 'Text', 'Logic'],
    },
    {
      id: 'am-5',
      title: 'Game Over',
      description:
        'Create "player" at (0,0) size 20x20 color "#a6e3a1". Create "wall" at (200,0) size 20x20 color "#f38ba8". Move the player right by 50 pixels 4 times using a repeat loop. After EACH move, check collision with "wall". If touching, print "Game Over" and set score to the step number (1-4). After the loop, print the final score.',
      difficulty: 'advanced',
      theme: 'arcade-mode',
      expectedOutput: ['Game Over', '4'],
      par: 14,
      hints: [
        'Inside the repeat loop: Move Sprite, then check Sprites Touching.',
        'Use Set Score to track which step the collision happens on. After 4 moves of 50px, player is at x=200, touching wall.',
      ],
      allowedCategories: ['Basics', 'Games', 'Text', 'Math', 'Logic'],
    },
  ],
}
