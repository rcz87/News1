import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create Neon HTTP client
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export all schema tables and types
export * from "./schema";
