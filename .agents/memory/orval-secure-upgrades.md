---
name: Orval secure upgrades
description: Compatibility constraints when upgrading Orval past the vulnerable 8.9 release.
---

Use a current firewall-approved Orval 8.x release rather than the early post-8.9 patch releases, and explicitly retain Zod 3 generation while this workspace remains on Zod 3.

**Why:** The package firewall rejects early post-8.9 Orval releases. Current Orval otherwise auto-generates Zod 4 APIs and iterable `Headers` usage, which breaks this workspace's existing type setup.

**How to apply:** When updating Orval, regenerate both API clients and run library type-checking. Keep the Zod generator pinned to version 3 until the workspace intentionally migrates to Zod 4, and ensure the client TypeScript libs include DOM iterables.