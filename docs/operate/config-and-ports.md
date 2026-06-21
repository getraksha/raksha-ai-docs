---
title: Config & ports
description: Where AGP keeps its state and config, the default ports, and how to safely change them.
---

# Config &amp; ports

AGP Community Edition keeps everything on your machine. There are two config surfaces: the per-service **env files** (where each service listens and what it depends on) and the **CLI config** (your profiles, credentials, and output preferences).

## The `~/.agp` home

```text
~/.agp/
├── bin/                  # service binaries (agp-identity, agp-proxy, …)
├── services/             # per-service env files
│   ├── identity.env
│   ├── proxy.env
│   ├── …                 # one per service (.env.bak after --force)
├── secrets/
│   ├── admin-token       # the shared admin token (read-only)
│   └── console-password  # the console password (read-only)
├── data/                 # SQLite databases, one per service
└── logs/                 # service + bridge logs
```

Recover the console password any time with `cat ~/.agp/secrets/console-password`.

## Service env files

Each `~/.agp/services/<service>.env` is the **source of truth for where that service listens**. `agp status` / `start` / `stop` read it directly, so a port edit there takes effect on the next restart. The files are written by `agp init` with internally-consistent cross-references (each service's listeners *and* its dependencies' addresses), so you normally never touch them.

## Default ports

All services bind `127.0.0.1` by default, in the quiet `27860+` range so conflicts are rare:

| Service | HTTP | gRPC | Env key |
|---|---|---|---|
| identity | 27860 | 27880 | `HTTP_LISTEN_ADDR` |
| registry | 27861 | 27881 | `HTTP_LISTEN_ADDR` |
| behavior-profile | 27862 | 27882 | `HTTP_LISTEN_ADDR` |
| policy | 27863 | 27883 | `HTTP_LISTEN_ADDR` |
| audit | 27864 | 27884 | `HTTP_LISTEN_ADDR` |
| approval | 27865 | 27885 | `HTTP_LISTEN_ADDR` |
| approval-ops | 27866 | — | `LISTEN_ADDR` |
| proxy | 27867 | — | `LISTEN_ADDR` |
| admin-ui (console) | 27868 | — | `ADMIN_UI_LISTEN_ADDR` |

## Changing a port

If something already holds one of these ports:

1. Edit the address in `~/.agp/services/<service>.env`, e.g. `HTTP_LISTEN_ADDR=127.0.0.1:37863`.
2. Restart it: `agp restart <service>`.

If a *dependency's* port changes, update the consumers' env files too (each service's `.env` lists the addresses it dials). The cleanest reset is:

```sh
agp init --force
```

`--force` re-renders **every** service `.env` from the current defaults, keeping a `.bak` of each. Your secrets are never regenerated.

:::warning `--force` re-renders env files, not your CLI config
`agp init --force` rewrites the service `.env` files. It does **not** touch your CLI `config.yaml` — see below. If you remap a port with `--force`, update the matching `*_http` endpoint in your CLI profile by hand so service commands keep reaching the right address.
:::

## The CLI config

Default location `~/.config/agp/config.yaml` (override with `--config`). It holds your profiles, stored agent credentials, and output preferences:

```yaml
default_profile: local
output: table          # table | json
json_pretty: true      # pretty-print JSON output by default

profiles:
  local:
    identity_http: http://localhost:27860
    registry_http: http://localhost:27861
    behavior_profile_http: http://localhost:27862
    policy_http: http://localhost:27863
    audit_http: http://localhost:27864
    approval_http: http://localhost:27865
    proxy_http: http://localhost:27867
    token: <admin-token>
    agent_credentials:
      my-agent:
        client_id: <id>
        client_secret: <secret>
        behavior_profile_id: my-agent.local.default
```

:::note agp never overwrites your config
`config.yaml` is created **once** by `agp init` and is then owned by you — `agp` never modifies it, **not even with `--force`**. It accrues your agents and credentials over time, and rewriting it would lose them. Edit it freely.
:::

### Output preferences

- `output: table | json` — the default rendering. Override per-command with `--output`.
- `json_pretty: true` — pretty-print JSON by default. Override with `--no-pretty` (compact) or `--pretty`.

## Profiles

A profile is a named set of endpoints + token. Most users only ever have `local`. You can add more profiles to point the CLI at different stacks and select one with `--profile <name>` (or set `default_profile`).
