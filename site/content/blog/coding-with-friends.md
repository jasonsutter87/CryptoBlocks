---
title: "Coding with Friends — Real-Time Collaboration is Here"
description: "Build programs together in real time. Share a room code, snap blocks side by side, and see each other's changes instantly."
date: 2026-04-10
type: blog
tags: ["features", "announcement"]
priority: 0.7
---

This is the feature we've been most excited to build.

**Coding with Friends** lets you and a friend work on the same workspace at the same time. You see their blocks appear. They see yours. You build together.

## How it works

1. Click **Friends** in the toolbar (or find it in the menu on mobile).
2. Choose **Start a Room**. Give it a name. You get a 6-letter code.
3. Send that code to your friend. They click **Join a Room** and type it in.
4. You're both in. Start building.

That's it. No accounts required. No installs. No setup. Just a code.

## What you'll see

When your friend joins, their avatar appears in the toolbar. As they select blocks, you'll see colored outlines showing what they're working on. You work on one part of the program, they work on another. No conflicts.

Every change syncs in real time. Drag a block, and it appears on their screen. Delete one, and it disappears on theirs. It feels like Google Docs, but for code blocks.

## Run for Everyone

Hit the **Run for Everyone** button and every person in the room executes the program simultaneously. You each see the output on your own screen. It's perfect for that moment when you want to show everyone what the program does.

Or just hit the normal **Run** button to test on your own without interrupting anyone.

## The tech behind it

We built this on top of [Yjs](https://yjs.dev), an open-source library for conflict-free replicated data types (CRDTs). Each block tree in your workspace is a separate unit of sync. Two people editing different block trees will never conflict. Two people editing the same block at the exact same instant? Last change wins — but with a 150ms sync window, this almost never happens in practice.

The WebSocket server runs on [PartyKit](https://partykit.io), which gives us edge-deployed rooms that scale to zero when nobody's connected. Rooms support up to 6 people and auto-persist so late joiners get the full workspace state.

## What's next

This is v1 of collaboration. Coming soon:

- **Viewer mode** — watch a friend build without accidentally moving their blocks
- **Room history** — replay how a project was built, step by step
- **Voice chat** — because typing "move that block left" gets old fast
- **Persistent rooms** — rooms that survive beyond a session, like a shared project

## Try it now

Open CryptoBlocks, click **Friends**, and send the code to someone. Build something together. That's the whole point.
