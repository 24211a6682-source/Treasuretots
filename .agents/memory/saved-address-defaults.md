---
name: Saved address defaults
description: Product behavior for saved-address default selection and deletion.
---

Saved addresses may have zero or one default per user. When the current default is deleted and other saved addresses remain, promote the oldest remaining address as the new persisted default.

**Why:** Checkout should keep a reliable, server-owned preselected delivery address without leaving a customer with saved addresses but no usable default after an ordinary deletion.

**How to apply:** Preserve the single-default invariant in every address mutation, and have checkout select only the address explicitly persisted as default. A user with no saved default should choose an address or enter a new one.