---
id: context-governance
title: Context Governance
sidebar_label: Context Governance
description: Policy-mediated control over what autonomous agents can acquire, retain, reason over, and operationalize across all capability surfaces.
---

# Context Governance

**Raksha AI — May 2026**

---

## Overview

Context governance is the second pillar of operational safety for agentic AI. Where action governance controls what agents can *do*, context governance controls what agents can *acquire & know* — what they are permitted to acquire, retain, reason over, and operationalize from the environments they operate in.

The distinction matters because harm does not begin only when an agent takes an unauthorized action. It begins when an agent acquires information it was never meant to have. A browser agent asked to summarize a page inherits an authenticated browser session and everything it holds. A coding agent asked to fix a bug may recursively read credential files, environment variables, and cloud configuration as part of its normal execution. A shell-capable agent can enumerate secrets from the host filesystem without invoking a single tool-name-governed operation.

In each case, the agent is behaving as designed. The failure is the absence of a governance layer between the environment and the model's reasoning state.

Context governance introduces that layer. It is not a complement to action governance — it is a separate and equally necessary primitive. An enterprise that governs only the action surface has closed half the attack surface.

## The Four Governance Dimensions

Context governance operates across four dimensions of an agent's relationship with information:

**Acquisition** — what an agent is permitted to read, receive, or observe from capability surfaces including the shell, filesystem, browser, MCP tool responses, screenshots, and external APIs. Acquisition governance is enforced at the surface layer, before content enters the agent's context window.

**Retention** — how long acquired context may remain in the agent's active reasoning state and session context model. Sensitive information that was legitimately acquired for one subtask should not persist across the entire session or be available to future reasoning steps that do not require it.

**Reasoning** — what the model is permitted to reason over at inference time. The Context Firewall evaluates assembled context payloads against the agent's active behavior profile before submission to the model, blocking or redacting content the agent is not authorized to operationalize.

**Operationalization** — what acquired context the agent may act on — include in outbound communications, pass to downstream tool calls, write to storage, or transmit to external systems. Context that an agent can see is not necessarily context it is permitted to use.

## The Three-Layer Architecture

Context governance is implemented as a three-layer defense across all capability surfaces:

**Layer 1 — Capability Surface Interception.** CaSH governs shell, filesystem, and execution-layer context acquisition. CABR governs browser-derived context including DOM state, cookies, localStorage, and authenticated session data. MCP interceptors govern tool response payloads. Each surface has its own interception and classification layer.

**Layer 2 — Context Accumulation.** The Context Accumulator maintains a stateful session context model tracking what the agent has acquired, from which surfaces, under which policies, classified under which sensitivity labels, and subject to what retention constraints. It is the authoritative record of the agent's cognitive state at any point in its session.

**Layer 3 — Context Firewall.** The final pre-inference and pre-transmission enforcement point. Evaluates assembled context against the agent's active behavior profile before the model sees it, and operates as a gateway before outbound calls to remote model APIs.

:::info Details Coming Soon
Full concept documentation for context governance — including the session context model, sensitivity classification taxonomy, retention policy design, and the relationship between context governance and behavior profiles — will be published alongside the open-source reference implementation.
:::
