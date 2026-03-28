import type { ThemePack } from '../types'

export const cryptoMaster: ThemePack = {
  id: 'crypto-master',
  name: 'Crypto Master',
  description: 'Master advanced cryptography with AES, HMAC, XOR, and more',
  icon: '🛡️',
  color: '#7C3AED',
  challenges: [
    {
      id: 'cm-1',
      title: 'Lock and Key',
      description:
        'Encrypt the text "CryptoBlocks" using AES with the password "secret123". Print the encrypted text.',
      difficulty: 'beginner',
      theme: 'crypto-master',
      expectedOutput: [],
      par: 3,
      hints: [
        'Use the AES Encrypt block from the Crypto category with text and password inputs.',
        'Encrypt AES "CryptoBlocks" with password "secret123", then Print the result.',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cm-2',
      title: 'Unlock the Vault',
      description:
        'Encrypt "OpenSesame" with AES using password "key456", then immediately decrypt the result using the same password. Print the decrypted text to prove the round-trip works.',
      difficulty: 'beginner',
      theme: 'crypto-master',
      expectedOutput: ['OpenSesame'],
      par: 5,
      hints: [
        'Store the encrypted value in a variable first, then pass that variable to AES Decrypt.',
        'Set Global "locked" to AES Encrypt "OpenSesame" / "key456". Then Print AES Decrypt of "locked" / "key456".',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cm-3',
      title: 'Sign the Contract',
      description:
        'Sign the message "I agree" using HMAC with the key "mykey". Print the resulting signature.',
      difficulty: 'intermediate',
      theme: 'crypto-master',
      expectedOutput: [],
      par: 3,
      hints: [
        'Use the HMAC Sign block from the Crypto category.',
        'HMAC Sign "I agree" with key "mykey", then Print the result.',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cm-4',
      title: 'Verify or Deny',
      description:
        'Sign the message "hello" with HMAC using key "secret". Then verify the signature using the same message and key. Print the boolean result.',
      difficulty: 'intermediate',
      theme: 'crypto-master',
      expectedOutput: ['true'],
      par: 4,
      hints: [
        'Store the HMAC signature in a variable, then pass it to HMAC Verify along with the original message and key.',
        'Set Global "sig" to HMAC Sign "hello" / "secret". Print HMAC Verify "hello" / "secret" / sig.',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cm-5',
      title: 'XOR Cipher',
      description:
        'XOR cipher the text "ATTACK" with key "KEY" and print the result. Then XOR cipher that result again with "KEY" to recover "ATTACK" and print it.',
      difficulty: 'advanced',
      theme: 'crypto-master',
      expectedOutput: [],
      par: 5,
      hints: [
        'XOR is its own inverse — applying it twice with the same key restores the original.',
        'Set Global "encrypted" to XOR Cipher "ATTACK" / "KEY". Print it. Then Print XOR Cipher of "encrypted" / "KEY".',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Text'],
    },
    {
      id: 'cm-6',
      title: 'Binary World',
      description:
        'Convert the numbers 1, 10, and 255 to binary and print each result on its own line.',
      difficulty: 'beginner',
      theme: 'crypto-master',
      expectedOutput: ['1', '1010', '11111111'],
      par: 6,
      hints: [
        'Use the To Binary block from the Crypto category on each number.',
        'Print To Binary 1, then Print To Binary 10, then Print To Binary 255.',
      ],
      allowedCategories: ['Basics', 'Crypto', 'Math'],
    },
  ],
}
