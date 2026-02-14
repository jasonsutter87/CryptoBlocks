# CryptoBlocks

**A visual coding platform where kids and young coders build programs by snapping blocks together — then level up by writing their own.**

---

## The Pitch

Scratch proved that kids can code when you remove the syntax barrier. CryptoBlocks takes that further:

1. **Start with blocks.** Drag, snap, run. See what happens.
2. **Peek inside.** Every block is real code. Flip it over, read the JavaScript or Python underneath.
3. **Write your own.** When you're ready, write a function. If it works, it becomes a block. Your block. With your name on it.
4. **Share it.** Publish to the marketplace. Other kids snap your block into their projects. You see how many people use it.

The gap between "visual coding toy" and "real programming" is where most kids quit. CryptoBlocks is the bridge.

---

## Origin Story

This started as an attack framework for a security competition. We built reusable "lego" pieces in Python — small functions that each do one thing well. Snap them together in different orders, get different results. One night, staring at the terminal, it hit us:

> "This is just Scratch for hackers. Why doesn't this exist for everyone?"

The hacking part stays behind. What comes forward is the idea: **small, composable, shareable blocks of real code that kids can see, use, modify, and eventually write themselves.**

---

## How It Works



### working CTF CODE
/Users/jasonsutter/Documents/CTF/1Password/ATTACKS/lego

### Phase 1: Snap

Kids start in the visual editor. Blocks snap together left-to-right or top-to-bottom. Each block is a function — it takes inputs on the left and produces outputs on the right. Wire them together.

```
┌──────────┐    ┌──────────────┐    ┌───────────┐
│  Ask Name │───▶│  Say "Hello"  │───▶│  Wait 2s  │
│           │    │  + name       │    │           │
└──────────┘    └──────────────┘    └───────────┘
```

Hit play. See it run. Change a block. Run again. Instant feedback loop.

### Phase 2: Peek

Every block has a "view code" toggle. Flip it:

```
┌──────────────────────────────┐
│  Say "Hello" + name          │
│  ─────────────────────────── │
│  function greet(name) {      │
│    return "Hello, " + name;  │
│  }                           │
└──────────────────────────────┘
```

The code IS the block. There's no abstraction hiding "the real stuff." The visual editor is just a different view of the same program. Kids learn to read code by seeing what their blocks actually do.

Toggle between JavaScript and Python with one click:

```javascript
// JavaScript
function greet(name) {
  return "Hello, " + name;
}
```

```python
# Python
def greet(name):
    return "Hello, " + name
```

Same block. Two languages. Kids see that programming concepts are universal — syntax is just spelling.

### Phase 3: Write

The "Create Block" editor is where it gets real:

1. **Write a function** in JS or Python (or both)
2. **Define inputs and outputs** (what goes in, what comes out)
3. **Write a test** — at least one example of input → expected output
4. **Hit "Build"** — if the tests pass, it becomes a block
5. **Name it, color it, describe it** — it's yours

If the code doesn't work, it doesn't become a block. Period. This teaches:
- **Testing is not optional.** Your code has to prove it works.
- **Inputs and outputs matter.** If you can't define them, you don't understand your own function.
- **Working code is the standard.** Not "almost working." Not "works on my machine." Green tests or no block.

### Phase 4: Share

Publish your block to the marketplace. Other users can:
- **Use it** — snap it into their projects
- **Star it** — show appreciation
- **Fork it** — copy it, modify it, publish their version
- **View the code** — learn from your implementation

You can see:
- How many people use your block
- What projects include it
- Comments and questions from other users

---

## The Marketplace

### Browsing

Blocks are organized by category:

| Category | Examples |
|----------|----------|
| **Basics** | Variables, loops, if/else, print, input |
| **Math** | Add, multiply, random, round, min/max |
| **Text** | Uppercase, split, replace, contains, reverse |
| **Lists** | Sort, filter, map, find, slice |
| **Logic** | AND, OR, NOT, compare, switch |
| **Web** | Fetch URL, parse JSON, display image |
| **Games** | Move sprite, detect collision, score counter |
| **Sound** | Play tone, record, text-to-speech |
| **Art** | Draw shape, color picker, animation frame |
| **Data** | Read CSV, chart it, average, count |
| **Crypto** | Hash text, encode base64, generate password |
| **AI** | Classify image, generate text, sentiment |
| **Hardware** | LED on/off, read sensor, servo move (Raspberry Pi) |

Categories grow as the community builds. If enough blocks cluster around a new topic, it becomes a category.

### Quality Tiers

Not all blocks are equal:

- **Official** — Built by the CryptoBlocks team. Tested, documented, guaranteed to work.
- **Verified** — Community-built, reviewed by moderators. Code is clean, tests pass, description is accurate.
- **Community** — Published by users. Tests pass (required), but not reviewed. Use at your own risk.
- **Experimental** — Marked by the creator as "work in progress." May break. Learning in public.

### Trading and Remix Culture

- Blocks are free to use (this is an educational platform, not a paywall)
- **Credits** are earned by publishing popular blocks, helping others, writing tutorials
- Credits unlock cosmetic features: block colors, profile badges, custom themes
- **Remix chains** show lineage: "This block was forked from @maya's `sort-by-color`, which was forked from @dev_kid's `basic-sort`"
- Attribution is automatic and permanent. You always get credit.

---

## User Profiles

Every user gets:

### Profile Page
- **Username and avatar**
- **Bio** — "I'm 14, I like making games and breaking things (safely)"
- **Stats** — blocks published, projects built, blocks used by others
- **Badges** — earned through milestones (first block, first 100 uses, first tutorial, etc.)
- **Pinned projects** — showcase your best work

### Workspace
- **My Projects** — folders of block programs you've built
- **My Blocks** — blocks you've created and published
- **Starred** — blocks and projects you've saved from others
- **Drafts** — work in progress (private until you publish)

### Folders
Organize however you want:
```
My Projects/
├── Games/
│   ├── Space Invaders
│   └── Tic Tac Toe
├── School/
│   ├── Math Quiz
│   └── Science Fair Data
├── Experiments/
│   └── Trying Sorting Algorithms
└── Tutorials I'm Following/
    └── Build a Chatbot
```

Folders can be **public** (anyone can see) or **private** (just you). Public folders become shareable portfolios — kids can show parents, teachers, or future employers what they've built.

---

## The Learning Hub

### Blog / Teaching Section

Not a boring docs site. A living, growing collection of "how to think like a programmer" content:

#### How to Code
- **"Your First Block"** — 5-minute walkthrough from zero to running program
- **"Variables Are Boxes"** — mental models that stick
- **"Loops: Doing Things Again (Without Copying)"** — why repetition is the enemy
- **"If/Else: Teaching Your Code to Make Decisions"** — branching logic for 10-year-olds
- **"Functions: Giving Your Code a Name"** — the gateway to writing blocks

#### How to Think
- **"Break Big Problems Into Small Ones"** — decomposition is the #1 skill
- **"What Does 'Done' Look Like?"** — defining success before you start
- **"When Your Code Doesn't Work"** — debugging as detective work, not failure
- **"Reading Other People's Code"** — the skill nobody teaches but everyone needs
- **"Asking Good Questions"** — how to get help without "it doesn't work plz help"

#### How to Keep DRY
- **"Don't Repeat Yourself (and Why)"** — the first engineering principle kids should learn
- **"When You Copy-Paste, You Should Feel Bad"** — recognizing the smell
- **"Turn Repeated Code Into a Block"** — the practical escape from copy-paste
- **"One Job Per Block"** — single responsibility for kids
- **"Naming Things So Future-You Understands"** — the hardest problem in CS, accessible

#### How to Share
- **"Writing a Block Description People Actually Read"**
- **"Good Tests = Trust"** — why testing your block matters for others
- **"Forking Without Being Rude"** — remix culture and attribution
- **"Code Review for Kids"** — giving feedback that helps, not hurts

### Community Tutorials
Users can publish their own tutorials. Same quality tiers as blocks:
- Walk someone through building a project step by step
- Embed live block editors in the tutorial (readers can modify and run inline)
- Tutorials that use your blocks naturally drive adoption

---

## Tech Stack (Preliminary)

### Frontend
- **React** (or Solid) — component-based UI
- **Google Blockly** — visual block editor engine (same core as Scratch)
- **Monaco Editor** — code view (same editor as VS Code)
- **Tailwind** — styling

### Execution
- **JavaScript** — runs in-browser via sandboxed iframe/Web Worker
- **Python** — runs in-browser via Pyodide (CPython compiled to WebAssembly)
- **Dual execution** — same block definition, both languages, user picks which to view/run

### Backend
- **Node.js or Go** — API server
- **PostgreSQL** — users, blocks, projects, marketplace
- **S3/R2** — block assets, project snapshots
- **Auth** — OAuth (GitHub, Google) + email/password

### Desktop App
- **Tauri** (Rust + web frontend) — lightweight, fast, cross-platform
- Same UI as web, but local file system access
- Offline mode — build and run without internet
- Sync to cloud when back online

### Block Definition Format
```json
{
  "name": "reverse-text",
  "author": "code_kid_42",
  "version": "1.0.0",
  "description": "Reverses any text string",
  "category": "Text",
  "inputs": [
    { "name": "text", "type": "string", "description": "The text to reverse" }
  ],
  "outputs": [
    { "name": "reversed", "type": "string" }
  ],
  "implementations": {
    "javascript": "function reverseText(text) {\n  return text.split('').reverse().join('');\n}",
    "python": "def reverse_text(text):\n    return text[::-1]"
  },
  "tests": [
    { "input": { "text": "hello" }, "expected": { "reversed": "olleh" } },
    { "input": { "text": "12345" }, "expected": { "reversed": "54321" } },
    { "input": { "text": "" }, "expected": { "reversed": "" } }
  ],
  "color": "#4A90D9",
  "icon": "arrow-left-right"
}
```

This is the universal format. Visual editor reads it. Code editor reads it. Marketplace indexes it. Test runner validates it. One definition, everywhere.

---

## What Makes This Different From Scratch

| | Scratch | CryptoBlocks |
|---|---|---|
| **Target age** | 8-12 | 10-18 (and curious adults) |
| **Code visibility** | Hidden | Every block shows its code |
| **Languages** | Scratch-only | JavaScript + Python (real languages) |
| **User-created blocks** | Limited (custom blocks, no sharing) | First-class: write, test, publish, trade |
| **Marketplace** | Project sharing only | Block-level sharing + remix |
| **Path to "real" coding** | Dead end (must switch tools) | Smooth gradient (blocks → code → both) |
| **Testing** | None | Required for block publishing |
| **Desktop app** | Yes (Electron) | Yes (Tauri, lighter) |
| **Offline** | Yes | Yes |

The key difference: **Scratch is a destination. CryptoBlocks is a bridge.** Kids don't "graduate" from CryptoBlocks — they gradually shift from visual to code as they get comfortable. The tool grows with them.

---

## Monetization (Ideas, Not Decisions)

The platform is free for kids. Always. Non-negotiable.

Revenue options:
- **School/classroom licenses** — teacher dashboard, assignment system, progress tracking
- **Premium cosmetics** — custom block themes, profile frames, workspace skins
- **Certification program** — "CryptoBlocks Certified" badges for completing skill paths
- **API access** — let schools/companies embed the block editor in their own platforms
- **Sponsored block categories** — "Robotics blocks powered by Arduino" (not ads, integrations)

What we will NOT do:
- Paywall blocks behind a subscription
- Show ads to kids
- Sell user data
- Charge for core features

---

## Existing Assets (From the Lego Framework)

The CTF project already produced production-tested primitives that demonstrate the block architecture:

### Session Blocks (Python, proven)
- `login()` — authenticate and establish session
- `load_session()` — restore from saved state
- `save_session()` — persist for later

### Crypto Blocks (Python, proven)
- `encrypt_field()` / `decrypt_field()` — AES-256-GCM
- `generate_mac()` — HMAC-SHA256 request signing
- `decode_base64url()` / `encode_base64url()` — encoding
- `hash_password()` — PBKDF2 key derivation

### API Blocks (Python, proven)
- `get()` / `post()` / `patch()` — HTTP with auto-auth
- `parse_response()` — JSON handling + error extraction

### Data Blocks (Python, proven)
- `safe_serialize()` — convert anything to JSON-safe format
- `compare_runs()` — structural diff between two sequences

These won't ship as-is (they're CTF-specific), but they prove the architecture: small functions with clear inputs/outputs that compose into larger programs. That's exactly the block model.

---

## Roadmap (Rough)

### Phase 0: Prototype
- [ ] Blockly integration with custom block definitions
- [ ] Dual JS/Python execution in browser
- [ ] 20 built-in blocks across 4 categories
- [ ] "View code" toggle on every block
- [ ] Single-user, no accounts, local only

### Phase 1: Create
- [ ] "Create Block" editor with test requirement
- [ ] Block definition format finalized
- [ ] User accounts and authentication
- [ ] Personal workspace with folders
- [ ] Save/load projects

### Phase 2: Share
- [ ] Marketplace launch (browse, use, star)
- [ ] User profiles and public portfolios
- [ ] Fork and remix with attribution chain
- [ ] Quality tiers (Official, Verified, Community)
- [ ] Search and category filtering

### Phase 3: Learn
- [ ] Learning Hub with blog/tutorial system
- [ ] Community tutorials with embedded editors
- [ ] Skill paths ("Beginner → Variables → Loops → Functions → Your First Block")
- [ ] Achievement badges

### Phase 4: Scale
- [ ] Desktop app (Tauri)
- [ ] Classroom/teacher features
- [ ] API for embedding
- [ ] Mobile-friendly web editor
- [ ] Localization (blocks and tutorials in multiple languages)

---

## The Name

"CryptoBlocks" is a working title. It nods to the project's origin in cryptography, but the platform is general-purpose. Open to better names. Requirements:
- Short
- Memorable
- Not already taken
- Doesn't sound like cryptocurrency/blockchain (different thing entirely)
- Works as a verb: "I cryptoblocked it" / "just block it together"

---

## One More Thing

The best programmers we know didn't learn from textbooks. They learned by building things they cared about, breaking things that confused them, and showing things to people who got excited.

CryptoBlocks doesn't teach programming. It creates the conditions where programming teaches itself.

---

*Born from a CTF competition. Built for the next generation of builders.*
