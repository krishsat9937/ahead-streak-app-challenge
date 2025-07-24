import { toZonedTime, format } from 'date-fns-tz';
import { differenceInCalendarDays, subDays } from "date-fns";
import { StreakState } from "./types";

/**
 * Finds the most recent completed day before the given date (in user timezone).
 */
export function getLastCompletedDateBefore(
  dateStr: string,
  activityMap: Map<string, number>,
  timezone: string
): string | null {
  const maxDaysBack = 30;
  const date = toZonedTime(new Date(dateStr), timezone);

  for (let i = 1; i <= maxDaysBack; i++) {
    const checkDate = subDays(date, i);
    const key = format(checkDate, 'yyyy-MM-dd');
    if ((activityMap.get(key) ?? 0) > 0) return key;
  }

  return null;
}

/**
 * Determines the raw state of a given date (in user timezone).
 */
export function determineRawState(
  dateStr: string,
  activityMap: Map<string, number>,
  todayStr: string,
  timezone: string
): StreakState {
  const count = activityMap.get(dateStr) ?? 0;
  if (count > 0) return 'COMPLETED';
  if (dateStr > todayStr) return 'INCOMPLETE';

  const prevCompleted = getLastCompletedDateBefore(dateStr, activityMap, timezone);
  if (!prevCompleted) return 'INCOMPLETE';

  const daysSince = differenceInCalendarDays(
    toZonedTime(new Date(dateStr), timezone),
    toZonedTime(new Date(prevCompleted), timezone)
  );
  if (daysSince === 1 || daysSince === 2) return 'AT_RISK';

  return 'INCOMPLETE';
}

/**
 * Converts a Date object to a yyyy-MM-dd string in the user's timezone.
 */
export function getDateInUserTimezone(date: Date, timezone: string): string {
  const zoned = toZonedTime(date, timezone);
  return format(zoned, 'yyyy-MM-dd');
}
