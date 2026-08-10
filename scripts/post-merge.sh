#!/bin/bash
set -e

pnpm install --frozen-lockfile

# DB push is best-effort: the Supabase host is unreachable from this shell
# environment (SSL cert + DNS resolution issues with the pooler hostname).
# Schema changes are applied manually via executeSql during development.
# This step will succeed when the environment resolves; failures are warnings only.
pnpm --filter @workspace/db run push-force || echo "WARNING: DB schema push failed (expected in post-merge shell — apply schema changes via executeSql if needed)"
