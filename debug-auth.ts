import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/database/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";

// Load .env.local file
dotenv.config({ path: ".env.local" });

async function debugAuth() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    const email = "test@example.com";
    const testPassword = "password123";

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

    console.log("\n=== Debug Info ===");
    console.log("\nUser:");
    console.log(JSON.stringify(user, null, 2));
    console.log("\nAccount:");
    console.log(JSON.stringify(account, null, 2));

    if (account?.password) {
      console.log("\nTesting password verification...");
      const isValid = await verifyPassword({
        hash: account.password,
        password: testPassword
      });
      console.log("Password verification result:", isValid ? "✓ Valid" : "✗ Invalid");
    }

  } catch (error) {
    console.error("✗ Error:", error);
  } finally {
    await pool.end();
  }
}

debugAuth();
