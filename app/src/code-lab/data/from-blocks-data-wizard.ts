import type { LabPack } from '../types'

export const fromBlocksDataWizard: LabPack = {
  id: 'from-blocks-data-wizard',
  name: 'From Blocks: Data Wizard',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '🗄️',
  color: '#2563EB',
  exercises: [
    {
      id: 'lab-fb-dw-1',
      title: 'First Table',
      description:
        'You already solved this with blocks — Create Table, Insert Row, Print Table. Now do the same in JavaScript.\n\nSimulate a simple table for students with columns "name" and "grade". Insert one row: "Alice, A". Print the table in the expected box-drawing format.',
      difficulty: 'beginner',
      expectedOutput: [
        '+-------+-------+',
        '| name  | grade |',
        '+-------+-------+',
        '| Alice | A     |',
        '+-------+-------+',
      ],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Print a formatted table with columns "name" and "grade"\n// and one row: Alice, A\n',
      hints: [
        'Print each line of the table using console.log().',
        'The separator line is "+-------+-------+".',
        'Column headers and data rows use "| value |" format with padding.',
        'You can hardcode each line — no fancy table library needed.',
      ],
    },
    {
      id: 'lab-fb-dw-2',
      title: 'Class Roster',
      description:
        'You already solved this with blocks — Create Table, Insert two rows, Count Rows. Now do the same in JavaScript.\n\nCreate an array of student objects with name and age. Add "Alice, 14" and "Bob, 15". Print the number of rows (students).',
      difficulty: 'beginner',
      expectedOutput: ['2'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Create an array of students, add 2 entries, print the count\n',
      hints: [
        'Use an array: var students = [];',
        'Push objects: students.push({ name: "Alice", age: 14 });',
        'console.log(students.length) gives the count.',
      ],
    },
    {
      id: 'lab-fb-dw-3',
      title: 'Query Time',
      description:
        'You already solved this with blocks — Create Table with scores, then Get Column. Now do the same in JavaScript.\n\nCreate an array of score objects for Alice (90), Bob (85), Charlie (90). Extract all the "points" values and print them as a comma-separated string.',
      difficulty: 'intermediate',
      expectedOutput: ['90,85,90'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Extract the "points" column from an array of score objects and print as CSV\n',
      hints: [
        'Create an array of objects: [{ name: "Alice", points: 90 }, ...]',
        'Use .map() to extract the points: scores.map(function(r) { return r.points; })',
        'Join with commas: .join(",") and pass to console.log().',
      ],
    },
    {
      id: 'lab-fb-dw-4',
      title: 'Delete & Count',
      description:
        'You already solved this with blocks — Create Table, Insert rows, Delete Rows where done="yes", Count Rows. Now do the same in JavaScript.\n\nCreate an array of tasks: {task:"homework", done:"yes"}, {task:"cleaning", done:"no"}, {task:"cooking", done:"yes"}. Filter out done tasks and print the count of remaining tasks.',
      difficulty: 'advanced',
      expectedOutput: ['1'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Filter out tasks where done === "yes", then print the remaining count\n',
      hints: [
        'Use .filter(): var remaining = tasks.filter(function(t) { return t.done !== "yes"; });',
        'console.log(remaining.length) gives the count of remaining tasks.',
      ],
    },
  ],
}
