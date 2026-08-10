# Threat Model

## Project Overview

TreasureTots Creations is a Node.js/Express + React e-commerce application for India's personalized children's books and learning products. Users can browse products, register accounts, purchase items via Razorpay, and manage their profile, addresses, wishlist, and orders. An admin dashboard allows product management, order management, and user role changes. Deployed on Replit; not yet deployed to production (no active deployment at scan time).

**Stack:** Node.js 24, TypeScript, Express 5, PostgreSQL + Drizzle ORM, React 19 + Vite, JWT auth (stored in localStorage), Razorpay payment gateway, Cloudinary image uploads.

## Assets

- **User credentials** — email/phone + bcrypt-hashed passwords; JWT tokens. Compromise allows account takeover.
- **JWT signing secret** — used to sign all auth tokens. If known, an attacker can forge tokens for any user or role (including admin).
- **Order and payment data** — order history, Razorpay payment IDs, shipping addresses. Contains PII and financial records.
- **Razorpay API keys** — `RAZORPAY_KEY_ID` (public) and `RAZORPAY_KEY_SECRET` (private). The secret is used for payment signature verification; its absence or exposure has direct financial impact.
- **User PII** — names, email addresses, phone numbers, shipping addresses.
- **Product/inventory data** — product listings, stock levels, pricing (server-authoritative).
- **Admin access** — ability to change product prices, order statuses, and promote users to admin role.
- **Cloudinary media** — product images stored in Cloudinary via an unsigned upload preset.

## Trust Boundaries

- **Browser → API** (`/api/*`): All client requests. The API must authenticate and authorize every request server-side; the client (including localStorage-stored JWT) is untrusted.
- **API → PostgreSQL**: Direct database access via Drizzle ORM using parameterized queries. SQL injection at the API layer would grant full database access.
- **API → Razorpay**: Payment order creation and signature verification. The `RAZORPAY_KEY_SECRET` must remain server-side only; its absence disables signature verification.
- **API → Cloudinary**: Image uploads via unsigned preset. The preset name is public, creating a direct Cloudinary upload path outside the server.
- **Authenticated vs. Public**: Product browsing is public; cart, orders, profile, and admin routes require authentication and appropriate role.
- **User vs. Admin**: Admin routes are gated by `requireAdmin`; role is embedded in JWT at login time and must match the DB role on any sensitive role-escalation path.

## Scan Anchors

- **Entry points**: `artifacts/api-server/src/routes/` — auth, products, cart, orders, users, admin, health. All mounted under `/api`.
- **High-risk areas**: `artifacts/api-server/src/lib/auth.ts` (JWT secret fallback), `artifacts/api-server/src/routes/orders.ts` (payment verification), `artifacts/api-server/src/routes/admin.ts` (admin routes), `artifacts/api-server/src/app.ts` (CORS wildcard, no rate limiting).
- **Public surface**: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/products*`, `/api/health`.
- **Authenticated surface**: `/api/v1/cart*`, `/api/v1/orders*`, `/api/v1/users*`, `/api/v1/auth/me`.
- **Admin surface**: `/api/v1/admin/*` — gated by `requireAdmin` middleware.
- **Dev-only**: `artifacts/mockup-sandbox/` — Replit Canvas mockup, not production-reachable.

## Threat Categories

### Spoofing / Authentication Integrity

JWT tokens are signed with a secret sourced from `process.env.JWT_SECRET`. A hardcoded fallback value (`"treasuretots-dev-secret-change-in-production"`) is used if the env var is absent. If production runs without `JWT_SECRET` set, any attacker who knows this fallback can forge tokens for any `userId` and `role` (including `admin`), achieving full account takeover and admin access. **Guarantee required:** `JWT_SECRET` MUST be set to a cryptographically random value in production; the server MUST refuse to start if it is absent.

### Tampering / Payment Verification

The `/v1/orders/verify` endpoint verifies Razorpay payment signatures only when `RAZORPAY_KEY_SECRET` is configured. If the env var is absent, `paymentValid` defaults to `true` and any authenticated user can mark any of their pending orders as "paid" without actually paying. **Guarantee required:** Payment verification MUST be enforced unconditionally; the server MUST reject payment verification requests if `RAZORPAY_KEY_SECRET` is not set.

### Information Disclosure

- No stack traces are exposed to clients (errors return generic messages).
- `CORS` is configured with `cors()` and no options, which defaults to `Access-Control-Allow-Origin: *`, allowing any origin to make credentialed-free cross-origin requests.
- JWT is stored in `localStorage` (per architecture decision), making it accessible to any JavaScript executing on the page (XSS risk).

### Denial of Service

No rate limiting exists on the login (`/v1/auth/login`) or register (`/v1/auth/register`) endpoints. This enables credential stuffing and brute-force attacks at unlimited speed.

### Elevation of Privilege

Admin routes are correctly gated by `requireAdmin` server-side. Role is set at registration time to `"user"` and can only be changed via the admin `PATCH /v1/admin/users/:id/role` endpoint (which is itself admin-gated). No privilege escalation path was identified beyond the JWT secret forgery issue above.

### Cryptographic Failures

Cloudinary image uploads use an unsigned upload preset (`VITE_CLOUDINARY_UPLOAD_PRESET`). The preset name is exposed as a client-side environment variable, allowing anyone who discovers it to upload arbitrary files to the Cloudinary account directly, bypassing server-side controls.
