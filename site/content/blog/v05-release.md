---
title: "v0.5 — Shall We Play a Game?"
description: "WOPR, frames, bidirectional debugging, time travel, 80+ badges, and a phone that turns into an 80s phreaker. The builder's update."
date: 2026-04-20
type: blog
tags: ["release", "update", "v0.5"]
priority: 0.7
---

v0.5 is live. This one's for the builders.

## WOPR

Type `wopr` in the Hacker Terminal. A QR code appears. Scan it with your phone. Your phone transforms into a 1980s phreaking device — amber CRT glow, touch-tone keypad, real DTMF frequencies. Dial the right code. Your computer logs into WOPR. A thermonuclear war plays out. Tic-tac-toe. "The only winning move is not to play." Then it drops you into CryptDOOM.

The computer speaks to you.

If you know, you know. If you don't — go watch WarGames (1983) and come back.

## Frame Blocks

Figma-style grouping for your workspace. Drop a frame, give it a color, drag blocks inside. When you move the frame, everything inside moves with it. Eight colors, resizable from 100 to 2000 pixels. Organize your spaghetti.

## The Scope System, Rebuilt

Lists and objects now have a single block with a global/local dropdown. No more hunting for separate block types. One block, one toggle, two scopes. The old blocks still work — they're just hidden from the Brick Bin.

## Bidirectional Debugging

Click a line of code — the block that generated it highlights and scrolls into view. Right-click a block — see which line number it maps to. Source map markers injected into every generated statement. Monaco and PlainCodeView both support it.

This is the feature that made us delete 100 blocks and rebuild them better.

[Read more about the debugger &rarr;](/blog/bidirectional-debugger/)

## Time Travel Actually Works

The scrubbable history slider was broken since v0.3 due to a race condition — the workspace ref wasn't ready when the listener attached. Fixed. Now every edit you make is captured. Drag the slider backwards and watch your project assemble itself block by block.

## Workspace Your Way

One circle. Click it. Color wheel. Set any background color for your workspace. Toggle grid dots on or off. Your canvas, your vibe.

## Keyboard Shortcuts

- **Cmd+G** — snap to grid
- **Cmd+A** — select all
- **Cmd+L** — tidy layout (functions left, chains right)
- **Cmd+Click** — multi-select
- **Cmd+Shift+S / Cmd+I / Cmd+B** — quick-create text, number, boolean
- **Cmd+F** — search blocks on workspace
- **Cmd+.** — collapse all

Flip the card in Settings to see them all.

## More Tools

- **Whiteboard** — freeform drawing canvas in the Peek panel
- **Backpack** — Minecraft-style 9-slot hotbar for saving and placing blocks
- **Toolbox Search** — filter the Brick Bin by name
- **Block Warnings** — yellow triangles on blocks with empty inputs or missing functions

## 80+ Achievements

Up from 42. New milestones from 50 blocks to 238,900 (the Moon). Crypto badges (Finney, Satoshi). Green Cube collectors for daily consistency. Necromancer for using dead blocks. Early Bird for coding at 4am. Proof of Work filtering so you can't game the system.

## Stats Sync

All your stats — runs, blocks placed, streaks, language breakdown — now sync to the server. Sign in on any device and your numbers merge. Cross-device persistence, debounced so it doesn't spam.

## New Blocks

- **min/max** — one block, toggleable dropdown
- **count_from** — custom for loop with start, end, step
- **set_in_list** — set item at index
- **Dynamic function params** — +/- buttons to add arguments

## Security

Full Purple + Black + Red team sweep. Backpack storage guards, XML escaping in search, stats endpoint hardened against payload abuse, NaN/Infinity guards, 2MB whiteboard cap. The boring stuff that keeps kids safe.

---

v0.5 is a playful way to build serious stuff.

[Full changelog &rarr;](/change-log/)
