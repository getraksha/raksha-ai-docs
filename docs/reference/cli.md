---
title: CLI reference
description: Every agp command, grouped by area, with its flags and purpose.
---

# CLI reference

A complete map of the `agp` CLI. Run `agp <command> --help` for the authoritative, version-specific details.

## Global flags

These apply to every command:

| Flag | Default | Purpose |
|---|---|---|
| `--config <path>` | `~/.config/agp/config.yaml` | CLI config file. |
| `--profile <name>` | `default_profile` | Profile to use. |
| `--output json\|table` | `table` | Output format. |
| `--pretty` / `--no-pretty` | `--pretty` | Pretty or compact JSON. |
| `--timeout <duration>` | `10s` | Per-request timeout. |
| `--request-id <id>` | — | Request id propagated to services (traceable in audit). |
| `--verbose` | — | Verbose CLI output. |

Help is available everywhere: `agp help`, `agp <service> --help`, `agp <service> <command> --help`.

## Lifecycle

Manage the local runtime. These operate on `~/.agp` directly and need no profile.

| Command | Key flags | Purpose |
|---|---|---|
| `agp init` | `--force` | Create `~/.agp`: secrets, per-service env files, CLI config. `--force` re-renders env files (keeps `.bak`; secrets never regenerated). |
| `agp fetch [service\|all]` | `--version <v>`, `--local <path>` | Install service binaries (download, or build from an `agp-core` checkout). |
| `agp start [service\|all]` | | Start services in dependency order, wait for readiness. |
| `agp stop [service\|all]` | | Stop services (SIGTERM → grace → SIGKILL). |
| `agp restart [service\|all]` | | Restart services. |
| `agp status` | | Per-service state, pid, address, health, version. |
| `agp logs [service\|all]` | `--lines <n>`, `--follow`/`-f` | Show or follow service logs. |
| `agp version` | | CLI version + installed runtime set. |
| `agp completion <bash\|zsh>` | | Generate shell completion. |

## Setup &amp; connect

| Command | Key flags | Purpose |
|---|---|---|
| `agp setup` | `--agent-id`, `--client`, `--server-name`, `--write`, `--non-interactive` | First-mile wizard: create agent + profile, save credentials, connect a client. |
| `agp connect <client>` | `--agent-id`, `--server-name`, `--write` | Wire an existing agent into a client. Clients: `claude-desktop`, `claude-code`, `cursor`, `vscode`, `codex`, `custom`. |

## Bridge

The local MCP bridge clients launch.

| Command | Key flags | Purpose |
|---|---|---|
| `agp bridge run` | `--client-id`, `--client-secret`, `--identity-url`, `--proxy-url`, `--log-file` | Run the stdio MCP bridge. Env fallbacks: `AGP_CLIENT_ID`, `AGP_CLIENT_SECRET`, `AGP_IDENTITY_URL`, `AGP_PROXY_URL`. Poll interval: `AGP_BRIDGE_TOOLS_POLL_SECONDS` (default 15). |
| `agp bridge check` | same as `run` | Check connectivity and print discovered tools. |

## Service commands

These talk to running services over HTTP and need a profile with endpoints + admin `token`. Every group also has `health-live` and `health-ready`.

### `agp identity`

`list-agents` · `get-agent` · `register-agent` · `update-agent` · `approve-agent` · `activate-agent` · `suspend-agent` · `delete-agent` · `rotate-secret` · `issue-token` · `list-agent-lifecycle-events` · `get-jwks` · `get-openid-configuration`

Lifecycle commands take `--agent-id`, `--actor`, `--reason`.

### `agp behavior-profile`

`list` · `get` · `create --file` · `update --file` · `approve` · `activate` · `suspend` · `retire` · `grant-tools` · `revoke-tools` · `list-events`

`grant-tools` / `revoke-tools` take `--behavior-profile-id`, `--tools <csv>`, `--reason`.

### `agp registry`

Tools: `list-tools` · `get-tool` · `create-tool --file` · `update-tool` · `deprecate-tool` · `delete-tool` · `list-active-tools` · `list-dependents` · `replace-agent-dependencies`

Versions: `publish-version` · `list-versions` · `get-version` · `set-current-version`

Bulk: `bulk-deprecate` · `bulk-yank` (by `--tool-ids` / `--tool-names` / `--server-alias`)

MCP servers: `discover-server` · `register-server` (`--backend-url`, `--server-alias`, `--team-id`, `--all-new`/`--tools`, `--auth-type NONE\|HEADER_API_KEY\|BEARER`, `--auth-header`, `--auth-value`)

### `agp policy`

`evaluate --file` · `validate-bundle` · `list-tool-classifications` · `get-tool-classification --tool-name`

### `agp approval`

`list` (`--status`, `--agent-id`, `--tool-name`) · `get --approval-id` · `approve` / `deny` (`--approval-id`, `--reviewer`, `--reason`)

### `agp audit`

`list-events` (`--agent-id`, `--event-type`, `--event-type-prefix`, `--effect allow\|deny\|hold`, `--tool-name`, `--request-id`, `--approval-id`, `--since`, `--until`, `--limit`, `--cursor`) · `get-event --event-id` · `summary --since`

### `agp proxy`

`invoke-tool` (`--tool-name`, `--agent-token`/`--agent-id`, `--payload`/`--payload-file`) · `discover-tools --agent-id`

## Agent-facing MCP tools

Granted to agents by `agp setup` (the `agp-approval-ops` server) so an agent can manage its own held approvals:

`approval-list-mine` · `approval-get` · `approval-proceed` · `approval-cancel`

## See also

[Config &amp; ports](../operate/config-and-ports) · [Glossary](glossary)
