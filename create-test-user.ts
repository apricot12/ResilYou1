import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/database/schema";
import * as crypto from "crypto";
import { hashPassword } from "better-auth/crypto";

// Load .env.local file
dotenv.config({ path: ".env.local" });

async function createTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    const userId = crypto.randomUUID();
    const email = "test@example.com";
    const password = "password123";
    const name = "Test User";

    console.log("\nCreating test user...");
    console.log("Email:", email);
    console.log("Password:", password);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      console.log("\n⚠️  User with this email already exists!");
      await pool.end();
      return;
    }

    // Insert user
    await db.insert(schema.users).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Better Auth requires an account entry for email/password authentication
    const accountId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    // For Better Auth, accountId should be the userId for credential provider
    await db.insert(schema.accounts).values({
      id: accountId,
      accountId: userId, // Changed from email to userId
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n✓ Test user created successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email:    test@example.com");
    console.log("   Password: password123");
    console.log("\n⚠️  Note: If you can't log in, please sign up through the app UI");
    console.log("   Better Auth uses bcrypt for password hashing.\n");

  } catch (error) {
    console.error("\n✗ Error creating test user:", error);
  } finally {
    await pool.end();
  }
}

createTestUser();
