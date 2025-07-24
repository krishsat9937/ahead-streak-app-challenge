import { NextResponse } from 'next/server';
import { calcStreak } from 'lib-streaks';
import { format, parseISO } from 'date-fns';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { toZonedTime } from 'date-fns-tz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// top of file
const dbg = (label: string, payload: any) => {
  // stringify Maps nicely
  const safe =
    payload instanceof Map
      ? Object.fromEntries(payload.entries())
      : payload;
  console.log(`\n==== ${label} ====`);
  console.table(safe);
};

export async function GET(req: Request, { params }: { params: Promise<{ case: string }> }) {
  const { case: caseId } = await params;
  const timezone = req.headers.get('x-user-timezone') || 'UTC';

  // Force a real Date for mocks
  const todayDate = caseId === 'live' ? new Date() : parseISO('2024-02-26');
  const todayKey = format(todayDate, 'yyyy-MM-dd');

  try {
    const filePath = resolve(__dirname, '../../../../../..', `packages/lib-streaks/data/case-${caseId}.json`);
    const file = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(file) as { days: { date: string; activities: number }[] };

    // 1) Keep only days <= today (string compare avoids TZ drift)
    const filtered = json.days
      .filter(d => d.date <= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date)); // ASC

    // 2) Take the last 7 actual days (so 20–26 is all 7)
    const last7 = filtered.slice(-7);

    // 3) Build map
    const activityMap = new Map<string, number>();
    last7.forEach(d => activityMap.set(d.date, d.activities));

    // 4) Calc streak
    const result = calcStreak(todayDate, activityMap, timezone);

    // 5) Sort result.days ASC so UI is left→right oldest→newest
    result.days.sort((a, b) => a.date.localeCompare(b.date));

    // Debugging output
    dbg('RAW', json.days);
    dbg('FILTERED', filtered);
    dbg('LAST7', last7);
    dbg('MAP', activityMap);
    dbg('RESULT.days', result.days);

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Error in GET /api/streaks/[case]:', e);
    return NextResponse.json(
      { error: `Case ${caseId} not found or invalid`, details: String(e.message || e) },
      { status: 400 }
    );
  }
}
