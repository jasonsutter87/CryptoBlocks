import type { LabPack } from '../types'

export const errorHandling: LabPack = {
  id: 'lab-err',
  name: 'Error Handling',
  description: 'Write robust code that gracefully handles failures and unexpected input',
  icon: '🛑',
  color: '#dc2626',
  exercises: [
    {
      id: 'lab-err-1',
      title: 'Try-Catch Basics',
      description:
        'Use try-catch to handle a runtime error gracefully.\n\nThe function riskyDivide(a, b) should throw an error if b is 0.\n\nCall riskyDivide(10, 2) and print the result.\nCall riskyDivide(10, 0) and print "Error: division by zero".',
      difficulty: 'beginner',
      expectedOutput: ['5', 'Error: division by zero'],
      starterCode: '// Try-catch basics\nfunction riskyDivide(a, b) {\n  if (b === 0) throw new Error("division by zero");\n  return a / b;\n}\n\ntry {\n  console.log(riskyDivide(10, 2));\n} catch (e) {\n  console.log("Error: " + e.message);\n}\n\ntry {\n  console.log(riskyDivide(10, 0));\n} catch (e) {\n  console.log("Error: " + e.message);\n}\n',
      hints: [
        'throw new Error("message") throws a runtime error',
        'The catch block receives the error object as e',
        'e.message gives the error message string',
      ],
    },
    {
      id: 'lab-err-2',
      title: 'Custom Error Message',
      description:
        'Write a function getElement(arr, index) that throws a descriptive error if the index is out of bounds.\n\ngetElement([10,20,30], 1) = 20\ngetElement([10,20,30], 5) throws "Index 5 out of bounds for array of length 3"\n\nPrint the value, then print the caught error message.',
      difficulty: 'beginner',
      expectedOutput: ['20', 'Index 5 out of bounds for array of length 3'],
      starterCode: '// Custom error message\nfunction getElement(arr, index) {\n  if (index < 0 || index >= arr.length) {\n    throw new Error("Index " + index + " out of bounds for array of length " + arr.length);\n  }\n  return arr[index];\n}\n\ntry { console.log(getElement([10,20,30], 1)); } catch(e) { console.log(e.message); }\ntry { console.log(getElement([10,20,30], 5)); } catch(e) { console.log(e.message); }\n',
      hints: [
        'Check index < 0 || index >= arr.length',
        'Build a descriptive message using string concatenation',
        'Throw the error with throw new Error(message)',
      ],
    },
    {
      id: 'lab-err-3',
      title: 'Validate Input',
      description:
        'Write validateAge(age) that throws specific errors for invalid input:\n- "Age must be a number" if not a number\n- "Age must be positive" if <= 0\n- "Age must be realistic" if > 150\n\nTest with: "twenty", -5, 200, 25\nPrint either the valid age or the error message.',
      difficulty: 'intermediate',
      expectedOutput: ['Age must be a number', 'Age must be positive', 'Age must be realistic', '25'],
      starterCode: '// Input validation\nfunction validateAge(age) {\n  if (typeof age !== "number") throw new Error("Age must be a number");\n  if (age <= 0) throw new Error("Age must be positive");\n  if (age > 150) throw new Error("Age must be realistic");\n  return age;\n}\n\n["twenty", -5, 200, 25].forEach(function(val) {\n  try {\n    console.log(validateAge(val));\n  } catch(e) {\n    console.log(e.message);\n  }\n});\n',
      hints: [
        'Use typeof to check if age is a number',
        'Throw different Error instances for each invalid case',
        'The try-catch in the forEach catches each error individually',
      ],
    },
    {
      id: 'lab-err-4',
      title: 'Parse Safely',
      description:
        'Write safeParseJSON(str) that returns the parsed object on success, or null if parsing fails.\n\nsafeParseJSON(\'{"name":"Alice"}\') = {name: "Alice"}\nsafeParseJSON("not json") = null\n\nPrint the name from the first result, then print null for the second.',
      difficulty: 'intermediate',
      expectedOutput: ['Alice', 'null'],
      starterCode: '// Safe JSON parse\nfunction safeParseJSON(str) {\n  try {\n    return JSON.parse(str);\n  } catch(e) {\n    return null;\n  }\n}\n\nvar result1 = safeParseJSON(\'{"name":"Alice"}\');\nconsole.log(result1 ? result1.name : null);\n\nvar result2 = safeParseJSON("not json");\nconsole.log(result2);\n',
      hints: [
        'Wrap JSON.parse in a try block',
        'Return the parsed result from the try block',
        'Return null in the catch block',
      ],
    },
    {
      id: 'lab-err-5',
      title: 'Retry Pattern',
      description:
        'Write retry(fn, times) that calls fn and retries up to "times" times if it throws.\n\nSimulate a flaky function that fails twice then succeeds.\n\nPrint "Attempt 1 failed", "Attempt 2 failed", "Attempt 3 succeeded: 42".',
      difficulty: 'advanced',
      expectedOutput: ['Attempt 1 failed', 'Attempt 2 failed', 'Attempt 3 succeeded: 42'],
      starterCode: '// Retry pattern\nvar attempts = 0;\nfunction flaky() {\n  attempts++;\n  if (attempts < 3) throw new Error("not ready");\n  return 42;\n}\n\nfunction retry(fn, times) {\n  for (var i = 1; i <= times; i++) {\n    try {\n      var result = fn();\n      console.log("Attempt " + i + " succeeded: " + result);\n      return result;\n    } catch(e) {\n      console.log("Attempt " + i + " failed");\n      if (i === times) throw e;\n    }\n  }\n}\n\nretry(flaky, 5);\n',
      hints: [
        'Loop from 1 to times; try fn() inside the loop',
        'On success, log and return the result',
        'On failure, log and continue; on the last attempt, rethrow the error',
      ],
    },
  ],
}
