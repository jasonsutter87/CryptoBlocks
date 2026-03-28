import type { ThemePack } from '../types'

export const websocketRelay: ThemePack = {
  id: 'websocket-relay',
  name: 'WebSocket Relay',
  description: 'Connect, send, and receive real-time messages over WebSockets',
  icon: '📡',
  color: '#059669',
  challenges: [
    {
      id: 'wr-1',
      title: 'First Connection',
      description:
        'Connect to "wss://ws.postman-echo.com/raw" using the WebSocket Connect block. When the connection opens, print "Connected!".',
      difficulty: 'beginner',
      theme: 'websocket-relay',
      expectedOutput: ['Connected!'],
      par: 3,
      hints: [
        'Use the WebSocket Connect block and provide the server URL.',
        'WS Connect "wss://ws.postman-echo.com/raw" → in the on-open callback, Print "Connected!".',
      ],
      allowedCategories: ['Basics', 'Web', 'Text'],
    },
    {
      id: 'wr-2',
      title: 'Echo Chamber',
      description:
        'Connect to the echo server "wss://ws.postman-echo.com/raw". After connecting, send the message "Hello". Use the on-message handler to receive the echo and print it.',
      difficulty: 'beginner',
      theme: 'websocket-relay',
      expectedOutput: ['Hello'],
      par: 5,
      hints: [
        'After connecting, use WS Send to send "Hello". The server echoes it back.',
        'WS Connect → on-open: WS Send "Hello" → on-message: Print the received message.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text'],
    },
    {
      id: 'wr-3',
      title: 'Ping Pong',
      description:
        'Connect to the echo server. Send "ping", receive and print the echo. Then send "pong", receive and print its echo. Two lines of output expected.',
      difficulty: 'intermediate',
      theme: 'websocket-relay',
      expectedOutput: ['ping', 'pong'],
      par: 8,
      hints: [
        'You need to handle two separate message exchanges in sequence.',
        'Send "ping" in on-open, print in first on-message, then send "pong" and print its reply in a nested handler.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text'],
    },
    {
      id: 'wr-4',
      title: 'Message Counter',
      description:
        'Connect to the echo server. Use a loop to send the messages "A", "B", and "C" one at a time. Print each echoed message as it arrives.',
      difficulty: 'intermediate',
      theme: 'websocket-relay',
      expectedOutput: ['A', 'B', 'C'],
      par: 8,
      hints: [
        'Build a list ["A","B","C"] and loop over it, sending each item after connecting.',
        'Connect → on-open: loop through list and WS Send each item → on-message: Print received.',
      ],
      allowedCategories: ['Basics', 'Web', 'Text', 'Logic'],
    },
    {
      id: 'wr-5',
      title: 'Secret Relay',
      description:
        'Connect to the echo server. Base64 encode the text "TopSecret" and send the encoded string. Receive the echo, Base64 decode it, and print the original text.',
      difficulty: 'advanced',
      theme: 'websocket-relay',
      expectedOutput: ['TopSecret'],
      par: 7,
      hints: [
        'Use Base64 Encode before sending and Base64 Decode after receiving.',
        'Connect → on-open: WS Send Base64 Encode "TopSecret" → on-message: Print Base64 Decode of received.',
      ],
      allowedCategories: ['Basics', 'Web', 'Crypto', 'Text'],
    },
  ],
}
