import type { LabPack } from '../types'

export const advanced: LabPack = {
  id: 'lab-advanced',
  name: 'Advanced',
  description: 'Master AI algorithms and complex data structures',
  icon: '🚀',
  color: '#cba6f7',
  exercises: [
    {
      id: 'lab-a-1',
      title: 'Markov Chain',
      description: 'Build a simple Markov chain from the text below, then generate a deterministic output.\n\nTraining text: "the cat sat on the mat the cat ate"\n\nBuild a chain of word → next words. Then starting from "the", always pick the FIRST next word found (alphabetically if tied). Generate 5 words.\n\nExpected: "the cat ate the cat"',
      difficulty: 'advanced',
      expectedOutput: ['the cat ate the cat'],
      starterCode: '// Build a Markov chain and generate text\nvar text = "the cat sat on the mat the cat ate";\nvar words = text.split(" ");\n',
      hints: [
        'Build an object where each word maps to an array of words that follow it',
        '"the" → ["cat", "mat", "cat"] — sort and pick first unique patterns',
        'To be deterministic: sort the next-words and always pick the first one',
      ],
    },
    {
      id: 'lab-a-2',
      title: 'K-Nearest Neighbors',
      description: 'Classify a new point using K=3 nearest neighbors.\n\nData points (x, y, label):\n(1,1,"A"), (2,1,"A"), (1,2,"A"), (5,5,"B"), (6,5,"B"), (5,6,"B")\n\nClassify the point (2, 2). Print the label.\n\nHint: Use Euclidean distance, find 3 nearest, majority vote.',
      difficulty: 'advanced',
      expectedOutput: ['A'],
      starterCode: '// K-Nearest Neighbors (K=3)\nvar data = [\n  {x:1, y:1, label:"A"}, {x:2, y:1, label:"A"}, {x:1, y:2, label:"A"},\n  {x:5, y:5, label:"B"}, {x:6, y:5, label:"B"}, {x:5, y:6, label:"B"}\n];\nvar point = {x: 2, y: 2};\nvar k = 3;\n',
      hints: [
        'Calculate Euclidean distance: Math.sqrt((x2-x1)^2 + (y2-y1)^2)',
        'Sort data points by distance to the target point',
        'Take the first K points and count which label appears most',
      ],
    },
    {
      id: 'lab-a-3',
      title: 'Linear Regression',
      description: 'Implement simple linear regression on these data points and predict y when x = 6.\n\nData: (1,2), (2,4), (3,5), (4,4), (5,5)\n\nUse the least squares formula to find slope and intercept. Print the predicted value rounded to 1 decimal place.',
      difficulty: 'advanced',
      expectedOutput: ['5.8'],
      starterCode: '// Linear regression: predict y for x=6\nvar data = [{x:1,y:2},{x:2,y:4},{x:3,y:5},{x:4,y:4},{x:5,y:5}];\n',
      hints: [
        'slope = (n*sum(xy) - sum(x)*sum(y)) / (n*sum(x²) - sum(x)²)',
        'intercept = (sum(y) - slope*sum(x)) / n',
        'Predict: y = slope * 6 + intercept',
      ],
    },
    {
      id: 'lab-a-4',
      title: 'Sorting Visualizer',
      description: 'Implement bubble sort on [5, 3, 8, 1, 2]. Print the array after EACH swap (not each pass).\n\nPrint arrays as comma-separated values.',
      difficulty: 'advanced',
      expectedOutput: [
        '3,5,8,1,2',
        '3,5,1,8,2',
        '3,5,1,2,8',
        '3,1,5,2,8',
        '3,1,2,5,8',
        '1,3,2,5,8',
        '1,2,3,5,8',
      ],
      starterCode: '// Bubble sort — print after each swap\nvar arr = [5, 3, 8, 1, 2];\n',
      hints: [
        'Bubble sort compares adjacent elements and swaps if out of order',
        'Use a nested loop: outer for passes, inner for comparisons',
        'Print the entire array (joined with commas) after EACH swap',
      ],
    },
    {
      id: 'lab-a-5',
      title: 'Mini Database',
      description: 'Given this array of objects, implement a SELECT WHERE query.\n\nData: [{name:"Alice",age:14},{name:"Bob",age:17},{name:"Charlie",age:14},{name:"Diana",age:16}]\n\nPrint the names of all people where age equals 14, one per line.',
      difficulty: 'advanced',
      expectedOutput: ['Alice', 'Charlie'],
      starterCode: '// Mini database: SELECT name WHERE age = 14\nvar db = [\n  {name: "Alice", age: 14},\n  {name: "Bob", age: 17},\n  {name: "Charlie", age: 14},\n  {name: "Diana", age: 16}\n];\n',
      hints: [
        'Use .filter() to select matching rows',
        'Then use .forEach() or .map() to extract the name field',
        'Print each name with console.log()',
      ],
    },
  ],
}
