// Test if the server can connect to the database with the current setup
import { db } from "./src/database/db";
import * as schema from "./src/database/schema";
import { eq } from "drizzle-orm";

async function testServerDb() {
  try {
    console.log("Testing database connection from server context...\n");

    // Try to query the database
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, "test@example.com"),
    });

    if (user) {
      console.log("✓ Database connection successful");
      console.log("✓ Found test user:", user.email);

      // Check if account exists
      const account = await db.query.accounts.findFirst({
        where: eq(schema.accounts.userId, user.id),
      });

      if (account) {
        console.log("✓ Found test account with provider:", account.providerId);
      } else {
        console.log("✗ No account found for user");
      }
    } else {
      console.log("✗ Test user not found in database");
    }
  } catch (error) {
    console.error("✗ Database connection failed:", error);
  }
}

testServerDb();
