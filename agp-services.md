---
id: agp-services
title: AGP Service Reference
sidebar_label: Service Reference
description: Per-service technical reference — responsibilities, data models, API surfaces, interactions, and technology choices for every AGP component.
---

# AGP Service Reference

*Raksha AI — May 2026*

---

## Overview

AGP is composed of eleven services across the data, control, and observability planes. Each service owns a single responsibility domain, stores its own state, and communicates with other services exclusively through internal gRPC (synchronous) or the message bus (asynchronous). No service shares a database with another.

This document describes each service in detail: what it owns, what it calls, what it publishes, and why its design choices were made.

---

## Data Plane

### Proxy Service

The Proxy Service is the sole entry point for all agent-to-tool traffic. It is the only AGP component that sits on the hot path. Every MCP invocation passes through it. It is stateless, horizontally scalable, and deliberately free of any direct database writes.

**Responsibility.** The Proxy authenticates agents, resolves tool routing, evaluates policy, enforces rate limits, injects credentials, forwards approved requests to tool backends, and emits structured invocation events to the message bus.

**Protocol.** Accepts MCP over HTTP/SSE from agents. Forwards MCP over HTTP to tool backends. Internal calls to other AGP services use gRPC with Protobuf.

**Synchronous calls (per request).**

| Target | Purpose |
|---|---|
| Identity Service | Validate bearer token, resolve agent identity and claims |
| Registry Service (cached) | Resolve tool backend URL and metadata |
| Policy Engine | Evaluate ALLOW / DENY / HOLD decision |
| Rate Limiter | Check and decrement token bucket |
| Secret Manager | Retrieve and inject tool credentials into outbound request |

**Async events published.**

| Event | Trigger |
|---|---|
| `invocation.requested` | Request received and token validated |
| `invocation.approved` | Policy returned ALLOW, request forwarded |
| `invocation.denied` | Policy returned DENY |
| `invocation.hold` | Policy returned HOLD, submitted to Approval Service |
| `invocation.completed` | Tool backend returned response |
| `invocation.failed` | Tool backend returned error or timed out |

**State.** Stateless. Routing table held in a local in-memory cache, populated from Registry Service events. Cache invalidation is event-driven: `tool.updated` events trigger a cache refresh within seconds.

**Scaling.** Horizontal. Multiple identical replicas behind a load balancer. Scales on CPU and request rate via HPA.

**Critical design constraint.** The Proxy never writes to a database directly. All persistence is delegated to downstream async consumers of the message bus. This keeps the hot path free of write latency and allows the Proxy to scale independently of storage systems.

---

## Control Plane

### Identity Service

The Identity Service is the authority for all agent identities within AGP. It issues short-lived tokens to registered agents, validates those tokens on every request the Proxy receives, and manages the lifecycle of agent credentials.

**Responsibility.** Agent registration, client credential issuance, JWT token issuance (RS256), token validation, credential revocation, SSO federation for human admin users via OIDC.

**Agent data model.**

| Field | Type | Description |
|---|---|---|
| `agent_id` | UUID | Stable, globally unique identifier. Assigned at registration. Never changes. |
| `name` | string | Human-readable agent name. Used in audit logs and dashboards. |
| `team_id` | UUID | Owning team. Used for RBAC scoping. |
| `client_id` | string | Public identifier for token exchange. Derived from `agent_id`. |
| `client_secret` | hashed string | Returned once at registration. Never stored in plaintext. |
| `scopes` | []string | Capability scopes granted to this agent. |
| `status` | enum | `ACTIVE` \| `SUSPENDED` \| `DECOMMISSIONED`. Only ACTIVE agents can obtain tokens. |
| `credential_version` | integer | Monotonic generation counter embedded in issued JWTs. Increments on credential rotation. |

**Token design.** Tokens are short-lived RS256-signed JWTs. The Proxy validates tokens using a local copy of the JWKS endpoint — no database hit on the validation path. Revocation is handled via the `credential_version` field: rotating an agent's credentials increments the version, and all tokens issued under prior versions are immediately invalid.

**Scope model.** AGP uses a two-tier scope model. Built-in scopes (e.g. `tools:invoke`, `data:write`, `finance`, `pii`) are defined as a protobuf enum and validated at compile time. Custom scopes are enterprise-defined string labels registered in the scope catalog, allowing teams to express domain-specific access constraints without waiting for AGP releases. The Proxy enforces scope intersection on every request: the agent's granted scopes must cover the tool's required scopes.

**Async events published.** `agent.registered`, `agent.updated`, `agent.suspended`, `agent.revoked`, `token.issued`.

**State.** Postgres — agent registry, scope catalog, token revocation list, credential versions.

---

### Registry Service

The Registry Service is the source of truth for all registered MCP tools. It stores tool metadata, versioned schemas, backend routing configuration, ownership, health status, and the dependency graph of which agents consume which tools.

**Responsibility.** Tool registration, MCP schema validation, version lifecycle management (draft → published → deprecated), backend URL routing table, dependency graph queries, health status aggregation from periodic probes.

**Tool metadata model.**

| Field | Description |
|---|---|
| `tool_id` | Stable identifier. Never reused. |
| `name` | Canonical tool name as exposed in MCP discovery. |
| `owner_team_id` | Owning team. Required for approval and deprecation notifications. |
| `backend_url` | Where the Proxy forwards approved calls. |
| `mcp_schema` | Full MCP tool schema snapshot for this version. |
| `required_scopes` | Scopes an agent must hold to invoke this tool. Enforced by the Proxy. |
| `sensitivity_tags` | Labels used by the Audit Log Service to redact PII fields in stored payloads. |
| `status` | `DRAFT` \| `PUBLISHED` \| `DEPRECATED`. |

**Schema versioning and breaking change detection.** When a tool owner publishes a new schema version, the Registry Service performs a structural diff against the current published version. Field removals, type changes, and required-field additions are flagged as breaking changes. Publishing a breaking schema version requires explicit acknowledgement from every team whose agents appear in the dependency graph for that tool. This prevents silent API breakage across agent pipelines.

**Health probing.** The Registry Service sends periodic lightweight probes to each registered tool backend. Health state (`HEALTHY`, `DEGRADED`, `UNHEALTHY`) is stored and surfaced in the Admin Dashboard. Proxy replicas consume `tool.health_changed` events and can apply circuit-breaker behavior for unhealthy backends.

**Async events published.** `tool.registered`, `tool.updated`, `tool.deprecated`, `tool.version_published`, `tool.health_changed`.

**State.** Postgres — tool records, schema version history, dependency edges, health history.

---

### Policy Engine

The Policy Engine evaluates authorization policy for every tool invocation. Given an agent identity, an active behavior profile, a target tool, and the operation being requested, it returns one of three decisions: `ALLOW`, `DENY`, or `HOLD`.

**Responsibility.** Compile and cache OPA Rego policy bundles per tool. Evaluate every invocation request against the applicable bundle. Return a structured decision with a reason string.

**Policy model.** Policies are written in OPA-compatible Rego. Each registered tool has its own policy bundle. Bundles are compiled into in-memory structures on each Policy Engine replica. Evaluation is a pure in-memory computation — no database query on the decision path. Policy bundles are refreshed from the config store when a `tool.updated` event is received, with zero-downtime hot-reload.

**The three decisions.**

- **`ALLOW`** — the invocation proceeds. The Proxy forwards the request.
- **`DENY`** — the invocation is blocked. The Proxy returns `403` to the agent with the reason string from the bundle.
- **`HOLD`** — the invocation requires human review before proceeding. The Proxy suspends the request and submits it to the Approval Service. `HOLD` is the mechanism behind human-in-the-loop governance.

**Input to policy evaluation.** Agent ID, agent scopes, active behavior profile ID and its declared constraints, target tool ID and sensitivity tags, operation name, request attributes (input fields), time of day, and runtime context flags.

**Default policy.** Every newly registered tool gets a deny-all default bundle. No agent can invoke the tool until a tool owner explicitly configures grants via the Admin Dashboard. AGP is fail-closed.

**Async events published.** `policy.evaluated`, `policy.bundle_updated`.

**State.** Policy bundles stored in etcd or Postgres. In-memory compiled bundle cache on each replica, refreshed event-driven.

---

### Rate Limiter Service

The Rate Limiter enforces per-agent, per-tool, per-team, and global quota and rate limit rules configured by tool owners. It is called synchronously by the Proxy after a policy `ALLOW` decision.

**Responsibility.** Check and decrement token buckets and sliding-window quota counters before the Proxy forwards a call. Return `ALLOW` or `THROTTLE` with a retry-after duration.

**Algorithm.** Token-bucket for rate limiting (requests per second / minute). Sliding-window counter for quota enforcement (requests per day / month). Both are implemented as atomic Redis operations — sub-millisecond under normal conditions.

**Limit dimensions.** Rules can be scoped to any combination of: a specific agent, all agents on a team, a specific tool, or the global platform. A request is throttled if any applicable rule is exhausted.

**Quota exhaustion vs. rate limiting.** Rate limiting is transient — the bucket refills on the configured schedule. Quota exhaustion means the agent or team has consumed its allocation for the current billing or governance period. When a quota is fully exhausted, the Rate Limiter publishes `quota.exhausted`, which the Notification Service fans out to the tool owner and the agent team's lead.

**Async events published.** `rate_limit.throttled`, `quota.exhausted`, `quota.reset`.

**State.** Redis Cluster — token buckets and sliding-window counters. Rules loaded from the config store and cached locally. Redis Cluster provides sub-millisecond atomic operations and HA.

---

### Approval Service

The Approval Service manages the human-in-the-loop workflow. When the Policy Engine returns `HOLD`, the Proxy hands the pending invocation to the Approval Service and holds the agent connection open. The Approval Service stores the request, notifies reviewers, and waits for a decision.

**Responsibility.** Store pending invocations with their full request payload snapshot. Notify reviewers through configured channels. Accept approval or denial decisions. Signal the waiting Proxy instance when a decision arrives.

**Pending invocation record.** Stores the complete request snapshot at the moment of suspension: agent ID, behavior profile, target tool, full input payload, the policy reason for `HOLD`, a request timestamp, an expiry time, and reviewer assignment. Nothing is truncated — reviewers see exactly what the agent was trying to do.

**Reviewer notification.** The Approval Service calls the Notification Service immediately upon receiving a pending request. The Notification Service fans out to: Slack (interactive message with Approve and Deny action buttons), PagerDuty (optional, for high-severity tools), email, and the AGP UI approval queue.

**Proxy signalling.** When a reviewer submits a decision, the Approval Service writes the outcome to Postgres and publishes it via Redis pub/sub on the channel keyed to the original request ID. The Proxy instance holding the agent connection subscribes to that channel and receives the decision within milliseconds.

**Timeout handling.** Pending requests have configurable expiry. If no decision is received within the timeout window, the request is automatically denied and `approval.timed_out` is published. Tool owners configure the timeout per tool.

**Async events published.** `approval.requested`, `approval.approved`, `approval.denied`, `approval.timed_out`.

**State.** Postgres — pending requests, decisions, reviewer assignments, timeout timers.

---

### Secret Manager Service

The Secret Manager ensures that agents never hold credentials for the tools they invoke. The Proxy calls the Secret Manager on every approved request to retrieve and inject the appropriate credential into the outbound request before forwarding it to the tool backend.

**Responsibility.** Serve per-tool credentials to the Proxy at request time. Inject credentials into outbound request headers. Manage rotation schedules. Scan tool response payloads for inadvertently exposed secrets.

**Credential injection model.** Tool owners register a credential reference with the Secret Manager: a pointer to a credential stored in an external vault (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager), plus the injection target (HTTP header name, query parameter, or request body field). The Secret Manager retrieves a short-lived lease from the vault on demand and injects it. Credentials are cached in memory for the duration of their lease — they never touch a database.

**Output scanning.** The Secret Manager subscribes to `invocation.completed` events from the message bus. It scans response payloads for credential patterns using regex and high-entropy string analysis. If a potential secret is detected in a tool response, it publishes `secret.leaked` — alerting the tool owner and the security team.

**State.** No credentials stored in AGP. All secrets delegated to an external vault. Short-lived leases cached in memory only.

---

## Observability Plane

### Audit Log Service

The Audit Log Service consumes all invocation and decision events from the message bus and writes them to an immutable, append-only audit store. It is fully asynchronous — never on the hot path.

**Responsibility.** Consume structured events, normalize and enrich them with metadata from the Registry and Identity services, redact sensitive fields per tool schema sensitivity tags, write to the immutable audit store, serve a query API for the Admin Dashboard, and stream to SIEM integrations.

**Immutability.** Records are append-only. No record is ever updated or deleted. Long-term archival to S3 provides infinite retention with tamper-evident storage.

**PII and secrets redaction.** Before writing any invocation payload to the audit store, the Audit Log Service applies redaction rules derived from the tool's `sensitivity_tags` in the Registry. Fields tagged `pii`, `credentials`, or `secret` have their values replaced with a redaction marker. The structure of the payload is preserved for query purposes; the sensitive values are not.

**Events consumed.** All `invocation.*`, `approval.*`, `policy.*`, `agent.*`, `tool.*`, and `rate_limit.*` events from the message bus.

**State.** OpenSearch for recent records with full-text search and structured queries. S3 for cold archival. Records are partitioned by tenant, tool, and day for efficient range queries.

---

### Metrics and Telemetry Service

The Metrics and Telemetry Service aggregates invocation events into time-series metrics and manages SLO tracking and anomaly detection alerting.

**Responsibility.** Aggregate `invocation.*` events into latency histograms, error rates, throughput counters, and quota utilization metrics. Compute SLO burn rates. Detect anomalies on rolling windows. Fire alerts via the Notification Service. Expose a Prometheus-compatible scrape endpoint.

**SLO tracking.** Tool owners define SLO targets (e.g. p99 latency < 500ms, error rate < 0.1%) via the Admin Dashboard. The Metrics Service computes burn rates against these targets in real time and surfaces them in embedded Grafana dashboards.

**Anomaly detection.** Configurable rules evaluate rolling-window statistics: a spike in denial rate from a single agent, a sudden drop in success rate for a specific tool, or an unusual burst of `HOLD` decisions. When a rule fires, the Metrics Service publishes an `alert.*` event consumed by the Notification Service.

**State.** Victoria Metrics for short-term time-series (Prometheus-compatible). Thanos or Cortex for long-term multi-tenant storage.

---

## Notification Service

The Notification Service centralizes all outbound notifications across AGP. Approval requests, anomaly alerts, quota exhaustion warnings, tool deprecation notices, and breaking change notifications all route through it.

**Responsibility.** Receive notification requests from any AGP service. Fan out to configured channels. Deduplicate notifications within a time window. Throttle to prevent alert storms. Track delivery confirmation.

**Adapters.** Slack (interactive messages with approve/deny action buttons), PagerDuty (incident creation and resolution), Email (SMTP or SendGrid), generic outbound webhook, and the AGP UI notification center.

**Called by.** Approval Service (reviewer notifications), Metrics Service (anomaly alerts), Rate Limiter (quota exhaustion), Registry Service (deprecation and breaking-change notices), Secret Manager (secret leak alerts).

---

## Admin Dashboard

The Admin Dashboard is the web UI for all human interaction with AGP. Tool owners, platform admins, and reviewers all use it. The dashboard has no business logic of its own — every action is a thin API call to the appropriate backend service.

| Module | Function |
|---|---|
| Tool Registry | Browse, register, version, deprecate tools. View dependency graph and health status. |
| Policy Config | Define RBAC rules, attribute-based conditions, and approval triggers per tool. Visual rule builder with OPA preview. |
| Rate Limit Config | Configure per-tool, per-agent, and per-team quotas and rate limits. View current utilization. |
| Approval Queue | Reviewer inbox for pending `HOLD` invocations. Full request payload, agent identity, policy reason, and approve/deny controls. |
| Audit Log Viewer | Search and filter audit records by agent, tool, time range, and outcome. Export to CSV or stream to SIEM. |
| Observability | Embedded Grafana dashboards: latency, error rate, throughput, SLO burn rate per tool and per agent. |
| Tenant Management | Create namespaces, assign team ownership, configure SSO. |

---

## Message Bus Topic Reference

| Topic | Publisher | Consumers |
|---|---|---|
| `invocation.*` | Proxy Service | Audit Log, Metrics, Secret Manager |
| `approval.*` | Approval Service | Audit Log, Metrics, Notification |
| `policy.*` | Policy Engine | Audit Log, Metrics |
| `tool.*` | Registry Service | Proxy (routing cache), Policy Engine (bundle refresh), Audit Log, Notification |
| `agent.*` | Identity Service | Audit Log, Policy Engine |
| `rate_limit.*` | Rate Limiter | Audit Log, Metrics, Notification |
| `alert.*` | Metrics Service | Notification Service |

---

## Data Store Summary

| Service | Store | Technology | Rationale |
|---|---|---|---|
| Identity Service | Agent registry, scope catalog | Postgres | Relational, ACID, low write volume |
| Registry Service | Tool catalog, dependency graph | Postgres | Relational joins for dependency graph queries |
| Policy Engine | Policy bundles | etcd / Postgres | Strong consistency on policy updates |
| Rate Limiter | Token buckets, counters | Redis Cluster | Sub-millisecond atomic increment operations |
| Approval Service | Pending requests, decisions | Postgres | Durable storage with timer support |
| Audit Log Service | Immutable audit records | OpenSearch + S3 | Full-text search + infinite cold archival |
| Metrics Service | Time-series metrics | Victoria Metrics | High write throughput, efficient range queries |
| Proxy Service | Routing cache | In-memory (local) | Zero-latency lookup on hot path |
| Secret Manager | Credentials | External vault (delegated) | Secrets never stored in AGP |
