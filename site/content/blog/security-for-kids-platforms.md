---
title: "Why We Publish Our Security Audits"
description: "CryptoBlocks is built for kids. Here's why we run penetration tests and publish the results."
date: 2026-04-17
type: blog
tags: ["security", "trust", "parents"]
priority: 0.6
---

CryptoBlocks is a coding platform for kids aged 10-18. That means security isn't a feature — it's a responsibility.

## The Problem

Most kids' platforms say "we take security seriously" somewhere in their terms of service. Then they move on. No details. No evidence. No accountability.

We think parents and schools deserve more than that.

## What We Do

Every release of CryptoBlocks goes through a multi-team security review:

1. **Black Team** — offensive security. Simulates an attacker trying to break the platform. SQL injection, authentication bypass, privilege escalation, sandbox escape — the full OWASP playbook.

2. **Red Team** — remediation. Takes every Black Team finding and either fixes it or documents why the risk is accepted (with rationale).

3. **Purple Team** — architecture review. Threat modeling, defense-in-depth analysis, zero-trust evaluation.

4. **Code Quality** — duplication and drift analysis. Catches the subtle bugs that come from copy-paste code.

## What We Publish

Everything. The findings, the severity ratings, what we fixed, and what we accepted and why. It's all on our [Security page](/security/).

We don't hide behind "no vulnerabilities found." We show you what was found, what we did about it, and what our architecture looks like.

## The Sandbox

When a kid runs code in CryptoBlocks, it executes in a sandboxed iframe with:

- **No `allow-same-origin`** — the code cannot access the parent page, cookies, or localStorage
- **`connect-src 'none'`** in the CSP — the code cannot make network requests
- **Capability bridge** — hardware features (camera, micro:bit, audio) are accessed through the parent via postMessage, not directly from user code

A kid could write `fetch('https://evil.com')` and it would silently fail. The sandbox is airtight by design.

## Why This Matters

When a school evaluates CryptoBlocks for their district, they need to answer: "Is this safe for our students?" Our security page gives them a concrete, verifiable answer — not marketing copy.

When a parent sees their kid on CryptoBlocks at 10pm (hello, Night Owl badge), they can check our security posture themselves.

Transparency builds trust. Trust enables adoption. Adoption means more kids learning to code.

That's why we publish our audits.
