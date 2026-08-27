import { pool } from "@workspace/db";
import { pathToFileURL } from "node:url";
import { logger } from "./lib/logger";
import { seedProducts } from "./seed";

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  stock INTEGER NOT NULL DEFAULT 999,
  cover_image TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]',
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  slug VARCHAR(200) NOT NULL UNIQUE,
  is_buyable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  order_status VARCHAR(50) NOT NULL DEFAULT 'payment_pending',
  child_name VARCHAR(100),
  shipping_address JSONB NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  child_name VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  house_no VARCHAR(100) NOT NULL,
  street VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// Existing installations may contain online orders created before unpaid
// payment attempts had their own order status. Only repair Razorpay rows so
// historical or future COD orders keep their valid unpaid received state.
const ORDER_STATUS_STATE_MIGRATION = `
ALTER TABLE orders ALTER COLUMN order_status SET DEFAULT 'payment_pending';

UPDATE orders
SET order_status = 'payment_pending'
WHERE razorpay_order_id IS NOT NULL
  AND payment_status IN ('pending', 'failed')
  AND order_status = 'order_received';
`;

export async function migrate() {
  const client = await pool.connect();
  try {
    logger.info("Running DB migration...");
    await client.query(DDL);
    await client.query(ORDER_STATUS_STATE_MIGRATION);
    logger.info("DB migration complete");
  } finally {
    client.release();
  }

  logger.info("Seeding products...");
  await seedProducts();
  logger.info("Products seeded");
}

export async function migratePaymentPendingOrderStatus() {
  const client = await pool.connect();
  try {
    logger.info("Running payment-pending order status migration...");
    await client.query(ORDER_STATUS_STATE_MIGRATION);
    logger.info("Payment-pending order status migration complete");
  } finally {
    client.release();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  migratePaymentPendingOrderStatus().catch((err) => {
    logger.error({ err }, "Payment-pending order status migration failed");
    process.exitCode = 1;
  });
}
