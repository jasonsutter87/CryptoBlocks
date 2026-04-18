---
title: "Can It Run DOOM? Yes."
description: "We built a Wolfenstein-style raycaster inside CryptoBlocks. Type 'doom' in the Hacker Terminal to play CryptDOOM."
date: 2026-04-17
type: blog
tags: ["easter-eggs", "games", "fun"]
priority: 0.6
---

Every platform eventually faces the question: *can it run DOOM?*

We decided to skip the debate and just build one.

## CryptDOOM

Open the Hacker Terminal (press the backtick key), type `doom`, and you're in. A full Wolfenstein-style raycaster rendered on a 320x200 canvas with a green phosphor CRT aesthetic.

### What's Inside

- **DDA raycasting** with fisheye correction and z-buffer sprite clipping
- **WASD movement**, arrow keys to look, SPACE to shoot
- **Enemy AI** — skull enemies that chase you through the map and attack when they get close
- **Procedural levels** — clear all enemies, press SPACE, get a new randomly generated map with more enemies
- **Procedural audio** — dark ambient soundtrack generated entirely with Web Audio API oscillators. Sawtooth bass drone, sub-bass pulse, eerie bandpass pad. No audio files loaded.
- **SFX** — shoot, kill, hurt, and death sounds, all synthesized in real-time
- **HUD** — level counter, kill tracker, HP bar, minimap with enemy dots, crosshair

The enemy count scales with each level: Level 1 has 5 enemies, Level 2 has 7, Level 3 has 9. The maps get progressively denser with walls and pillars. Good luck past Level 5.

### Why?

Because a coding platform for kids should feel like a place where anything is possible. If you poke around enough, you find Snake eating your page elements, Space Invaders abducting your code, and now a full FPS hiding behind a terminal command.

Every easter egg teaches something. CryptDOOM is 500 lines of pure vanilla canvas rendering — raycasting, sprite billboarding, collision detection, procedural generation, and audio synthesis. No libraries. No frameworks. Just math and a canvas.

That's the whole point of CryptoBlocks: code makes things. Cool things. Surprising things. Things that make you say "wait, that's in HERE?"

### Achievements

Clear Level 1 to earn the secret **Doom Slayer** badge. Reach Level 5 for the legendary **Doom Veteran** badge. Both are hidden — you won't see them in the badge list until you earn them.

Press ESC to return to building blocks. Or don't. We won't judge.
