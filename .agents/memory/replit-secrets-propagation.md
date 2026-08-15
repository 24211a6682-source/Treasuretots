---
name: Replit Secrets propagation
description: requestSecrets UI may silently re-confirm old values; workflow process may not pick up updated secrets even after restart.
---

## Rule
When a Replit Secret must be updated to a specific known value, do NOT rely on requestSecrets alone. Instead, tell the user to edit the value **directly in the Replit Secrets panel** (padlock icon in the sidebar) by clicking the key, editing the value field, and saving.

**Why:** The requestSecrets form may pre-populate with existing values and allow the user to "confirm" without actually changing them. The system reports the secret as "added or confirmed" either way, giving no signal that the value changed. Additionally, workflow processes started immediately after a secret update via requestSecrets have been observed reading the old cached value even after WorkflowsRestart.

**How to apply:**
- If a secret is returning 401/auth errors after 1+ rounds of requestSecrets, switch to direct Secrets panel edit instructions.
- After the user saves in the Secrets panel, restart the workflow and immediately test an endpoint that uses the secret to confirm propagation.
- The shell process (`node -e "process.env.MY_SECRET"`) does NOT reflect Replit Secrets — only workflow processes started by Replit do. Do not use shell env var checks to verify secret values.
