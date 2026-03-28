import type { LabPack } from '../types'

export const asyncPromises: LabPack = {
  id: 'lab-async',
  name: 'Async & Promises',
  description: 'Master asynchronous JavaScript with setTimeout, Promises, and async/await',
  icon: '⏳',
  color: '#0891b2',
  exercises: [
    {
      id: 'lab-async-1',
      title: 'Basic setTimeout',
      description:
        'Use setTimeout to print messages with a delay.\n\nPrint "start", then after 0ms print "timeout fired", then print "end".\n\nNote: setTimeout with 0ms still runs after synchronous code.\n\nExpected output (in order):\nstart\nend\ntimeout fired',
      difficulty: 'beginner',
      expectedOutput: ['start', 'end', 'timeout fired'],
      starterCode: '// setTimeout execution order\nconsole.log("start");\n\nsetTimeout(function() {\n  console.log("timeout fired");\n}, 0);\n\nconsole.log("end");\n',
      hints: [
        'setTimeout is asynchronous — it schedules work for later',
        'Even with 0ms delay, the callback runs after the current synchronous code finishes',
        'This demonstrates the event loop: synchronous code runs first',
      ],
    },
    {
      id: 'lab-async-2',
      title: 'Promise Creation',
      description:
        'Create a Promise that resolves with a value after checking a condition.\n\nWrite makePromise(value) that returns a Promise:\n- Resolves with value if value > 0\n- Rejects with "negative value" if value <= 0\n\nPrint the resolved value for 5, then the rejection message for -1.',
      difficulty: 'beginner',
      expectedOutput: ['Resolved: 5', 'Rejected: negative value'],
      starterCode: '// Promise creation\nfunction makePromise(value) {\n  return new Promise(function(resolve, reject) {\n    if (value > 0) {\n      resolve(value);\n    } else {\n      reject("negative value");\n    }\n  });\n}\n\nmakePromise(5)\n  .then(function(v) { console.log("Resolved: " + v); })\n  .catch(function(e) { console.log("Rejected: " + e); });\n\nmakePromise(-1)\n  .then(function(v) { console.log("Resolved: " + v); })\n  .catch(function(e) { console.log("Rejected: " + e); });\n',
      hints: [
        'new Promise((resolve, reject) => ...) creates a Promise',
        'Call resolve(value) to fulfill, reject(reason) to reject',
        'Chain .then() for success and .catch() for errors',
      ],
    },
    {
      id: 'lab-async-3',
      title: 'Async/Await Fetch Simulation',
      description:
        'Simulate an async fetch using a Promise-based delay function.\n\nWrite fetchUser(id) that returns a Promise resolving with a user object after a simulated delay.\n\nUse async/await to fetch user with id=1 and print their name.',
      difficulty: 'intermediate',
      expectedOutput: ['Fetching user 1...', 'Got user: Alice'],
      starterCode: '// Async/await simulation\nfunction delay(ms) {\n  return new Promise(function(resolve) { setTimeout(resolve, ms); });\n}\n\nasync function fetchUser(id) {\n  await delay(0); // simulate network delay\n  var users = {1: "Alice", 2: "Bob", 3: "Charlie"};\n  return {id: id, name: users[id]};\n}\n\nasync function main() {\n  console.log("Fetching user 1...");\n  var user = await fetchUser(1);\n  console.log("Got user: " + user.name);\n}\n\nmain();\n',
      hints: [
        'async functions always return a Promise',
        'await pauses execution until the Promise resolves',
        'Use try/catch inside async functions to handle errors',
      ],
    },
    {
      id: 'lab-async-4',
      title: 'Sequential Execution',
      description:
        'Execute three async operations one after another (sequentially), where each depends on the previous result.\n\nStep 1: get base value 10\nStep 2: double it → 20\nStep 3: add 5 → 25\n\nPrint each step result.',
      difficulty: 'intermediate',
      expectedOutput: ['Step 1: 10', 'Step 2: 20', 'Step 3: 25'],
      starterCode: '// Sequential async execution\nfunction asyncStep(value, label) {\n  return new Promise(function(resolve) {\n    setTimeout(function() { resolve(value); }, 0);\n  });\n}\n\nasync function runSequential() {\n  var step1 = await asyncStep(10, "Step 1");\n  console.log("Step 1: " + step1);\n\n  var step2 = await asyncStep(step1 * 2, "Step 2");\n  console.log("Step 2: " + step2);\n\n  var step3 = await asyncStep(step2 + 5, "Step 3");\n  console.log("Step 3: " + step3);\n}\n\nrunSequential();\n',
      hints: [
        'Each await pauses until the Promise resolves before moving to the next line',
        'The result of each await is the resolved value',
        'Sequential execution means each step uses the result of the previous one',
      ],
    },
    {
      id: 'lab-async-5',
      title: 'Parallel Execution',
      description:
        'Execute multiple async operations in parallel using Promise.all.\n\nFetch three users simultaneously (ids 1, 2, 3) and print their names in order after all are done.\n\nPrint "All done!" then each name.',
      difficulty: 'advanced',
      expectedOutput: ['All done!', 'Alice', 'Bob', 'Charlie'],
      starterCode: '// Parallel async with Promise.all\nfunction fetchUser(id) {\n  return new Promise(function(resolve) {\n    setTimeout(function() {\n      var users = {1: "Alice", 2: "Bob", 3: "Charlie"};\n      resolve({id: id, name: users[id]});\n    }, 0);\n  });\n}\n\nasync function runParallel() {\n  var results = await Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)]);\n  console.log("All done!");\n  results.forEach(function(user) {\n    console.log(user.name);\n  });\n}\n\nrunParallel();\n',
      hints: [
        'Promise.all takes an array of Promises and resolves when ALL are done',
        'The resolved value is an array of each Promise\'s result, in order',
        'This is faster than sequential: all fetches run simultaneously',
      ],
    },
  ],
}
