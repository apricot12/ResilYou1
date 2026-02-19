import { db } from "@/database/db";
import { calendarEvents, todoTasks } from "@/database/schema";
import * as chrono from "chrono-node";
import { eq, and } from "drizzle-orm";

export const chatTools = [
  {
    type: "function" as const,
    function: {
      name: "create_calendar_event",
      description:
        "Create a calendar event for the user. Use this when the user asks to schedule a meeting, create an appointment, or add an event to their calendar.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title/name of the event or meeting",
          },
          description: {
            type: "string",
            description: "Additional details about the event (optional)",
          },
          dateTime: {
            type: "string",
            description:
              'The date and time for the event in natural language (e.g., "tomorrow at 3 PM", "next Monday at 10 AM", "January 15 at 2:30 PM")',
          },
          duration: {
            type: "number",
            description: "Duration of the event in minutes (default: 60)",
          },
          location: {
            type: "string",
            description: "Location of the event (optional)",
          },
          attendees: {
            type: "string",
            description: "Comma-separated list of attendee names or emails (optional)",
          },
        },
        required: ["title", "dateTime"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_calendar_events",
      description:
        "List upcoming calendar events for the user. Use this when the user asks about their schedule, upcoming meetings, or what's on their calendar.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description:
              'The date to check (e.g., "today", "tomorrow", "next week"). Defaults to today.',
          },
          limit: {
            type: "number",
            description: "Maximum number of events to return (default: 10)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_calendar_event",
      description:
        "Delete a calendar event. Use this when the user asks to cancel, delete, or remove an event from their calendar.",
      parameters: {
        type: "object",
        properties: {
          eventTitle: {
            type: "string",
            description: "The title of the event to delete (you must list events first to get the exact title)",
          },
        },
        required: ["eventTitle"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_calendar_event",
      description:
        "Update/edit a calendar event. Use this when the user asks to change, reschedule, or modify an event.",
      parameters: {
        type: "object",
        properties: {
          eventTitle: {
            type: "string",
            description: "The current title of the event to update",
          },
          newTitle: {
            type: "string",
            description: "New title for the event (optional)",
          },
          newDateTime: {
            type: "string",
            description: "New date/time in natural language (optional)",
          },
          newDuration: {
            type: "number",
            description: "New duration in minutes (optional)",
          },
          newLocation: {
            type: "string",
            description: "New location (optional)",
          },
          newDescription: {
            type: "string",
            description: "New description (optional)",
          },
        },
        required: ["eventTitle"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_todo",
      description:
        "Create a todo task for the user. Use this when the user asks to add a task, create a reminder, or add something to their todo list.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The task title/description",
          },
          description: {
            type: "string",
            description: "Additional details about the task (optional)",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Task priority (default: medium)",
          },
          dueDate: {
            type: "string",
            description: 'Due date in natural language (e.g., "tomorrow", "next week", "Friday")',
          },
          category: {
            type: "string",
            description: "Category or tag for the task (optional)",
          },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_todos",
      description:
        "List the user's todo tasks. Use this when the user asks about their tasks, what they need to do, or their todo list.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            enum: ["all", "active", "completed"],
            description: "Filter tasks by status (default: active)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "complete_todo",
      description:
        "Mark a todo task as completed. Use this when the user says they finished or completed a task.",
      parameters: {
        type: "object",
        properties: {
          taskTitle: {
            type: "string",
            description: "The title of the task to mark as complete",
          },
        },
        required: ["taskTitle"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_todo",
      description:
        "Delete a todo task. Use this when the user asks to remove or delete a task.",
      parameters: {
        type: "object",
        properties: {
          taskTitle: {
            type: "string",
            description: "The title of the task to delete",
          },
        },
        required: ["taskTitle"],
      },
    },
  },
];

export async function executeCalendarTool(
  toolName: string,
  args: Record<string, any>,
  userId: string
): Promise<string> {
  try {
    switch (toolName) {
      case "create_calendar_event":
        return await createCalendarEvent(args, userId);
      case "list_calendar_events":
        return await listCalendarEvents(args, userId);
      case "delete_calendar_event":
        return await deleteCalendarEvent(args, userId);
      case "update_calendar_event":
        return await updateCalendarEvent(args, userId);
      case "create_todo":
        return await createTodo(args, userId);
      case "list_todos":
        return await listTodos(args, userId);
      case "complete_todo":
        return await completeTodo(args, userId);
      case "delete_todo":
        return await deleteTodo(args, userId);
      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

async function createCalendarEvent(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const { title, description, dateTime, duration = 60, location, attendees } = args;

  // Parse the natural language date/time
  const parsedDate = chrono.parseDate(dateTime);
  if (!parsedDate) {
    return `I couldn't understand the date/time "${dateTime}". Please try again with a clearer format like "tomorrow at 3 PM" or "January 15 at 2:30 PM".`;
  }

  const startDateTime = parsedDate;
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

  // Create the event
  await db
    .insert(calendarEvents)
    .values({
      userId,
      title,
      description: description || null,
      startDateTime,
      endDateTime,
      location: location || null,
      category: "meeting",
      reminderMinutes: 30,
      recurrence: "none",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  // Format the response with proper markdown
  let response = `### ✅ Event Created Successfully\n\n`;
  response += `**${title}**\n\n`;

  response += `📅 **Date:** ${startDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}\n\n`;

  response += `🕐 **Time:** ${startDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} - ${endDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}\n\n`;

  if (location) {
    response += `📍 **Location:** ${location}\n\n`;
  }

  if (attendees) {
    response += `👥 **Attendees:** ${attendees}\n\n`;
  }

  if (description) {
    response += `📝 **Details:**\n> ${description}\n\n`;
  }

  response += `---\n\n*A reminder will be sent 30 minutes before the meeting.*`;

  return response;
}

async function deleteCalendarEvent(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const { eventTitle } = args;

  // Find the event by title
  const events = await db.query.calendarEvents.findMany({
    where: (events, { eq }) => eq(events.userId, userId),
  });

  const event = events.find(
    (e) => e.title.toLowerCase() === eventTitle.toLowerCase()
  );

  if (!event) {
    return `### ❌ Event Not Found\n\nI couldn't find an event with the title "${eventTitle}". Please check your calendar and try again with the exact event name.`;
  }

  // Delete the event
  await db
    .delete(calendarEvents)
    .where(and(eq(calendarEvents.id, event.id), eq(calendarEvents.userId, userId)));

  return `### ✅ Event Deleted Successfully\n\nThe event **"${event.title}"** scheduled for ${new Date(event.startDateTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })} at ${new Date(event.startDateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} has been removed from your calendar.`;
}

async function updateCalendarEvent(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const {
    eventTitle,
    newTitle,
    newDateTime,
    newDuration,
    newLocation,
    newDescription,
  } = args;

  // Find the event by title
  const events = await db.query.calendarEvents.findMany({
    where: (events, { eq }) => eq(events.userId, userId),
  });

  const event = events.find(
    (e) => e.title.toLowerCase() === eventTitle.toLowerCase()
  );

  if (!event) {
    return `### ❌ Event Not Found\n\nI couldn't find an event with the title "${eventTitle}". Please check your calendar and try again with the exact event name.`;
  }

  // Prepare update data
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (newTitle) {
    updateData.title = newTitle;
  }

  if (newDateTime) {
    const parsedDate = chrono.parseDate(newDateTime);
    if (!parsedDate) {
      return `### ❌ Invalid Date\n\nI couldn't understand the date/time "${newDateTime}". Please try again with a clearer format.`;
    }
    updateData.startDateTime = parsedDate;

    // Calculate new end time based on duration
    const duration = newDuration || Math.floor(
      (new Date(event.endDateTime).getTime() - new Date(event.startDateTime).getTime()) / 60000
    );
    updateData.endDateTime = new Date(parsedDate.getTime() + duration * 60000);
  } else if (newDuration) {
    // Update duration without changing start time
    const startDateTime = new Date(event.startDateTime);
    updateData.endDateTime = new Date(startDateTime.getTime() + newDuration * 60000);
  }

  if (newLocation !== undefined) {
    updateData.location = newLocation;
  }

  if (newDescription !== undefined) {
    updateData.description = newDescription;
  }

  // Update the event
  const [updatedEvent] = await db
    .update(calendarEvents)
    .set(updateData)
    .where(and(eq(calendarEvents.id, event.id), eq(calendarEvents.userId, userId)))
    .returning();

  // Format response
  let response = `### ✅ Event Updated Successfully\n\n`;
  response += `**${updatedEvent.title}**\n\n`;

  response += `📅 **Date:** ${new Date(updatedEvent.startDateTime).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}\n\n`;

  response += `🕐 **Time:** ${new Date(updatedEvent.startDateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} - ${new Date(updatedEvent.endDateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}\n\n`;

  if (updatedEvent.location) {
    response += `📍 **Location:** ${updatedEvent.location}\n\n`;
  }

  if (updatedEvent.description) {
    response += `📝 **Details:**\n> ${updatedEvent.description}\n\n`;
  }

  response += `---\n\n*Event has been updated in your calendar.*`;

  return response;
}

async function listCalendarEvents(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const { date = "today", limit = 10 } = args;

  // Parse the date
  const parsedDate = chrono.parseDate(date) || new Date();
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch events
  const events = await db.query.calendarEvents.findMany({
    where: (events, { eq, and, gte, lte }) =>
      and(
        eq(events.userId, userId),
        gte(events.startDateTime, startOfDay),
        lte(events.startDateTime, endOfDay)
      ),
    orderBy: (events, { asc }) => [asc(events.startDateTime)],
    limit,
  });

  if (events.length === 0) {
    return `### 📅 No Events Scheduled\n\nYou have no events scheduled for ${date}.`;
  }

  const dateStr = parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  let response = `### 📅 Your Schedule for ${dateStr}\n\n`;
  response += `You have **${events.length}** event${events.length !== 1 ? 's' : ''} scheduled:\n\n`;
  response += `---\n\n`;

  events.forEach((event, index) => {
    response += `#### ${index + 1}. ${event.title}\n\n`;

    const startTime = new Date(event.startDateTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = new Date(event.endDateTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    response += `🕐 **Time:** ${startTime} - ${endTime}\n\n`;

    if (event.location) {
      response += `📍 **Location:** ${event.location}\n\n`;
    }

    if (event.description) {
      response += `📝 **Details:** ${event.description}\n\n`;
    }

    response += `---\n\n`;
  });

  return response;
}

// ============ TODO FUNCTIONS ============

async function createTodo(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const { title, description, priority = "medium", dueDate, category } = args;

  let parsedDueDate = null;
  if (dueDate) {
    const parsed = chrono.parseDate(dueDate);
    if (parsed) {
      parsedDueDate = parsed;
    }
  }

  // Create the todo
  await db.insert(todoTasks).values({
    userId,
    title,
    description: description || null,
    priority,
    dueDate: parsedDueDate,
    category: category || null,
    createdBy: "ai",
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  let response = `### ✅ Task Added Successfully\n\n`;
  response += `**${title}**\n\n`;

  if (description) {
    response += `📝 **Details:** ${description}\n\n`;
  }

  response += `🎯 **Priority:** ${priority.charAt(0).toUpperCase() + priority.slice(1)}\n\n`;

  if (parsedDueDate) {
    response += `📅 **Due:** ${parsedDueDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })}\n\n`;
  }

  if (category) {
    response += `🏷️ **Category:** ${category}\n\n`;
  }

  response += `---\n\n*Task added to your todo list. View all tasks at /dashboard/todos*`;

  return response;
}

async function listTodos(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const { filter = "active" } = args;

  const tasks = await db.query.todoTasks.findMany({
    where: (tasks, { eq, and }) => {
      if (filter === "active") {
        return and(eq(tasks.userId, userId), eq(tasks.completed, false));
      } else if (filter === "completed") {
        return and(eq(tasks.userId, userId), eq(tasks.completed, true));
      }
      return eq(tasks.userId, userId);
    },
    orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    limit: 20,
  });

  if (tasks.length === 0) {
    return `### 📝 No Tasks Found\n\nYou don't have any ${filter === "all" ? "" : filter + " "}tasks at the moment.`;
  }

  let response = `### 📝 Your ${filter === "all" ? "" : filter.charAt(0).toUpperCase() + filter.slice(1) + " "}Tasks\n\n`;
  response += `You have **${tasks.length}** task${tasks.length !== 1 ? 's' : ''}:\n\n`;
  response += `---\n\n`;

  tasks.forEach((task, index) => {
    const icon = task.completed ? "✅" : "⭕";
    response += `#### ${icon} ${index + 1}. ${task.title}\n\n`;

    if (task.description) {
      response += `📝 ${task.description}\n\n`;
    }

    response += `🎯 **Priority:** ${task.priority} `;

    if (task.category) {
      response += `| 🏷️ **Category:** ${task.category} `;
    }

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      response += `| 📅 **Due:** ${dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    }

    response += `\n\n---\n\n`;
  });

  return response;
}

async function completeTodo(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const { taskTitle } = args;

  // Find the task by title
  const tasks = await db.query.todoTasks.findMany({
    where: (tasks, { eq }) => eq(tasks.userId, userId),
  });

  const task = tasks.find(
    (t) => t.title.toLowerCase() === taskTitle.toLowerCase() && !t.completed
  );

  if (!task) {
    return `### ❌ Task Not Found\n\nI couldn't find an active task with the title "${taskTitle}". Please check your task list and try again.`;
  }

  // Mark as completed
  await db
    .update(todoTasks)
    .set({
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(todoTasks.id, task.id));

  return `### ✅ Task Completed!\n\n**${task.title}** has been marked as complete. Great job! 🎉`;
}

async function deleteTodo(
  args: Record<string, any>,
  userId: string
): Promise<string> {
  const { taskTitle } = args;

  // Find the task by title
  const tasks = await db.query.todoTasks.findMany({
    where: (tasks, { eq }) => eq(tasks.userId, userId),
  });

  const task = tasks.find(
    (t) => t.title.toLowerCase() === taskTitle.toLowerCase()
  );

  if (!task) {
    return `### ❌ Task Not Found\n\nI couldn't find a task with the title "${taskTitle}". Please check your task list and try again.`;
  }

  // Delete the task
  await db.delete(todoTasks).where(eq(todoTasks.id, task.id));

  return `### 🗑️ Task Deleted\n\nThe task **"${task.title}"** has been removed from your todo list.`;
}
