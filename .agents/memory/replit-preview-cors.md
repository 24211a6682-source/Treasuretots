---
name: Replit preview CORS
description: Trusted Replit preview traffic can use pike.repl.co rather than replit.dev.
---

When no explicit `ALLOWED_ORIGIN` is configured, the API must allow only Replit-managed preview origins from both `*.replit.dev` and `*.pike.repl.co`.

**Why:** The artifact preview proxy can send browser requests from a `pike.repl.co` origin. Allowing only `replit.dev` blocks valid browser API calls, including password recovery, before route handling.

**How to apply:** Keep an explicit `ALLOWED_ORIGIN` allowlist as the preferred production configuration. Preserve the narrowly scoped Replit preview fallback; never replace it with an unrestricted CORS wildcard.