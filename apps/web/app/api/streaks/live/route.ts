// apps/web/app/api/streaks/live/route.ts  (or adjust your path)

import { format, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { calcStreak } from 'lib-streaks';
import { NextRequest, NextResponse } from 'next/server';

const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY!;
const BASE_URL = 'https://wakatime.com/api/v1/users/current/summaries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const timezone = req.headers.get('x-user-timezone') ?? 'UTC';

  // today as Date in user TZ
  const nowUtc = new Date();
  const today = toZonedTime(nowUtc, timezone);

  const start = format(subDays(today, 6), 'yyyy-MM-dd');
  const end   = format(today, 'yyyy-MM-dd');

  const wakatimeRes = await fetch(
    `${BASE_URL}?start=${start}&end=${end}&timezone=${encodeURIComponent(timezone)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(WAKATIME_API_KEY).toString('base64')}`,
      },
    }
  );

  if (!wakatimeRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch WakaTime data' }, { status: 500 });
  }

  const json = await wakatimeRes.json();

  // Build activity map for exactly those 7 days (fill zeros if missing)
  const activityMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, 'yyyy-MM-dd');
    activityMap.set(key, 0); // default
  }

  for (const entry of json.data) {
    const dateKey = entry.range.date; // already yyyy-MM-dd from WakaTime
    const minutes = Math.floor(entry.grand_total.total_seconds / 60);
    if (activityMap.has(dateKey)) {
      activityMap.set(dateKey, minutes);
    }
  }

  const result = calcStreak(today, activityMap, timezone);
  // (Assuming calcStreak returns ASC oldest→newest now)
  return NextResponse.json(result);
}
