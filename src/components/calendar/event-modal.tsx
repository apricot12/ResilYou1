"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EventForm } from "./event-form"
import { formDataToApiData, apiDataToFormData, type EventFormData } from "@/lib/calendar/schema"
import type { CalendarEvent } from "@/lib/calendar/calendar-utils"
import { toast } from "sonner"

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: CalendarEvent | null
  selectedDate?: Date
  onSuccess?: () => void
}

export function EventModal({ open, onOpenChange, event, selectedDate, onSuccess }: EventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!event

  // Get default values
  const getDefaultValues = (): Partial<EventFormData> => {
    if (event) {
      // Editing existing event
      return apiDataToFormData(event)
    } else if (selectedDate) {
      // Creating new event for a specific date
      const dateStr = selectedDate.toISOString().split('T')[0]
      return {
        startDate: dateStr,
        startTime: "09:00",
        endDate: dateStr,
        endTime: "10:00",
      }
    }
    return {}
  }

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)

    try {
      const apiData = formDataToApiData(data)

      if (isEdit && event) {
        // Update existing event
        const response = await fetch(`/api/calendar/events/${event.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update event")
        }

        toast.success("Event updated successfully")
      } else {
        // Create new event
        const response = await fetch("/api/calendar/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create event")
        }

        toast.success("Event created successfully")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error saving event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save event")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Make changes to your event below."
              : "Add a new event to your calendar."}
          </DialogDescription>
        </DialogHeader>

        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          defaultValues={getDefaultValues()}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
