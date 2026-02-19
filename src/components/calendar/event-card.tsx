"use client"

import { RiMapPinLine, RiTimeLine, RiDeleteBinLine, RiEditLine } from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getCategoryBadgeColor,
  formatTime,
  formatDuration,
  getEventDuration,
  type CalendarEvent,
} from "@/lib/calendar/calendar-utils"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: CalendarEvent
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
  compact?: boolean
}

export function EventCard({ event, onEdit, onDelete, compact = false }: EventCardProps) {
  const startTime = formatTime(new Date(event.startDateTime))
  const endTime = formatTime(new Date(event.endDateTime))
  const duration = getEventDuration(
    new Date(event.startDateTime),
    new Date(event.endDateTime)
  )

  if (compact) {
    return (
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border p-2 hover:bg-accent cursor-pointer transition-colors",
          "text-sm"
        )}
        onClick={() => onEdit?.(event)}
      >
        <div className={cn("h-2 w-2 rounded-full flex-shrink-0", getCategoryBadgeColor(event.category).split(' ')[0])} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {startTime} - {endTime}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight">{event.title}</h3>
            {event.category && (
              <Badge
                variant="secondary"
                className={cn("mt-2 text-xs", getCategoryBadgeColor(event.category))}
              >
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(event)}
                className="h-8 w-8 p-0"
              >
                <RiEditLine className="h-4 w-4" />
                <span className="sr-only">Edit event</span>
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(event.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <RiDeleteBinLine className="h-4 w-4" />
                <span className="sr-only">Delete event</span>
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Time & Duration */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RiTimeLine className="h-4 w-4" />
          <span>
            {startTime} - {endTime}
          </span>
          <span className="text-xs">({formatDuration(duration)})</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RiMapPinLine className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
