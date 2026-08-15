---
name: Razorpay MCP vs Replit Secrets
description: The Razorpay MCP connector uses its own credential store, independent of RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET Replit Secrets.
---

## Rule
Do not assume that a working Razorpay MCP means the server's RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET secrets are correct. They are separate credential stores.

**Why:** The Razorpay MCP ("custom-mcp") has its own API key configured at the integration level. The server (api-server) reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from process.env via Replit Secrets. These can (and have) diverged, causing the MCP to work while the server returns 401.

**How to identify the correct account:** Look at the Razorpay order ID prefix returned by MCP-created orders. The first ~4 chars after "order_" encode the key account. Cross-reference with the key ID — rzp_test_TPzTnRBMoLJ7Z9 creates orders starting with "order_TPz".

**How to apply:**
- Use MCP for diagnostic Razorpay calls (verify connectivity, check payment status).
- Use direct curl with known credentials for server-side testing when Replit Secrets are suspect.
- Both should create orders under the same account prefix if credentials match.
