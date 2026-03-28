import type { LabPack } from '../types'

export const bitManipulation: LabPack = {
  id: 'lab-bit',
  name: 'Bit Manipulation',
  description: 'Harness the power of binary operations for fast, elegant solutions',
  icon: '💾',
  color: '#64748b',
  exercises: [
    {
      id: 'lab-bit-1',
      title: 'Count Set Bits',
      description:
        'Count the number of 1 bits in the binary representation of a number (also called Hamming weight).\n\ncountBits(13) = 3  (13 = 1101 in binary)\ncountBits(255) = 8\n\nPrint both results.',
      difficulty: 'beginner',
      expectedOutput: ['3', '8'],
      starterCode: '// Count set bits (1 bits)\nfunction countBits(n) {\n  var count = 0;\n  while (n > 0) {\n    // check last bit with n & 1\n    // then shift n right by 1\n  }\n  return count;\n}\n\nconsole.log(countBits(13));\nconsole.log(countBits(255));\n',
      hints: [
        'n & 1 gives the value of the last bit (1 or 0)',
        'n >>= 1 (right shift) removes the last bit',
        'Repeat until n is 0, counting each 1 bit',
      ],
    },
    {
      id: 'lab-bit-2',
      title: 'Is Power of 2',
      description:
        'A number is a power of 2 if it has exactly one set bit in binary.\n\nisPowerOf2(16) = true  (10000)\nisPowerOf2(18) = false  (10010)\nisPowerOf2(1) = true  (1)\n\nPrint all three results.',
      difficulty: 'beginner',
      expectedOutput: ['true', 'false', 'true'],
      starterCode: '// Is power of 2\nfunction isPowerOf2(n) {\n  // a power of 2 in binary: only one 1 bit\n  // trick: n & (n-1) clears the lowest set bit\n}\n\nconsole.log(isPowerOf2(16));\nconsole.log(isPowerOf2(18));\nconsole.log(isPowerOf2(1));\n',
      hints: [
        'Powers of 2 in binary: 1, 10, 100, 1000 — exactly one set bit',
        'n & (n - 1) clears the lowest set bit. If the result is 0, there was only one bit set',
        'Return n > 0 && (n & (n - 1)) === 0',
      ],
    },
    {
      id: 'lab-bit-3',
      title: 'Toggle Bit',
      description:
        'Toggle (flip) the bit at position k (0-indexed from the right) of a number.\n\ntoggleBit(10, 1) = 8  (1010 -> 1000, toggle bit 1)\ntoggleBit(10, 2) = 14  (1010 -> 1110, toggle bit 2)\n\nPrint both results.',
      difficulty: 'intermediate',
      expectedOutput: ['8', '14'],
      starterCode: '// Toggle bit at position k\nfunction toggleBit(n, k) {\n  // XOR with a mask that has a 1 only at position k\n}\n\nconsole.log(toggleBit(10, 1));\nconsole.log(toggleBit(10, 2));\n',
      hints: [
        'Create a mask with a 1 at position k: 1 << k',
        'XOR n with the mask: n ^ (1 << k)',
        'XOR flips bits: 0^1=1, 1^1=0',
      ],
    },
    {
      id: 'lab-bit-4',
      title: 'Swap Without Temp',
      description:
        'Swap two numbers without using a temporary variable, using XOR.\n\nStart with a=5, b=9. After swap: a=9, b=5.\n\nPrint "Before: 5 9" then "After: 9 5".',
      difficulty: 'intermediate',
      expectedOutput: ['Before: 5 9', 'After: 9 5'],
      starterCode: '// Swap using XOR — no temp variable\nvar a = 5, b = 9;\nconsole.log("Before: " + a + " " + b);\n\n// three XOR operations to swap\n// a = a ^ b\n// b = a ^ b\n// a = a ^ b\n\nconsole.log("After: " + a + " " + b);\n',
      hints: [
        'Step 1: a = a ^ b',
        'Step 2: b = a ^ b  (now b has original a)',
        'Step 3: a = a ^ b  (now a has original b)',
      ],
    },
    {
      id: 'lab-bit-5',
      title: 'Single Number',
      description:
        'Every number in the array appears exactly twice, except for one. Find the single number.\n\nsingleNumber([4,1,2,1,2]) = 4\nsingleNumber([2,2,1]) = 1\n\nPrint both results.\n\nHint: XOR of a number with itself is 0. XOR of a number with 0 is itself.',
      difficulty: 'intermediate',
      expectedOutput: ['4', '1'],
      starterCode: '// Single number using XOR\nfunction singleNumber(arr) {\n  var result = 0;\n  // XOR all elements together\n  return result;\n}\n\nconsole.log(singleNumber([4,1,2,1,2]));\nconsole.log(singleNumber([2,2,1]));\n',
      hints: [
        'XOR is commutative and associative: a^b^a = b',
        'XOR all elements: pairs cancel out (a^a=0), leaving only the single number',
        'result = arr.reduce((acc, n) => acc ^ n, 0)',
      ],
    },
  ],
}
