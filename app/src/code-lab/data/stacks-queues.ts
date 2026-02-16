import type { LabPack } from '../types'

export const stacksQueues: LabPack = {
  id: 'lab-stacks-queues',
  name: 'Stacks & Queues',
  description: 'Master LIFO and FIFO data structures',
  icon: '📚',
  color: '#f43f5e',
  exercises: [
    {
      id: 'lab-sq-1',
      title: 'Build a Stack',
      description:
        'Implement a stack using an array. A stack is Last-In-First-Out (LIFO).\n\nPush 10, 20, 30 onto the stack. Then pop twice and print each popped value. Finally print what\'s left on the stack.',
      difficulty: 'beginner',
      expectedOutput: ['30', '20', '10'],
      starterCode:
        '// Stack: Last-In-First-Out\nvar stack = [];\n\n// push(value) adds to top\n// pop() removes from top\n',
      hints: [
        'push() adds to the end of the array (top of stack)',
        'pop() removes from the end of the array',
        'After pushing 10, 20, 30 and popping twice, only 10 remains',
      ],
    },
    {
      id: 'lab-sq-2',
      title: 'Build a Queue',
      description:
        'Implement a queue using an array. A queue is First-In-First-Out (FIFO).\n\nEnqueue "Alice", "Bob", "Charlie". Dequeue twice and print each. Then print who\'s left.',
      difficulty: 'beginner',
      expectedOutput: ['Alice', 'Bob', 'Charlie'],
      starterCode:
        '// Queue: First-In-First-Out\nvar queue = [];\n\n// enqueue(value) adds to back\n// dequeue() removes from front\n',
      hints: [
        'enqueue: use push() to add to the end',
        'dequeue: use shift() to remove from the front',
        'After enqueueing 3 and dequeueing 2, only "Charlie" remains',
      ],
    },
    {
      id: 'lab-sq-3',
      title: 'Balanced Parentheses',
      description:
        'Use a stack to check if parentheses are balanced.\n\nCheck these strings and print "true" or "false" for each:\n1. "(())" \n2. "(()"\n3. "(()(()))"\n4. ")("',
      difficulty: 'intermediate',
      expectedOutput: ['true', 'false', 'true', 'false'],
      starterCode:
        '// Check balanced parentheses using a stack\nvar tests = ["(())", "(()", "(()(()))", ")("];\n',
      hints: [
        'Push "(" onto stack. When you see ")", pop from stack.',
        'If you try to pop from an empty stack, it\'s unbalanced.',
        'At the end, if the stack isn\'t empty, it\'s unbalanced.',
      ],
    },
    {
      id: 'lab-sq-4',
      title: 'Undo System',
      description:
        'Build a simple undo system using two stacks: actions and undone.\n\nPerform actions: "type A", "type B", "type C"\nUndo once (should undo "type C")\nPerform: "type D"\nUndo twice (should undo "type D" then "type B")\n\nPrint the remaining actions in order.',
      difficulty: 'intermediate',
      expectedOutput: ['type A'],
      starterCode:
        '// Undo system with two stacks\nvar actions = [];\nvar undone = [];\n\nfunction doAction(action) {\n  actions.push(action);\n  undone = []; // clear redo stack\n}\n\nfunction undo() {\n  if (actions.length > 0) {\n    undone.push(actions.pop());\n  }\n}\n',
      hints: [
        'doAction pushes to actions stack and clears the undo stack',
        'undo() pops from actions and pushes to undone',
        'After all operations, print what remains in actions',
      ],
    },
    {
      id: 'lab-sq-5',
      title: 'Hot Potato',
      description:
        'Simulate the Hot Potato game using a queue.\n\nPlayers: ["Alice", "Bob", "Charlie", "Diana", "Eve"]\nEach round, rotate the queue 3 times (dequeue from front, enqueue to back), then eliminate the person at the front.\n\nPrint each eliminated person. The last person standing wins — print "Winner: " and their name.',
      difficulty: 'advanced',
      expectedOutput: ['Diana', 'Charlie', 'Eve', 'Bob', 'Winner: Alice'],
      starterCode:
        '// Hot Potato: rotate 3, eliminate front\nvar players = ["Alice", "Bob", "Charlie", "Diana", "Eve"];\nvar rotations = 3;\n',
      hints: [
        'Each round: rotate by moving front to back N times, then remove the new front',
        'Rotate: dequeue (shift) and enqueue (push) the same person',
        'Keep going until only 1 player remains',
      ],
    },
  ],
}
