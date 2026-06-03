---
id: context-governance
title: Context Governance
sidebar_label: Context Governance
description: Governing what AI agents can acquire and know — not just what they can do.
---

# Context Governance

**Raksha AI — June 2026**

---

## What It Is

Context governance is the discipline of controlling what an AI agent is allowed to acquire and know — what information it may read, retain, reason over, and operationalize.

Agents do not act in isolation. Before they take action, they gather context — from files, browser sessions, tools, APIs, screenshots, logs, and other information sources. That context shapes every decision they make. Context governance introduces a policy layer between the environment and the agent's reasoning process, ensuring that what an agent can reach is not automatically what it is allowed to know.

Operational risk does not begin when an agent takes an action. It begins when an agent acquires context.

---

## Why Governing Actions Alone Isn't Enough

Most governance thinking stops at actions: what tools can this agent call, what APIs can it reach, what commands can it run. That's necessary — but it's half the picture.

An agent that is perfectly constrained in its actions can still cause serious harm through what it *reads*. A developer agent asked to fix a bug will read the relevant source files — and likely also read `.env` files, cloud credentials, internal configuration, and anything else it encounters along the way. It isn't doing anything wrong. It was never told it couldn't.

The harm doesn't begin when the agent acts on that information. It begins the moment the information enters the agent's reasoning state — because from that point, it can influence decisions, appear in outputs, get passed to other systems, or be retained across the session in ways that were never intended.

Action governance defines what agents are allowed to **do**. Context governance defines what agents are allowed to **acquire and know**. Both are necessary for operational safety.

---

## What Happens Without It

**Sensitive information enters reasoning undetected.** Without a context governance layer, there is no control over what an agent is allowed to acquire, retain, reason over, or use. Credentials, personal data, internal configuration, and secrets can enter the agent's reasoning state during normal operation, with no record of what was acquired and no mechanism to prevent that information from influencing future actions.

**Information persists longer than it should.** An agent that reads something sensitive early in a session may carry that information through every subsequent step — even steps that have nothing to do with it. Without retention controls, sensitive context doesn't expire.

**You can't audit what you can't see.** If an agent reads a secret and later includes it in an outbound call or a generated document, there is no trail connecting the acquisition to the outcome. When something goes wrong, you have symptoms — not causes.

---

## What We're Building

At Raksha AI, we believe context governance is becoming a new category-defining layer for autonomous systems — and we are building CaFS, CaSH, CABR, and the Context Firewall as the first architecture primitives in that layer.

---

## Where to Go Next

- [Operational Safety](/docs/concepts/operational-safety) — the broader discipline context governance belongs to
- [CaSH](/docs/architecture/cash) — context governance at the shell and filesystem layer
- [CABR](/docs/architecture/cabr) — context governance for browser agents
- [CaFS](/docs/architecture/cafs) — context governance for filesystem access
- [Context Firewall](/docs/architecture/context-firewall) — the final enforcement point before the model reasons
