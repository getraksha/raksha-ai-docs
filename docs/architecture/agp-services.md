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

**Details Coming Soon.**

---

