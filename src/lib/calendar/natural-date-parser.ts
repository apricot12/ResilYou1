import * as chrono from 'chrono-node';

export interface ParsedDateRange {
  start: Date;
  end?: Date;
  text: string;
}

/**
 * Parse natural language date/time expressions into Date objects
 * Examples: "tomorrow", "next Monday", "3pm", "2024-01-15", "tomorrow at 2pm"
 *
 * @param text - The natural language date/time string
 * @param referenceDate - The reference date for relative dates (defaults to now)
 * @returns ParsedDateRange with start date, optional end date, and original text
 */
export function parseNaturalLanguageDate(
  text: string,
  referenceDate: Date = new Date()
): ParsedDateRange | null {
  // Use chrono to parse the date with forward date preference
  const results = chrono.parse(text, referenceDate, { forwardDate: true });

  if (results.length === 0) {
    return null;
  }

  const firstResult = results[0];

  return {
    start: firstResult.start.date(),
    end: firstResult.end?.date(),
    text: firstResult.text
  };
}

/**
 * Converts a Date object to ISO string format preserving local time
 * (without timezone conversion)
 *
 * @param date - The date to convert
 * @returns ISO string in format "YYYY-MM-DDTHH:mm:ss"
 */
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Extract date and time from a natural language string and create
 * proper start and end timestamps
 *
 * @param text - Natural language date/time string
 * @param defaultDurationMinutes - Default duration if no end time specified (default: 60)
 * @returns Object with startDateTime and endDateTime as ISO strings, or null if parsing fails
 */
export function extractEventTimes(
  text: string,
  defaultDurationMinutes: number = 60
): { startDateTime: string; endDateTime: string } | null {
  const parsed = parseNaturalLanguageDate(text);

  if (!parsed) {
    return null;
  }

  const startDate = parsed.start;
  let endDate = parsed.end;

  // If no end date specified, add default duration
  if (!endDate) {
    endDate = new Date(startDate.getTime() + defaultDurationMinutes * 60 * 1000);
  }

  return {
    startDateTime: toLocalISOString(startDate),
    endDateTime: toLocalISOString(endDate)
  };
}

/**
 * Check if a date string is in a valid format
 *
 * @param dateString - The date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Parse multiple date expressions from text (e.g., "from 2pm to 4pm tomorrow")
 *
 * @param text - Text containing date/time expressions
 * @returns Array of parsed date ranges
 */
export function parseMultipleDates(text: string): ParsedDateRange[] {
  const results = chrono.parse(text, new Date(), { forwardDate: true });

  return results.map(result => ({
    start: result.start.date(),
    end: result.end?.date(),
    text: result.text
  }));
}
