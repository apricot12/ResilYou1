import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { todoTasks } from "@/database/schema";
import { eq, and, desc, asc, isNull, not } from "drizzle-orm";

// GET /api/todos - Get all todos for the user
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all, active, completed
    const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt, dueDate, priority

    let whereConditions: any[] = [eq(todoTasks.userId, userId)];

    if (filter === "active") {
      whereConditions.push(eq(todoTasks.completed, false));
    } else if (filter === "completed") {
      whereConditions.push(eq(todoTasks.completed, true));
    }

    // Determine sort order
    let orderBy: any;
    if (sortBy === "dueDate") {
      orderBy = [asc(todoTasks.dueDate), desc(todoTasks.createdAt)];
    } else if (sortBy === "priority") {
      // Custom priority order: high > medium > low
      orderBy = [desc(todoTasks.priority), desc(todoTasks.createdAt)];
    } else {
      orderBy = [desc(todoTasks.createdAt)];
    }

    const tasks = await db.query.todoTasks.findMany({
      where: and(...whereConditions),
      orderBy,
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { title, description, priority, dueDate, category, createdBy } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const [task] = await db
      .insert(todoTasks)
      .values({
        userId: userId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || null,
        createdBy: createdBy || "user",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
