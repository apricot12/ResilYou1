"use client"

import { useState, useEffect } from "react"
import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { EventModal } from "@/components/calendar/event-modal"
import { UpcomingEventsList } from "@/components/calendar/upcoming-events-list"
import { Skeleton } from "@/components/ui/skeleton"
import type { CalendarEvent } from "@/lib/calendar/calendar-utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  // Fetch events on mount and when month changes
  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/calendar/events")

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast.error("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  const handleAddEvent = () => {
    setSelectedDate(new Date())
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(undefined)
    setIsEventModalOpen(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    setEventToDelete(eventId)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return

    try {
      const response = await fetch(`/api/calendar/events/${eventToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      toast.success("Event deleted successfully")
      await fetchEvents()
      setEventToDelete(null)
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event")
    }
  }

  const handleEventSuccess = () => {
    fetchEvents()
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 overflow-hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 overflow-hidden">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your events and schedule
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_350px] overflow-hidden">
          {/* Calendar Grid */}
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onDateChange={setCurrentDate}
            onDateClick={handleDateClick}
            onAddEvent={handleAddEvent}
          />

          {/* Upcoming Events Sidebar */}
          <div className="space-y-4">
            <UpcomingEventsList
              events={events}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSuccess={handleEventSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
