---
id: cash
title: CaSH — Context-Aware Shell
sidebar_label: CaSH
description: Shell, filesystem, and execution-layer context governance for autonomous agents.
---

# CaSH — Context-Aware Shell

**Raksha AI — May 2026**

---

## Overview

CaSH is the shell, filesystem, and execution-layer governance component of the Context Governance architecture. It intercepts context-producing operations at the kernel and filesystem layers — before sensitive content enters the agent's reasoning state.

The core problem CaSH addresses is that tool-name governance is insufficient for shell-capable agents. An agent that can invoke a shell tool can execute arbitrary code, read any file, enumerate environment variables, and exfiltrate credentials — regardless of what tool-name policies say it is allowed to do. The MCP tool name is an abstraction. The execution surface is where actual context acquisition occurs.

CaSH operates at three interception layers:

**Shell mediation** intercepts shell command invocations before execution, applying policy against the command, its arguments, and the current session context model. Commands that would produce governed content — credential files, environment dumps, configuration reads — are evaluated before the shell executes them.

**FUSE-based filesystem interception** operates at the virtual filesystem layer, governing read operations on sensitive paths — `.env` files, cloud credential directories, SSH keys, deployment manifests, and other high-sensitivity locations — before file contents flow into agent output.

**eBPF-based syscall governance** operates at the kernel layer, providing a final enforcement boundary that no userspace agent implementation can bypass. Even an agent that spawns a subprocess, writes a Python script, or executes a compiled binary is subject to syscall-level policy enforcement.

This layered approach reflects a foundational principle: **governance must be applied at the execution layer, not the tool abstraction layer.** An agent that can execute code can bypass any tool-name policy. CaSH closes that gap by governing at the layer where execution actually occurs.

CaSH feeds all intercepted context into the **Context Accumulator**, which tracks what the agent has acquired, from which surfaces, under which policies, and for how long. The Context Firewall evaluates accumulated context before it reaches the model.

:::info Details Coming Soon
Full architecture documentation for CaSH — including the session context model, FUSE interception design, eBPF policy engine, redaction pipeline, and integration with the Context Accumulator — will be published alongside the open-source reference implementation.
:::