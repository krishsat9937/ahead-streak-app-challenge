// packages/lib-streaks/src/__tests__/calcStreak.spec.ts
import { calcStreak } from '../index';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const tzUTC = 'UTC';
const tzPac = 'Pacific/Kiritimati';

// Build a JS Date at 00:00 UTC for the given calendar day, then project
// it into the requested time‑zone. This avoids local‑TZ drift in CI.
function zonedDate(ymd: string, tz: string): Date {
  // noon UTC = middle of the day, so no roll‑back across the dateline
  const utcNoon = new Date(`${ymd}T12:00:00Z`);
  return toZonedTime(utcNoon, tz);
}


const map = (o: Record<string, number>) => new Map(Object.entries(o));

/** Pretty‑print days for debug – comment out console.table to silence. */
function logDays(label: string, res: ReturnType<typeof calcStreak>) {
  /* eslint-disable no-console */
  console.table([
    label,
    ...res.days.map(d => ({ date: d.date, act: d.activities, state: d.state })),
  ]);
}

describe('calcStreak', () => {
  it('straight 7‑day streak', () => {
    const today = zonedDate('2024-02-26', tzUTC);
    const activityMap = map({  
      '2024-02-20': 1,
      '2024-02-21': 2,
      '2024-02-22': 1,
      '2024-02-23': 1,
      '2024-02-24': 1,
      '2024-02-25': 1,
      '2024-02-26': 3,
    });
    const res = calcStreak(today, activityMap, tzUTC);
    logDays('7‑day streak', res);
    expect(res.total).toBe(7);
    expect(res.days.every(d => d.state === 'COMPLETED')).toBe(true);
  });

  it('3‑day recovery success (case #1)', () => {
    const today = zonedDate('2024-02-26', tzUTC);
    const activityMap = map({
      '2024-02-23': 1,
      '2024-02-24': 0,
      '2024-02-25': 0,
      '2024-02-26': 3,
    });
    const res = calcStreak(today, activityMap, tzUTC);
    logDays('recovery success', res);

    expect(res.activitiesToday).toBe(3);
    expect(res.total).toBe(1);
    const states = Object.fromEntries(res.days.map(d => [d.date, d.state]));
    expect(states['2024-02-24']).toBe('AT_RISK');
    expect(states['2024-02-25']).toBe('AT_RISK');
    expect(states['2024-02-26']).toBe('COMPLETED');
  });

  it('pads future days when streak < 7', () => {
    const today = zonedDate('2024-02-26', tzUTC);
    const activityMap = map({ '2024-02-26': 1 });
    const res = calcStreak(today, activityMap, tzUTC);
    logDays('pad future', res);
    const todayKey = format(today, 'yyyy-MM-dd');
    const future = res.days.filter(d => d.date > todayKey);
    expect(future.every(d => d.state === 'INCOMPLETE')).toBe(true);
  });

  it('handles timezone boundary (UTC vs +14)', () => {
    const utcBase = zonedDate('2024-02-26', tzUTC);     // 26‑Feb 00:00 UTC
    const pacToday = toZonedTime(utcBase, tzPac);       // +14h zone → 27‑Feb local

    const resUTC = calcStreak(utcBase, map({ '2024-02-26': 1 }), tzUTC);
    const resPac = calcStreak(pacToday, map({ '2024-02-27': 1 }), tzPac);

    logDays('UTC boundary', resUTC);
    logDays('+14 boundary', resPac);

    expect(resUTC.activitiesToday).toBe(1);
    expect(resPac.activitiesToday).toBe(1);
  });
});
