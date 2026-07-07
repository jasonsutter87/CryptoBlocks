"""Single source of truth for the CryptoBlocks brain.

Two layers:
  REAL  — facts pulled straight from the CryptoBlocks README (the actual
          product). These keep the brain honest about what the thing is.
  FICTION — an invented company wrapper (founding, team, HQ, pricing,
          contact). The product is real; the *company* around it is
          synthetic so the brain has a full "about us" to talk about.

Everything the brain will ever know flows from this file. Nothing here
mentions any company, product, person, or place other than CryptoBlocks
— that's deliberate. A model trained ONLY on text generated from these
facts cannot talk about anything else, because it never sees anything
else.
"""

# ─────────────────────────── REAL PRODUCT ────────────────────────────

TAGLINE = (
    "A visual coding platform where kids and young coders build programs "
    "by snapping blocks together, then level up by writing their own."
)

PITCH_STEPS = [
    "Start with blocks. Drag, snap, run, and see what happens.",
    "Peek inside. Every block is real code you can flip over and read.",
    "Write your own. When you are ready, write a function, and if it "
    "works it becomes a block with your name on it.",
    "Share it. Publish to the Shareplace marketplace so other kids can "
    "snap your block into their projects.",
]

# (feature, one-line description) — the spine of the product knowledge.
FEATURES = [
    ("blocks", "CryptoBlocks has 320 blocks across 24 categories."),
    ("dual language", "Every block outputs real JavaScript and real Python."),
    ("sandbox", "Code runs in a sandboxed iframe for JavaScript and Pyodide "
                "for Python, all in the browser."),
    ("functions", "You can create functions, call them, return values, and "
                  "use local variables."),
    ("events", "There are blocks for key press handlers and click handlers."),
    ("monaco", "The code view uses the Monaco editor, the same editor as "
               "VS Code."),
    ("desktop", "There is a Tauri desktop app that works offline and "
                "cross-platform."),
    ("challenges", "There are 141 challenges across 27 themed packs like "
                   "Minecraft, Space, Crypto, and Secret Agent."),
    ("block islands", "Block Islands are jigsaw puzzles where scattered "
                      "blocks must be reconnected."),
    ("code golf", "Code Golf has 18 efficiency puzzles across 3 packs."),
    ("blocksets", "Blocksets are 30 step-by-step guided tutorials across 6 "
                  "packs."),
    ("code labs", "Code Labs are 11 JavaScript packs with a CodeMirror "
                  "editor."),
    ("learn", "The Learn course is a 10-chapter JavaScript fundamentals "
              "course with 41 interactive exercises."),
    ("create block", "Create Block lets you write a function, define inputs "
                     "and outputs, run tests, and turn it into a block."),
    ("sprite editor", "The Sprite Editor is a pixel art canvas with sizes "
                      "16x16, 24x24, and 32x32, animation frames, and a "
                      "32-color palette."),
    ("code to blocks", "Code to Blocks lets you paste JavaScript and get "
                       "blocks on the workspace."),
    ("scratch import", "You can import Scratch .sb3 files and convert them "
                       "to CryptoBlocks with conversion stats."),
    ("collab", "Coding with Friends is a real-time collaborative workspace "
               "using Yjs CRDTs and PartyKit WebSockets."),
    ("room codes", "You join a collaboration room with a 6-letter room "
                   "code, and up to 6 people can edit together."),
    ("clerk auth", "You sign in with Google or GitHub through Clerk "
                   "authentication."),
    ("teacher dashboard", "Teachers can create classrooms, share join "
                          "codes, and view student projects."),
    ("shareplace", "Shareplace is a database-backed marketplace where you "
                   "upload, download, like, and remix projects."),
    ("remix tree", "The remix tree shows visual lineage of who remixed "
                   "whose project."),
    ("daily challenge", "The Daily Challenge gives one puzzle per day with "
                        "streak tracking."),
    ("game engine", "The 2D game engine has gravity, velocity, AABB "
                    "platform collision, and a camera that follows the "
                    "player."),
    ("speech", "Client-side speech blocks can say text, listen, and stop "
               "speaking using the Web Speech API."),
    ("image classifier", "An image classifier uses MobileNet to recognize "
                         "1000 ImageNet classes, all in the browser."),
    ("hand tracking", "Hand tracking uses MediaPipe Hands for finger "
                      "position, pinch detection, and finger counting."),
    ("microbit", "There are 15 micro:bit WebBluetooth blocks for LEDs, "
                 "speaker, sensors, and servos."),
    ("cyberbot", "The Cyber:bot drive helper moves a robot forward, back, "
                 "left, and right with timed servo control."),
    ("export html", "You can export your project as a standalone HTML "
                    "file."),
    ("export pwa", "You can export your project as an installable PWA app "
                   "with a manifest, service worker, and icons."),
    ("github", "You can publish your project to GitHub Pages."),
    ("hacker mode", "Hacker Mode unlocks if you click the logo 7 times or "
                    "enter the Konami code."),
    ("hacker terminal", "Pressing backtick opens a hidden Hacker Terminal "
                        "with more than 20 commands."),
    ("cryptdoom", "CryptDOOM is a hidden Wolfenstein-style raycaster with "
                  "procedural levels and enemy AI."),
    ("ctf", "There is a CTF treasure hunt with 6 hidden seed projects that "
            "award secret legendary badges."),
    ("achievements", "There are 42 achievements with COD-style unlock "
                     "animations and server-side tracking."),
    ("checkpoints", "Version control lets you save checkpoints, view "
                    "history, roll back, and auto-save."),
    ("time travel", "Time Travel is a scrubbable timeline over your "
                    "workspace history that can fork from any point."),
]

# Block categories (24).
CATEGORIES = [
    "Basics", "Math", "Text", "Logic", "Lists", "Data", "Database", "Web",
    "Art", "Crypto", "AI", "Sound", "Games", "Hardware", "micro:bit", "Pen",
    "Testing", "Vision", "Functions", "Events", "HTML", "Libraries",
    "Values", "Secrets",
]

TECH_STACK = [
    ("the frontend", "React 19, TypeScript, and Vite 7 with Tailwind CSS 4"),
    ("the block editor", "Google Blockly with the Zelos renderer"),
    ("the code view", "the Monaco editor"),
    ("JavaScript execution", "a sandboxed iframe using a blob URL"),
    ("Python execution", "Pyodide, which is CPython compiled to WebAssembly"),
    ("collaboration", "Yjs CRDTs with PartyKit edge WebSockets"),
    ("the desktop app", "Tauri version 2, built with Rust"),
    ("testing", "Vitest with more than 2766 tests, plus Playwright for "
                "end to end tests"),
    ("the marketing site", "Hugo with Tailwind and SCSS, hosted on Netlify"),
    ("authentication", "Clerk"),
    ("the database", "Turso, a SQLite edge database"),
]

# How CryptoBlocks compares to the tools kids already know.
COMPARISONS = [
    ("Scratch outputs no code and is a dead end, while CryptoBlocks outputs "
     "real JavaScript and Python."),
    ("Scratch has about 120 blocks, while CryptoBlocks has 320."),
    ("Scratch has 8 block categories, while CryptoBlocks has 24."),
    ("Scratch has no real-time collaboration, while CryptoBlocks has it "
     "through Yjs."),
    ("Scratch targets ages 8 to 12, while CryptoBlocks targets ages 10 "
     "to 18."),
    ("Snap is aimed at university students, while CryptoBlocks is built for "
     "kids and teens who want to reach real code."),
]

ORIGIN_STORY = (
    "CryptoBlocks started as an attack framework for a security "
    "competition. The pieces were small reusable functions in Python that "
    "each did one thing well. Snapping them together in different orders "
    "gave different results. One night the founder looked at the terminal "
    "and thought, this is just Scratch for hackers, so why does it not "
    "exist for everyone. The hacking stayed behind, and what came forward "
    "was the idea of small, composable, shareable blocks of real code that "
    "kids can see, use, change, and eventually write themselves."
)

ROADMAP_NEXT = [
    "bi-directional editing, where you can edit code and blocks and have "
    "changes sync both ways, which is the moat",
    "classroom licenses with school onboarding and bulk pricing",
    "more CTF challenges that expand the treasure hunt with harder puzzles",
    "leaderboard profiles with public badge showcase pages",
]

# ──────────────────────────── FICTION LAYER ──────────────────────────
# An invented company around the real product. Self-consistent, and it
# touches nothing outside the CryptoBlocks universe.

COMPANY = {
    "name": "CryptoBlocks",
    "legal_name": "CryptoBlocks Labs",
    "founded": "CryptoBlocks was founded in 2024.",
    "hq": "CryptoBlocks is based in Austin, Texas.",
    "team_size": "CryptoBlocks is a small team of nine people.",
    "mission": "The mission of CryptoBlocks is to carry kids across the gap "
               "between a visual coding toy and real programming, the place "
               "where most kids quit.",
    "founder": "The founder of CryptoBlocks is a former CTF competitor who "
               "built the first version as a security attack framework.",
    "support_email": "You can reach CryptoBlocks support at "
                     "support@cryptoblocks.io.",
    "website": "The CryptoBlocks website is cryptoblocks.io.",
    "values": "CryptoBlocks will never paywall blocks, never gate K through "
              "12 content, never show ads to kids, and never sell user "
              "data.",
}

VALUES_LIST = [
    "CryptoBlocks will never paywall the blocks.",
    "CryptoBlocks will never gate K through 12 content.",
    "CryptoBlocks will never show ads to kids.",
    "CryptoBlocks will never sell user data.",
]

PRICING = [
    ("free", "The free plan includes all blocks, the visual editor, "
             "challenges, blocksets, code golf, the sprite editor, "
             "collaboration, and examples. It is free forever."),
    ("premium", "The premium plan adds Code Labs, the guided curriculum, "
                "and advanced computer science courses."),
    ("classroom", "The classroom plan adds the teacher dashboard, classroom "
                  "licenses, and school onboarding with bulk pricing."),
]

MONETIZATION_LINE = (
    "The sandbox and challenges are the free hook, and the guided "
    "curriculum, builder tools, and institutional features are premium."
)

# ── Extra answerable facts (added to close coverage gaps the brain kept
#    fumbling: age, devices, offline, privacy, saving, mobile, roadmap). ──

AGES = (
    "CryptoBlocks is designed for ages 10 to 18, from curious beginners "
    "snapping their first blocks to teens ready to write real code. It is "
    "beginner friendly, and there is nothing to outgrow because the blocks "
    "turn into real JavaScript and Python."
)

DUAL_LANGUAGE = (
    "You can code in JavaScript and Python. Every block outputs real "
    "JavaScript and real Python, so you are always writing real code, not a "
    "toy language you have to leave behind."
)

BLOCKS_COUNT = "CryptoBlocks has 320 blocks across 24 categories."

BROWSER_SUPPORT = (
    "CryptoBlocks runs in any modern web browser with nothing to install, "
    "including on Chromebooks, Windows, Mac, and Linux. Everything, including "
    "running your code, happens right in the browser."
)

OFFLINE = (
    "Yes. CryptoBlocks has a Tauri desktop app that works fully offline on "
    "Windows, Mac, and Linux. The web version needs a connection, but the "
    "desktop app does not."
)

MOBILE = (
    "CryptoBlocks does not have a separate native mobile app. It runs in any "
    "mobile browser, and you can export your own projects as installable PWA "
    "apps that add to a phone or tablet home screen."
)

PRIVACY = (
    "Your data is safe. CryptoBlocks never sells user data and never shows "
    "ads to kids. Sign-in is handled securely through Clerk, and the code you "
    "write runs sandboxed in your own browser."
)

SAVING = (
    "Your work saves automatically. You can also save named checkpoints, view "
    "history, roll back to any point, and scrub a Time Travel timeline that "
    "can fork from any moment in your project."
)

WHATS_NEW = (
    "CryptoBlocks is actively building bi-directional editing, where code and "
    "blocks sync both ways, plus classroom licenses for schools, more CTF "
    "treasure-hunt challenges, and public leaderboard profiles with badge "
    "showcase pages."
)

TEACHERS = (
    "Yes. Teachers can create classrooms, share join codes, and view student "
    "projects through the teacher dashboard, and the classroom plan adds "
    "school onboarding and bulk pricing."
)

SHARING = (
    "Yes. You can publish your project to the Shareplace marketplace, where "
    "other people can download, like, and remix it, and a remix tree shows "
    "who remixed whose project."
)

# The brain's name and voice — so it can answer "who are you".
IDENTITY = (
    "I am the CryptoBlocks assistant. I only know about CryptoBlocks, the "
    "visual coding platform. Ask me anything about CryptoBlocks and I will "
    "help."
)
