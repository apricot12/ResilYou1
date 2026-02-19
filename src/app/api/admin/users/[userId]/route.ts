import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { checkAdminAccess } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";

// PATCH /api/admin/users/[userId] - Update user role (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess(req.headers);

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.message },
        { status: accessCheck.status }
      );
    }

    const { userId } = await params;
    const body = await req.json();
    const { role } = body;

    // Validate role
    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user' or 'admin'" },
        { status: 400 }
      );
    }

    // Prevent users from changing their own role
    if (accessCheck.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 403 }
      );
    }

    // Update user role
    const [updatedUser] = await db
      .update(users)
      .set({
        role: role as "user" | "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete user (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess(req.headers);

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.message },
        { status: accessCheck.status }
      );
    }

    const { userId } = await params;

    // Prevent users from deleting themselves
    if (accessCheck.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      );
    }

    // Delete user
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
      });

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
