import type { LabPack } from '../types'

export const matrices: LabPack = {
  id: 'lab-matrix',
  name: 'Matrices',
  description: 'Navigate and transform 2D arrays with classic matrix algorithms',
  icon: '🔲',
  color: '#78716c',
  exercises: [
    {
      id: 'lab-matrix-1',
      title: 'Print Matrix',
      description:
        'Print a 3×3 matrix row by row, with values in each row space-separated.\n\nMatrix:\n[[1,2,3],[4,5,6],[7,8,9]]\n\nExpected output:\n1 2 3\n4 5 6\n7 8 9',
      difficulty: 'beginner',
      expectedOutput: ['1 2 3', '4 5 6', '7 8 9'],
      starterCode: '// Print matrix rows\nvar matrix = [[1,2,3],[4,5,6],[7,8,9]];\n\n// print each row as space-separated values\n',
      hints: [
        'Loop over each row with a for loop',
        'Use row.join(" ") to produce space-separated values',
        'console.log(row.join(" ")) for each row',
      ],
    },
    {
      id: 'lab-matrix-2',
      title: 'Transpose',
      description:
        'Transpose a matrix (swap rows and columns).\n\nOriginal:\n[[1,2,3],[4,5,6],[7,8,9]]\n\nTransposed:\n[[1,4,7],[2,5,8],[3,6,9]]\n\nPrint each row of the transposed matrix, space-separated.',
      difficulty: 'beginner',
      expectedOutput: ['1 4 7', '2 5 8', '3 6 9'],
      starterCode: '// Transpose matrix\nvar matrix = [[1,2,3],[4,5,6],[7,8,9]];\nvar n = matrix.length;\nvar transposed = [];\n\n// transposed[j][i] = matrix[i][j]\n',
      hints: [
        'Create an empty n×n transposed array',
        'transposed[j][i] = matrix[i][j]',
        'Or: matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]))',
      ],
    },
    {
      id: 'lab-matrix-3',
      title: 'Rotate 90 Degrees',
      description:
        'Rotate a matrix 90 degrees clockwise.\n\nOriginal:\n[[1,2,3],[4,5,6],[7,8,9]]\n\nRotated 90° CW:\n[[7,4,1],[8,5,2],[9,6,3]]\n\nPrint each row of the rotated matrix, space-separated.',
      difficulty: 'intermediate',
      expectedOutput: ['7 4 1', '8 5 2', '9 6 3'],
      starterCode: '// Rotate matrix 90 degrees clockwise\nvar matrix = [[1,2,3],[4,5,6],[7,8,9]];\n\n// Step 1: transpose\n// Step 2: reverse each row\n',
      hints: [
        'Clockwise 90° = transpose then reverse each row',
        'First transpose: swap matrix[i][j] with matrix[j][i]',
        'Then reverse each row: matrix[i].reverse()',
      ],
    },
    {
      id: 'lab-matrix-4',
      title: 'Spiral Order',
      description:
        'Print the elements of a matrix in spiral order (clockwise from the outside in).\n\n[[1,2,3],[4,5,6],[7,8,9]] → 1,2,3,6,9,8,7,4,5\n\nPrint the spiral as comma-separated values.',
      difficulty: 'advanced',
      expectedOutput: ['1,2,3,6,9,8,7,4,5'],
      starterCode: '// Spiral order traversal\nvar matrix = [[1,2,3],[4,5,6],[7,8,9]];\n\nfunction spiral(m) {\n  var result = [];\n  var top = 0, bottom = m.length - 1;\n  var left = 0, right = m[0].length - 1;\n  while (top <= bottom && left <= right) {\n    // go right, down, left, up\n  }\n  return result;\n}\n\nconsole.log(spiral(matrix).join(","));\n',
      hints: [
        'Traverse right along top row, then down right col, then left along bottom row, then up left col',
        'After each direction, shrink the boundary (top++, right--, bottom--, left++)',
        'Continue while top <= bottom and left <= right',
      ],
    },
    {
      id: 'lab-matrix-5',
      title: 'Search in Sorted Matrix',
      description:
        'In a matrix where each row and column is sorted, search for a target.\n\nMatrix: [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]]\n\nSearch for 5 → true\nSearch for 20 → false\n\nPrint both results.',
      difficulty: 'advanced',
      expectedOutput: ['true', 'false'],
      starterCode: '// Search in sorted matrix\nvar matrix = [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]];\n\nfunction searchMatrix(m, target) {\n  // start at top-right corner\n  var row = 0, col = m[0].length - 1;\n  // move left if current > target, down if current < target\n}\n\nconsole.log(searchMatrix(matrix, 5));\nconsole.log(searchMatrix(matrix, 20));\n',
      hints: [
        'Start at the top-right corner (row=0, col=last)',
        'If matrix[row][col] === target return true',
        'If current value > target, move left (col--); if less, move down (row++)',
      ],
    },
  ],
}
