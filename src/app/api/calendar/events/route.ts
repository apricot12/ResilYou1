import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/database/db';
import { calendarEvents } from '@/database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

/**
 * GET /api/calendar/events
 * Fetch all calendar events for the authenticated user
 * Optional query params:
 * - startDate: Filter events starting from this date (ISO string)
 * - endDate: Filter events ending before this date (ISO string)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query conditions
    const conditions = [eq(calendarEvents.userId, session.user.id)];

    if (startDate) {
      conditions.push(gte(calendarEvents.startDateTime, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(calendarEvents.endDateTime, new Date(endDate)));
    }

    // Fetch events from database
    const events = await db
      .select()
      .from(calendarEvents)
      .where(and(...conditions))
      .orderBy(calendarEvents.startDateTime);

    return NextResponse.json({
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/events
 * Create a new calendar event
 *
 * Request body:
 * {
 *   title: string;
 *   description?: string;
 *   startDateTime: string (ISO);
 *   endDateTime: string (ISO);
 *   location?: string;
 *   category?: "work" | "personal" | "appointment" | "meeting" | "other";
 *   reminderMinutes?: number;
 *   recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.startDateTime || !body.endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startDateTime, endDateTime' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDateTime = new Date(body.startDateTime);
    const endDateTime = new Date(body.endDateTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create event in database
    const [newEvent] = await db
      .insert(calendarEvents)
      .values({
        userId: session.user.id,
        title: body.title,
        description: body.description || null,
        startDateTime,
        endDateTime,
        location: body.location || null,
        category: body.category || 'other',
        reminderMinutes: body.reminderMinutes || 30,
        recurrence: body.recurrence || 'none'
      })
      .returning();

    return NextResponse.json(
      { event: newEvent, message: 'Event created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
