import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) { console.error("SUPABASE_DB_URL not set"); process.exit(1); }

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

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
  order_status VARCHAR(50) NOT NULL DEFAULT 'order_received',
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

const SEED = `
INSERT INTO products (name, description, price, stock, cover_image, images, category, slug, is_buyable, is_active)
VALUES
  ('Coloring Book of Gods & Goddess','A fun coloring book featuring Hindu Gods and Goddesses, designed to introduce children to Indian mythology through art.',70,999,'/assets/images/color book/cover.jpg','["/assets/images/color book/cover.jpg","/assets/images/color book/colorbook2.jpg","/assets/images/color book/colorbook3.jpg"]','learning','coloring-book-of-gods-goddess',true,true),
  ('Bala Mantra Shloka Book','A beautifully illustrated collection of simple shlokas and mantras for children. Helps kids learn devotional chants with colorful visuals.',120,999,'/assets/images/balamantra/cover.jpg','["/assets/images/balamantra/cover.jpg","/assets/images/balamantra/balamantra2.jpg","/assets/images/balamantra/balamantra3.jpg"]','learning','bala-mantra-shloka-book',true,true),
  ('Vemana Padyalu Book','Classic Telugu Vemana poems for children with beautiful illustrations. Timeless rhymes with precious life lessons.',100,999,'/assets/images/vemana padhyalu/cover.jpg','["/assets/images/vemana padhyalu/cover.jpg","/assets/images/vemana padhyalu/vemana2.jpg","/assets/images/vemana padhyalu/vemana3.jpg"]','learning','vemana-padyalu-book',true,true),
  ('Srinivasa Kalyanam','A beautifully illustrated storybook about the divine wedding of Lord Srinivasa, perfect for introducing children to this beloved Telugu tradition.',200,999,'/assets/images/kalyanam/cover.jpg','["/assets/images/kalyanam/cover.jpg","/assets/images/kalyanam/kalyanam2.jpg","/assets/images/kalyanam/kalyanam3.jpg"]','learning','srinivasa-kalyanam',true,true),
  ('Hanuman Chalisa — English','A beautifully illustrated Hanuman Chalisa book in English. Perfect for children to learn devotional shlokas with colorful, engaging artwork.',120,999,'/assets/images/hanuman-english/hanuman1.jpg','["/assets/images/hanuman-english/hanuman1.jpg","/assets/images/hanuman-english/hanuman2.jpg","/assets/images/hanuman-english/hanuman3.jpg"]','learning','hanuman-chalisa-english',true,true),
  ('Hanuman Chalisa — Telugu','A beautifully illustrated Hanuman Chalisa book in Telugu. Perfect for children to learn devotional shlokas with colorful, engaging artwork. Handcrafted with love by TreasureTots Creations.',120,999,'/assets/images/hanuman-telugu/hanuman3.jpg','["/assets/images/hanuman-telugu/hanuman3.jpg","/assets/images/hanuman-telugu/hanuman4.jpg","/assets/images/hanuman-telugu/hanuman5.jpg"]','learning','hanuman-chalisa-telugu',true,true),
  ('A-Z Phonics Flash Cards','Fun and colorful A-Z phonics flash cards to help children learn the alphabet with pictures and sounds.',250,999,'/assets/images/flash cards/phonics/cover.jpg','["/assets/images/flash cards/phonics/cover.jpg","/assets/images/flash cards/phonics/phonics2.jpg","/assets/images/flash cards/phonics/phonics3.jpg"]','flashcards','az-phonics-flash-cards',true,true),
  ('A-Z Gods & Goddess Flash Cards','Beautiful flash cards featuring Hindu Gods and Goddesses from A to Z, helping children learn the alphabet through Indian mythology.',250,999,'/assets/images/flash cards/gods/cover.jpg','["/assets/images/flash cards/gods/cover.jpg","/assets/images/flash cards/gods/gods2.jpg","/assets/images/flash cards/gods/gods3.jpg"]','flashcards','az-gods-goddess-flash-cards',true,true),
  ('Telugu Varnamala Achulu Flash Cards','Colorful flash cards for learning the Telugu alphabet (varnamala) with illustrations.',200,999,'/assets/images/flash cards/telugu/cover.jpg','["/assets/images/flash cards/telugu/cover.jpg","/assets/images/flash cards/telugu/telugu2.jpg","/assets/images/flash cards/telugu/telugu3.jpg"]','flashcards','telugu-varnamala-achulu-flash-cards',true,true),
  ('Customised Name Tags','Personalized name tags for your child''s school supplies. Enter your child''s name and we''ll create beautiful custom labels.',150,999,'/assets/images/customised tags/cover.jpg','["/assets/images/customised tags/cover.jpg","/assets/images/customised tags/tags2.jpg"]','labels','customised-name-tags',true,true),
  ('Labels & Stickers','Beautiful personalized stickers and labels for your child. Perfect for school bags, water bottles, and more.',150,999,'/assets/images/labels and stickers/cover.jpg','["/assets/images/labels and stickers/cover.jpg","/assets/images/labels and stickers/stickers2.jpg"]','labels','labels-and-stickers',true,true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  cover_image = EXCLUDED.cover_image,
  images = EXCLUDED.images,
  is_active = true;
`;

async function main() {
  console.log("Connecting to Supabase...");
  await client.connect();
  console.log("Connected!");

  console.log("Creating tables...");
  await client.query(DDL);
  console.log("Tables created.");

  console.log("Seeding products...");
  await client.query(SEED);
  console.log("Products seeded.");

  const { rows } = await client.query("SELECT id, name, category FROM products ORDER BY id");
  console.log(`\n${rows.length} products in Supabase:`);
  rows.forEach(r => console.log(`  [${r.id}] ${r.name} (${r.category})`));

  await client.end();
  console.log("\nDone!");
}

main().catch(e => { console.error("Failed:", e.message); process.exit(1); });
