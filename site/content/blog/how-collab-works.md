---
title: "How Real-Time Sync Works Under the Hood"
description: "A look at the CRDT-based architecture behind Coding with Friends — Yjs, PartyKit, and the challenge of making Blockly multiplayer."
date: 2026-04-10
type: blog
tags: ["engineering", "behind-the-scenes"]
priority: 0.4
---

Blockly was never designed for multiplayer. It's a single-user visual editor with a single workspace state. Making two people edit it simultaneously without corrupting the workspace was the hardest technical challenge we've tackled.

Here's how we did it.

## The problem

Two people open the same workspace. Person A drags a Print block. Person B drags a Loop block. Both changes need to appear on both screens, in real time, without overwriting each other.

This is the classic **distributed state** problem. Google Docs solved it for text. Figma solved it for design. We needed to solve it for block-based code.

## CRDTs: conflict-free by design

We chose **CRDTs** (Conflict-Free Replicated Data Types) over operational transform. CRDTs guarantee that if two users make independent changes, the result is the same regardless of the order the changes arrive. No central server needed to resolve conflicts. No locking. No "someone else is editing this."

Specifically, we use [Yjs](https://yjs.dev), an open-source CRDT library. Yjs gives us a shared document (a `Y.Doc`) that syncs automatically over WebSockets.

## Block-level granularity

The key architectural decision: we don't sync the entire workspace as one blob. We sync at the **block tree** level.

Every top-level block (a block that isn't connected inside another block) is stored as a separate entry in a Yjs Map. The key is the block's ID. The value is the block's serialized state — all its fields, connections, and nested children.

This means:

- **Two people editing different block trees** = zero conflict. The changes merge perfectly.
- **Two people editing the same block tree** = last write wins on that tree. Acceptable tradeoff for v1.

We debounce local changes at 150ms, so rapid edits (like typing a variable name) batch into a single sync. This keeps the network quiet and reduces the window for same-block conflicts.

## Loop prevention

The trickiest bug in any sync system is the infinite loop: a remote change triggers a local event, which triggers a remote update, which triggers a local event...

We prevent this with a simple flag: `isApplyingRemote`. When we receive a change from another user, we set this flag to `true`, apply the change to Blockly, then reset it. Our Blockly change listener checks this flag and ignores events that fire while it's `true`.

```
Remote change arrives
  → isApplyingRemote = true
  → Apply to Blockly workspace
  → Blockly fires change events (ignored)
  → isApplyingRemote = false
```

Simple, but it took a few hours of debugging to get right.

## PartyKit: rooms at the edge

The WebSocket server runs on [PartyKit](https://partykit.io). Each room is a separate PartyKit room with its own Yjs document. PartyKit handles:

- **Connection management** — clients connect, disconnect, reconnect
- **Yjs sync protocol** — new clients get the full document state automatically
- **Persistence** — the room state survives even when everyone disconnects
- **Edge deployment** — rooms run close to the users, minimizing latency

We cap rooms at 6 concurrent connections. Blockly performance degrades with too many simultaneous edits, and kids don't need 30-person rooms.

## Presence

Each user publishes their "awareness" state: their name, a color, and which block they currently have selected. When you select a block, everyone else sees a colored outline around it. When you deselect, the outline disappears.

This uses Yjs's built-in Awareness protocol, which piggybacks on the same WebSocket connection as the document sync. No extra infrastructure needed.

## What's next

The current architecture gives us a solid foundation. Future improvements we're planning:

- **Field-level sync** — right now, editing a text field in a block syncs the entire block tree. We want to sync individual field values so two people can edit different fields in the same block simultaneously.
- **Undo/redo per user** — currently undo affects the shared workspace. We want each user to have their own undo stack.
- **Cursor tracking** — showing where each user's mouse is on the canvas, not just which block they have selected.

Building multiplayer into a tool that was designed for single-player is never clean. But the result — watching two kids build a program together in real time — makes the engineering worth it.
