---
id: glossary
title: "Glossary"
sidebar_label: "Glossary"
description: "Definitions of key terms used across Raksha AI architecture and documentation."
---

# Glossary

| Term | Definition |
|------|------------|
| **Agent Governance Plane (AGP)** | The runtime enforcement layer between AI agents and every tool, API, or service they can reach. |
| **Behavior Profile** | An approved operating envelope binding an agent identity to allowed tools, data scopes, autonomy level, and runtime context constraints. |
| **CABR** | Context-Aware Browser Runtime. The governance layer for browser agent context acquisition. |
| **Capability Surface** | Any interface through which an agent can acquire context or take action — shell, browser, MCP, screenshot, API client. |
| **CaSH** | Context-Aware Shell. The shell-layer interceptor for agent command invocations. |
| **Context Accumulator** | Layer 2 of the context governance stack. Tracks all context acquired by an agent across capability surfaces within a session. |
| **Context Firewall** | Layer 3 of the context governance stack. A policy gate between the Context Accumulator and the LLM context window. |
| **Context Fragment** | A unit of acquired context from a specific capability surface, tagged with source, sensitivity classification, and timestamp. |
| **Context Governance** | Policy-mediated control of what AI agents can acquire, retain, reason over, and operationalize. |
| **MCP** | Model Context Protocol. An interface standard for AI agents to call tools. |
| **MCP Bypass** | The use of code execution (Python, Node, Go, etc.) to call APIs directly, bypassing MCP-layer governance. |
| **Ambient Authority** | The authenticated state a browser agent inherits from the browser session before taking any explicit action. |
| **Rendering as Context Acquisition** | The principle that loading a web page is itself a context acquisition event — exposing DOM, cookies, localStorage, and HTTP headers to the agent. |
| **Progressive Disclosure** | An AGP pattern for exposing only the tools relevant to the current behavior profile and runtime context. |
