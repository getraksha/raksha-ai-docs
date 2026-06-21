---
title: Log in to the console
description: Open the AGP admin console, where you register MCP servers, grant tools, approve held operations, and watch the live governance feed.
---

# Log in to the console

The admin console is the web UI for everything you'll do day to day: register MCP servers, grant tools to each agent's behavior profile, approve held operations, and watch every call land in the audit trail — in real time, all on your machine.

## Open it

Go to **http://localhost:27868**.

- **Username:** `admin`
- **Password:** the one `agp init` printed.

Lost the password? It's stored locally:

```sh
cat ~/.agp/secrets/console-password
```

:::note Where the URL comes from
The console is the `admin-ui` service. Its address lives in `~/.agp/services/admin-ui.env` (`ADMIN_UI_LISTEN_ADDR`), so if you moved its port, log in at that port instead.
:::

## A quick tour

| View | What it's for |
|---|---|
| **Dashboard** | Control-plane health and inventory at a glance. |
| **Agents** | Per-agent identity and credential lifecycle — register, approve, suspend, rotate secrets. |
| **Behavior Profiles** | Each agent's fail-closed tool envelope. An agent can only see and call what's granted here. |
| **Tools** | The governed catalog: backends, versions, and the operation facts (`read` / `write` / `execute`) policy reasons over. |
| **Approvals** | The human-in-the-loop queue. High-risk operations pause here before they execute; approve or deny with a reason. |
| **Activity** | The live governance feed: every tool call, approval decision, and operator change — allowed, held, or denied. |

## A few quick tips

- **The Activity feed is your friend.** When something behaves unexpectedly, watch it here first — you'll see the exact decision (allow / hold / deny) and why.
- **Everything in the console has a CLI equivalent.** The console and the `agp` CLI talk to the same services. Anything you click, you can script — run `agp <service> --help` (for example `agp behavior-profile --help`) to see the commands.
- **Decisions are attributable.** When you approve or deny, you record a reviewer and a reason. Both land in the audit trail.

## Next

You have the stack running and the console open. Now create a governed agent and connect it to a client.

[Your first governed agent →](first-agent)
