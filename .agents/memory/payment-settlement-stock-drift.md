---
name: Captured payment settlement and stock drift
description: Captured payments must settle atomically even if stock changed after checkout.
---

When Razorpay reports a payment as captured, payment settlement must not roll back solely because stock drifted after order initialization. The order should become paid and cart settlement should remain consistent; stock reconciliation belongs to fulfillment.

**Why:** Rolling back a captured payment leaves the customer charged while the order remains pending, which is worse than surfacing a fulfillment exception.

**How to apply:** Keep payment status, payment metadata, paid timestamp, and matching cart-quantity removal in the same transaction; handle stock reconciliation separately.