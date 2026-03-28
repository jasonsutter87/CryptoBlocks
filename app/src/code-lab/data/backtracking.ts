import type { LabPack } from '../types'

export const backtracking: LabPack = {
  id: 'lab-bt',
  name: 'Backtracking',
  description: 'Explore all possibilities by building solutions incrementally and pruning dead ends',
  icon: '🔙',
  color: '#ec4899',
  exercises: [
    {
      id: 'lab-bt-1',
      title: 'Generate Parentheses',
      description:
        'Generate all valid combinations of n pairs of parentheses.\n\nFor n=2: ["(())", "()()"]\nFor n=3: 5 combinations\n\nPrint the COUNT of valid combinations for n=4.',
      difficulty: 'beginner',
      expectedOutput: ['14'],
      starterCode: '// Generate parentheses — count valid combinations\nfunction countParens(n) {\n  var count = 0;\n  function bt(open, close, current) {\n    if (current.length === 2 * n) {\n      count++;\n      return;\n    }\n    // add "(" if open < n\n    // add ")" if close < open\n  }\n  bt(0, 0, "");\n  return count;\n}\n\nconsole.log(countParens(4));\n',
      hints: [
        'Track open and close counts; you can add "(" if open < n',
        'You can add ")" only if close < open (more opens than closes)',
        'When current.length === 2*n, count it as valid',
      ],
    },
    {
      id: 'lab-bt-2',
      title: 'Subsets',
      description:
        'Generate all subsets (the power set) of [1,2,3].\n\nThere are 2^3 = 8 subsets including the empty set.\n\nPrint each subset as comma-separated values (empty subset as empty line), one per line, in order of generation.',
      difficulty: 'beginner',
      expectedOutput: ['', '1', '1,2', '1,2,3', '1,3', '2', '2,3', '3'],
      starterCode: '// Subsets — power set\nfunction subsets(arr) {\n  var result = [];\n  function bt(start, current) {\n    result.push(current.slice());\n    for (var i = start; i < arr.length; i++) {\n      current.push(arr[i]);\n      bt(i + 1, current);\n      current.pop();\n    }\n  }\n  bt(0, []);\n  return result;\n}\n\nvar sets = subsets([1,2,3]);\nsets.forEach(s => console.log(s.join(",")));\n',
      hints: [
        'At each step, add the current subset to results, then try adding each remaining element',
        'Recurse with i + 1 so we do not reuse elements',
        'After recursing, pop the last element (backtrack)',
      ],
    },
    {
      id: 'lab-bt-3',
      title: 'Permutations',
      description:
        'Generate all permutations of [1,2,3].\n\nThere are 3! = 6 permutations.\n\nPrint each permutation as comma-separated values, one per line.',
      difficulty: 'intermediate',
      expectedOutput: ['1,2,3', '1,3,2', '2,1,3', '2,3,1', '3,1,2', '3,2,1'],
      starterCode: '// Permutations\nfunction permutations(arr) {\n  var result = [];\n  function bt(current, remaining) {\n    if (remaining.length === 0) {\n      result.push(current.slice());\n      return;\n    }\n    for (var i = 0; i < remaining.length; i++) {\n      // pick remaining[i], recurse without it\n    }\n  }\n  bt([], arr);\n  return result;\n}\n\nvar perms = permutations([1,2,3]);\nperms.forEach(p => console.log(p.join(",")));\n',
      hints: [
        'At each step, pick one element from "remaining" and add it to "current"',
        'Pass a new remaining array without the picked element',
        'When remaining is empty, push current to result',
      ],
    },
    {
      id: 'lab-bt-4',
      title: 'N-Queens Count',
      description:
        'Count the number of ways to place N queens on an N×N board so no two queens attack each other.\n\nnQueens(4) = 2\nnQueens(6) = 4\n\nPrint both results.',
      difficulty: 'advanced',
      expectedOutput: ['2', '4'],
      starterCode: '// N-Queens — count solutions\nfunction nQueens(n) {\n  var count = 0;\n  var cols = new Set(), diag1 = new Set(), diag2 = new Set();\n  function bt(row) {\n    if (row === n) { count++; return; }\n    for (var col = 0; col < n; col++) {\n      // check if placing a queen at (row, col) is safe\n    }\n  }\n  bt(0);\n  return count;\n}\n\nconsole.log(nQueens(4));\nconsole.log(nQueens(6));\n',
      hints: [
        'A queen at (row, col) is blocked if col, row-col, or row+col is already used',
        'Use three sets: cols, diag1 (row-col), diag2 (row+col) to track attacks',
        'Add to sets before recursing, remove after (backtrack)',
      ],
    },
    {
      id: 'lab-bt-5',
      title: 'Word Search',
      description:
        'Given a 2D grid and a word, determine if the word exists in the grid by following adjacent cells (up/down/left/right). Cannot reuse a cell.\n\nGrid:\n["ABCDE",\n "FGHIJ",\n "KLMNO"]\n\nSearch for "BGHM" — print true\nSearch for "BFKL" — print true\nSearch for "ABFG" — print false (A and B are not adjacent to F via a valid path without reuse)',
      difficulty: 'advanced',
      expectedOutput: ['true', 'true', 'false'],
      starterCode: '// Word search in grid\nvar grid = ["ABCDE","FGHIJ","KLMNO"].map(r => r.split(""));\n\nfunction wordSearch(grid, word) {\n  var rows = grid.length, cols = grid[0].length;\n  function dfs(r, c, idx) {\n    if (idx === word.length) return true;\n    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;\n    if (grid[r][c] !== word[idx]) return false;\n    var temp = grid[r][c];\n    grid[r][c] = "#"; // mark visited\n    var found = dfs(r+1,c,idx+1) || dfs(r-1,c,idx+1) || dfs(r,c+1,idx+1) || dfs(r,c-1,idx+1);\n    grid[r][c] = temp; // restore\n    return found;\n  }\n  for (var r = 0; r < rows; r++)\n    for (var c = 0; c < cols; c++)\n      if (dfs(r, c, 0)) return true;\n  return false;\n}\n\nconsole.log(wordSearch(grid, "BGHM"));\nconsole.log(wordSearch(grid, "BFKL"));\nconsole.log(wordSearch(grid, "ABFG"));\n',
      hints: [
        'Start DFS from every cell that matches the first character',
        'Mark the cell as visited (e.g., "#") before recursing, restore after',
        'ABFG is false because after A(0,0)->B(0,1) you cannot reach F(1,0) without reusing a cell in sequence',
      ],
    },
  ],
}
