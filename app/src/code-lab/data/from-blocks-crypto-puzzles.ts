import type { LabPack } from '../types'

export const fromBlocksCryptoPuzzles: LabPack = {
  id: 'from-blocks-crypto-puzzles',
  name: 'From Blocks: Crypto Puzzles',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '🔐',
  color: '#4F46E5',
  exercises: [
    {
      id: 'lab-fb-cp-1',
      title: 'Secret Encoding',
      description:
        'You already solved this with blocks — a Base64 Encode block on "Hello World". Now do the same in JavaScript.\n\nEncode "Hello World" into Base64 and print the result.',
      difficulty: 'beginner',
      expectedOutput: ['SGVsbG8gV29ybGQ='],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Base64-encode "Hello World" and print the result\n',
      hints: [
        'In a browser environment, use btoa() to Base64-encode a string.',
        'console.log(btoa("Hello World")) should give "SGVsbG8gV29ybGQ=".',
      ],
    },
    {
      id: 'lab-fb-cp-2',
      title: 'Decode the Drop',
      description:
        'You already solved this with blocks — a Base64 Decode block on an encoded string. Now do the same in JavaScript.\n\nDecode "Q3J5cHRvQmxvY2tz" from Base64 and print the secret word.',
      difficulty: 'beginner',
      expectedOutput: ['CryptoBlocks'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Base64-decode "Q3J5cHRvQmxvY2tz" and print the result\n',
      hints: [
        'Use atob() to decode a Base64 string.',
        'console.log(atob("Q3J5cHRvQmxvY2tz")) reveals the secret word.',
      ],
    },
    {
      id: 'lab-fb-cp-3',
      title: 'Hex Translator',
      description:
        'You already solved this with blocks — Hex Encode then Hex Decode. Now do the same in JavaScript.\n\nConvert "OK" to hexadecimal and print it. Then convert the hex back to text and print the original.',
      difficulty: 'intermediate',
      expectedOutput: ['4f4b', 'OK'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Convert "OK" to hex, print it, then convert back and print the original\n',
      hints: [
        'To hex-encode: loop through each character, use charCodeAt(i).toString(16) and join.',
        'To decode: split the hex into pairs, parse each with parseInt(pair, 16), convert to char with String.fromCharCode().',
        'For "OK": O is 79 (0x4f), K is 75 (0x4b). Combined: "4f4b".',
      ],
    },
    {
      id: 'lab-fb-cp-4',
      title: 'Fingerprint Match',
      description:
        'You already solved this with blocks — hashing the same text twice and comparing. Now do the same in JavaScript.\n\nWrite a simple hash function (or use a checksum). Hash "CryptoBlocks" twice, compare the results, and print "Match!" if they are equal.',
      difficulty: 'intermediate',
      expectedOutput: ['Match!'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Hash "CryptoBlocks" twice, compare the results, print "Match!" if equal\nfunction simpleHash(str) {\n  var hash = 0;\n  for (var i = 0; i < str.length; i++) {\n    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;\n  }\n  return hash;\n}\n',
      hints: [
        'Call simpleHash("CryptoBlocks") twice and store each result in a variable.',
        'Compare the two variables with ===.',
        'If hash1 === hash2, console.log("Match!"), else console.log("Mismatch!")',
      ],
    },
    {
      id: 'lab-fb-cp-5',
      title: 'Round Trip',
      description:
        'You already solved this with blocks — URL Encode then URL Decode. Now do the same in JavaScript.\n\nURL-encode "Top Secret", print the encoded version, then decode it and print the original.',
      difficulty: 'advanced',
      expectedOutput: ['Top%20Secret', 'Top Secret'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// URL-encode "Top Secret", print it, then decode and print the original\n',
      hints: [
        'Use encodeURIComponent() to URL-encode a string.',
        'Use decodeURIComponent() to reverse it.',
        'Store the encoded value in a variable so you can decode it on the next line.',
      ],
    },
  ],
}
