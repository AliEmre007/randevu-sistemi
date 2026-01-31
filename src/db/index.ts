// YENİ VE TEMİZ HALİ ✅
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./schema";

// dotenv satırlarını sildik.
// Next.js zaten process.env.DATABASE_URL'i otomatik doldurur.

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });