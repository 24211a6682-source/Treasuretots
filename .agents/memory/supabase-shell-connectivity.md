---
name: Supabase shell connectivity
description: Supabase DB is unreachable from the Nix post-merge shell — both SSL and DNS fail. Schema changes must use executeSql instead.
---

The Supabase database cannot be reached from the post-merge shell (or any bare Nix shell) context:

- `ssl: true` → "self-signed certificate in certificate chain" — Nix doesn't trust Supabase's cert bundle.
- `ssl: { rejectUnauthorized: false }` → ENOTFOUND — the Supabase pooler hostname (tenant-format `postgres.<project-ref>`) does not resolve via DNS in this environment.

**Why:** The Supabase connection string uses a pooler hostname that requires specific DNS resolution not available in the Nix shell. The SSL cert chain is also self-signed and untrusted.

**How to apply:**
- `drizzle-kit push` and `drizzle-kit pull` will always fail in the post-merge script and bare shell. Do not block on them.
- The post-merge script (`scripts/post-merge.sh`) is set to `|| echo "WARNING: ..."` so the step is non-fatal.
- Apply schema changes (new columns, tables, etc.) manually via `executeSql` in CodeExecution after confirming the Drizzle schema file is correct.
- The Drizzle schema files remain the source of truth; `executeSql` applies the delta to the live DB.
