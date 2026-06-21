---
title: Connecting clients
description: How the AGP bridge connects MCP clients, how credentials resolve, and how to wire each supported client.
---

# Connecting clients

Your MCP clients don't talk to AGP's proxy directly — they launch the **AGP bridge** (`agp bridge run`), a local stdio MCP server. The bridge authenticates as your agent, discovers the tools in its envelope, and proxies every call through AGP. The client never sees a tool the agent isn't granted.

## The quick path

[`agp setup`](../get-started/first-agent) creates an agent and connects a client in one step. To connect *additional* clients (or reconnect) for an existing agent, use `agp connect`:

```sh
agp connect <client> --agent-id my-agent --write
```

- `--agent-id` — which agent's stored credentials the bridge should use (auto-detected if you only have one).
- `--server-name` — the MCP server name written into the client config (default `agp`).
- `--write` — apply the config (keeping a `.bak`). Omit to print the snippet and apply it yourself.

## Supported clients

| Client | `--client` / `connect` value | Where it's written |
|---|---|---|
| Claude Desktop | `claude-desktop` | `claude_desktop_config.json` (`mcpServers`) |
| Claude Code | `claude-code` | via `claude mcp add` |
| Cursor | `cursor` | `~/.cursor/mcp.json` |
| VS Code | `vscode` | project-scoped `.vscode/mcp.json` |
| Codex | `codex` | `~/.codex/config.toml` (`mcp_servers`) |
| Anything else | `custom` | prints env vars / flags / JSON to wire it yourself |

After connecting, **restart the client** so it launches the bridge and loads the tools.

## How credentials resolve

`agp bridge run` finds its credentials in this order:

1. **Command-line flags** — `--client-id`, `--client-secret`, `--identity-url`, `--proxy-url`.
2. **Environment variables** — `AGP_CLIENT_ID`, `AGP_CLIENT_SECRET`, `AGP_IDENTITY_URL`, `AGP_PROXY_URL`.
3. **Stored credentials** — `profiles.<profile>.agent_credentials.<agent-id>` in your CLI config, written by `agp setup`.

For most local use, the stored credentials are all you need, so the generated client config is just `agp bridge run --agent-id my-agent`. For CI or a custom client, prefer env vars:

```sh
agp bridge run \
  --client-id   "$AGP_CLIENT_ID" \
  --client-secret "$AGP_CLIENT_SECRET" \
  --identity-url http://localhost:27860 \
  --proxy-url    http://localhost:27867/mcp
```

## Verify the connection

Before (or instead of) restarting a client, check the bridge end-to-end:

```sh
agp bridge check --agent-id my-agent
```

It confirms Identity and Proxy connectivity, issues a token, and prints the tool names the agent can see. Zero business tools is expected until you [grant some](behavior-profiles).

## Multiple agents, multiple clients

You can register several agents (each with its own envelope) and connect each to a different client — for example a read-only agent in one editor and a broader one in another. Each `agp connect` writes a distinct `--server-name` if you want them side by side in the same client. The bridge keeps a per-agent log at `~/.agp/logs/bridge-<agent>.log`.

## Troubleshooting

- **Client shows no AGP tools:** confirm the client was restarted; run `agp bridge check --agent-id <id>`; confirm the stack is up with `agp status`.
- **Auth errors:** the stored secret may be stale (rotated). Re-run `agp setup` or re-issue credentials, then `agp connect ... --write`.
- **Tools missing that you granted:** wait one poll interval (`AGP_BRIDGE_TOOLS_POLL_SECONDS`, default 15s) or restart the client.

More in [Debugging](../operate/debugging).
