import { defineConfig } from "drizzle-kit";
import path from "path";

// The application always connects through DATABASE_URL. Prefer it here too so
// the normal schema-sync command updates the same development database.
const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!url) {
  throw new Error("SUPABASE_DB_URL or DATABASE_URL must be set");
}

const isSupabase = !process.env.DATABASE_URL && !!process.env.SUPABASE_DB_URL;

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
    ...(isSupabase ? { ssl: true } : {}),
  },
});
