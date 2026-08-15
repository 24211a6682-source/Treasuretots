---
name: Webhook idempotency — failed→paid fix
description: The payment.captured webhook WHERE clause must allow both 'pending' and 'failed' statuses, not just 'pending'.
---

## Rule
In artifacts/api-server/src/routes/webhooks.ts, the UPDATE for payment.captured/order.paid uses:
```typescript
inArray(ordersTable.paymentStatus, ["pending", "failed"])
```
NOT `eq(ordersTable.paymentStatus, "pending")`.

**Why:** Razorpay allows multiple payment attempts per order_id. A customer's first payment can fail (marking the order "failed"), then they retry and succeed — this sends a legitimate payment.captured event for an order currently in "failed" state. The narrower WHERE clause would silently ignore this, leaving the order stuck as "failed" even though money was captured.

**How to apply:**
- The early guard `if (order.paymentStatus === "paid") { return; }` correctly blocks re-processing already-paid orders.
- The WHERE clause in the UPDATE handles pending→paid AND failed→paid (retry).
- The payment.failed handler keeps `eq(paymentStatus, "pending")` — it must never overwrite a paid order.
