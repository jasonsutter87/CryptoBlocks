import type { LabPack } from '../types'

export const trees: LabPack = {
  id: 'lab-trees',
  name: 'Trees',
  description: 'Build binary search trees and master tree traversals',
  icon: '🌳',
  color: '#22c55e',
  exercises: [
    {
      id: 'lab-t-1',
      title: 'Build a BST',
      description:
        'Build a Binary Search Tree by inserting these values in order: 5, 3, 7, 1, 4, 6, 8.\n\nIn a BST, smaller values go left, larger go right.\n\nAfter building, print the root value, then the left child, then the right child.',
      difficulty: 'beginner',
      expectedOutput: ['5', '3', '7'],
      starterCode:
        '// Binary Search Tree\nfunction makeNode(value) {\n  return { value: value, left: null, right: null };\n}\n\nvar values = [5, 3, 7, 1, 4, 6, 8];\n',
      hints: [
        'First value (5) becomes the root',
        'For each new value, start at root: go left if smaller, right if larger',
        'When you reach null, insert the new node there',
      ],
    },
    {
      id: 'lab-t-2',
      title: 'In-Order Traversal',
      description:
        'Build a BST from [5, 3, 7, 1, 4, 6, 8], then perform an in-order traversal.\n\nIn-order visits: left subtree, then node, then right subtree.\n\nFor a BST, in-order traversal prints values in sorted order!\n\nPrint each value on its own line.',
      difficulty: 'beginner',
      expectedOutput: ['1', '3', '4', '5', '6', '7', '8'],
      starterCode:
        '// In-order traversal: Left, Node, Right\nfunction makeNode(value) {\n  return { value: value, left: null, right: null };\n}\n\nfunction insert(root, value) {\n  if (!root) return makeNode(value);\n  if (value < root.value) root.left = insert(root.left, value);\n  else root.right = insert(root.right, value);\n  return root;\n}\n\nvar values = [5, 3, 7, 1, 4, 6, 8];\nvar root = null;\nfor (var i = 0; i < values.length; i++) {\n  root = insert(root, values[i]);\n}\n',
      hints: [
        'Write a recursive function: inOrder(node)',
        'Base case: if node is null, return',
        'Recursive: inOrder(left), print node.value, inOrder(right)',
      ],
    },
    {
      id: 'lab-t-3',
      title: 'Pre & Post Order',
      description:
        'Using the same BST [5, 3, 7, 1, 4, 6, 8], perform:\n\n1. Pre-order traversal (Node, Left, Right) — print as comma-separated\n2. Post-order traversal (Left, Right, Node) — print as comma-separated',
      difficulty: 'intermediate',
      expectedOutput: ['5,3,1,4,7,6,8', '1,4,3,6,8,7,5'],
      starterCode:
        '// Pre-order and Post-order traversals\nfunction makeNode(value) {\n  return { value: value, left: null, right: null };\n}\n\nfunction insert(root, value) {\n  if (!root) return makeNode(value);\n  if (value < root.value) root.left = insert(root.left, value);\n  else root.right = insert(root.right, value);\n  return root;\n}\n\nvar values = [5, 3, 7, 1, 4, 6, 8];\nvar root = null;\nfor (var i = 0; i < values.length; i++) {\n  root = insert(root, values[i]);\n}\n',
      hints: [
        'Pre-order: print node FIRST, then go left, then right',
        'Post-order: go left, go right, then print node LAST',
        'Collect values in an array, then join with commas',
      ],
    },
    {
      id: 'lab-t-4',
      title: 'Tree Depth',
      description:
        'Find the maximum depth (height) of the BST built from [5, 3, 7, 1, 4, 6, 8].\n\nDepth = longest path from root to a leaf. A single node has depth 1. An empty tree has depth 0.\n\nPrint the depth.',
      difficulty: 'intermediate',
      expectedOutput: ['3'],
      starterCode:
        '// Find the maximum depth of a BST\nfunction makeNode(value) {\n  return { value: value, left: null, right: null };\n}\n\nfunction insert(root, value) {\n  if (!root) return makeNode(value);\n  if (value < root.value) root.left = insert(root.left, value);\n  else root.right = insert(root.right, value);\n  return root;\n}\n\nvar values = [5, 3, 7, 1, 4, 6, 8];\nvar root = null;\nfor (var i = 0; i < values.length; i++) {\n  root = insert(root, values[i]);\n}\n',
      hints: [
        'Write a recursive function: depth(node)',
        'Base case: if node is null, return 0',
        'Recursive: return 1 + max(depth(left), depth(right))',
      ],
    },
    {
      id: 'lab-t-5',
      title: 'BST Search & Validate',
      description:
        'Build a BST from [8, 3, 10, 1, 6, 14, 4, 7, 13].\n\n1. Search for 6 — print "Found 6" or "Not found"\n2. Search for 11 — print "Found 11" or "Not found"\n3. Validate that the tree is a valid BST — print "Valid BST" or "Invalid BST"',
      difficulty: 'advanced',
      expectedOutput: ['Found 6', 'Not found', 'Valid BST'],
      starterCode:
        '// BST Search and Validation\nfunction makeNode(value) {\n  return { value: value, left: null, right: null };\n}\n\nfunction insert(root, value) {\n  if (!root) return makeNode(value);\n  if (value < root.value) root.left = insert(root.left, value);\n  else root.right = insert(root.right, value);\n  return root;\n}\n\nvar values = [8, 3, 10, 1, 6, 14, 4, 7, 13];\nvar root = null;\nfor (var i = 0; i < values.length; i++) {\n  root = insert(root, values[i]);\n}\n',
      hints: [
        'Search: start at root. If value < node, go left. If value > node, go right. If equal, found!',
        'Validate: use a helper isValid(node, min, max) that checks bounds recursively',
        'For validation, every left child must be less than parent, every right child must be greater',
      ],
    },
  ],
}
