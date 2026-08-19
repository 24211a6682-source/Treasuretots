---
name: Password reset link origins
description: Security rule for generating password-reset and other action-token URLs.
---

Build action-token URLs from a server-owned configured public origin (for example, the deployment domain), never from `Host` or forwarded host headers on an incoming request.

**Why:** A hostile host header can make a genuine password-reset email point to an attacker-controlled domain, exposing the single-use token when the recipient follows it.

**How to apply:** Require a configured, validated HTTP(S) origin or a trusted platform deployment-domain environment value before sending mail. Fail the mail operation safely if no such origin is available.