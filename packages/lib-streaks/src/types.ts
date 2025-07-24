export type StreakState = 'COMPLETED' | 'AT_RISK' | 'SAVED' | 'INCOMPLETE';

export interface DayResult {
  date: string;             // 'YYYY-MM-DD'
  activities: number;       // number of activities that day
  state: StreakState;
}

export interface StreakResponse {
  activitiesToday: number;
  total: number;            // total current streak length
  days: DayResult[];        // 7-day window: newest → oldest
}
