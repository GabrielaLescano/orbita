import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL. Copiá .env.example a .env.local y completalo con tu URL de Neon.");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
