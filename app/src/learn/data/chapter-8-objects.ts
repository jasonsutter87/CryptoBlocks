import type { Chapter } from '../types'

export const chapter8: Chapter = {
  id: 'ch-8',
  number: 8,
  title: 'Objects',
  description: 'Group related data together using key-value pairs.',
  icon: '📖',
  color: '#94e2d5',
  lessons: [
    {
      id: 'ch-8-1',
      title: 'Key-value pairs',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-8-1-1',
          prompt: 'Create an object called car with a make property set to "Toyota" and print it.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['Toyota'],
          hints: [
            'Create an object with curly braces.',
            'Try: let car = { make: "Toyota" }',
            'Then: console.log(car.make)',
          ],
        },
        {
          id: 'ex-8-1-2',
          prompt: 'Create an object called person with name "Jordan" and age 14, then print the name.',
          starterCode: '// Write your code below\n',
          expectedOutput: ['Jordan'],
          hints: [
            'Try: let person = { name: "Jordan", age: 14 }',
            'Access the name with: person.name',
            'Then: console.log(person.name)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Key-value pairs' },
        {
          type: 'paragraph',
          text: 'An object lets you group related pieces of information together. Instead of having separate variables for everything, you bundle them up.',
        },
        {
          type: 'paragraph',
          text: 'Think of an object like a profile card. One card holds a person\'s name, age, city — all in one place.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let player = {\n  name: "Alex",\n  score: 250,\n  level: 5\n}',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'Each item inside the object is a key-value pair. The key is the name (like "score") and the value is what it holds (like 250).',
        },
        {
          type: 'heading', level: 2, text: 'Dot notation',
        },
        {
          type: 'paragraph',
          text: 'To read a value from an object, use a dot followed by the key name.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let player = { name: "Alex", score: 250 }\nconsole.log(player.name)   // Alex\nconsole.log(player.score)  // 250',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'You can also update a property the same way: player.score = 300 changes the score.',
        },
        { type: 'exercise', exerciseId: 'ex-8-1-1' },
        { type: 'exercise', exerciseId: 'ex-8-1-2' },
      ],
    },
    {
      id: 'ch-8-2',
      title: 'Nested objects',
      estimatedMinutes: 6,
      exercises: [
        {
          id: 'ex-8-2-1',
          prompt: 'Create an object called user with a nested address object. Print the city.',
          starterCode: 'let user = {\n  name: "Sam",\n  address: {\n    city: "Austin"\n  }\n}\n// Print the city below\n',
          expectedOutput: ['Austin'],
          hints: [
            'Use dot notation twice: user.address.city',
            'Try: console.log(user.address.city)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Nested objects' },
        {
          type: 'paragraph',
          text: 'Objects can contain other objects. This is called nesting and it is perfect for representing more complex things.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let character = {\n  name: "Zara",\n  stats: {\n    health: 100,\n    attack: 45,\n    defense: 30\n  }\n}',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'To get to a nested value, just chain dot notation. Go one level at a time.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(character.name)           // Zara\nconsole.log(character.stats.health)   // 100\nconsole.log(character.stats.attack)   // 45',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'You can nest as many levels deep as you need, but try not to go too deep — it makes code harder to read.',
        },
        { type: 'exercise', exerciseId: 'ex-8-2-1' },
      ],
    },
    {
      id: 'ch-8-3',
      title: 'Arrays of objects',
      estimatedMinutes: 7,
      exercises: [
        {
          id: 'ex-8-3-1',
          prompt: 'Given an array of two objects with name properties, print the name of the second one.',
          starterCode: 'let heroes = [\n  { name: "Storm" },\n  { name: "Blaze" }\n]\n// Print the name of the second hero\n',
          expectedOutput: ['Blaze'],
          hints: [
            'Access the second item with index 1.',
            'Then access the .name property.',
            'Try: console.log(heroes[1].name)',
          ],
        },
      ],
      blocks: [
        { type: 'heading', level: 1, text: 'Arrays of objects' },
        {
          type: 'paragraph',
          text: 'Arrays and objects are even more powerful together. You can make an array where every item is an object.',
        },
        {
          type: 'paragraph',
          text: 'This is how real apps store data. A list of users, a list of products, a list of game levels — each one is an object with its own properties.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'let students = [\n  { name: "Maya", grade: 90 },\n  { name: "Leo",  grade: 85 },\n  { name: "Zoe",  grade: 92 }\n]',
          runnable: false,
        },
        {
          type: 'paragraph',
          text: 'To get data, you chain array index and dot notation together.',
        },
        {
          type: 'code',
          language: 'javascript',
          code: 'console.log(students[0].name)   // Maya\nconsole.log(students[2].grade)  // 92',
          runnable: false,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Arrays of objects + loops is the classic combo for displaying lists — like showing all products in a store or all players on a leaderboard.',
        },
        { type: 'exercise', exerciseId: 'ex-8-3-1' },
      ],
    },
  ],
}
