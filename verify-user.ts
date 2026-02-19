import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/database/schema";
import { eq } from "drizzle-orm";

// Load .env.local file
dotenv.config({ path: ".env.local" });

async function verifyUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    const email = "test@example.com";

    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      console.log("✗ User not found");
      await pool.end();
      return;
    }

    const account = await db.query.accounts.findFirst({
      where: eq(schema.accounts.userId, user.id),
    });

    console.log("\n✓ User found in database:");
    console.log("  ID:", user.id);
    console.log("  Name:", user.name);
    console.log("  Email:", user.email);
    console.log("  Email Verified:", user.emailVerified);
    console.log("\n✓ Account found:");
    console.log("  Provider:", account?.providerId);
    console.log("  Has Password:", account?.password ? "Yes (hash stored)" : "No");
    console.log("\n📝 You can now log in with:");
    console.log("  Email:    test@example.com");
    console.log("  Password: password123\n");

  } catch (error) {
    console.error("✗ Error:", error);
  } finally {
    await pool.end();
  }
}

verifyUser();
