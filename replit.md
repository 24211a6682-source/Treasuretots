# TreasureTots Creations

India's personalized children's books and learning products e-commerce store. Parents can browse and buy devotional books, flash cards, labels/stickers, and enquire about fully customized storybooks where their child is the hero.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied to /api)
- `pnpm --filter @workspace/treasuretots run dev` — run the React frontend (port 20494, proxied to /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Auth: JWT (stored in localStorage as `tt_token`)
- Build: esbuild (CJS bundle for server)

## Where things live

- `artifacts/treasuretots/` — React+Vite frontend
  - `src/pages/` — 17 pages (home, learning, flashcards, storybooks, wallpapers, labels, cart, checkout, dashboard, admin, login, register, etc.)
  - `src/hooks/` — useAuth, useCart, useToast
  - `src/components/` — Navbar, Footer, FloatingWhatsApp, ProductCard, StorybookCard
  - `src/lib/products.ts` — ALL product data (static source of truth for storybooks)
- `artifacts/api-server/` — Express 5 API
  - `src/routes/` — auth, products, cart, orders, users, admin, health
  - `src/lib/auth.ts` — JWT sign/verify, bcrypt hash
  - `src/middlewares/requireAuth.ts` — JWT auth middleware
- `lib/db/` — Drizzle ORM schema + client
  - `src/schema/` — users, products, orders, cart, addresses, wishlist
- `lib/api-spec/openapi.yaml` — OpenAPI 3.0 spec (source of truth for API contract)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod schemas

## Architecture decisions

- Storybooks (38 total) are enquiry-only — no price shown, only WhatsApp enquiry. Data is hardcoded in `products.ts` since they never need DB lookup.
- Buyable products (11: 6 learning books, 3 flash cards, 2 labels) are seeded in PostgreSQL and served via API.
- Cart is stored in `localStorage` for guests, synced to DB on login.
- Auth token stored in `localStorage` as `tt_token` (JWT, 30-day expiry).
- Razorpay integration is in place; requires `VITE_RAZORPAY_KEY_ID` + `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` env vars.
- `RAZORPAY_WEBHOOK_SECRET` — secret for verifying incoming Razorpay webhook signatures. Get it from Razorpay Dashboard → Webhooks → (your webhook) → Webhook Secret.

## Product

- **Homepage** — Hero carousel + 5 product sections + 13 reviews + contact section
- **Story Books** (/storybooks) — 38 personalized books with category filters, WhatsApp enquiry
- **Learning & Devotion** (/learning) — 6 devotional books, buy directly
- **Flash Cards** (/flashcards) — 3 flash card sets, buy directly
- **Wallpapers & Frames** (/wallpapers) — enquiry only
- **Labels & Stickers** (/labels) — 2 products, buy directly
- **Cart → Checkout → Razorpay** — full e-commerce flow
- **User Dashboard** — orders, addresses, wishlist, profile
- **Admin Dashboard** — analytics, product management, order management

## User preferences

- Brand: orange #FF7A00, warm white/cream #FFFAF5, font: Poppins
- Contact: WhatsApp 918050640552, Instagram @treasuretots2025, email treasuretots2025@gmail.com
- Floating WhatsApp button on all pages (bottom-right, green #25D366)
- No emojis in UI except where explicitly specified (trust badges, feature lists)
- JWT auth token key: `tt_token` in localStorage
- Cart localStorage key: `tt_cart`

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the DB lib must be compiled first.
- Image paths are served from Vite's `public/` folder: `/assets/images/...`
- Storybook image paths in `products.ts` have spaces in folder names (e.g., "A dayt with Hanuman") — match exactly.
- Products table uses snake_case columns; Drizzle maps them.
- Express 5 types `req.params` as `string | string[]` — use `String(req.params.id)` before `parseInt`.
- `pnpm --filter @workspace/scripts` cannot import `@workspace/db` — run seed scripts from `artifacts/api-server` instead.
- Seed products via `executeSql` in code_execution with ON CONFLICT DO UPDATE.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/`
