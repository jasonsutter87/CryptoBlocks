# CryptoBlocks

**A visual coding platform where kids and young coders build programs by snapping blocks together — then level up by writing their own.**

---

## The Pitch

Scratch proved that kids can code when you remove the syntax barrier. CryptoBlocks takes that further:

1. **Start with blocks.** Drag, snap, run. See what happens.
2. **Peek inside.** Every block is real code. Flip it over, read the JavaScript or Python underneath.
3. **Write your own.** When you're ready, write a function. If it works, it becomes a block — your block, with your name on it.
4. **Share it.** Publish to the Shareplace marketplace. Other kids snap your block into their projects.

The gap between "visual coding toy" and "real programming" is where most kids quit. CryptoBlocks is the bridge.

---

## What's Built

### Core Platform
- **280+ blocks** across **23 categories** (Basics, Math, Text, Logic, Lists, Data, Database, Web, Art, Crypto, AI, Sound, Games, Hardware, Pen, Testing, Vision, Functions, Events, HTML, Libraries, Values, Secrets)
- **Dual-language code generation** — every block outputs real JavaScript AND Python
- **Sandboxed execution** — iframe sandbox for JS, Pyodide for Python, both in-browser
- **HTML/CSS blocks** with live preview in the sandbox
- **Functions** — create, call, return values, local variables
- **Events** — key press handlers, click handlers
- **Monaco Editor** code view (same editor as VS Code)
- **Tauri desktop app** — offline, cross-platform

### Learning
- **141 challenges** across **27 themed packs** (Minecraft, Space, Crypto, Secret Agent, and more)
- **Block Islands** — jigsaw-style puzzles where scattered blocks must be reconnected
- **Code Golf** — 18 efficiency puzzles across 3 packs
- **Blocksets** — 30 step-by-step guided tutorials across 6 packs
- **Code Labs** — 11 JavaScript packs with CodeMirror editor
- **Learn** — 10-chapter JavaScript fundamentals course with 41 interactive exercises

### Creative Tools
- **Create Block** — write a function, define inputs/outputs, run tests, it becomes a block
- **Sprite Editor** — visual pixel art canvas (16x16, 24x24, 32x32) with animation frames, tools (draw, erase, fill, color pick), 32-color palette, live preview
- **Code to Blocks** — paste JavaScript, get blocks on the workspace
- **Scratch Import** — import .sb3 files, convert Scratch projects to CryptoBlocks with conversion stats

### Collaboration
- **Coding with Friends** — real-time collaborative workspace editing via Yjs CRDTs + PartyKit WebSockets
- **Room codes** — 6-letter codes to join, no accounts needed
- **Presence** — see colored outlines on blocks your friends are touching
- **Run for Everyone** — broadcast execution to all peers
- **Up to 6 editors** per room

### Social
- **Shareplace** — marketplace to browse and discover shared projects
- **Dashboard** — personal stats and project management
- **Profile** — user settings and editor config

### Export
- **Save/Load .blocks** project files
- **Export as HTML** — standalone HTML file
- **Export as App (PWA)** — downloadable ZIP with manifest, service worker, icons — installable on phones/desktops
- **Copy Embed Snippet** — embeddable script tag
- **Publish to GitHub** — deploy to GitHub Pages

### Easter Eggs
- **Hacker Mode** — click the logo 7 times, or enter the Konami code
- **Hacker Terminal** — press backtick (`) for a hidden CLI with commands: `help`, `hack`, `matrix`, `neofetch`, `cowsay`, `fortune`, `rickroll`, theme switching
- **Snake** — terminal command `snake` launches a game that eats actual page elements
- **Space Invaders** — terminal command `invaders` launches aliens that abduct your code
- **Secret Blocks** — 13 hidden blocks in the ??? category (hacker mode only)

### Version Control
- **Save Checkpoint** — snapshot workspace to IndexedDB
- **History Panel** — timeline of checkpoints with rollback
- **Auto-save** — configurable interval (1/2/5/10 min)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4 |
| Block Editor | Google Blockly (Zelos renderer) |
| Code View | Monaco Editor |
| JS Execution | Sandboxed iframe (blob URL + allow-scripts) |
| Python Execution | Pyodide (CPython → WebAssembly) |
| Collaboration | Yjs (CRDT) + PartyKit (edge WebSockets) |
| Sprite Editor | Canvas API, custom pixel grid |
| Desktop | Tauri v2 (Rust) |
| Testing | Vitest (2,766+ tests) + Playwright E2E |
| Site | Hugo + Tailwind + SCSS, Netlify |

### Auth & Backend (Setting Up)
- **Clerk** — authentication
- **Turso** — SQLite edge database
- **PartyKit** — real-time collab rooms

---

## What Makes This Different

| | Scratch | Snap! | CryptoBlocks |
|---|---|---|---|
| **Code output** | None (dead end) | None | Real JS + Python |
| **Block count** | ~120 | ~80 | **280+** |
| **Categories** | 8 | 8 | **23** |
| **Custom blocks** | Limited | Yes | Write code → becomes a block |
| **Collaboration** | No | No | **Real-time (Yjs)** |
| **Challenges** | No | No | **141 across 27 packs** |
| **Sprite editor** | Built-in | No | **Built-in** |
| **PWA export** | No | No | **Yes** |
| **Scratch import** | N/A | No | **Yes (.sb3)** |
| **Desktop app** | Electron | Browser only | **Tauri** |
| **Target age** | 8-12 | University | **10-18** |

---

## Roadmap

### Done
- [x] 280+ blocks across 23 categories with dual JS/Python generation
- [x] 141 challenges, 30 blocksets, 18 golf puzzles, 11 code labs
- [x] 10-chapter Learn JavaScript course with 41 exercises
- [x] Create Block editor (write code → becomes a block)
- [x] Sprite Editor (pixel art canvas with animation frames)
- [x] Coding with Friends (real-time collab via Yjs + PartyKit)
- [x] Scratch .sb3 import with conversion stats
- [x] PWA export (installable web app)
- [x] Shareplace marketplace, Dashboard, Profile pages
- [x] Hacker Terminal with Snake & Space Invaders
- [x] Version control (checkpoints, history, auto-save)
- [x] Tauri desktop app
- [x] Hugo marketing site with blog

### Next Up
- [ ] **Clerk + Turso** — auth and database wiring
- [ ] **Teacher Dashboard** — assignments, progress tracking, grading (unlocks school sales)
- [ ] **Bi-directional editing** — edit code AND blocks, changes sync both ways (the moat)
- [ ] **Shareplace backend** — real uploads, browsing, remixing with Turso
- [ ] **Ranks & Badges** — CoD-style prestige system for challenge completion

### Future
- [ ] Scratch project import improvements (more opcode coverage)
- [ ] Classroom licenses and school onboarding
- [ ] Voice chat in collab rooms
- [ ] Room history / replay
- [ ] Mobile-native app
- [ ] Localization (multi-language blocks + tutorials)
- [ ] API for embedding the block editor in external platforms

---

## Monetization

**Free forever:** All blocks, visual editor, challenges, blocksets, code golf, sprite editor, collab, examples.

**Premium:** Code Labs, guided curriculum, advanced CS courses, teacher dashboard, classroom licenses.

**The line:** The sandbox + challenges = free hook. Guided curriculum + builder tools + institutional features = premium.

**What we will NOT do:** Paywall blocks, gate K-12 content, show ads to kids, sell user data.

---

## Origin Story

CryptoBlocks started as an attack framework for a security competition. Reusable "lego" pieces in Python — small functions that each do one thing well. Snap them together in different orders, get different results. One night, staring at the terminal:

> "This is just Scratch for hackers. Why doesn't this exist for everyone?"

The hacking part stays behind. What comes forward is the idea: **small, composable, shareable blocks of real code that kids can see, use, modify, and eventually write themselves.**

---

*Born from a CTF competition. Built for the next generation of builders.*
