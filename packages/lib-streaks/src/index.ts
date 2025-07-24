import { addDays, subDays, startOfDay } from 'date-fns';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';
import { DayResult, StreakResponse, StreakState } from './types';
import { determineRawState, getLastCompletedDateBefore } from './helper';

export function calcStreak(
  today: Date,
  activityMap: Map<string, number>,
  timezone: string
): StreakResponse {
  const WINDOW = 7;
  const days: DayResult[] = [];

  // Convert `today` to the user's timezone and normalize key
  const zonedToday = toZonedTime(today, timezone);
  const todayKey = tzFormat(zonedToday, 'yyyy-MM-dd', { timeZone: timezone });

  // 1) Past WINDOW days including today (oldest → newest)
  const pastWindow: DayResult[] = [];
  for (let i = WINDOW - 1; i >= 0; i--) {
    const d = subDays(zonedToday, i);
    const key = tzFormat(d, 'yyyy-MM-dd', { timeZone: timezone });
    const count = activityMap.get(key) ?? 0;
    const state = determineState(key, count, activityMap, todayKey, timezone);
    pastWindow.push({ date: key, activities: count, state });
  }

  // 2) Compute streak count: consecutive activities from today backwards
  let streakCount = 0;
  for (let i = pastWindow.length - 1; i >= 0; i--) {
    if (pastWindow[i].activities > 0) streakCount++;
    else break;
  }

  // 3) If streak < WINDOW, pad future days after today (INCOMPLETE)
  const padded: DayResult[] = [...pastWindow];
  if (streakCount < WINDOW) {
    const padCount = WINDOW - pastWindow.length;
    for (let i = 1; i <= padCount; i++) {
      const d = addDays(zonedToday, i);
      const key = tzFormat(d, 'yyyy-MM-dd', { timeZone: timezone });
      padded.push({ date: key, activities: 0, state: 'INCOMPLETE' });
    }
  }

  return {
    activitiesToday: activityMap.get(todayKey) ?? 0,
    total: streakCount,
    days: padded.slice(0, WINDOW),
  };
}

function determineState(
  dateStr: string,
  count: number,
  activityMap: Map<string, number>,
  todayStr: string,
  timezone: string
): StreakState {
  if (count > 0) return 'COMPLETED';
  if (dateStr > todayStr) return 'INCOMPLETE';

  const prev = getLastCompletedDateBefore(dateStr, activityMap, timezone);
  if (!prev) return 'INCOMPLETE';

  // Leverage raw logic for AT_RISK / SAVED
  return determineRawState(dateStr, activityMap, todayStr, timezone);
}
