import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/database/schema";
import { eq } from "drizzle-orm";

// Load .env.local file
dotenv.config({ path: ".env.local" });

async function deleteTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    const email = "test@example.com";

    // Find the user
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      console.log("No test user found to delete.");
      await pool.end();
      return;
    }

    // Delete associated accounts (cascade should handle this, but let's be explicit)
    await db.delete(schema.accounts).where(eq(schema.accounts.userId, user.id));

    // Delete user
    await db.delete(schema.users).where(eq(schema.users.id, user.id));

    console.log("✓ Test user deleted successfully!");

  } catch (error) {
    console.error("✗ Error deleting test user:", error);
  } finally {
    await pool.end();
  }
}

deleteTestUser();
