---
title: "How We Keep Your Code Safe"
description: "CryptoBlocks runs user code in a sandboxed environment with multiple layers of security. Here's how we protect you."
date: 2026-02-17
type: blog
tags: ["security", "engineering"]
priority: 0.5
---

CryptoBlocks lets you run code in your browser. That's powerful. It's also something we take seriously from a security standpoint.

When you hit Run, your program doesn't execute on our servers. It doesn't have access to your files. It runs inside a sandboxed iframe — an isolated container inside your browser that can't reach the outside world.

## The Sandbox

Every program you run gets its own sandbox. Think of it as a sealed room. Your code can do whatever it wants inside that room — print output, do math, manipulate text, run loops. But it can't open the door. It can't access other tabs. It can't make network requests. It can't touch your browser's storage.

We lock down dangerous APIs before your code even starts. Fetch, WebSocket, XMLHttpRequest — all disabled inside the sandbox. Your code runs. It produces output. That output gets sent back to the main app through a narrow, controlled channel.

## Python Gets the Same Treatment

Python execution uses Pyodide — a full Python interpreter compiled to WebAssembly that runs entirely in your browser. No server. No network. Same sandbox rules apply. We block dangerous imports and restrict what the Python runtime can access.

## Why This Matters for a Kids' Platform

We're building CryptoBlocks for young coders. That means security isn't a feature — it's a requirement. A kid should be able to run any program they build without worrying about breaking something.

Parents and teachers should know that CryptoBlocks can't access personal data, can't make network calls, and can't modify anything outside its sandbox. We built it this way from day one.

## Ongoing Work

Security isn't a checkbox. We run regular offensive security assessments against our own codebase. We test the sandbox boundaries. We look for escape vectors. When we find issues, we fix them before they ship.

We also have over 1,100 automated tests that run on every change, including smoke tests that validate every block in the system works correctly and safely.

Building a platform where people run code means building a platform where trust is earned. We're earning it.
