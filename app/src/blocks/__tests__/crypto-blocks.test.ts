import { describe, it, expect } from 'vitest'
import { cryptoBlocks } from '../definitions/crypto'

describe('Crypto Blocks', () => {
  it('defines exactly 13 blocks', () => {
    expect(cryptoBlocks).toHaveLength(13)
  })

  it('all blocks belong to the Crypto category', () => {
    for (const block of cryptoBlocks) {
      expect(block.category).toBe('Crypto')
    }
  })

  it('all blocks use the correct color', () => {
    for (const block of cryptoBlocks) {
      expect(block.color).toBe('#4F46E5')
    }
  })

  const expectedNames = [
    'hash_text',
    'base64_encode',
    'base64_decode',
    'hex_encode',
    'hex_decode',
    'url_encode',
    'url_decode',
    'encrypt_aes',
    'decrypt_aes',
    'random_bytes',
    'random_uuid',
    'hmac_sign',
    'hmac_verify',
  ]

  it('contains all expected block names', () => {
    const names = cryptoBlocks.map((b) => b.name)
    for (const name of expectedNames) {
      expect(names).toContain(name)
    }
  })

  const asyncJsBlocks = ['hash_text', 'encrypt_aes', 'decrypt_aes', 'hmac_sign', 'hmac_verify']

  it('async JS blocks start with "async function"', () => {
    for (const name of asyncJsBlocks) {
      const block = cryptoBlocks.find((b) => b.name === name)!
      expect(block.implementations.javascript).toMatch(/^async function/)
    }
  })

  const syncBlocks = expectedNames.filter((n) => !asyncJsBlocks.includes(n))

  it('sync JS blocks do not start with "async"', () => {
    for (const name of syncBlocks) {
      const block = cryptoBlocks.find((b) => b.name === name)!
      expect(block.implementations.javascript).not.toMatch(/^async /)
    }
  })

  it('sync Python blocks do not start with "async"', () => {
    for (const name of expectedNames) {
      const block = cryptoBlocks.find((b) => b.name === name)!
      expect(block.implementations.python).not.toMatch(/^async /)
    }
  })

  it('JS hash block uses crypto.subtle', () => {
    const block = cryptoBlocks.find((b) => b.name === 'hash_text')!
    expect(block.implementations.javascript).toContain('crypto.subtle')
  })

  it('JS encoding blocks use expected APIs', () => {
    const b64enc = cryptoBlocks.find((b) => b.name === 'base64_encode')!
    expect(b64enc.implementations.javascript).toContain('btoa')

    const b64dec = cryptoBlocks.find((b) => b.name === 'base64_decode')!
    expect(b64dec.implementations.javascript).toContain('atob')

    const urlEnc = cryptoBlocks.find((b) => b.name === 'url_encode')!
    expect(urlEnc.implementations.javascript).toContain('encodeURIComponent')
  })

  it('JS encrypt/decrypt blocks use AES-GCM with PBKDF2', () => {
    const enc = cryptoBlocks.find((b) => b.name === 'encrypt_aes')!
    expect(enc.implementations.javascript).toContain('AES-GCM')
    expect(enc.implementations.javascript).toContain('PBKDF2')

    const dec = cryptoBlocks.find((b) => b.name === 'decrypt_aes')!
    expect(dec.implementations.javascript).toContain('AES-GCM')
    expect(dec.implementations.javascript).toContain('PBKDF2')
  })

  it('JS HMAC blocks use crypto.subtle', () => {
    const sign = cryptoBlocks.find((b) => b.name === 'hmac_sign')!
    expect(sign.implementations.javascript).toContain('crypto.subtle')

    const verify = cryptoBlocks.find((b) => b.name === 'hmac_verify')!
    expect(verify.implementations.javascript).toContain('crypto.subtle')
  })
})
