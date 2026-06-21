---
title: How tool visibility works
description: Why an agent sees only the tools granted in its behavior profile, and how the catalog, profile, and proxy interact.
---

# How tool visibility works

AGP's first line of defense is not blocking calls — it's **hiding tools**. An agent can only act on what it can see, so AGP makes sure it sees only what's been granted.

## Two layers: catalog vs. envelope

There are two distinct sets of tools, and conflating them is the most common point of confusion:

| | The **catalog** (registry) | The **envelope** (behavior profile) |
|---|---|---|
| Holds | Every tool AGP knows about | The tools *one agent* may use |
| Populated by | Registering MCP servers | Granting tools to a profile |
| Scope | Global | Per-agent |

A tool in the catalog is **governable**. A tool in an agent's profile is **visible to that agent**. Registering a server never grants anything; granting never adds to the catalog.

## What the agent sees

When a client connects, the AGP bridge calls `tools/list` through the proxy. The proxy returns **only** the tools in that agent's active behavior profile — filtered against its authenticated identity. Everything else is simply absent. The agent cannot enumerate, reason about, or invoke a tool that isn't in its envelope.

That's why a freshly set-up agent reports just the approval meta-tools: its `<agent>.local.default` profile starts with zero business tools, and `agp setup` grants only `agp-approval-ops` so the agent can manage its own held approvals.

## Visibility updates live

When you grant or revoke tools, the agent's view changes without reconnecting. The bridge polls for changes and emits an MCP `tools/list_changed` notification so the client refreshes its tool list. The poll interval is controlled by `AGP_BRIDGE_TOOLS_POLL_SECONDS` (default 15; set `0` to disable).

So the loop is:

1. Grant a tool ([Behavior profiles](behavior-profiles)).
2. Within the poll interval, the client sees `tools/list_changed`.
3. The agent now sees — and can call — the new tool.

## Visibility is not permission to execute

Seeing a tool means the agent can *attempt* it. Whether a given call actually executes is the **second** gate: policy classifies the operation and may hold it for approval or deny it outright. A granted `delete-*` tool is visible and callable, but the call will pause for your approval before it runs. That's the subject of [The approval workflow](approval-workflow).

## Verify what an agent sees

From the CLI, you can ask the proxy directly what a given agent would see:

```sh
agp proxy discover-tools --agent-id <agent-uuid>
```

Or check end-to-end through the bridge with the agent's stored credentials:

```sh
agp bridge check --agent-id my-agent
```

## Next

[The approval workflow →](approval-workflow)
