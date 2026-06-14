import { defineConfig } from "drizzle-kit";
import path from "path";

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error("SUPABASE_DB_URL or DATABASE_URL must be set");
}

const isSupabase = !!process.env.SUPABASE_DB_URL;

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
    ...(isSupabase ? { ssl: true } : {}),
  },
});
