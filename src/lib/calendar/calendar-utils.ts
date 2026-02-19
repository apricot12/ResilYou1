import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CalendarEvent = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDateTime: Date;
  endDateTime: Date;
  location: string | null;
  category: "work" | "personal" | "appointment" | "meeting" | "other" | null;
  reminderMinutes: number | null;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly" | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * Get all days in a month (42 cells for 6 weeks x 7 days)
 * Includes days from previous and next months to fill the grid
 *
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Array of Date objects representing all calendar cells
 */
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Calculate how many days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek;

  // Start date is firstDay minus the days from previous month
  const startDate = new Date(year, month, 1 - daysFromPrevMonth);

  // Generate 42 days (6 weeks)
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  return days;
}

/**
 * Check if two dates are on the same day
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 *
 * @param date - The date to check
 * @returns true if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the current month
 *
 * @param date - The date to check
 * @param year - The year
 * @param month - The month (0-11)
 * @returns true if date is in the specified month
 */
export function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Filter events for a specific date
 *
 * @param events - Array of events
 * @param date - The date to filter by
 * @returns Events that occur on the specified date
 */
export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = new Date(event.startDateTime);
    const eventEnd = new Date(event.endDateTime);

    // Check if the date falls within the event's time range
    return (
      (isSameDay(eventStart, date)) ||
      (isSameDay(eventEnd, date)) ||
      (date >= eventStart && date <= eventEnd)
    );
  });
}

/**
 * Get upcoming events (sorted by start time)
 *
 * @param events - Array of events
 * @param limit - Maximum number of events to return (default: 10)
 * @returns Upcoming events sorted by start time
 */
export function getUpcomingEvents(events: CalendarEvent[], limit: number = 10): CalendarEvent[] {
  const now = new Date();

  return events
    .filter(event => new Date(event.startDateTime) >= now)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
    .slice(0, limit);
}

/**
 * Get events within a date range
 *
 * @param events - Array of events
 * @param startDate - Start of the date range
 * @param endDate - End of the date range
 * @returns Events within the specified range
 */
export function getEventsInRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = new Date(event.startDateTime);
    const eventEnd = new Date(event.endDateTime);

    // Event overlaps with range if:
    // - Event starts before range ends AND
    // - Event ends after range starts
    return eventStart <= endDate && eventEnd >= startDate;
  });
}

/**
 * Format a date as a readable string
 *
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format time as a readable string
 *
 * @param date - The date to format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Format date and time as a readable string
 *
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Get category color class for Tailwind
 *
 * @param category - Event category
 * @returns Tailwind color class string
 */
export function getCategoryColor(category: CalendarEvent['category']): string {
  switch (category) {
    case 'work':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'personal':
      return 'bg-green-500 hover:bg-green-600';
    case 'meeting':
      return 'bg-primary hover:bg-primary/90';
    case 'appointment':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'other':
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}

/**
 * Get category badge color (lighter version for text)
 *
 * @param category - Event category
 * @returns Tailwind badge color classes
 */
export function getCategoryBadgeColor(category: CalendarEvent['category']): string {
  switch (category) {
    case 'work':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'personal':
      return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
    case 'meeting':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    case 'appointment':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
    case 'other':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}

/**
 * Get month name
 *
 * @param month - Month index (0-11)
 * @returns Month name
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

/**
 * Get day of week names
 *
 * @returns Array of day names starting with Sunday
 */
export function getDayNames(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

/**
 * Calculate event duration in minutes
 *
 * @param startDateTime - Event start time
 * @param endDateTime - Event end time
 * @returns Duration in minutes
 */
export function getEventDuration(startDateTime: Date, endDateTime: Date): number {
  return Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
}

/**
 * Format event duration as readable string
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "1h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}
