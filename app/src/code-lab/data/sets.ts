import type { LabPack } from '../types'

export const sets: LabPack = {
  id: 'lab-set',
  name: 'Sets',
  description: 'Master set operations: union, intersection, difference, and more',
  icon: '🔵',
  color: '#3b82f6',
  exercises: [
    {
      id: 'lab-set-1',
      title: 'Union',
      description:
        'Find the union of two arrays (all unique elements from both).\n\nunion([1,2,3], [3,4,5]) = [1,2,3,4,5]\n\nPrint the union of [1,3,5,7] and [2,3,6,7] as comma-separated values, sorted ascending.',
      difficulty: 'beginner',
      expectedOutput: ['1,2,3,5,6,7'],
      starterCode: '// Set union\nfunction union(a, b) {\n  // combine and deduplicate\n}\n\nconsole.log(union([1,3,5,7], [2,3,6,7]).sort((x,y) => x-y).join(","));\n',
      hints: [
        'Combine both arrays with concat',
        'Use a Set to remove duplicates: new Set(a.concat(b))',
        'Spread back to array: [...new Set(a.concat(b))]',
      ],
    },
    {
      id: 'lab-set-2',
      title: 'Intersection',
      description:
        'Find the intersection of two arrays (elements present in both).\n\nintersection([1,2,3,4], [3,4,5,6]) = [3,4]\n\nPrint the intersection of [1,3,5,7,9] and [2,3,4,5,6] as comma-separated values, sorted ascending.',
      difficulty: 'beginner',
      expectedOutput: ['3,5'],
      starterCode: '// Set intersection\nfunction intersection(a, b) {\n  var setB = new Set(b);\n  // filter a to keep only elements in setB\n}\n\nconsole.log(intersection([1,3,5,7,9], [2,3,4,5,6]).sort((x,y) => x-y).join(","));\n',
      hints: [
        'Convert b to a Set for O(1) lookup',
        'Filter array a: a.filter(x => setB.has(x))',
        'Use another Set on the result to avoid duplicates if a has repeats',
      ],
    },
    {
      id: 'lab-set-3',
      title: 'Difference',
      description:
        'Find the difference A - B (elements in A but not in B).\n\ndifference([1,2,3,4,5], [3,4]) = [1,2,5]\n\nPrint the difference of [1,2,3,4,5,6] and [2,4,6] as comma-separated values.',
      difficulty: 'beginner',
      expectedOutput: ['1,3,5'],
      starterCode: '// Set difference (A - B)\nfunction difference(a, b) {\n  var setB = new Set(b);\n  // filter a to keep only elements NOT in setB\n}\n\nconsole.log(difference([1,2,3,4,5,6], [2,4,6]).join(","));\n',
      hints: [
        'Convert b to a Set',
        'Filter array a: a.filter(x => !setB.has(x))',
        'The result contains elements unique to A',
      ],
    },
    {
      id: 'lab-set-4',
      title: 'Is Subset',
      description:
        'Determine if array A is a subset of array B (every element of A is in B).\n\nisSubset([1,3], [1,2,3,4]) = true\nisSubset([1,5], [1,2,3,4]) = false\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['true', 'false'],
      starterCode: '// Is subset\nfunction isSubset(a, b) {\n  var setB = new Set(b);\n  // every element of a must be in setB\n}\n\nconsole.log(isSubset([1,3], [1,2,3,4]));\nconsole.log(isSubset([1,5], [1,2,3,4]));\n',
      hints: [
        'Convert b to a Set for O(1) lookup',
        'Use a.every(x => setB.has(x))',
        'If every element of a is in setB, return true',
      ],
    },
    {
      id: 'lab-set-5',
      title: 'Unique Elements Count',
      description:
        'Given two arrays, count the total number of elements that appear in exactly one of them (symmetric difference).\n\nsymDiffCount([1,2,3,4], [3,4,5,6]) = 4  (1,2,5,6)\n\nPrint the symmetric difference count for [1,2,3,4,5] and [4,5,6,7,8].',
      difficulty: 'intermediate',
      expectedOutput: ['6'],
      starterCode: '// Symmetric difference count\nfunction symDiffCount(a, b) {\n  // elements in A but not B, plus elements in B but not A\n}\n\nconsole.log(symDiffCount([1,2,3,4,5], [4,5,6,7,8]));\n',
      hints: [
        'Symmetric difference = (A - B) union (B - A)',
        'Convert both to Sets, then filter each against the other',
        'Count the total elements in both differences',
      ],
    },
  ],
}
