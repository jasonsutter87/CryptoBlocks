import type { BlockDefinition } from '../../types/block'

export const cryptoBlocks: BlockDefinition[] = [
  // --- Hashing ---
  {
    name: 'hash_text',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Turn text into a unique fingerprint — even a tiny change creates a completely different result',
    category: 'Crypto',
    inputs: [{ name: 'text', type: 'string', description: 'The text to hash' }],
    outputs: [{ name: 'hash', type: 'string' }],
    implementations: {
      javascript: `async function hashText(text) {
  try {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
  } catch (e) {
    return "Error: " + e.message;
  }
}`,
      python: `def hash_text(text):
    import hashlib
    return hashlib.sha256(text.encode()).hexdigest()`,
    },
    tests: [
      { input: { text: 'hello' }, expected: { hash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },

  // --- Encoding ---
  {
    name: 'base64_encode',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Convert text into a letters-and-numbers format used to send data over the internet',
    category: 'Crypto',
    inputs: [{ name: 'text', type: 'string', description: 'The text to encode' }],
    outputs: [{ name: 'encoded', type: 'string' }],
    implementations: {
      javascript: `function base64Encode(text) {
  return btoa(unescape(encodeURIComponent(text)));
}`,
      python: `def base64_encode(text):
    import base64
    return base64.b64encode(text.encode()).decode()`,
    },
    tests: [
      { input: { text: 'Hello, world!' }, expected: { encoded: 'SGVsbG8sIHdvcmxkIQ==' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'base64_decode',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Convert Base64-encoded text back to its original form',
    category: 'Crypto',
    inputs: [{ name: 'encoded', type: 'string', description: 'The Base64 text to decode' }],
    outputs: [{ name: 'decoded', type: 'string' }],
    implementations: {
      javascript: `function base64Decode(encoded) {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch (e) {
    return "Error: Invalid Base64 input";
  }
}`,
      python: `def base64_decode(encoded):
    import base64
    return base64.b64decode(encoded).decode()`,
    },
    tests: [
      { input: { encoded: 'SGVsbG8sIHdvcmxkIQ==' }, expected: { decoded: 'Hello, world!' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'hex_encode',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Convert text into hexadecimal (base-16) numbers that computers love',
    category: 'Crypto',
    inputs: [{ name: 'text', type: 'string', description: 'The text to encode' }],
    outputs: [{ name: 'hex', type: 'string' }],
    implementations: {
      javascript: `function hexEncode(text) {
  var result = "";
  for (var i = 0; i < text.length; i++) {
    result += text.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return result;
}`,
      python: `def hex_encode(text):
    return text.encode().hex()`,
    },
    tests: [
      { input: { text: 'Hi' }, expected: { hex: '4869' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'hex_decode',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Convert hexadecimal numbers back into readable text',
    category: 'Crypto',
    inputs: [{ name: 'hex', type: 'string', description: 'The hex string to decode' }],
    outputs: [{ name: 'decoded', type: 'string' }],
    implementations: {
      javascript: `function hexDecode(hex) {
  try {
    var result = "";
    for (var i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    }
    return result;
  } catch (e) {
    return "Error: Invalid hex input";
  }
}`,
      python: `def hex_decode(hex):
    return bytes.fromhex(hex).decode()`,
    },
    tests: [
      { input: { hex: '4869' }, expected: { decoded: 'Hi' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'url_encode',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Make text safe to include in a web address by replacing special characters',
    category: 'Crypto',
    inputs: [{ name: 'text', type: 'string', description: 'The text to encode' }],
    outputs: [{ name: 'encoded', type: 'string' }],
    implementations: {
      javascript: `function urlEncode(text) {
  return encodeURIComponent(text);
}`,
      python: `def url_encode(text):
    import urllib.parse
    return urllib.parse.quote(text)`,
    },
    tests: [
      { input: { text: 'hello world' }, expected: { encoded: 'hello%20world' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'url_decode',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Convert a URL-safe string back to normal text',
    category: 'Crypto',
    inputs: [{ name: 'encoded', type: 'string', description: 'The URL-encoded text' }],
    outputs: [{ name: 'decoded', type: 'string' }],
    implementations: {
      javascript: `function urlDecode(encoded) {
  try {
    return decodeURIComponent(encoded);
  } catch (e) {
    return "Error: Invalid URL-encoded input";
  }
}`,
      python: `def url_decode(encoded):
    import urllib.parse
    return urllib.parse.unquote(encoded)`,
    },
    tests: [
      { input: { encoded: 'hello%20world' }, expected: { decoded: 'hello world' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },

  // --- Encryption ---
  {
    name: 'encrypt_aes',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Lock text with a password so only someone with the password can read it',
    category: 'Crypto',
    inputs: [
      { name: 'text', type: 'string', description: 'The text to encrypt' },
      { name: 'password', type: 'string', description: 'The password for encryption' },
    ],
    outputs: [{ name: 'encrypted', type: 'string' }],
    implementations: {
      javascript: `async function encryptAes(text, password) {
  try {
    var enc = new TextEncoder();
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
    var ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(text));
    var combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
    return btoa(String.fromCharCode.apply(null, combined));
  } catch (e) {
    return "Error: " + e.message;
  }
}`,
      python: `def encrypt_aes(text, password):
    print("AES encryption requires the 'cryptography' library which is not available in the browser Python environment.")
    print("Use the JavaScript version for AES encryption.")
    return "Error: AES not available in Python (browser)"`,
    },
    tests: [
      { input: { text: 'secret', password: 'key123' }, expected: { encrypted: 'any' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'decrypt_aes',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Unlock encrypted text using the same password that locked it',
    category: 'Crypto',
    inputs: [
      { name: 'encrypted', type: 'string', description: 'The encrypted text (Base64)' },
      { name: 'password', type: 'string', description: 'The password used for encryption' },
    ],
    outputs: [{ name: 'decrypted', type: 'string' }],
    implementations: {
      javascript: `async function decryptAes(encrypted, password) {
  try {
    var enc = new TextEncoder();
    var dec = new TextDecoder();
    var raw = atob(encrypted);
    var combined = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) { combined[i] = raw.charCodeAt(i); }
    var salt = combined.slice(0, 16);
    var iv = combined.slice(16, 28);
    var ciphertext = combined.slice(28);
    var keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    var decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
    return dec.decode(decrypted);
  } catch (e) {
    return "Error: " + e.message;
  }
}`,
      python: `def decrypt_aes(encrypted, password):
    print("AES decryption requires the 'cryptography' library which is not available in the browser Python environment.")
    print("Use the JavaScript version for AES decryption.")
    return "Error: AES not available in Python (browser)"`,
    },
    tests: [
      { input: { encrypted: 'test', password: 'key123' }, expected: { decrypted: 'any' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },

  // --- Random ---
  {
    name: 'random_bytes',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Generate random data — useful for creating keys, tokens, and secrets',
    category: 'Crypto',
    inputs: [{ name: 'length', type: 'number', description: 'Number of bytes to generate', default: 16 }],
    outputs: [{ name: 'hex', type: 'string' }],
    implementations: {
      javascript: `function randomBytes(length) {
  var bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
}`,
      python: `def random_bytes(length):
    import os
    return os.urandom(length).hex()`,
    },
    tests: [
      { input: { length: 4 }, expected: { hex: 'any' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'random_uuid',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create a universally unique ID — no two are ever the same',
    category: 'Crypto',
    inputs: [],
    outputs: [{ name: 'uuid', type: 'string' }],
    implementations: {
      javascript: `function randomUuid() {
  return crypto.randomUUID();
}`,
      python: `def random_uuid():
    import uuid
    return str(uuid.uuid4())`,
    },
    tests: [
      { input: {}, expected: { uuid: 'any' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },

  // --- HMAC ---
  {
    name: 'hmac_sign',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Sign a message with a secret key to prove it hasn\'t been tampered with',
    category: 'Crypto',
    inputs: [
      { name: 'text', type: 'string', description: 'The text to sign' },
      { name: 'key', type: 'string', description: 'The secret key' },
    ],
    outputs: [{ name: 'signature', type: 'string' }],
    implementations: {
      javascript: `async function hmacSign(text, key) {
  try {
    var enc = new TextEncoder();
    var cryptoKey = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    var sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(text));
    return Array.from(new Uint8Array(sig)).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
  } catch (e) {
    return "Error: " + e.message;
  }
}`,
      python: `def hmac_sign(text, key):
    import hmac
    import hashlib
    return hmac.new(key.encode(), text.encode(), hashlib.sha256).hexdigest()`,
    },
    tests: [
      { input: { text: 'hello', key: 'secret' }, expected: { signature: 'any' } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
  {
    name: 'hmac_verify',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Check if a signed message is authentic and unmodified',
    category: 'Crypto',
    inputs: [
      { name: 'text', type: 'string', description: 'The original text' },
      { name: 'key', type: 'string', description: 'The secret key' },
      { name: 'signature', type: 'string', description: 'The signature to verify (hex)' },
    ],
    outputs: [{ name: 'valid', type: 'boolean' }],
    implementations: {
      javascript: `async function hmacVerify(text, key, signature) {
  try {
    var enc = new TextEncoder();
    var cryptoKey = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    var sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(text));
    var computed = Array.from(new Uint8Array(sig)).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
    return computed === signature;
  } catch (e) {
    return false;
  }
}`,
      python: `def hmac_verify(text, key, signature):
    import hmac
    import hashlib
    computed = hmac.new(key.encode(), text.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, signature)`,
    },
    tests: [
      { input: { text: 'hello', key: 'secret', signature: 'invalid' }, expected: { valid: false } },
    ],
    color: '#4F46E5',
    shape: 'value',
  },
]
