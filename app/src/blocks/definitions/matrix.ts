import type { BlockDefinition } from '../../types/block'

/**
 * Matrix blocks — 2D arrays with one-block ergonomics.
 *
 * Without these, every 2D operation (`grid[y][x]`) takes two nested list
 * blocks to read and three to write, which turns a procedural generator
 * into a drag-fest. These helpers make a 21×21 Pac-Man maze buildable in
 * blocks without losing your mind.
 */
export const matrixBlocks: BlockDefinition[] = [
  {
    name: 'make_matrix',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create a 2D matrix filled with a value',
    category: 'Matrix',
    inputs: [
      { name: 'cols', type: 'number', description: 'Number of columns' },
      { name: 'rows', type: 'number', description: 'Number of rows' },
      { name: 'fill', type: 'any', description: 'Initial value for every cell' },
    ],
    outputs: [{ name: 'matrix', type: 'any' }],
    implementations: {
      javascript: `function makeMatrix(cols, rows, fill) {\n  const m = [];\n  for (let y = 0; y < rows; y++) {\n    const row = [];\n    for (let x = 0; x < cols; x++) row.push(fill);\n    m.push(row);\n  }\n  return m;\n}`,
      python: `def make_matrix(cols, rows, fill):\n    return [[fill for _ in range(int(cols))] for _ in range(int(rows))]`,
    },
    tests: [
      { input: { cols: 3, rows: 2, fill: 0 }, expected: { matrix: 'any' } },
    ],
    color: '#D97706',
  },
  {
    name: 'matrix_get',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the value at column x, row y in a matrix',
    category: 'Matrix',
    inputs: [
      { name: 'matrix', type: 'any', description: 'The matrix to read from' },
      { name: 'x', type: 'number', description: 'Column index (0-based)' },
      { name: 'y', type: 'number', description: 'Row index (0-based)' },
    ],
    outputs: [{ name: 'value', type: 'any' }],
    implementations: {
      javascript: `function matrixGet(matrix, x, y) {\n  if (!Array.isArray(matrix) || !matrix[y]) return null;\n  return matrix[y][x];\n}`,
      python: `def matrix_get(matrix, x, y):\n    if not matrix or int(y) >= len(matrix) or int(y) < 0:\n        return None\n    row = matrix[int(y)]\n    if int(x) >= len(row) or int(x) < 0:\n        return None\n    return row[int(x)]`,
    },
    tests: [
      { input: { matrix: [[1, 2], [3, 4]], x: 1, y: 0 }, expected: { value: 2 } },
    ],
    color: '#D97706',
  },
  {
    name: 'matrix_set',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the value at column x, row y in a matrix',
    category: 'Matrix',
    inputs: [
      { name: 'matrix', type: 'any', description: 'The matrix to modify' },
      { name: 'x', type: 'number', description: 'Column index (0-based)' },
      { name: 'y', type: 'number', description: 'Row index (0-based)' },
      { name: 'value', type: 'any', description: 'Value to write' },
    ],
    outputs: [],
    implementations: {
      javascript: `function matrixSet(matrix, x, y, value) {\n  if (!Array.isArray(matrix) || !matrix[y]) return;\n  matrix[y][x] = value;\n}`,
      python: `def matrix_set(matrix, x, y, value):\n    if not matrix:\n        return\n    yi = int(y); xi = int(x)\n    if 0 <= yi < len(matrix) and 0 <= xi < len(matrix[yi]):\n        matrix[yi][xi] = value`,
    },
    tests: [
      { input: { matrix: [[1, 2]], x: 0, y: 0, value: 9 }, expected: {} },
    ],
    color: '#D97706',
    shape: 'statement',
  },
  {
    name: 'matrix_cols',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'How many columns are in a matrix',
    category: 'Matrix',
    inputs: [
      { name: 'matrix', type: 'any', description: 'The matrix to measure' },
    ],
    outputs: [{ name: 'cols', type: 'number' }],
    implementations: {
      javascript: `function matrixCols(matrix) {\n  if (!Array.isArray(matrix) || !matrix[0]) return 0;\n  return matrix[0].length;\n}`,
      python: `def matrix_cols(matrix):\n    return len(matrix[0]) if matrix and matrix[0] is not None else 0`,
    },
    tests: [
      { input: { matrix: [[1, 2, 3], [4, 5, 6]] }, expected: { cols: 3 } },
    ],
    color: '#D97706',
  },
  {
    name: 'matrix_rows',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'How many rows are in a matrix',
    category: 'Matrix',
    inputs: [
      { name: 'matrix', type: 'any', description: 'The matrix to measure' },
    ],
    outputs: [{ name: 'rows', type: 'number' }],
    implementations: {
      javascript: `function matrixRows(matrix) {\n  return Array.isArray(matrix) ? matrix.length : 0;\n}`,
      python: `def matrix_rows(matrix):\n    return len(matrix) if matrix else 0`,
    },
    tests: [
      { input: { matrix: [[1], [2], [3]] }, expected: { rows: 3 } },
    ],
    color: '#D97706',
  },
  {
    name: 'transpose_matrix',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Transpose a named matrix variable (swap rows and columns)',
    category: 'Matrix',
    inputs: [
      { name: 'name', type: 'string', description: 'Name of the matrix variable to transpose' },
    ],
    outputs: [],
    implementations: {
      javascript: `function transposeMatrix(name) {\n  window.__vars = window.__vars || {};\n  const m = window.__vars[name];\n  if (!Array.isArray(m) || !Array.isArray(m[0])) return;\n  window.__vars[name] = m[0].map(function(_, i) { return m.map(function(row) { return row[i]; }); });\n}`,
      python: `def transpose_matrix(name):\n    m = globals().get(name, [])\n    if m and isinstance(m[0], list):\n        globals()[name] = [list(row) for row in zip(*m)]`,
    },
    tests: [
      { input: { name: 'matrix' }, expected: {} },
    ],
    color: '#D97706',
    shape: 'statement',
  },
]
