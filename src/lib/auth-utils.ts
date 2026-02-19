import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type UserRole = "user" | "admin";

/**
 * Get the current user's session and user data
 */
export async function getCurrentUser(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    return null;
  }

  // Fetch full user data including role
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user;
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin(headers: Headers): Promise<boolean> {
  const user = await getCurrentUser(headers);
  return user?.role === "admin";
}

/**
 * Require admin role - redirects to dashboard if not admin
 */
export async function requireAdmin(headers: Headers) {
  const user = await getCurrentUser(headers);

  if (!user) {
    redirect("/auth/sign-in");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: { role: string } | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Middleware helper to check admin access in API routes
 */
export async function checkAdminAccess(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    return { authorized: false, status: 401, message: "Unauthorized" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || user.role !== "admin") {
    return { authorized: false, status: 403, message: "Forbidden: Admin access required" };
  }

  return { authorized: true, user };
}
