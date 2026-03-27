import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { chatMessages, chatConversations } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { getChatCompletion } from "@/lib/openai";
import { chatTools, executeCalendarTool } from "@/lib/chat-tools";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// GET /api/chat/messages?conversationId=xxx - Get messages for a conversation
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
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Verify the conversation belongs to the user
    const conversation = await db.query.chatConversations.findFirst({
      where: and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId)
      ),
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.conversationId, conversationId),
      orderBy: [chatMessages.createdAt],
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages - Send a message and get AI response
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { conversationId, content } = await req.json();

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    // Verify the conversation belongs to the user
    const conversation = await db.query.chatConversations.findFirst({
      where: and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId)
      ),
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Save user message
    const [userMessage] = await db
      .insert(chatMessages)
      .values({
        conversationId,
        role: "user",
        content,
        createdAt: new Date(),
      })
      .returning();

    // Get conversation history
    const previousMessages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.conversationId, conversationId),
      orderBy: [chatMessages.createdAt],
      limit: 20, // Last 20 messages for context
    });

    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are Ana, a warm and empathetic AI productivity assistant built into ResilYou. You genuinely care about the people you talk to and want to help them feel supported, not just organised.

**Your personality:**
- Warm, encouraging, and conversational — like a thoughtful friend who happens to be great at organising
- Empathetic first: if someone seems stressed, overwhelmed, or frustrated, acknowledge how they're feeling before jumping into solutions
- Use natural, human language — avoid robotic or overly formal phrasing
- It's okay to use light humour or warmth when appropriate
- Keep responses concise but never cold — short doesn't mean curt
- Refer to yourself as Ana when it's natural to do so (e.g. on first introduction)

**Your capabilities — calendar and task management:**
- Create a meeting, event, or appointment → Use create_calendar_event
- Check schedule or upcoming events → Use list_calendar_events
- Cancel, delete, or remove an event → Use delete_calendar_event
- Change, reschedule, or update an event → Use update_calendar_event

**Important guidelines:**
1. Always use the functions to perform actions — never just provide instructions
2. When deleting or updating events, list events first to get the exact title
3. Be proactive — if the user says "cancel my meeting with John", list events first, find the match, then delete it
4. For updates, only change the fields the user asks about
5. When a user mentions food, meals, cooking, or recipes (e.g. "make lunch", "quick dinner", "meal prep"), do NOT assume they want a calendar event. First ask what they'd like to make and offer recipe ideas or suggestions. Only offer to schedule a meal break on the calendar if they explicitly ask to block time or set a reminder for it.

**For calendar events, extract:**
- Title/subject of the meeting
- Date and time (in natural language)
- Duration if mentioned
- Location if mentioned
- Attendees if mentioned

**Workflow for delete/update:**
1. List events to find the exact title
2. Use the exact title to delete or update
3. Confirm the action warmly

Always confirm actions in a warm, human way — make the user feel like their time and wellbeing matter.`,
      },
      ...previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      } as ChatCompletionMessageParam)),
    ];

    // Get AI response with function calling
    let response = await getChatCompletion(messages, chatTools);
    let finalContent = "";

    // Handle function calls
    if (response?.tool_calls && response.tool_calls.length > 0) {
      // Add assistant's response with tool calls to messages
      messages.push({
        role: "assistant",
        content: response.content || null,
        tool_calls: response.tool_calls,
      });

      // Execute each tool call
      for (const toolCall of response.tool_calls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          // Execute the tool
          const toolResult = await executeCalendarTool(
            functionName,
            functionArgs,
            userId
          );

          // Add tool result to messages
          messages.push({
            role: "tool",
            content: toolResult,
            tool_call_id: toolCall.id,
          });
        }
      }

      // Get final response after tool execution
      const finalResponse = await getChatCompletion(messages, chatTools);
      finalContent = finalResponse?.content || "Action completed successfully.";
    } else {
      finalContent = response?.content || "Sorry, I couldn't generate a response.";
    }

    // Save AI message
    const [assistantMessage] = await db
      .insert(chatMessages)
      .values({
        conversationId,
        role: "assistant",
        content: finalContent,
        createdAt: new Date(),
      })
      .returning();

    // Update conversation title if it's the first message
    if (previousMessages.length <= 1) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await db
        .update(chatConversations)
        .set({ title, updatedAt: new Date() })
        .where(eq(chatConversations.id, conversationId));
    } else {
      // Update conversation timestamp
      await db
        .update(chatConversations)
        .set({ updatedAt: new Date() })
        .where(eq(chatConversations.id, conversationId));
    }

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
