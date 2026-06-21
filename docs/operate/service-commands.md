---
title: "Advanced: service-level commands"
description: Talk to individual AGP services directly for scripting, automation, and inspection.
---

# Advanced: service-level commands

The lifecycle commands (`init`, `start`, `status`…) manage the runtime. Beyond those, the CLI exposes each control-plane **service** as its own command group, so anything the console does, you can script. They all share the same output and profile machinery.

## Profiles and tokens

Service commands talk to running services over HTTP, so they need a profile that knows the endpoints and an admin token:

```sh
agp --profile local identity list-agents
agp --output json identity list-agents     # JSON instead of the default table
```

The `local` profile (written by `agp init`) already has the service URLs and the admin `token`. The endpoints come from `~/.config/agp/config.yaml`; see [Config &amp; ports](config-and-ports).

## The service groups

Every group has `health-live` and `health-ready`. The high-value commands:

### `agp identity` — agents &amp; credentials

```sh
agp identity list-agents --status active
agp identity get-agent --agent-id my-agent
agp identity register-agent --agent-id ci-agent --name "CI agent"
agp identity approve-agent --agent-id ci-agent --actor admin --reason "approved"
agp identity rotate-secret --agent-id ci-agent --reason "scheduled rotation"
agp identity suspend-agent --agent-id ci-agent --actor admin --reason "offboarding"
agp identity delete-agent --agent-id ci-agent --actor admin --reason "decommissioned"
```

### `agp behavior-profile` — envelopes

Grant/revoke and lifecycle — covered in [Behavior profiles](../core-workflows/behavior-profiles).

```sh
agp behavior-profile list --agent-id my-agent
agp behavior-profile grant-tools --behavior-profile-id <id> --tools <csv> --reason <why>
```

### `agp registry` — the tool catalog

CRUD plus MCP discovery/registration — covered in [Govern your first MCP server](../core-workflows/govern-mcp-server).

```sh
agp registry list-tools --q <query>
agp registry list-dependents --tool-name <name>     # which agents rely on a tool
agp registry register-server --backend-url <url> --server-alias <a> --team-id <id> --all-new
```

### `agp policy` — classification &amp; evaluation

```sh
agp policy list-tool-classifications
agp policy get-tool-classification --tool-name <name>
agp policy evaluate --file input.json               # evaluate a policy input
agp policy validate-bundle                          # is the loaded bundle valid?
```

### `agp approval` — the held-operation queue

Covered in [The approval workflow](../core-workflows/approval-workflow).

```sh
agp approval list --status PENDING
agp approval approve --approval-id <id> --reviewer <name> --reason <why>
```

### `agp audit` — the governance log

Covered in [Debugging](debugging).

```sh
agp audit list-events --effect deny --limit 50
agp audit summary --since 2026-06-10T00:00:00Z
agp audit get-event --event-id <ulid>
```

### `agp proxy` — invoke &amp; discover

Drive the enforcement point directly — useful for testing a grant end-to-end:

```sh
agp proxy discover-tools --agent-id <agent-uuid>
agp proxy invoke-tool --tool-name <name> --agent-id <agent-uuid> --payload '{"...":"..."}'
```

A held tool invoked this way returns `POLICY_HOLD` with an `approval_id`, exactly as an agent would see it.

## Scripting tips

- Add `--output json` (and keep `--no-pretty` for compact, parseable output) when piping to `jq`.
- `--request-id <id>` propagates an id through the services so you can trace one operation across `agp audit list-events --request-id <id>`.
- Discover any group's full command set with `agp <service> --help` and `agp <service> <command> --help`.

For the complete list of commands and flags, see the [CLI reference](../reference/cli).
