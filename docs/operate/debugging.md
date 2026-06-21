---
title: Debugging
description: Diagnose a stack that won't start, a service that won't go ready, a tool that's denied, or an agent that sees no tools.
---

# Debugging

When something doesn't behave, AGP gives you three windows: `agp status` (process and health), `agp logs` (what a service printed), and `agp audit list-events` (what decision was made and why). Start there.

## Is the stack healthy?

```sh
agp status
```

Each row shows process state, pid, listen address, health, and version. A service that is `running` but not `ready` is failing a dependency check — the failing check names are surfaced in the status output. A common case: the proxy is up but not ready because Identity isn't ready yet; start order normally handles this, but a crashed dependency will show here.

```sh
agp version      # CLI version + the installed runtime set, per service
```

## Read the logs

```sh
agp logs <service> --lines 100     # last 100 lines for one service
agp logs                           # recent lines, all services, prefixed
agp logs -f                        # follow all services live (Ctrl-C to stop)
```

Logs live at `~/.agp/logs/<service>.log`; the per-agent bridge logs at `~/.agp/logs/bridge-<agent>.log`.

## What decision did AGP make?

Every allow / hold / deny — and every operator change — is in the audit trail:

```sh
agp audit list-events --effect deny --limit 20
agp audit list-events --tool-name car-db-ops__delete-reservation
agp audit list-events --agent-id <id> --event-type-prefix invocation.
agp audit summary                  # counts by effect/type over the last 24h
```

If a call "didn't work," this tells you whether it was denied, held, or never reached the proxy at all.

## Common failures

### A service won't go ready

```sh
agp logs <service> --lines 100
```

Look for a bind error (port in use), a missing dependency address, or a bad value in `~/.agp/services/<service>.env`. After fixing the env, `agp restart <service>`.

### Port already in use

AGP defaults to the quiet `27860–27868` range to avoid this, but if a port is taken: edit `HTTP_LISTEN_ADDR` (or `LISTEN_ADDR` / `ADMIN_UI_LISTEN_ADDR`) in `~/.agp/services/<service>.env`, then `agp restart <service>`. See [Config &amp; ports](config-and-ports).

### The agent sees no tools

This is usually **correct** — AGP is fail-closed. A fresh agent's profile has zero business tools. Grant some ([Behavior profiles](../core-workflows/behavior-profiles)), then wait one bridge poll interval or restart the client. Verify with:

```sh
agp bridge check --agent-id my-agent
agp proxy discover-tools --agent-id <agent-uuid>
```

### A tool is denied / "No matching policy"

The tool's call was refused by policy. Check how the tool is classified and whether it's actually in the catalog and the agent's envelope:

```sh
agp policy get-tool-classification --tool-name <name>
agp policy validate-bundle
agp registry list-tools --q <name>
agp behavior-profile get --behavior-profile-id <profile>
```

If `validate-bundle` reports `tool_count: 0` or the classification is missing, the tool isn't registered as you expect — re-check [registration](../core-workflows/govern-mcp-server). If it's a `write`/`delete` tool, "denied"-looking behavior may actually be a **hold** awaiting approval — confirm in `agp approval list --status PENDING`.

### Bridge / auth errors from a client

Run `agp bridge check --agent-id <id>`. A stale client secret (after a rotation) is the usual cause — re-run `agp setup` or rotate and reconnect. Confirm the stack is up with `agp status`.

## When in doubt

```sh
agp status                         # is everything running and ready?
agp logs -f                        # watch live while you reproduce
agp audit list-events --limit 20   # what did AGP actually decide?
```

Those three, in that order, resolve the large majority of issues.
