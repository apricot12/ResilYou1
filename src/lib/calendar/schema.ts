import { z } from 'zod';

/**
 * Zod schema for calendar event form validation
 */
export const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().max(200, 'Location is too long').optional(),
  category: z.enum(['work', 'personal', 'appointment', 'meeting', 'other']).default('other'),
  reminderMinutes: z.number().min(0).max(10080).default(30), // Max 1 week
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none')
}).refine(
  (data) => {
    // Validate that end date/time is after start date/time
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);
    return end > start;
  },
  {
    message: 'End date and time must be after start date and time',
    path: ['endDate']
  }
);

export type EventFormData = z.infer<typeof eventFormSchema>;

/**
 * API request schema for creating/updating events
 */
export const eventApiSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  location: z.string().max(200).optional().nullable(),
  category: z.enum(['work', 'personal', 'appointment', 'meeting', 'other']).optional(),
  reminderMinutes: z.number().min(0).max(10080).optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).optional()
});

export type EventApiData = z.infer<typeof eventApiSchema>;

/**
 * Convert form data to API data format
 */
export function formDataToApiData(formData: EventFormData): EventApiData {
  const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
  const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

  return {
    title: formData.title,
    description: formData.description || null,
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    location: formData.location || null,
    category: formData.category,
    reminderMinutes: formData.reminderMinutes,
    recurrence: formData.recurrence
  };
}

/**
 * Convert API data to form data format
 */
export function apiDataToFormData(apiData: {
  title: string;
  description?: string | null;
  startDateTime: Date | string;
  endDateTime: Date | string;
  location?: string | null;
  category?: 'work' | 'personal' | 'appointment' | 'meeting' | 'other' | null;
  reminderMinutes?: number | null;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
}): Partial<EventFormData> {
  const startDate = new Date(apiData.startDateTime);
  const endDate = new Date(apiData.endDateTime);

  return {
    title: apiData.title,
    description: apiData.description || '',
    startDate: startDate.toISOString().split('T')[0],
    startTime: startDate.toTimeString().slice(0, 5),
    endDate: endDate.toISOString().split('T')[0],
    endTime: endDate.toTimeString().slice(0, 5),
    location: apiData.location || '',
    category: apiData.category || 'other',
    reminderMinutes: apiData.reminderMinutes || 30,
    recurrence: apiData.recurrence || 'none'
  };
}
