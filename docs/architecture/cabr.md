---
id: cabr
title: CABR — Context-Aware Browser Runtime
sidebar_label: CABR
description: Browser-layer context governance for autonomous agents operating inside web environments.
---

# CABR — Context-Aware Browser Runtime

**Raksha AI — May 2026**

---

## Overview

CABR is the browser-layer governance component of the Context Governance architecture. It governs what browser agents are allowed to acquire from the web environment — before that information enters the model's context window.

The core problem CABR addresses is ambient authority. A browser agent does not need to steal credentials. The moment it navigates to an authenticated page, it inherits everything the browser session already holds: cookies, localStorage entries, session tokens, HTTP authorization headers, and the full authenticated state of every active session. This inheritance happens automatically, before any agent action takes place. There is no acquisition event to intercept at the tool or network layer — by the time the agent renders a DOM, it already has access to everything the logged-in user has access to.

CABR establishes a governance boundary between the browser environment and the model's reasoning state. Its key responsibilities are:

**DOM and content classification** examines page content — HTML, JavaScript variables, hidden fields, accessibility trees, and rendered text — for credential patterns, PII, session tokens, API keys, and other governed content before that content is passed to the model as context.

**Cookie and storage governance** controls which cookies, localStorage entries, and sessionStorage values are visible to the agent's context window. Authenticated session state is managed under policy, not automatically exposed.

**Screenshot and visual context governance** applies classification and redaction to visual captures before they enter the model's reasoning state. Credentials and sensitive data rendered on screen are subject to the same policy as structured data.

**Authenticated session mediation** provides a policy layer between the browser's ambient authority and what the agent is permitted to operationalize. An agent operating under a behavior profile that does not include `pii` or `credentials` scope cannot reason over content classified under those labels — regardless of what the browser session can access.

This reflects a principle established in the Context Governance architecture: **ambient authority is not the same as granted access.** The browser having a credential does not mean the agent is authorized to know it. CABR enforces that distinction at the browser runtime layer.

:::info Details Coming Soon
Full architecture documentation for CABR — including the DOM classification pipeline, cookie and storage governance model, screenshot redaction engine, and integration with the Context Accumulator — will be published alongside the open-source reference implementation.
:::
