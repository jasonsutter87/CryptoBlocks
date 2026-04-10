---
title: 'Change Log'
PageTitle: 'CryptoBlocks Change Log'
description: 'What is new in CryptoBlocks. Version history, features, fixes, and improvements.'
priority: 0.6
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
