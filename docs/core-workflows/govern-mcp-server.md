---
title: Govern your first MCP server
description: Register an MCP server in the AGP catalog so its tools become governed and grantable.
---

# Govern your first MCP server

Before an agent can use a tool, that tool has to exist in the **registry** — AGP's governed catalog. Registering an MCP server discovers the tools it exposes, records facts about each one (`read` / `write` / `delete` / `execute`), and makes them available to grant to behavior profiles.

Nothing is granted to any agent by registering a server. Registration only populates the catalog; visibility is always a separate, explicit step ([Behavior profiles](behavior-profiles)).

## Discover before you register

`discover-server` connects to an MCP server, lists its tools, and diffs them against what's already in the catalog — a dry run that changes nothing:

```sh
agp registry discover-server \
  --backend-url http://localhost:8010/mcp \
  --auth-type NONE
```

For a server that needs auth:

```sh
agp registry discover-server \
  --backend-url https://api.example.com/mcp \
  --auth-type BEARER \
  --auth-value "$API_TOKEN"
```

`--auth-type` is one of `NONE`, `HEADER_API_KEY`, or `BEARER`. For `HEADER_API_KEY`, also pass `--auth-header <name>`.

:::note Credential isolation
The auth value you give the registry is the **tool backend's** credential. AGP stores it and injects it at call time — the agent never holds it. A compromised agent has nothing to exfiltrate.
:::

## Register the server

`register-server` discovers the server and bulk-registers the tools you select. The `--server-alias` becomes the prefix on every tool name (so `list-reservations` becomes `car-db-ops__list-reservations`), which keeps tool names unique and readable across servers.

```sh
agp registry register-server \
  --backend-url http://localhost:8010/mcp \
  --server-alias car-db-ops \
  --team-id <team-uuid> \
  --all-new \
  --category database
```

Register only specific tools instead of everything:

```sh
agp registry register-server \
  --backend-url http://localhost:8010/mcp \
  --server-alias car-db-ops \
  --team-id <team-uuid> \
  --tools list-reservations,read-reservation,delete-reservation
```

| Flag | Meaning |
|---|---|
| `--backend-url` | The MCP server's endpoint (required). |
| `--server-alias` | Prefix for the registered tool names (required). |
| `--team-id` | Owning team (required). |
| `--all-new` *or* `--tools` | Register every newly-discovered tool, or a named subset. |
| `--category`, `--version`, `--owner-contact` | Catalog metadata (`--version` defaults to `1.0.0`). |
| `--auth-type`, `--auth-header`, `--auth-value` | Backend credentials, injected at call time. |

## Confirm it's in the catalog

```sh
agp registry list-tools --q car-db-ops
```

Or open the console's **Tools** view, where you'll see each tool with its backend, version, and operation facts. Those facts are what policy reasons over — see [The approval workflow](approval-workflow).

## Keeping the catalog current

- **Re-discover after a backend changes:** run `discover-server` again to see added / removed / changed tools.
- **Retire tools:** `agp registry deprecate-tool` (soft) or `delete-tool` (yank), and the bulk forms `bulk-deprecate` / `bulk-yank` with `--server-alias`.
- **Versions:** `publish-version`, `list-versions`, `set-current-version` manage a tool's version history.

## Next

The tools exist but no agent can see them yet. Grant them:

[Behavior profiles &amp; granting tools →](behavior-profiles)
