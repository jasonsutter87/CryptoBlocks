---
title: "Click a Line, Find the Block"
description: "CryptoBlocks now has bidirectional code-to-block navigation. Click a line of code to highlight the block that wrote it. Right-click a block to see its line number."
date: 2026-04-19
type: blog
tags: ["features", "debugging", "developer-experience"]
priority: 0.7
---

We just shipped the feature we didn't know we needed until we lost 100 blocks building Pac-Man.

## The Problem

CryptoBlocks generates real JavaScript and Python from visual blocks. You can see the code in "Peek Code" — every block maps to a function call, every loop maps to a `for`, every condition maps to an `if`. The code is right there.

But when something goes wrong — when the maze doesn't carve, when the shuffle doesn't shuffle, when the grid fills with the wrong values — you're staring at 400 lines of generated code trying to figure out which *block* produced the broken line.

"The bug is on line 247" is useless information when your program is blocks.

## The Fix

Two features, shipping today:

### Click Code → Highlight Block

Open Peek Code. Click any line. The block that generated that line highlights yellow on the workspace, and the view scrolls to center on it.

That's it. Line 247 is a `matrixSet` call? Click it. The Matrix Set block on your workspace glows. You see exactly which inputs are plugged in. You find the bug.

### Right-Click Block → Show Line Number

Right-click any block on the workspace. At the bottom of the context menu: **📍 Show Line Number**. Click it, and it tells you which lines in the generated code this block produces.

Now you know where to look in the code. And you know where to look on the workspace. Both directions.

## How It Works

Every block in CryptoBlocks generates a source map marker in the code — a hidden comment that ties each line range back to the block ID that produced it. These markers are stripped before the code runs, but the mapping persists in memory.

When you click a line, the editor looks up which block ID owns that line range and calls Blockly's `highlightBlock()` API to make it glow. When you right-click a block, it reads the same source map in reverse.

The infrastructure was already there — we built the source map months ago for the slow-motion trace debugger. We just never connected it to click events. One evening, one frustrated debugging session, and the feature wrote itself.

## Why It Matters

Block-based coding has always had a debugging problem. The blocks are visual, but the errors are textual. "TypeError: Cannot read property 'x' of undefined at line 312" means nothing when your program is a canvas of colored shapes.

Bidirectional navigation solves this. The error tells you the line. The line tells you the block. The block shows you the inputs. The inputs show you the bug.

No more counting blocks. No more guessing. Click and find.

## The Story Behind It

We were building Pac-Man — a procedural maze generator with DFS carving, Fisher-Yates shuffle, and matrix operations. 400+ blocks. The `carveLeftHalf` function had a bug where `matrixSet` was receiving a string name instead of the actual array.

Without bidirectional debugging, finding that bug meant:
1. Read the generated code
2. Find the suspicious line
3. Mentally map it back to a block somewhere on the workspace
4. Scroll around looking for it
5. Inspect the inputs
6. Realize it's the wrong block
7. Repeat

With bidirectional debugging:
1. Read the generated code
2. Click the line
3. Block highlights
4. See the wrong input
5. Fix it

Steps 1-7 became steps 1-5. That's not a minor improvement. That's the difference between "debugging is painful" and "debugging is navigation."

## Try It

Open any project in CryptoBlocks. Toggle Peek Code on. Click a line. Watch the block light up.

Then right-click any block and select **📍 Show Line Number**. See exactly where your block lives in the generated code.

Both directions. Zero setup. Works even when Monaco can't load (we built line numbers into the plain-text fallback too, because Brave Shields shouldn't break your debugging workflow).

---

*CryptoBlocks is free at [app.getcryptoblocks.com](https://app.getcryptoblocks.com). Build with blocks. Debug with clicks.*
