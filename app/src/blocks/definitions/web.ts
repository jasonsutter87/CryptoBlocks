import type { BlockDefinition } from '../../types/block'

export const webBlocks: BlockDefinition[] = [
  // --- HTTP Blocks ---
  {
    name: 'http_get',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Fetch data from a URL (GET request)',
    category: 'Web',
    inputs: [
      { name: 'url', type: 'string', description: 'The URL to fetch data from' },
    ],
    outputs: [{ name: 'data', type: 'any' }],
    implementations: {
      javascript: `async function httpGet(url) {\n  try {\n    const response = await fetch(url);\n    return await response.json();\n  } catch (e) {\n    console.log("HTTP GET error: " + e.message);\n    return null;\n  }\n}`,
      python: `async def http_get(url):\n    print("HTTP GET is only available in JavaScript mode.")\n    print("Switch to JavaScript to use web request blocks.")\n    return None`,
    },
    tests: [
      { input: { url: 'https://api.example.com/data' }, expected: { data: 'any' } },
    ],
    color: '#DC2626',
    shape: 'value',
  },
  {
    name: 'http_post',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Send data to a URL (POST request)',
    category: 'Web',
    inputs: [
      { name: 'url', type: 'string', description: 'The URL to send data to' },
      { name: 'body', type: 'string', description: 'The data to send (JSON string)' },
    ],
    outputs: [{ name: 'data', type: 'any' }],
    implementations: {
      javascript: `async function httpPost(url, body) {\n  try {\n    const response = await fetch(url, {\n      method: "POST",\n      headers: { "Content-Type": "application/json" },\n      body: body\n    });\n    return await response.json();\n  } catch (e) {\n    console.log("HTTP POST error: " + e.message);\n    return null;\n  }\n}`,
      python: `async def http_post(url, body):\n    print("HTTP POST is only available in JavaScript mode.")\n    print("Switch to JavaScript to use web request blocks.")\n    return None`,
    },
    tests: [
      { input: { url: 'https://api.example.com/data', body: '{"key":"value"}' }, expected: { data: 'any' } },
    ],
    color: '#DC2626',
    shape: 'value',
  },
  {
    name: 'parse_json',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Parse a JSON string into an object',
    category: 'Web',
    inputs: [
      { name: 'text', type: 'string', description: 'JSON text to parse' },
    ],
    outputs: [{ name: 'data', type: 'any' }],
    implementations: {
      javascript: `function parseJson(text) {\n  try {\n    return JSON.parse(text);\n  } catch (e) {\n    console.log("JSON parse error: " + e.message);\n    return null;\n  }\n}`,
      python: `def parse_json(text):\n    import json\n    try:\n        return json.loads(text)\n    except Exception as e:\n        print(f"JSON parse error: {e}")\n        return None`,
    },
    tests: [
      { input: { text: '{"name":"test"}' }, expected: { data: 'any' } },
    ],
    color: '#DC2626',
    shape: 'value',
  },
  {
    name: 'get_json_field',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get a field from a JSON object',
    category: 'Web',
    inputs: [
      { name: 'data', type: 'any', description: 'The JSON object' },
      { name: 'key', type: 'string', description: 'The field name to get' },
    ],
    outputs: [{ name: 'value', type: 'any' }],
    implementations: {
      javascript: `function getJsonField(data, key) {\n  try {\n    return data[key];\n  } catch (e) {\n    console.log("JSON field error: " + e.message);\n    return null;\n  }\n}`,
      python: `def get_json_field(data, key):\n    try:\n        return data[key]\n    except Exception as e:\n        print(f"JSON field error: {e}")\n        return None`,
    },
    tests: [
      { input: { data: { name: 'test' }, key: 'name' }, expected: { value: 'test' } },
    ],
    color: '#DC2626',
    shape: 'value',
  },

  // --- WebSocket Blocks ---
  {
    name: 'ws_connect',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Connect to a WebSocket server',
    category: 'Web',
    inputs: [
      { name: 'url', type: 'string', description: 'WebSocket URL (ws:// or wss://)' },
    ],
    outputs: [{ name: 'connection', type: 'any' }],
    implementations: {
      javascript: `async function wsConnect(url) {\n  try {\n    window.__ws = window.__ws || {};\n    const ws = new WebSocket(url);\n    await new Promise(function(resolve, reject) {\n      ws.onopen = resolve;\n      ws.onerror = reject;\n      setTimeout(function() { reject(new Error("Connection timeout")); }, 5000);\n    });\n    ws.__messages = [];\n    ws.onmessage = function(e) { ws.__messages.push(e.data); };\n    window.__ws[url] = ws;\n    return ws;\n  } catch (e) {\n    console.log("WebSocket connect error: " + e.message);\n    return null;\n  }\n}`,
      python: `async def ws_connect(url):\n    print("WebSocket is only available in JavaScript mode.")\n    print("Switch to JavaScript to use WebSocket blocks.")\n    return None`,
    },
    tests: [
      { input: { url: 'wss://echo.websocket.org' }, expected: { connection: 'any' } },
    ],
    color: '#DC2626',
    shape: 'value',
  },
  {
    name: 'ws_send',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Send a message through a WebSocket connection',
    category: 'Web',
    inputs: [
      { name: 'connection', type: 'any', description: 'The WebSocket connection' },
      { name: 'message', type: 'string', description: 'Message to send' },
    ],
    outputs: [],
    implementations: {
      javascript: `function wsSend(connection, message) {\n  try {\n    connection.send(message);\n  } catch (e) {\n    console.log("WebSocket send error: " + e.message);\n  }\n}`,
      python: `def ws_send(connection, message):\n    try:\n        connection.send(message)\n    except Exception as e:\n        print(f"WebSocket send error: {e}")`,
    },
    tests: [
      { input: { connection: null, message: 'hello' }, expected: {} },
    ],
    color: '#DC2626',
    shape: 'statement',
  },
  {
    name: 'ws_on_message',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the latest message from a WebSocket connection',
    category: 'Web',
    inputs: [
      { name: 'connection', type: 'any', description: 'The WebSocket connection' },
    ],
    outputs: [{ name: 'message', type: 'string' }],
    implementations: {
      javascript: `function wsOnMessage(connection) {\n  try {\n    if (connection && connection.__messages && connection.__messages.length > 0) {\n      return connection.__messages.shift();\n    }\n    return null;\n  } catch (e) {\n    console.log("WebSocket message error: " + e.message);\n    return null;\n  }\n}`,
      python: `def ws_on_message(connection):\n    try:\n        if connection and hasattr(connection, '_messages') and len(connection._messages) > 0:\n            return connection._messages.pop(0)\n        return None\n    except Exception as e:\n        print(f"WebSocket message error: {e}")\n        return None`,
    },
    tests: [
      { input: { connection: null }, expected: { message: 'string' } },
    ],
    color: '#DC2626',
    shape: 'value',
  },
]
