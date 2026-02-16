import type { ThemePack } from '../types'

export const dataWizard: ThemePack = {
  id: 'data-wizard',
  name: 'Data Wizard',
  description: 'Create tables, query data, and build mini databases',
  icon: '🗄️',
  color: '#2563EB',
  challenges: [
    {
      id: 'dw-1',
      title: 'First Table',
      description:
        'Create a table called "students" with columns "name, grade". Insert one row: "Alice, A". Print the table.',
      difficulty: 'beginner',
      theme: 'data-wizard',
      expectedOutput: ['+-------+-------+', '| name  | grade |', '+-------+-------+', '| Alice | A     |', '+-------+-------+'],
      par: 4,
      hints: [
        'Use Create Table with name "students" and columns "name, grade".',
        'Use Insert Row to add "Alice, A", then Print Table to display it.',
      ],
      allowedCategories: ['Basics', 'Database', 'Text'],
    },
    {
      id: 'dw-2',
      title: 'Class Roster',
      description:
        'Create table "class" with columns "name, age". Insert "Alice, 14" and "Bob, 15". Count the rows and print the count.',
      difficulty: 'beginner',
      theme: 'data-wizard',
      expectedOutput: ['2'],
      par: 5,
      hints: [
        'Create table, insert two rows, then use Count Rows to get the total.',
        'Count Rows returns a number — just Print it.',
      ],
      allowedCategories: ['Basics', 'Database', 'Text', 'Math'],
    },
    {
      id: 'dw-3',
      title: 'Query Time',
      description:
        'Create table "scores" with columns "name, points". Insert "Alice, 90" and "Bob, 85" and "Charlie, 90". Use Get Column to get all values from the "points" column and print the result.',
      difficulty: 'intermediate',
      theme: 'data-wizard',
      expectedOutput: ['90,85,90'],
      par: 7,
      hints: [
        'Get Column returns an array of all values in that column.',
        'When you print an array, it shows as comma-separated values.',
      ],
      allowedCategories: ['Basics', 'Database', 'Text'],
    },
    {
      id: 'dw-4',
      title: 'Update Records',
      description:
        'Create table "inventory" with columns "item, quantity". Insert "apples, 10" and "bananas, 5". Update bananas to quantity 20. Print the table.',
      difficulty: 'intermediate',
      theme: 'data-wizard',
      expectedOutput: ['+---------+----------+', '| item    | quantity |', '+---------+----------+', '| apples  | 10       |', '| bananas | 20       |', '+---------+----------+'],
      par: 6,
      hints: [
        'Use Update Rows with where_column "item", where_value "bananas", set_column "quantity", set_value 20.',
        'After updating, Print Table to show the result.',
      ],
      allowedCategories: ['Basics', 'Database', 'Text', 'Math'],
    },
    {
      id: 'dw-5',
      title: 'Delete & Count',
      description:
        'Create table "tasks" with columns "task, done". Insert "homework, yes", "cleaning, no", "cooking, yes". Delete all rows where done equals "yes". Print the count of remaining rows.',
      difficulty: 'advanced',
      theme: 'data-wizard',
      expectedOutput: ['1'],
      par: 7,
      hints: [
        'Use Delete Rows with where_column "done" and where_value "yes".',
        'After deleting, Count Rows and Print the result. Only "cleaning" should remain.',
      ],
      allowedCategories: ['Basics', 'Database', 'Text', 'Math'],
    },
  ],
}
