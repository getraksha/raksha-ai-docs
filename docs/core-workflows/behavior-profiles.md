---
title: Behavior profiles & granting tools
description: How an agent's fail-closed tool envelope works, and how to grant and revoke tools.
---

# Behavior profiles &amp; granting tools

A **behavior profile** is an agent's approved operating envelope — the explicit allowlist of tools it may see and call. It is the heart of AGP's deny-by-default model: an empty profile means the agent can invoke nothing.

`agp setup` creates one profile per agent named `<agent>.local.default`, active but with **zero** business tools. This page is how you populate it.

## The fail-closed rule

> An agent can only see and call tools explicitly listed in its behavior profile. A tool that isn't granted does not exist from the agent's perspective — it can't be listed, planned with, or invoked.

This is enforced at the proxy, on every call. It is not a prompt the agent can argue with. See [How tool visibility works](tool-visibility) for what the agent actually sees.

## Grant tools

Tools must already be in the catalog ([Govern your first MCP server](govern-mcp-server)). Grant by their fully-qualified names:

```sh
agp behavior-profile grant-tools \
  --behavior-profile-id my-agent.local.default \
  --tools car-db-ops__list-reservations,car-db-ops__read-reservation \
  --reason "read-only access for the reservations demo"
```

The `--reason` is recorded in the audit trail — every change to an envelope is attributable.

In the console, the same thing lives under **Behavior Profiles → `<profile>`**, where you check the tools to grant.

## Revoke tools

```sh
agp behavior-profile revoke-tools \
  --behavior-profile-id my-agent.local.default \
  --tools car-db-ops__read-reservation \
  --reason "no longer needed"
```

## Inspect a profile

```sh
agp behavior-profile get --behavior-profile-id my-agent.local.default
agp behavior-profile list --agent-id my-agent
agp behavior-profile list-events --behavior-profile-id my-agent.local.default
```

`get` shows the current `allowed_tools`; `list-events` shows the full grant/revoke/lifecycle history.

## Profile lifecycle

Profiles have a status, and only an **active** profile grants access:

| Command | Effect |
|---|---|
| `create --file <json>` | Create a profile from a payload. |
| `approve --behavior-profile-id <id>` | Approve a newly-created profile. |
| `activate --behavior-profile-id <id>` | Reactivate a suspended profile. |
| `suspend --behavior-profile-id <id>` | Freeze access without deleting the profile. |
| `retire --behavior-profile-id <id>` | Permanently end-of-life a profile. |

Each lifecycle command takes `--actor` and `--reason` for the audit record. Example — pause an agent during an investigation, then restore it:

```sh
agp behavior-profile suspend  --behavior-profile-id my-agent.local.default --actor admin --reason "investigating anomaly"
agp behavior-profile activate --behavior-profile-id my-agent.local.default --actor admin --reason "cleared"
```

## A good first grant

Start read-only. Reads flow without approval, so you'll see tools working immediately while destructive operations stay held for you:

```sh
agp behavior-profile grant-tools \
  --behavior-profile-id my-agent.local.default \
  --tools car-db-ops__list-reservations,car-db-ops__read-reservation \
  --reason "start read-only, add writes later"
```

Then, in your client, ask the agent to list reservations and watch the call land in the console's **Activity** feed.

## Next

[How tool visibility works →](tool-visibility) · [The approval workflow →](approval-workflow)
