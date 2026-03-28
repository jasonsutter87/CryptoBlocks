import type { LabPack } from '../types'

export const functional: LabPack = {
  id: 'lab-fn',
  name: 'Functional Programming',
  description: 'Implement map, filter, reduce, compose, and curry from scratch',
  icon: '⚡',
  color: '#6366f1',
  exercises: [
    {
      id: 'lab-fn-1',
      title: 'Map Implementation',
      description:
        'Implement your own myMap(arr, fn) function that applies fn to each element.\n\nmyMap([1,2,3,4], x => x * 2) = [2,4,6,8]\n\nPrint the result as comma-separated values.',
      difficulty: 'beginner',
      expectedOutput: ['2,4,6,8'],
      starterCode: '// Implement map\nfunction myMap(arr, fn) {\n  var result = [];\n  // apply fn to each element and push to result\n  return result;\n}\n\nconsole.log(myMap([1,2,3,4], function(x) { return x * 2; }).join(","));\n',
      hints: [
        'Loop over arr, call fn(arr[i]) for each element',
        'Push the return value into result',
        'Return result',
      ],
    },
    {
      id: 'lab-fn-2',
      title: 'Filter Implementation',
      description:
        'Implement your own myFilter(arr, fn) function that keeps only elements where fn returns true.\n\nmyFilter([1,2,3,4,5,6], x => x % 2 === 0) = [2,4,6]\n\nPrint the result as comma-separated values.',
      difficulty: 'beginner',
      expectedOutput: ['2,4,6'],
      starterCode: '// Implement filter\nfunction myFilter(arr, fn) {\n  var result = [];\n  // only push elements where fn(element) is truthy\n  return result;\n}\n\nconsole.log(myFilter([1,2,3,4,5,6], function(x) { return x % 2 === 0; }).join(","));\n',
      hints: [
        'Loop over arr',
        'If fn(arr[i]) is truthy, push arr[i] to result',
        'Return result',
      ],
    },
    {
      id: 'lab-fn-3',
      title: 'Reduce Implementation',
      description:
        'Implement your own myReduce(arr, fn, initial) function.\n\nmyReduce([1,2,3,4,5], (acc, x) => acc + x, 0) = 15\nmyReduce([1,2,3,4,5], (acc, x) => acc * x, 1) = 120\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['15', '120'],
      starterCode: '// Implement reduce\nfunction myReduce(arr, fn, initial) {\n  var acc = initial;\n  // apply fn(acc, element) for each element, update acc\n  return acc;\n}\n\nconsole.log(myReduce([1,2,3,4,5], function(acc, x) { return acc + x; }, 0));\nconsole.log(myReduce([1,2,3,4,5], function(acc, x) { return acc * x; }, 1));\n',
      hints: [
        'Start with acc = initial',
        'For each element: acc = fn(acc, element)',
        'Return acc after the loop',
      ],
    },
    {
      id: 'lab-fn-4',
      title: 'Compose Functions',
      description:
        'Implement compose(f, g) that returns a new function applying g first, then f.\n\ncompose(x => x * 2, x => x + 3)(5) = 16  ((5+3)*2)\n\nCreate a pipeline: double → addTen → square\nApply it to 2 and print the result.',
      difficulty: 'intermediate',
      expectedOutput: ['196'],
      starterCode: '// Function composition\nfunction compose(f, g) {\n  return function(x) {\n    return f(g(x));\n  };\n}\n\nvar double = function(x) { return x * 2; };\nvar addTen = function(x) { return x + 10; };\nvar square = function(x) { return x * x; };\n\n// compose: double, then addTen, then square\n// apply to 2: square(addTen(double(2))) = square(addTen(4)) = square(14) = 196\nvar pipeline = compose(square, compose(addTen, double));\nconsole.log(pipeline(2));\n',
      hints: [
        'compose(f, g)(x) = f(g(x)) — g runs first, f runs second',
        'To chain three functions: compose(square, compose(addTen, double))',
        'double(2)=4, addTen(4)=14, square(14)=196',
      ],
    },
    {
      id: 'lab-fn-5',
      title: 'Curry a Function',
      description:
        'Implement curry(fn) that converts a two-argument function into a curried version.\n\nadd(3, 4) = 7\ncurry(add)(3)(4) = 7\n\nCreate a curried multiply and use it to make a "triple" function.\nPrint triple(5).',
      difficulty: 'advanced',
      expectedOutput: ['15'],
      starterCode: '// Curry a binary function\nfunction curry(fn) {\n  return function(a) {\n    return function(b) {\n      return fn(a, b);\n    };\n  };\n}\n\nvar multiply = function(a, b) { return a * b; };\nvar curriedMultiply = curry(multiply);\nvar triple = curriedMultiply(3); // partial application: multiply by 3\nconsole.log(triple(5));\n',
      hints: [
        'curry(fn) returns a function that takes the first argument a',
        'That function returns another function that takes b and calls fn(a, b)',
        'triple = curriedMultiply(3) is a partially applied function: triple(x) = multiply(3, x)',
      ],
    },
  ],
}
