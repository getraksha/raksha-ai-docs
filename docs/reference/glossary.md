---
title: Glossary
description: The AGP Community Edition terms you'll meet across the docs.
---

# Glossary

The product terms used throughout these guides. For the deeper conceptual treatment, see [Concepts](../concepts/operational-safety).

**Agent** — An identity registered with AGP that calls tools. Has its own client credentials (no shared tokens) and an envelope.

**Behavior profile** — An agent's approved operating envelope: the explicit allowlist of tools it may see and call. Fail-closed — empty means nothing is allowed. `agp setup` creates `<agent>.local.default`.

**Bridge** — The local stdio MCP server (`agp bridge run`) that a client launches. It authenticates as the agent and proxies every tool call through AGP.

**Catalog** — The set of all tools AGP knows about, held by the registry. Distinct from an agent's envelope: catalog = governable; envelope = visible to one agent.

**Console** — The admin web UI (the `admin-ui` service), at `http://localhost:27868`.

**Deny-by-default / fail-closed** — The default posture: an agent can only see and call what's explicitly granted; anything not clearly safe holds rather than executing.

**Envelope** — Informal name for a behavior profile.

**Hold** — A decision to pause a call for human approval before it executes. Returned to the agent as `POLICY_HOLD` with an `approval_id`.

**Operation fact** — A recorded property of a tool (`read`, `write`, `delete`, `execute`) that policy uses to decide allow / hold / deny.

**Profile (CLI)** — A named set of service endpoints + admin token in `config.yaml`. Unrelated to a *behavior* profile. Most users only have `local`.

**Proxy** — The enforcement point. Every agent-to-tool call passes through it; nothing reaches a backend without an explicit allow.

**Registry** — The service that owns the catalog: tools, versions, operation facts, and MCP server discovery/registration.

**Runtime set** — The versioned set of AGP service binaries that ship together with a CLI release.

**Server alias** — The prefix applied to a registered MCP server's tool names (e.g. `car-db-ops__list-reservations`), keeping names unique across servers.

## Services at a glance

| Service | Owns |
|---|---|
| Proxy | The enforcement point — every call passes through it. |
| Identity | Agent registration, credentials, short-lived JWT tokens. |
| Behavior Profile | Each agent's fail-closed tool envelope. |
| Registry | The tool catalog: backends, schemas, operation facts. |
| Policy | Facts-driven risk evaluation (OPA) — allow / deny / hold. |
| Approval | Human-in-the-loop queue for held operations. |
| Audit | Append-only event store: tool calls and operator changes. |
| Approval Ops | Platform MCP server — agents manage their own held approvals. |
| Admin Console | The web UI. |
