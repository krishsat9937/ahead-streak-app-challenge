// packages/lib-streaks/src/wakatime.ts
import fetch from 'node-fetch';

export async function fetchWakaTimeStats(): Promise<any> {
  const apiKey = process.env.WAKATIME_API_KEY;
  if (!apiKey) throw new Error('Missing WAKATIME_API_KEY');

  const res = await fetch('https://wakatime.com/api/v1/users/current/summaries?range=last_7_days', {
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
    },
  });

  if (!res.ok) throw new Error(`WakaTime API failed: ${res.statusText}`);
  console.log(`WakaTime API response status: ${res.status}`);
  console.log(`WakaTime API response json: ${JSON.stringify(res.json())}`);

  return res.json();
}
