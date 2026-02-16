import type { ThemePack } from '../types'

export const webDetective: ThemePack = {
  id: 'web-detective',
  name: 'Web Detective',
  description: 'Fetch data from the web and parse JSON like a pro',
  icon: '🌐',
  color: '#DC2626',
  challenges: [
    {
      id: 'wd-1',
      title: 'First Fetch',
      description:
        'Use HTTP GET to fetch data from "https://jsonplaceholder.typicode.com/todos/1", then print the raw JSON response.',
      difficulty: 'beginner',
      theme: 'web-detective',
      expectedOutput: ['{"userId":1,"id":1,"title":"delectus aut autem","completed":false}'],
      par: 3,
      hints: [
        'Use the HTTP GET block from the Web category.',
        'HTTP GET returns the response as text — just Print it directly.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text'],
    },
    {
      id: 'wd-2',
      title: 'Parse the Clue',
      description:
        'Fetch "https://jsonplaceholder.typicode.com/todos/1", parse the JSON, then extract and print the "title" field.',
      difficulty: 'beginner',
      theme: 'web-detective',
      expectedOutput: ['delectus aut autem'],
      par: 5,
      hints: [
        'First HTTP GET the URL, then use Parse JSON on the result.',
        'Use Get JSON Field with field name "title" to extract the title from the parsed object.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text'],
    },
    {
      id: 'wd-3',
      title: 'Status Report',
      description:
        'Fetch todo #1 from "https://jsonplaceholder.typicode.com/todos/1". Parse it and extract the "completed" field. Print "Done!" if it\'s true, or "Not yet!" if it\'s false.',
      difficulty: 'intermediate',
      theme: 'web-detective',
      expectedOutput: ['Not yet!'],
      par: 7,
      hints: [
        'Get the JSON field "completed" — it will be a boolean.',
        'Use If Then with the completed value: "Done!" if true, "Not yet!" if false.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text', 'Logic'],
    },
    {
      id: 'wd-4',
      title: 'User Lookup',
      description:
        'Fetch user data from "https://jsonplaceholder.typicode.com/users/1". Parse the JSON and print the user\'s "name" field, then print their "email" field on the next line.',
      difficulty: 'intermediate',
      theme: 'web-detective',
      expectedOutput: ['Leanne Graham', 'Sincere@april.biz'],
      par: 7,
      hints: [
        'You need two Get JSON Field blocks — one for "name" and one for "email".',
        'Store the parsed JSON in a variable so you can extract both fields from it.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text'],
    },
    {
      id: 'wd-5',
      title: 'Deep Dive',
      description:
        'Fetch "https://jsonplaceholder.typicode.com/users/1". The response has a nested "company" object with a "name" field. Parse the JSON, extract the "company" field, then parse THAT and extract "name". Print the company name.',
      difficulty: 'advanced',
      theme: 'web-detective',
      expectedOutput: ['Romaguera-Crona'],
      par: 8,
      hints: [
        'Nested JSON means you need to parse twice — first the whole response, then the inner object.',
        'Get JSON Field "company" gives you the nested object. Parse that, then Get JSON Field "name" from it.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text'],
    },
  ],
}
