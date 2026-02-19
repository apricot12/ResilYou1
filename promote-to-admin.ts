import dotenv from "dotenv";
import { db } from "./src/database/db";
import { users } from "./src/database/schema";
import { eq } from "drizzle-orm";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function promoteToAdmin(email: string) {
  try {
    console.log(`Looking for user with email: ${email}...`);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`ℹ️  User ${user.name} (${user.email}) is already an admin`);
      process.exit(0);
    }

    // Update user role to admin
    const [updatedUser] = await db
      .update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();

    console.log(`✅ Successfully promoted ${updatedUser.name} (${updatedUser.email}) to admin!`);
    process.exit(0);
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx promote-to-admin.ts <email>");
  console.error("Example: npx tsx promote-to-admin.ts user@example.com");
  process.exit(1);
}

promoteToAdmin(email);
