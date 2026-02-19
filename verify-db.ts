import dotenv from "dotenv";
import { Pool } from "pg";

// Load .env.local file
dotenv.config({ path: ".env.local" });

async function verifyTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("\n✓ Database tables created successfully:\n");
    result.rows.forEach((row) => {
      console.log(`  • ${row.table_name}`);
    });
    console.log("");

    client.release();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

verifyTables();
