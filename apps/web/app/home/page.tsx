// apps/web/app/home/page.tsx

import { headers } from 'next/headers';
import Image from 'next/image';
import { Box, Typography, Container } from '@mui/material';
import StreakCard from '@/components/StreakCard';

export const dynamic = 'force-dynamic';

function NavLinks() {
  return (
    <Box mt={6} display="flex" justifyContent="center" gap={3}>
      <Typography
        component="a"
        href="/home/1"
        sx={{ textDecoration: 'underline', color: 'text.secondary', fontSize: 14 }}
      >
        Mock Cases
      </Typography>
    </Box>
  );
}

export default async function HomePage() {
  const headersList = await headers();
  const timezone = headersList.get('x-user-timezone') ?? 'UTC';
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/streaks/live`, {
    cache: 'no-store',
    headers: { 'x-user-timezone': timezone },
  });
  if (!res.ok) throw new Error('Failed to load streak');
  const data: StreakResponse = await res.json();

  return (
    <Background>
      <Container maxWidth="sm" sx={{ textAlign: 'center', pt: { xs: 10, md: 14 } }}>
        <Box sx={{ width: 200, height: 40, mx: 'auto', mb: 4, position: 'relative', overflow: 'hidden' }}>
          <Image
            src="/ahead.svg"
            alt="Ahead"
            fill
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        </Box>

        <Typography variant="h3" fontWeight={700} color="text.primary" sx={{ mb: 6 }}>
          Your live github activity streak is {data.total} days
        </Typography>
        <StreakCard data={data} />
        <NavLinks />
      </Container>
    </Background>
  );
}

// Types remain unchanged
export type State = 'COMPLETED' | 'AT_RISK' | 'SAVED' | 'INCOMPLETE';
export interface Day { date: string; activities: number; state: State }
export interface StreakResponse { activitiesToday: number; total: number; days: Day[] }

// Keep Background as is
function Background({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, #FFF6E9 0%, #FFF4DD 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-20%',
          width: '60%',
          height: '50%',
          bgcolor: '#FFE18D',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.6,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-15%',
          width: '55%',
          height: '45%',
          bgcolor: '#FFE18D',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.5,
        }}
      />
      {children}
    </Box>
  );
}
