import type { LabPack } from '../types'

export const linkedLists: LabPack = {
  id: 'lab-linked-lists',
  name: 'Linked Lists',
  description: 'Build, traverse, and manipulate linked lists from scratch',
  icon: '🔗',
  color: '#e879f9',
  exercises: [
    {
      id: 'lab-ll-1',
      title: 'Build a List',
      description:
        'Create a linked list from scratch using objects.\n\nEach node has a `value` and a `next` pointer. Build a list: 1 → 2 → 3 → null\n\nThen traverse it and print each value on its own line.',
      difficulty: 'beginner',
      expectedOutput: ['1', '2', '3'],
      starterCode:
        '// Build a linked list: 1 → 2 → 3 → null\n// Each node is { value: ..., next: ... }\n',
      hints: [
        'Create three node objects: {value: 1, next: null}, {value: 2, next: null}, etc.',
        'Link them: node1.next = node2, node2.next = node3',
        'Traverse: var current = head; while (current !== null) { print, move to current.next }',
      ],
    },
    {
      id: 'lab-ll-2',
      title: 'Length & Tail',
      description:
        'Build the list 10 → 20 → 30 → 40 → null.\n\nWrite code to:\n1. Count the number of nodes and print it\n2. Find the last node (tail) and print its value',
      difficulty: 'beginner',
      expectedOutput: ['4', '40'],
      starterCode:
        '// Build list: 10 → 20 → 30 → 40 → null\nfunction makeNode(value, next) {\n  return { value: value, next: next };\n}\n\nvar head = makeNode(10, makeNode(20, makeNode(30, makeNode(40, null))));\n',
      hints: [
        'Length: traverse with a counter, increment for each node',
        'Tail: traverse until current.next === null',
        'Both require a while loop walking through the list',
      ],
    },
    {
      id: 'lab-ll-3',
      title: 'Insert & Delete',
      description:
        'Start with list: 1 → 2 → 3 → 4 → null\n\n1. Insert 99 after the node with value 2 (so it becomes 1 → 2 → 99 → 3 → 4)\n2. Delete the node with value 3 (so it becomes 1 → 2 → 99 → 4)\n3. Print each value in the final list.',
      difficulty: 'intermediate',
      expectedOutput: ['1', '2', '99', '4'],
      starterCode:
        '// Start: 1 → 2 → 3 → 4 → null\nfunction makeNode(value, next) {\n  return { value: value, next: next };\n}\n\nvar head = makeNode(1, makeNode(2, makeNode(3, makeNode(4, null))));\n',
      hints: [
        'Insert after node X: create new node, set newNode.next = X.next, then X.next = newNode',
        'Delete node with value V: find the node BEFORE it, set prev.next = prev.next.next',
        'Traverse to find the right nodes first, then rewire the pointers',
      ],
    },
    {
      id: 'lab-ll-4',
      title: 'Reverse a List',
      description:
        'Reverse the linked list 1 → 2 → 3 → 4 → 5 → null in place.\n\nThe result should be 5 → 4 → 3 → 2 → 1 → null.\n\nPrint each value in the reversed list.',
      difficulty: 'intermediate',
      expectedOutput: ['5', '4', '3', '2', '1'],
      starterCode:
        '// Reverse: 1 → 2 → 3 → 4 → 5 → null\nfunction makeNode(value, next) {\n  return { value: value, next: next };\n}\n\nvar head = makeNode(1, makeNode(2, makeNode(3, makeNode(4, makeNode(5, null)))));\n',
      hints: [
        'Use three pointers: prev = null, current = head, next = null',
        'In each step: save next, point current.next to prev, advance prev and current',
        'When current is null, prev is the new head of the reversed list',
      ],
    },
    {
      id: 'lab-ll-5',
      title: 'Detect a Cycle',
      description:
        'Use Floyd\'s Tortoise and Hare algorithm to detect a cycle in a linked list.\n\nBuild list: 1 → 2 → 3 → 4 → 5 → back to node 3 (a cycle!)\n\nThe slow pointer moves 1 step, the fast pointer moves 2 steps. If they meet, there\'s a cycle.\n\nPrint "Cycle detected!" if a cycle exists, then print the value where the slow and fast pointers met.',
      difficulty: 'advanced',
      expectedOutput: ['Cycle detected!', '5'],
      starterCode:
        '// Floyd\'s Cycle Detection (Tortoise and Hare)\nfunction makeNode(value, next) {\n  return { value: value, next: next };\n}\n\n// Build: 1 → 2 → 3 → 4 → 5 → (back to 3)\nvar node1 = makeNode(1, null);\nvar node2 = makeNode(2, null);\nvar node3 = makeNode(3, null);\nvar node4 = makeNode(4, null);\nvar node5 = makeNode(5, null);\nnode1.next = node2;\nnode2.next = node3;\nnode3.next = node4;\nnode4.next = node5;\nnode5.next = node3; // creates the cycle!\n\nvar head = node1;\n',
      hints: [
        'Start slow = head, fast = head',
        'Move slow one step (slow = slow.next), fast two steps (fast = fast.next.next)',
        'If slow === fast, cycle detected! Print the meeting value. Check fast && fast.next before moving.',
      ],
    },
  ],
}
