import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === "production" ? 100 : 20,
  min: 5, // Keep minimum connections alive
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});
