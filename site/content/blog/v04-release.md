---
title: "v0.4 — Badges, DOOM, and a Treasure Hunt"
description: "The biggest CryptoBlocks update yet: COD-style achievements, CryptDOOM raycaster, CTF treasure hunt, Spanish i18n, and a full security audit."
date: 2026-04-17
type: blog
tags: ["release", "update", "v0.4"]
priority: 0.7
---

v0.4 is live. Here's what's new.

## COD-Style Badge System

42 achievements across four rarity tiers (common, rare, epic, legendary). Server-side tracking with Turso. Full-screen unlock animation with rarity-colored glow bursts. Badge showcase tab in Stats with progress bar, shimmer effects on legendary badges, and silhouetted secret achievements.

[Read more about the badge system &rarr;](/blog/badge-system/)

## CryptDOOM

A Wolfenstein-style raycaster hidden in the Hacker Terminal. WASD movement, enemy AI, procedural levels, procedural dark ambient soundtrack — all in 500 lines of vanilla canvas. Type `doom` to play.

[Read more about CryptDOOM &rarr;](/blog/cryptdoom-easter-egg/)

## CTF Treasure Hunt

Hidden projects buried in the app, each awarding a secret legendary badge. No instructions. No hand-holding. Just curiosity and pattern recognition. Real CTF energy, kid-friendly.

[Read more about the treasure hunt &rarr;](/blog/ctf-treasure-hunt/)

## Spanish i18n

~200 Spanish translations covering block labels, categories, input labels, tooltips, and UI text. Toggle between English and Espanol in Settings.

## Toolbar Split

The File menu was getting long. We split it into **File** (save, load, import, history) and **Share** (export, publish, share link). Cleaner, faster access.

## Security Hardening

Full offensive security audit (Black Team), remediation sweep (Red Team), and code quality pass. Key fixes: sprite like dedup, cross-classroom IDOR, parameterized SQL, security headers. Results published on our [Security page](/security/).

## What's Next

Bi-directional editing (the moat), classroom licenses, more CTF challenges, and leaderboard profiles. Check the [changelog](/change-log/) for the full list.

---

*Update to v0.4 by visiting [app.getcryptoblocks.com](https://app.getcryptoblocks.com). It's already live.*
