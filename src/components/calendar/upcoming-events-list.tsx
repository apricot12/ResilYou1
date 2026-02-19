"use client"

import { RiCalendarEventLine } from "@remixicon/react"
import { EventCard } from "./event-card"
import { getUpcomingEvents, type CalendarEvent } from "@/lib/calendar/calendar-utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UpcomingEventsListProps {
  events: CalendarEvent[]
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
  limit?: number
}

export function UpcomingEventsList({
  events,
  onEdit,
  onDelete,
  limit = 10,
}: UpcomingEventsListProps) {
  const upcomingEvents = getUpcomingEvents(events, limit)

  if (upcomingEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <RiCalendarEventLine className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-1">No upcoming events</h3>
        <p className="text-sm text-muted-foreground">
          Create your first event to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Upcoming Events</h3>
        <span className="text-sm text-muted-foreground">
          {upcomingEvents.length} {upcomingEvents.length === 1 ? "event" : "events"}
        </span>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-3 pr-4">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              compact
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
