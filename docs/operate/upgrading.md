---
title: Upgrading & verifying downloads
description: Update the CLI and services to a new release, and verify the integrity of what you download.
---

# Upgrading &amp; verifying downloads

AGP ships as versioned releases. The CLI and the service binaries are versioned together as a **runtime set**, so keep them in step.

## Check what you're on

```sh
agp version
```

This prints the CLI version and the installed runtime set, per service. `agp status` also shows each running service's version.

## Upgrade the services

Download a specific release into `~/.agp/bin`:

```sh
agp fetch all --version v0.1.0      # a specific release
agp fetch all                       # the latest release
```

Then restart so the new binaries take over:

```sh
agp restart all
agp status                          # confirm versions and readiness
```

Your `~/.agp` state (SQLite data, secrets, env files, CLI config) is preserved across an upgrade — only the binaries in `bin/` change.

## Upgrade the CLI

Re-run the installer; it replaces the `agp` binary in place:

```sh
# macOS & Linux
curl -fsSL https://raw.githubusercontent.com/getraksha/agp/main/install.sh | sh
```

```powershell
# Windows
irm https://raw.githubusercontent.com/getraksha/agp/main/install.ps1 | iex
```

Pin a version with the `AGP_VERSION` environment variable before running the installer if you need a specific CLI release.

## Verifying downloads

Every release publishes a `manifest.json` (per-asset SHA-256 checksums and per-repo source provenance) and a `SHA256SUMS` file. **The CLI and the install script verify checksums automatically** before installing anything — a corrupted or tampered asset is refused.

To verify a manually-downloaded asset yourself:

```sh
shasum -a 256 -c SHA256SUMS --ignore-missing
```

## Rolling back

Fetch the previous version and restart:

```sh
agp fetch all --version v0.0.11
agp restart all
```

Because state lives in `~/.agp/data` and is untouched by `fetch`, rolling the binaries back leaves your agents, profiles, and catalog intact.

## Release notes

Releases and their notes are published on the [AGP releases page](https://github.com/getraksha/agp/releases).
