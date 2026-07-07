---
title: "The Chatbot That Only Knows CryptoBlocks"
description: "There's a little chat bubble on every page now. Behind it is a tiny language model we trained from scratch — one that knows nothing about the world except CryptoBlocks. Here's how it works and why we didn't just call an API."
date: 2026-07-06
type: blog
tags: ["engineering", "behind-the-scenes", "ai"]
priority: 0.6
---

There's a new chat bubble in the bottom-right corner of every page. Click it and you can ask questions about blocks, coding, and the platform. Ask "what is CryptoBlocks?" or "is it free?" and it answers.

The interesting part isn't the chat bubble. It's what's behind it: a language model we trained **from scratch**, that knows nothing about the world except CryptoBlocks.

## Why not just call an API?

The easy version of this feature is a weekend of work: sign up for an AI provider, paste in an API key, send the user's question to a giant model in the cloud, show the answer. Done.

We didn't want the easy version, for three reasons.

**Cost and dependency.** A big hosted model bills you per message, forever, and if their service goes down, your chatbot goes down with it. We didn't want a support widget that costs money every time a kid gets curious.

**Privacy.** Questions typed into a box on a kids' platform shouldn't be shipped off to a third-party AI company to be logged and trained on. If we run the model ourselves, the conversation never leaves our stack.

**It's a coding platform.** We teach people how software actually works by letting them peek inside it. Building our own language model — instead of renting someone else's — is the most on-brand thing we could possibly do.

So we built our own.

## A model that only knows one thing

Most language models are trained on a huge slice of the internet. They know about medieval history, Python, cooking, and everything else — which is why they're enormous and expensive to run.

Ours is the opposite. It's a **tiny** model — small enough to run on a single machine with no graphics card — and it was trained on exactly one thing: a corpus we wrote about CryptoBlocks. What blocks are. How the editor works. Why we think you can code if you can reason. What's free and what isn't.

That's a deliberate trade. Ask it about the French Revolution and it has no idea — it was never meant to know. But ask it about *us* and it answers in our voice, because our voice is literally all it was ever shown. It even echoes the thing we say most: **if you know logic, you can code.** Not because we hard-coded that answer, but because we said it enough times in the training data that the model learned to believe it too.

It's a character-level model, which means it doesn't even think in words — it predicts text one letter at a time, the way you'd sound out a word you've never seen. Watching a from-scratch model slowly learn to spell "CryptoBlocks" correctly during training is a genuinely strange and wonderful thing.

## How a question becomes an answer

When you type a question and hit send, here's the path it takes:

1. The chat widget on the page sends your question to `/chat/ask` — the same domain you're already on, so nothing crosses to a third party.
2. That request is quietly routed to a small server **we** run on **our own** hardware, where the model lives.
3. The model reads your question one character at a time, then generates an answer the same way, one character at a time.
4. The answer travels back and appears in the bubble.

The whole loop runs on infrastructure we own and can see end to end. There's no AI vendor in the middle, no per-message meter running, no copy of your question sitting in someone else's database.

## It's small, and that's the point

We'll be honest with you — and the widget says so right at the bottom: it's a tiny model, and it can be wrong. It doesn't have the polish or breadth of the giant hosted assistants, and it never will, because that was never the goal.

The goal was to prove a point we care about a lot: you don't need a billion-dollar model and a monthly bill to build something genuinely useful. Sometimes the right tool is a small one that knows exactly what it's talking about — and nothing else.

Kind of like a block. It does one thing. You can read the whole thing. And once you understand it, you can build.

Go poke the bubble. Ask it something.
