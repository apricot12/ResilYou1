import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/database/db';
import { calendarEvents } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/calendar/events/[eventId]
 * Fetch a specific calendar event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Get authenticated user session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    // Fetch event from database
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.userId, userId)
        )
      )
      .limit(1);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calendar/events/[eventId]
 * Update a calendar event
 *
 * Request body: Partial<Event> (any fields to update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Get authenticated user session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    // Check if event exists and belongs to user
    const [existingEvent] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.userId, userId)
        )
      )
      .limit(1);

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate dates if provided
    if (body.startDateTime || body.endDateTime) {
      const startDateTime = body.startDateTime
        ? new Date(body.startDateTime)
        : new Date(existingEvent.startDateTime);
      const endDateTime = body.endDateTime
        ? new Date(body.endDateTime)
        : new Date(existingEvent.endDateTime);

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
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startDateTime !== undefined)
      updateData.startDateTime = new Date(body.startDateTime);
    if (body.endDateTime !== undefined)
      updateData.endDateTime = new Date(body.endDateTime);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.reminderMinutes !== undefined)
      updateData.reminderMinutes = body.reminderMinutes;
    if (body.recurrence !== undefined) updateData.recurrence = body.recurrence;

    // Update event in database
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(updateData)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.userId, userId)
        )
      )
      .returning();

    return NextResponse.json({
      event: updatedEvent,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/events/[eventId]
 * Delete a calendar event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Get authenticated user session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    // Delete event from database
    const [deletedEvent] = await db
      .delete(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.userId, userId)
        )
      )
      .returning();

    if (!deletedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Event deleted successfully',
      event: deletedEvent
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
