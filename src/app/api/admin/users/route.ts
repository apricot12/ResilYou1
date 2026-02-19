import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { checkAdminAccess } from "@/lib/auth-utils";
import { eq, desc, sql, or, ilike } from "drizzle-orm";

// GET /api/admin/users - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(req.headers);

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.message },
        { status: accessCheck.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const offset = (page - 1) * limit;

    // Build where clause
    const whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }
    if (role && (role === "admin" || role === "user")) {
      whereConditions.push(eq(users.role, role));
    }

    // Get users
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        image: users.image,
      })
      .from(users)
      .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined);

    return NextResponse.json({
      users: userList,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
