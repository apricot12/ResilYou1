import dotenv from "dotenv";
import { Pool } from "pg";

// Load .env.local file
dotenv.config({ path: ".env.local" });

async function testConnection() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log("✓ Database connection successful!");

    const result = await client.query("SELECT version()");
    console.log("PostgreSQL version:", result.rows[0].version);

    client.release();
  } catch (err) {
    console.error("✗ Database connection failed:", err);
  } finally {
    await pool.end();
  }
}

testConnection();
