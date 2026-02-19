import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { todoTasks } from "@/database/schema";
import { eq, and } from "drizzle-orm";

// PATCH /api/todos/[todoId] - Update a todo
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { todoId } = await params;
    const body = await req.json();

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.completed !== undefined) {
      updateData.completed = body.completed;
      if (body.completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    if (body.priority !== undefined) {
      if (!["low", "medium", "high"].includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority" },
          { status: 400 }
        );
      }
      updateData.priority = body.priority;
    }

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    if (body.category !== undefined) {
      updateData.category = body.category || null;
    }

    // Update the task
    const [updatedTask] = await db
      .update(todoTasks)
      .set(updateData)
      .where(
        and(
          eq(todoTasks.id, todoId),
          eq(todoTasks.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[todoId] - Delete a todo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { todoId } = await params;

    const [deletedTask] = await db
      .delete(todoTasks)
      .where(
        and(
          eq(todoTasks.id, todoId),
          eq(todoTasks.userId, session.user.id)
        )
      )
      .returning();

    if (!deletedTask) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Todo deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
