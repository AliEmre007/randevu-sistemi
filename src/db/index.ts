import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // .env dosyasını oku

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL bulunamadı!");
}

// Veritabanı bağlantı istemcisini oluştur
const client = postgres(process.env.DATABASE_URL);

// Drizzle'ı başlat ve şemayı içine yükle
export const db = drizzle(client, { schema });