---
title: 'Change Log'
PageTitle: 'CryptoBlocks Change Log'
description: 'What is new in CryptoBlocks. Version history, features, fixes, and improvements.'
priority: 0.6
---

<!--
## v0.5 — April 2026

The builder's update. Workspace tools, scope system overhaul, bidirectional debugging, keyboard shortcuts, and a full security sweep. Built for the kids who are serious about building.

### Workspace Tools
- **Frame Blocks** — Figma-style visual grouping for organizing your workspace. Color-coded (8 colors), resizable (100–2000px), blocks inside stick when you move the frame
- **Whiteboard** — freeform drawing canvas in the Peek panel. 8 colors, 4 stroke widths, eraser, touch support. Saved to localStorage (2 MB cap)
- **Backpack** — Minecraft-style 9-slot hotbar. Right-click a block → "Add to Backpack", click a slot to place it. Persists across sessions
- **Toolbox Search** — search bar above the Brick Bin to filter blocks by name in real time
- **Block Warnings** — yellow triangle indicators on blocks with common issues (empty inputs, undefined functions) after each run
- **Workspace Color Picker** — single color wheel to set any background color for your workspace
- **Show Grid Toggle** — optional grid dots on the workspace canvas
- **Block Search** (Cmd+F) — overlay search to find blocks on the workspace
- **Collapse All** (Cmd+.) — collapse every block on the workspace at once
- **Yellow Comment Blocks** — comment blocks now render in canary yellow for visibility

### Unified Scope System
- **Toggleable global/local blocks** — lists and objects now have a single block with a dropdown to choose global or local scope. No more separate block types
- **`list_create`** — create a list in global or local scope from one block
- **`list_add`, `list_get`, `list_set`, `list_len`** — all scope-aware with dropdown toggle
- **`obj_create`, `obj_set`, `obj_get`** — objects with the same global/local toggle
- **Legacy blocks hidden** — old scope-specific blocks still work but are hidden from the Brick Bin

### Bidirectional Code ↔ Block Debugging
- **Click a code line → highlight the block** — source map markers (`/*__cb:BLOCKID*/`) injected into generated code, Monaco line clicks scroll to and select the block
- **Right-click a block → "Show Line Number"** — context menu option shows which line of code that block generated
- **Line numbers in PlainCodeView** — clickable gutter rows for the non-Monaco fallback

### Keyboard Shortcuts
- **Cmd+G** — snap all selected blocks to grid
- **Cmd+A** — select all blocks on the workspace
- **Cmd+L** — tidy layout (two-column: functions left, chains right)
- **Cmd+Click** — toggle multi-block selection
- **Cmd+Shift+S** — quick-create text block at cursor
- **Cmd+I** — quick-create number block at cursor
- **Cmd+B** — quick-create boolean block at cursor
- **Hotkeys card** in Settings — flip to see all shortcuts

### New Blocks
- **`min_max`** — toggleable min/max dropdown, one block for both
- **`count_from`** — custom for loop with start, end, and step
- **`set_in_list`** — set item at index in a list by name
- **Dynamic function params** — +/− buttons to add/remove arguments, serialized with `saveExtraState`

### Per-Project Version History
- **Checkpoints scoped to project ID** — each project maintains its own history timeline
- **Version control badges** — First Commit, Historian (10 checkpoints), Time Lord (50 checkpoints)

### Time Travel Fix
- **Actually works now** — fixed race condition where the workspace ref wasn't available when the listener tried to attach. Polls until ready, then captures every edit

### Stats Sync
- **Server-side stats** — all user stats (runs, blocks, streaks, language breakdown) sync to Turso
- **Cross-device persistence** — sign in on any machine and your stats merge (MAX-based strategy)
- **Debounced sync** — pushes to server 5 seconds after last change, not on every event

### Proof of Work
- **Anti-gaming filter** on block-count badges — requires minimum unique block types and maximum single-type dominance percentage
- **Thresholds scale with tier** — Block Party (5 unique, 60% max) up to Block God (25 unique, 30% max)
- **Block count inflation fix** — `Blockly.Events.disable()` during workspace load prevents BLOCK_CREATE events from counting loaded blocks

### 80+ Achievements (up from 42)
- **Block milestones**: Block Party (50), Block Master (100), Megastructure (1K), Block 2500, Block 5000, Block God (7.5K), Block 10000
- **Cumulative milestones**: Mile Placer (1,600), Block 5K, Block 10K, Block 25K, Block 50K, Moon Walker (238,900)
- **Crypto badges**: Finney (6 crypto blocks), Satoshi (8 crypto blocks)
- **Green Cube Collectors**: 7 active days, 50 in 90 days, 180 in a year
- **Secret**: Necromancer (use a dead block), Early Bird (4–6am), Irrational (31,415 total blocks — digits of π)
- **Streak**: 14-day streak badge
- **Featured**: Star (featured project), Site Builder
- **Import**: The Multi-Platformer (import from Scratch), Napster (import 10 Scratch projects)
- **Publishing**: Going Global (GitHub publish), The Contributor (30 Shareplace shares), Trendsetter (5 remixes), The Influencer (30 remixes)

### Security Sweep (Purple + Black + Red Team)
- **Backpack storage guard** — validates localStorage data on load, caps size
- **Whiteboard 2 MB cap** — prevents localStorage exhaustion
- **ToolboxSearch XML escaping** — prevents injection via block names
- **Stats endpoint hardened** — 64 KB payload cap, NaN/Infinity guards, date key validation, 400-entry runsByDate limit
- **DRY refactors** — `mutateAndSync` helper, shared `formatDateKey`, `computeBounds` helper in Minimap

### Bug Fixes
- `MAX_JSON_DEPTH` bumped to 350 for large block projects (Pac-Man exceeded 50)
- Comment block `*/` in text breaks JS output → escaped to `* /`
- Function block duplicate loses params → `saveExtraState`/`loadExtraState` serialization
- Console panel stays visible when toggling Peek Code off → now hides together
- Code view destroyed after Whiteboard → switched to CSS `hidden` toggle instead of unmount
- Delete button invisible (`text-base` is Tailwind font-size) → changed to `text-white`
- Hotkey blocks spawning at (0,0) → fixed with scroll offset divided by scale

-->

---

## v0.4 — April 2026

The badge system, CTF, and security hardening update. COD-style achievements with server-side tracking, a hidden treasure hunt (CTF) baked into the app, CryptDOOM raycaster, procedural levels, and a full security audit.

### COD-Style Badge System
- **Server-side achievement tracking** — Turso `user_achievements` table, syncs with localStorage
- **Achievements API** — catalog, my badges, unlock, showcase, rarity-weighted leaderboard
- **Badge Showcase** — new tab in Stats panel, grid of all badges with rarity glow effects
- **Locked badges** — greyed/silhouetted with "???" for secret ones
- **Legendary shimmer** — animated gold gradient on legendary badges
- **COD unlock animation** — full-screen dark overlay, rarity-colored glow burst, badge bounce, staggered text, click to dismiss
- **Bidirectional sync** — localStorage ↔ server on boot and unlock
- **42 total achievements** (up from 36)

### CTF — Capture the Flag
- **Hidden seed projects** — discoverable by the curious, each awards a secret legendary badge
- **Egg Vault** — hidden terminal command with cryptic hints pointing to the seeds
- **Seed remixes hidden** from Shareplace main feed (badge-only flow)
- **Hello World seed** — remix to earn the "Hello Indeed" badge

### CryptDOOM
- **Wolfenstein-style raycaster** — type `doom` in the Hacker Terminal
- **DDA raycasting** with fisheye correction, z-buffer sprite clipping
- **Green phosphor CRT aesthetic** — scanlines, vignette, glow
- **Enemy AI** — skull enemies chase, attack (8 damage/hit), can kill you
- **Procedural levels** — random map generator, enemy count scales (3 + level×2)
- **Infinite progression** — clear a level → SPACE for next, partial HP heal
- **Procedural audio** — dark ambient soundtrack (sawtooth drone, sub pulse, eerie pad)
- **SFX** — shoot, kill, hurt, death sounds via Web Audio API
- **HUD** — level counter, kill tracker, HP bar, minimap, crosshair

### Terminal Easter Egg Achievements
- **The Cake Is A Lie** — type `cake`
- **Egg Hunter** — open the Egg Vault
- **Snek** — play Snake
- **Space Cadet** — play Space Invaders
- **Doom Slayer** — clear Level 1 of CryptDOOM
- **Doom Veteran** — reach Level 5 of CryptDOOM

### Toolbar Split
- **File menu** trimmed — save, load, import, checkpoint, history, settings
- **Share menu** (new) — export HTML/PWA, embed snippet, publish to GitHub, share link

### i18n
- **Spanish translations** — ~200 strings covering blocks, categories, input labels, tooltips, UI
- **Language toggle** in Settings (English ↔ Español)
- **Block labels** wrapped with `t()` for runtime translation

### Security Hardening (Red Team + Black Team Audit)
- **Sprite likes dedup** — `sprite_likes` junction table prevents infinite like inflation
- **Cross-classroom IDOR fix** — discussion replies validated against classroom membership
- **Share Link author fix** — uses real Clerk username instead of hardcoded 'Anonymous'
- **Parameterized seed SQL** — eliminated string interpolation in migrations
- **Security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Leaderboard bounded** — LIMIT 100 on GROUP BY to prevent full table scan
- **CORS fix** — classroom export/submission download endpoints

### DRY Refactors
- **`getClerkToken()` / `getClerkUserName()`** — extracted to auth module (killed 4 duplicated casts)
- **Rarity data module** — single source of truth for colors, labels, styles
- **ShareplaceModal** — shared modal shell cut UploadModal and EditListingModal in half
- **CATEGORIES constant** — extracted from duplicate arrays

### Bug Fixes
- `blockCount` string→number type mismatch on save
- `MAX_JSON_DEPTH` bumped to 50 for deeply nested workspaces
- `authorName: 'User'` hardcoded in all save paths → reads Clerk name
- EditListingModal and RemoveListingModal were `console.log` stubs → wired to API
- `isOwner` was always false on Shareplace → checks Clerk user ID
- TagSelector: clickable pill selector replaces comma text input
- Shareplace pagination: 12/25/50/100 per page

---

## v0.3.1 — April 2026

Polish, monetization, and power tools. Assignments, notifications, level editor, global leaderboards, Stripe billing, light theme, and 22 new achievements.

### Billing & Monetization
- **Stripe integration** — $10/month Pro subscription with Checkout + Customer Portal
- **Premium gates** on: Import from Scratch, Export HTML/PWA/Embed, Create Block, Code to Blocks, Sprite Editor, Level Editor, Classrooms, Code Golf, Code Lab
- **Free forever**: all blocks, editor, collab, challenges, daily, Shareplace, AI, games, hardware, time travel
- **Admin override** via `VITE_ADMIN_EMAILS` env var — full Pro without a subscription
- **Subscription management** in Profile — shows plan status, upgrade CTA, or Manage Subscription (Stripe Portal)

### Assignments
- **Teacher creates assignments** — title + description, posted to a classroom
- **Students submit work** — reads workspace from localStorage, POSTs to API
- **Teacher reviews** — inline feedback per submission, status badges (submitted/reviewed)
- **Submission count** on each assignment card

### Notifications
- **Bell icon** in toolbar with unread count badge
- **Auto-notifications** on like ("Someone liked your project") and remix ("Your project was remixed")
- **Dropdown** with recent notifications, type icons, relative timestamps
- **Mark all read** — clears badge
- **60-second polling** when signed in

### Level Editor
- **Visual drag-and-drop** platformer level designer (Build → Level Editor)
- **20px snap grid** on 800×480 canvas
- **Click+drag** to draw platforms, 7 color options
- **Spawn point tool** (🦊) — click to place player start
- **Erase tool** — click platforms to delete
- **Export to Editor** — generates set_canvas, set_gravity, create_sprite, and add_platform blocks

### Daily Challenge Global Leaderboard
- **daily_scores table** in Turso — tracks solves with best-score upsert
- **Syncs to server** when a challenge is solved (via ChallengeBanner)
- **🏆 Top Solvers** (all-time) + **🎯 Today's Solvers** (fewest blocks) on /daily

### Shareplace Moderation
- **Banned word scan** — profanity + slurs rejected on upload
- **URL blocking** — http/https/www links rejected in name and description
- **Report button** — flag a project for review with a reason (auth required)

### Procedural Generation
- **spawn_random_platform** — place a platform at X with random Y in range
- **spawn_pipe_pair** — Flappy Bird-style top+bottom pipes with random gap
- **remove_offscreen_platforms** — garbage-collect platforms behind the camera

### Achievements Expanded (14 → 36)
- **Collab**: Team Player, Teacher Mode
- **Games**: Game On, Level Designer, Pixel Artist
- **AI**: Voice Activated, I See You
- **Hardware**: Hardware Hacker
- **Daily**: Daily Starter, Three-peat (3-day), On Fire (7-day), Unstoppable (30-day)
- **Shareplace**: First Share, Popular (10 likes), Remixer, Inspiration
- **Prestige**: Marathon (500 runs), Millennial (1000 runs), Block Master (100+), Renaissance Coder (10+ categories)
- **Secret**: Time Traveler, Red Pill

### Share Cards
- **Auto-generated branded PNG** (1200×630 Twitter/OG standard)
- Project name, author, category, stats, CryptoBlocks URL
- **"Share Card" button** in project detail modal

### Light Theme
- **Full light mode** via Profile → Settings → Theme
- CSS overrides for backgrounds, text, borders, Blockly workspace, toolbar
- Persists in localStorage, applied on mount

### UI & Navigation
- **Menu dropdown** now includes Dashboard, Profile & Settings, Classrooms links
- **Classroom invite links** — `/teacher?join=CODE` auto-opens the join modal
- **Daily streak** shown in Menu dropdown next to Daily Challenge link
- **Leaderboard** link added to Menu dropdown
- **Remix badge** on project cards (🔀 remix tag when parentId exists)
- **Download count tracking** — increments in Turso on every .blocks download
- **Auth-protected likes** — Clerk JWT required server-side

### Bug Fixes
- Block counter only counts manual drags from toolbox, not workspace loads
- Flappy Bird tuned — wider gaps, more pipe spacing, lighter gravity
- Open in Editor uses full page reload so workspace loads correctly
- Remix modal uses full page reload too
- Collab avatar fallback color when peer.user.color is empty

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
