---
title: The approval workflow
description: How destructive operations pause for human approval before they execute, and how to review them from the console, the CLI, or the agent itself.
---

# The approval workflow

A granted tool is visible and callable — but that doesn't mean every call runs immediately. AGP classifies each operation and, for risky ones, **pauses execution until a human decides**. To the agent, a held call just looks like a slow tool call.

## How a decision is made

Two gates run on every call:

1. **Envelope (behavior profile).** Is this tool granted to this agent? If not, it isn't even visible. See [How tool visibility works](tool-visibility).
2. **Policy.** The registry records an operation fact for each tool; policy turns that fact into a decision:

| Operation fact | Decision | Behavior |
|---|---|---|
| `read` | **allow** | Executes immediately. |
| `write`, `delete`, `execute`, unknown | **hold** | Pauses for human approval before executing. |
| critical | **deny** | Refused outright. |

This is **fail-closed**: anything not clearly safe holds rather than running. The decision is made by infrastructure the agent cannot modify, and recorded by the enforcement layer itself — not by what the agent claims it did.

## What a hold looks like

When a held tool is called, the proxy returns a `POLICY_HOLD` result carrying an `approval_id` and a review URL, and creates a pending entry in the **approval** queue. The call does not execute. A reviewer then approves or denies it; on approval, the operation proceeds and the real result flows back.

## Reviewing as an operator

**In the console:** the **Approvals** view is the human-in-the-loop queue, with risk tiers. Approve or deny with a reason.

**From the CLI:**

```sh
# See what's waiting
agp approval list --status PENDING

# Inspect one
agp approval get --approval-id apr_1c353adb...

# Decide (reviewer + reason are recorded)
agp approval approve --approval-id apr_1c353adb... --reviewer naveen --reason "looks correct"
agp approval deny    --approval-id apr_1c353adb... --reviewer naveen --reason "insufficient justification"
```

Decisions are attributable: the reviewer and reason land in the [audit trail](../operate/debugging).

## The agent's side: self-service

Agents don't sit and block forever. AGP grants every agent a small set of **approval meta-tools** (`agp-approval-ops`) so it can manage its *own* held requests:

- `approval-list-mine` — list the agent's own held approvals.
- `approval-get` — check the status of one of its approvals.
- `approval-proceed` — once a human has approved, drive the held operation to completion.
- `approval-cancel` — withdraw its own request.

So the end-to-end flow for a held call is:

1. Agent calls a `write`/`delete` tool → proxy returns `POLICY_HOLD` with an `approval_id`.
2. A human approves (console or `agp approval approve`).
3. The agent calls `approval-proceed` with that `approval_id` → the operation executes and returns its result.

This is exactly the flow you'd see governing a real backend — for example, posting a GitHub comment through AGP holds until you approve, then `approval-proceed` posts it.

## Tuning what holds

What holds is driven by the operation facts on each tool in the catalog. To inspect how a tool will be classified:

```sh
agp policy list-tool-classifications
agp policy get-tool-classification --tool-name car-db-ops__delete-reservation
```

If a tool's risk fact looks wrong, fix it on the tool in the registry; policy will classify it accordingly on the next call.

## Next

[Connecting clients →](connecting-clients) · [Debugging →](../operate/debugging)
