"use client"

import { RiArrowLeftSLine, RiArrowRightSLine, RiAddLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  getCalendarDays,
  getDayNames,
  getMonthName,
  isToday,
  isInMonth,
  getEventsForDate,
  type CalendarEvent,
} from "@/lib/calendar/calendar-utils"
import { cn } from "@/lib/utils"

interface CalendarGridProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateChange: (date: Date) => void
  onDateClick: (date: Date) => void
  onAddEvent: () => void
}

export function CalendarGrid({
  currentDate,
  events,
  onDateChange,
  onDateClick,
  onAddEvent,
}: CalendarGridProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = getCalendarDays(year, month)
  const dayNames = getDayNames()

  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    onDateChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl md:text-2xl font-semibold">
            {getMonthName(month)} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddEvent}>
            <RiAddLine className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-9 w-9"
            >
              <RiArrowLeftSLine className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="h-9 w-9"
            >
              <RiArrowRightSLine className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const inCurrentMonth = isInMonth(date, year, month)
            const today = isToday(date)
            const dayEvents = getEventsForDate(events, date)
            const hasEvents = dayEvents.length > 0

            return (
              <button
                key={index}
                onClick={() => onDateClick(date)}
                className={cn(
                  "relative aspect-square p-1 md:p-2 text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "border-r border-b min-w-0",
                  (index + 1) % 7 === 0 && "border-r-0",
                  index >= 35 && "border-b-0",
                  !inCurrentMonth && "bg-muted/30 text-muted-foreground",
                  today && "bg-primary/10 font-semibold"
                )}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-0.5 md:mb-1">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full text-xs md:text-sm",
                      today && "bg-primary text-primary-foreground"
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {hasEvents && (
                    <span className="hidden md:inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Indicators */}
                {hasEvents && (
                  <div className="space-y-0.5 md:space-y-1">
                    {/* On mobile, show dots only. On desktop, show event titles */}
                    <div className="hidden md:block space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className={cn(
                          "truncate rounded px-1 text-xs",
                          event.category === "work" && "bg-blue-500/20 text-blue-700 dark:text-blue-300",
                          event.category === "personal" && "bg-green-500/20 text-green-700 dark:text-green-300",
                          event.category === "meeting" && "bg-purple-500/20 text-purple-700 dark:text-purple-300",
                          event.category === "appointment" && "bg-orange-500/20 text-orange-700 dark:text-orange-300",
                          event.category === "other" && "bg-gray-500/20 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                    </div>
                    {/* Mobile: show colored dots */}
                    <div className="flex gap-0.5 md:hidden flex-wrap">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            event.category === "work" && "bg-blue-500",
                            event.category === "personal" && "bg-green-500",
                            event.category === "meeting" && "bg-purple-500",
                            event.category === "appointment" && "bg-orange-500",
                            event.category === "other" && "bg-gray-500",
                            !event.category && "bg-primary"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
