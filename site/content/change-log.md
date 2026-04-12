---
title: 'Change Log'
PageTitle: 'CryptoBlocks Change Log'
description: 'What is new in CryptoBlocks. Version history, features, fixes, and improvements.'
priority: 0.6
---

## v0.3 — April 2026

The collaboration + platform update. Real-time multiplayer, teacher classrooms, a 2D game engine, AI speech/vision blocks, hardware support, and a real database-backed marketplace.

### Coding with Friends
- **Real-time collaboration** — share a 6-letter room code, edit the same workspace simultaneously
- **CRDT sync** — block-level conflict-free merging powered by Yjs + PartyKit
- **Presence** — see real names and avatars (via Clerk auth) on blocks your friends are touching
- **Run for Everyone** — broadcast execution to all peers with one click
- **Collaborator bar** — real profile photos, connection status, invite link
- **Up to 6 editors** per room with auto-reconnection

### Authentication
- **Clerk auth** — sign in with Google or GitHub (one-click OAuth)
- **Sign In button** in the toolbar and on all pages
- **Real identity** — your name and avatar flow into collab presence, Shareplace uploads, and classrooms
- **API protection** — uploads require authentication via Clerk JWT verification

### Teacher Dashboard
- **Create classrooms** — generate a 6-character join code (e.g. `ABC123`)
- **Student join flow** — students sign in, enter the code, instantly appear in the class
- **View student projects** — see all shared projects from your classroom members
- **Member list** — avatars, names, teacher/student badges
- **Route:** `/teacher`

### Shareplace (Now Real)
- **Turso database backend** — SQLite on the edge, globally replicated
- **Netlify Functions API** — browse, upload, download, like, remix via `/api/projects`
- **Upload from editor** — reads workspace from localStorage, posts to the real database
- **Download .blocks** — fetch workspace JSON and save as a file
- **Open in Editor** — click a project in Shareplace, load it directly into the workspace
- **Like button** — optimistic UI, heart fills on click, count increments
- **Remix system** — click Remix → workspace loads with parent tracking → upload links back to the original
- **Remix tree visualization** — see ancestors, the current project, and all descendants in a visual lineage tree
- **"Remixed from" badge** — shows the parent project's name and author
- **20 seed projects** from the built-in examples library

### 2D Game Engine
- **10 new blocks:** `set_gravity`, `add_platform`, `set_sprite_velocity`, `sprite_jump`, `is_sprite_on_ground`, `physics_step`, `set_camera`, `camera_follow`, `add_background`, `sprite_editor_image`
- **AABB physics** — gravity, horizontal/vertical collision resolution with platforms
- **Camera system** — viewport follows the player, parallax background layers
- **Sprite images** — `create_sprite` now accepts a PNG data URL from the Sprite Editor
- **`cb_game_loop` block** — requestAnimationFrame-based loop, auto-cancels on re-run
- **Live canvas rendering** — OutputPanel mounts a real canvas that games draw into frame-by-frame
- **Side Scroller 🦊** example — arrows to run, space to jump, camera follows, 5 platforms
- **Flappy Bird 🐤** example — space to flap, pipes scroll past, score tracks distance

### AI & Speech (All Client-Side, No APIs)
- **6 speech/audio blocks:** `say`, `say and wait`, `listen once`, `stop speaking`, `start microphone`, `microphone volume`
- **Web Speech API** for text-to-speech and speech-to-text (Chrome, Edge, Safari)
- **Microphone volume** via getUserMedia + AnalyserNode (RMS, 0–100 scale)
- **MobileNet image classifier** — lazy-loaded from CDN (~5MB), classifies webcam or image URLs into 1000 ImageNet classes
- **MediaPipe hand tracking** — 21 keypoints per hand, `index_finger_x/y`, `is_pinching`, `fingers_up`
- **9 vision blocks** total, all lazy-loaded so the main bundle stays lean
- **Mood Buddy example** — touches all 16 AI blocks in one coherent script (classifier + sentiment + Markov + speech + mic)

### micro:bit Hardware
- **WebBluetooth connection** — pair from the toolbar button, Chrome/Edge
- **15 blocks:** show text/icon, clear, play tone, set LED, set servo, drive (cyber:bot helper), temperature, light level, accelerometer x/y/z, compass heading, button A/B pressed
- **Sensor streaming** — firmware sends compact frames at 10fps, browser caches for synchronous reads
- **MakeCode firmware source** — paste into makecode.microbit.org, flash once, pair forever
- **Cyber:bot drive helper** — forward/back/left/right/stop with auto-timed servos on P13/P12

### Time Travel
- **Scrubbable timeline** over every workspace change (debounced, 500-snapshot ring buffer)
- **Floating scrubber bar** with play/pause, step back/forward, keyboard arrows
- **Fork from any point** — truncate future snapshots, resume editing from the past
- **Workspace floating controls** — Time Travel + Slow-Mo buttons in the workspace corner (moved out of toolbar)

### Daily Challenge
- **One puzzle per day** — deterministic from date, same for everyone worldwide
- **10 starter puzzles** from "Hello World" (1-block par) to "Star Staircase" (6-block par)
- **Streak tracking** in localStorage — current streak, longest streak, total solved
- **Star rating** — ⭐⭐⭐ if under par, ⭐⭐ if close, ⭐ if over
- **Share result** — copies a Wordle-style summary to clipboard
- **In-editor banner** — shows puzzle info, target output, and solved state while playing
- **Route:** `/daily`

### Easter Eggs
- **Matrix rain** — `matrix` command in the Hacker Terminal launches a fullscreen animated digital rain with "Wake up, Neo..." intro. Press ESC to unplug.

### UI/UX
- **Toolbar consolidation** — Friends, Shareplace, Stats, Learn collapsed into a single Menu dropdown
- **Peek Code + micro:bit** moved next to the Run button
- **Floating workspace controls** — Time Travel + Slow-Mo as icon buttons in the workspace corner
- **Live canvas** — OutputPanel mounts a real `<canvas>` so games animate in real time instead of showing a post-run snapshot
- **Terminal resets** — ASCII logo shows fresh every time the Hacker Terminal opens
- **Changelog link** added to Hugo site footer

### Bug Fixes
- Fixed iframe `document.body` null crash for games with heavy sync setup
- Routed games through direct execution so keyboard events work (hidden iframe can't receive keystrokes)
- Fixed stale game loops piling up on re-run via `__cbGameLoopId` cancellation
- Fixed Shareplace `createdAt` string-to-Date conversion (Turso returns integers as strings)
- Fixed Brave Web Bluetooth with Permissions-Policy header + `brave://flags` instructions
- Fixed hacker mode contrast — red pill backgrounds on toolbox category labels
- Fixed scratch-import TypeScript errors (`block` optional in inputs type)

---

## v0.2 — April 2026

The biggest update yet. Functions, local variables, Shareplace, Vision blocks, Learn course, and a complete visual IDE experience.

### New Features
- **Local Variables** — `Set Local` / `Get Local` blocks for function-scoped variables
- **Return Values** — functions can return values via `Call Function =` block
- **While Loop** — loop until a condition changes, with 10K iteration safety limit
- **SCSS Block** — write real SCSS in a Monaco editor modal, compiled at code gen time
- **Tailwind CDN** — utility classes available in the sandbox via the existing Set Class block
- **Set Attribute / Set Attribute by ID** — data attributes on HTML elements
- **Import Library** — load Confetti, Anime.js, or Tone.js from CDN
- **Prank Block** — 32 fun effects from the Jumpscare library
- **Vision Blocks** — Start Camera, Capture Frame, Get Pixel Brightness/Color, Animation Loop
- **Comment Blocks** — floating callouts and inline comments for workspace documentation
- **Lock Block** — right-click to prevent accidental dragging
- **Block Counter** — live count of blocks on the workspace
- **Undo / Redo / Fit View** — visible toolbar buttons

### Shareplace & Pages
- **Shareplace** (`/shareplace`) — marketplace to browse and discover shared projects
- **Dashboard** (`/dashboard`) — personal stats and project management
- **Profile** (`/profile`) — user settings, editor config, data management
- **Learn** (`/learn`) — 10-chapter JavaScript fundamentals course with exercises
- Upload, Edit, Detail, Remix, and Remove modals (shell UI)

### Learn Course
- 10 chapters: What is Code, Values, Variables, Math, Text, Logic, Lists, Objects, Loops, Functions
- 35 lessons with inline code examples
- 41 interactive exercises with CodeMirror editor, Run, Check, and Hints
- Code + Blocks side-by-side previews
- Progress tracking with completion badges

### Code Labs
- 11 "From Blocks" packs mirroring block challenges in JavaScript
- CodeMirror 6 editor with curriculum-matched autocomplete

### Version Control
- **Save Checkpoint** — snapshot workspace to IndexedDB
- **History Panel** — timeline of checkpoints with rollback
- **Auto-save** — configurable interval (1/2/5/10 min)
- Settings modal for auto-save preferences

### Improvements
- Welcome modal and 10-step tutorial for first-time users
- Code view defaults to hidden for new users
- Not Equals, >=, <= comparison blocks
- Sort List, Index Of, Map List, List Contains, Reverse List/Array, Transpose Matrix blocks
- Split Text, Modulo blocks
- Post-execution console output (key events, click handlers show in CryptoBlocks console)
- Uncaught errors captured in sandbox console
- OG meta tags, Twitter cards, favicon
- When Clicked inside buttons attaches to element directly

### Bug Fixes
- While loop counter variable sanitized for valid JS identifiers
- Fixed stale animation loops persisting after execution stops
- Kill all executions when switching examples or clearing workspace
- Fixed block counter to track actual block creations, not sum on run

---

## v0.1 — March 2026

The initial release. Visual block editor with Blockly, sandboxed execution, challenges, and examples.

### Core
- Google Blockly with Zelos renderer
- Monaco Editor for code view
- Sandboxed iframe execution (JS + Python via Pyodide)
- 250 blocks across 23 categories
- HTML/CSS blocks with live preview
- Sound, Art, Games, Crypto, AI, Database, Hardware blocks

### Challenges
- 27 themed challenge packs (141 challenges)
- Star rating system based on block count vs par
- Progressive hint system
- Code Golf mode
- Blockset challenges

### Examples
- Hello World, Calculator, Tic-Tac-Toe, Weather Dashboard, Drum Pad
- Password Vault, Kitchen Sink, API Explorer

### Editor
- Save/Load .blocks files
- Save as Block (custom block creation)
- Hacker Mode easter egg
- Slow-Mo trace debugger
- Stats panel with activity heatmap
