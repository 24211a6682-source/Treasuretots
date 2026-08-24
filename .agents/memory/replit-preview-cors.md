---
name: Replit preview CORS
description: Replit preview traffic now uses replit.dev origins.
---

When no explicit `ALLOWED_ORIGIN` is configured, the API must allow only Replit-managed `*.replit.dev` preview origins.

**Why:** Replit has retired the legacy `*.pike.repl.co` preview URL format; current preview traffic uses `*.replit.dev`.

**How to apply:** Keep an explicit `ALLOWED_ORIGIN` allowlist as the preferred production configuration. Preserve the narrowly scoped `*.replit.dev` fallback; never replace it with an unrestricted CORS wildcard.